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
                                       @create="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage})"></model-edit-dialog>
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
                >
                    <template v-slot:item.action="{ item }">
                        <v-btn color="edit" :to="{name: 'ModelEditPage', params: {model: model, id: item.id}}">
                            <v-icon icon="$edit"></v-icon>
                        </v-btn>
                    </template>
                </v-data-table-server>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import {onBeforeMount, PropType, ref, watch} from "vue";
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
import {useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

type VDataTableProps = InstanceType<typeof VDataTable>['$props']

const {t} = useI18n()
const router = useRouter()

const params = useUrlSearchParams('history', {initialValue: {page: "1"}})

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

const tableHeaders: VDataTableProps['headers'] = [
    {title: t('Name'), key: 'name'},
    {title: t('Category'), key: 'supermarketCategory.name'},
    {title: t('Actions'), key: 'action', align: 'end'},
]

const tablePage = ref(1)
const tablePageInitialized = ref(false) // TODO workaround until vuetify bug is fixed

const tableShowSelect = ref(false) // TODO enable once mass edit functions are implemented

// data
const loading = ref(false);
const items = ref([] as Array<any>)
const itemCount = ref(0)
const searchQuery = ref('')

const genericModel = ref({} as GenericModel)


// when navigating to ModelListPage from ModelListPage with a different model lifecycle hooks are not called so watch for change here
watch(() => props.model, () => {
    genericModel.value = getGenericModelFromString(props.model, t)
    loadItems({page: 1, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage})
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
})

/**
 * load items from API whenever the table calls for it
 * parameters defined by vuetify
 * @param page
 * @param itemsPerPage
 * @param search
 * @param sortBy
 * @param groupBy
 */
// TODO proper typescript signature, this is just taken from vuetify example, must be a better solution
function loadItems({page, itemsPerPage, search, sortBy, groupBy}) {
    loading.value = true
    window.scrollTo({top: 0, behavior: 'smooth'})
    // TODO workaround for initial page bug see https://github.com/vuetifyjs/vuetify/issues/17966
    if (page == 1 && Number(params.page) > 1 && !tablePageInitialized.value) {
        page = Number(params.page)
    }
    tablePageInitialized.value = true
    params.page = page.toString()
    useUserPreferenceStore().deviceSettings.general_tableItemsPerPage = itemsPerPage

    genericModel.value.list({page: page, pageSize: itemsPerPage, query: search}).then((r: any) => {
        items.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
        tablePage.value = page // TODO remove once page bug is fixed
    })
}

function changeModel(m: Model) {
    tablePage.value = 1
    router.push({name: 'ModelListPage', params: {model: m.name.toLowerCase()}})
    window.scrollTo({top: 0, behavior: 'smooth'})
}

</script>

<style scoped>

</style>