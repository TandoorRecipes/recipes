<template>
    <v-container>
        <v-row>
            <v-col>
                <span class="text-h4">
                    <v-btn icon="fa-solid fa-caret-down" variant="tonal">
                        <i class="fa-solid fa-caret-down"></i>
                        <v-menu activator="parent">
                            <v-list>

                                <v-list-item
                                    v-for="m in getListModels()"
                                    @click="changeModel(m)"
                                    :active="m.name == genericModel.model.name"
                                >
                                     <template #prepend><v-icon :icon="m.icon"></v-icon> </template>
                                     {{ $t(m.localizationKey) }}
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-btn>
                    <i :class="genericModel.model.icon"></i>
                    {{ $t(genericModel.model.localizationKey) }}</span>
                <v-btn class="float-right" icon="$create" color="create">
                    <i class="fa-solid fa-plus"></i>
                    <model-edit-dialog :close-after-create="false" :model="model"
                                       @create="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery})"></model-edit-dialog>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field prepend-inner-icon="$search" :label="$t('Search')" v-model="searchQuery"></v-text-field>
                <v-data-table-server
                    @update:options="loadItems"
                    :items="items"
                    :items-length="itemCount"
                    :loading="loading"
                    :search="searchQuery"
                    :headers="genericModel.getTableHeaders()"
                    :items-per-page-options="itemsPerPageOptions"
                    :show-select="tableShowSelect"
                    :page="tablePage"
                    :items-per-page="useUserPreferenceStore().deviceSettings.general_tableItemsPerPage"
                    disable-sort
                >
                    <template v-slot:item.action="{ item }">
                        <v-btn class="float-right" icon="$menu" variant="plain">
                            <v-icon icon="$menu"></v-icon>
                            <v-menu activator="parent" close-on-content-click>
                                <v-list density="compact">
                                    <v-list-item prepend-icon="$edit" :to="{name: 'ModelEditPage', params: {model: model, id: item.id}}">
                                        {{ $t('Edit') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-arrows-to-dot" v-if="genericModel.model.isMerge" link>
                                        {{ $t('Merge') }}
                                        <model-merge-dialog :model="model" :source="item"
                                                            @change="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage})"></model-merge-dialog>
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-table-list" :to="{name: 'IngredientEditorPage', query: {food_id: item.id}}"
                                                 v-if="genericModel.model.name == 'Food'">
                                        {{ $t('Ingredient Editor') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-table-list" :to="{name: 'IngredientEditorPage', query: {unit_id: item.id}}"
                                                 v-if="genericModel.model.name == 'Unit'">
                                        {{ $t('Ingredient Editor') }}
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-btn>
                    </template>
                </v-data-table-server>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import {onBeforeMount, onMounted, PropType, ref, watch} from "vue";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import {
    EditorSupportedModels,
    GenericModel,
    getGenericModelFromString, getListModels,
    Model,
} from "@/types/Models";
import {VDataTable} from "vuetify/components";
import {useUrlSearchParams} from "@vueuse/core";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useRoute, useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelMergeDialog from "@/components/dialogs/ModelMergeDialog.vue";
import {VDataTableUpdateOptions} from "@/vuetify";

const {t} = useI18n()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    model: {
        type: String as PropType<EditorSupportedModels>,
        default: 'food'
    },
})

// table config
const itemsPerPageOptions = [
    {value: 10, title: '10'},
    {value: 25, title: '25'},
    {value: 50, title: '50'},
]

const tablePage = ref(1)
const tableShowSelect = ref(false) // TODO enable once mass edit functions are implemented

// data
const loading = ref(false);
const items = ref([] as Array<any>)
const itemCount = ref(0)
const searchQuery = ref('')

const genericModel = ref({} as GenericModel)

/**
 * watch route changes (trough navigation) and set table page accordingly
 */
watch(() => route.query.page, () => {
    if (!loading.value && typeof route.query.page == "string" && !isNaN(parseInt(route.query.page))) {
        tablePage.value = parseInt(route.query.page)
    }
})

// when navigating to ModelListPage from ModelListPage with a different model lifecycle hooks are not called so watch for change here
watch(() => props.model, (newValue, oldValue) => {
    if (newValue != oldValue) {
        genericModel.value = getGenericModelFromString(props.model, t)
        tablePage.value = 1
        loadItems({page: 1, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery.value})
    }
})

/**
 * select model class before mount because template renders (and requests item load) before onMounted is called
 */
onBeforeMount(() => {
    try {
        genericModel.value = getGenericModelFromString(props.model, t)
    } catch (Error) {
        console.error('Invalid model passed to ModelListPage, loading Food instead')
        genericModel.value = getGenericModelFromString('Food', t)
    }

    if (typeof route.query.page == "string" && !isNaN(parseInt(route.query.page))) {
        tablePage.value = parseInt(route.query.page)
    }
})

/**
 * load items from API whenever the table calls for it
 * parameters defined by vuetify
 * @param options
 */
function loadItems(options: VDataTableUpdateOptions) {

    loading.value = true
    window.scrollTo({top: 0, behavior: 'smooth'})

    if (tablePage.value != options.page) {
        tablePage.value = options.page
    }
    router.push({name: 'ModelListPage', params: {model: props.model}, query: {page: options.page}})

    useUserPreferenceStore().deviceSettings.general_tableItemsPerPage = options.itemsPerPage
    
    genericModel.value.list({page: options.page, pageSize: options.itemsPerPage, query: options.search}).then((r: any) => {
        items.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

/**
 * change models and reset page/scroll
 * @param m
 */
function changeModel(m: Model) {
    tablePage.value = 1
    router.push({name: 'ModelListPage', params: {model: m.name.toLowerCase()}, query: {page: 1}})
    window.scrollTo({top: 0, behavior: 'smooth'})
}

</script>

<style scoped>

</style>