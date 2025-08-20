<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row dense>
            <v-col>
                <v-card :prepend-icon="genericModel.model.icon" :title="$t(genericModel.model.localizationKey)">
                    <template #subtitle v-if="genericModel.model.localizationKeyDescription">
                        <div class="text-wrap">
                            {{ $t(genericModel.model.localizationKeyDescription) }}
                        </div>
                    </template>
                    <template #append>
                        <v-btn class="float-right" icon="$create" color="create" v-if="!genericModel.model.disableCreate">
                            <i class="fa-solid fa-plus"></i>
                            <model-edit-dialog :close-after-create="false" :model="model"
                                               @create="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery})"
                                               @save="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery})"
                                               @delete="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery})"></model-edit-dialog>
                        </v-btn>
                    </template>
                    <v-card-actions v-if="genericModel.model.name == 'RecipeImport'">
                        <v-btn prepend-icon="fa-solid fa-rotate" color="success" @click="importAllRecipes()">{{ $t('ImportAll') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field prepend-inner-icon="$search" :label="$t('Search')" v-model="searchQuery" clearable></v-text-field>
                
                <v-data-table-server
                    v-model="selectedItems"
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
<!--                    <template v-slot:header.action v-if="selectedItems.length > 0">-->
<!--                        <v-select density="compact" hide-details></v-select>-->
<!--                    </template>-->
                    <template v-slot:item.action="{ item }">
                        <v-btn class="float-right" icon="$menu" variant="plain">
                            <v-icon icon="$menu"></v-icon>
                            <v-menu activator="parent" close-on-content-click>
                                <v-list density="compact">
                                    <v-list-item prepend-icon="$edit" :to="{name: 'ModelEditPage', params: {model: model, id: item.id}}"
                                                 v-if="!genericModel.model.disableCreate && !genericModel.model.disableUpdate && !genericModel.model.disableDelete">
                                        {{ $t('Edit') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-arrows-to-dot" v-if="genericModel.model.isMerge" link>
                                        {{ $t('Merge') }}
                                        <model-merge-dialog :model="model" :source="item"
                                                            @change="loadItems({page: tablePage, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery})"></model-merge-dialog>
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-table-list" :to="{name: 'IngredientEditorPage', query: {food_id: item.id}}"
                                                 v-if="genericModel.model.name == 'Food'">
                                        {{ $t('Ingredient Editor') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-table-list" :to="{name: 'IngredientEditorPage', query: {unit_id: item.id}}"
                                                 v-if="genericModel.model.name == 'Unit'">
                                        {{ $t('Ingredient Editor') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-rotate" v-if="genericModel.model.name == 'Sync'" link>
                                        {{ $t('Import') }}
                                        <sync-dialog :sync="item"></sync-dialog>
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-rotate" v-if="genericModel.model.name == 'RecipeImport'" @click="importRecipe(item)">
                                        {{ $t('Import') }}
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


import {onBeforeMount, PropType, ref, watch} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import {EditorSupportedModels, GenericModel, getGenericModelFromString, Model,} from "@/types/Models";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useRoute, useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelMergeDialog from "@/components/dialogs/ModelMergeDialog.vue";
import {VDataTableUpdateOptions} from "@/vuetify";
import SyncDialog from "@/components/dialogs/SyncDialog.vue";
import {ApiApi, RecipeImport} from "@/openapi";
import {useTitle} from "@vueuse/core";

const {t} = useI18n()
const router = useRouter()
const route = useRoute()
const title = useTitle()

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

const tableShowSelect = ref(true)
const selectedItems = ref([] as GenericModel[])

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

    title.value = t(genericModel.value.model.localizationKey)

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
    if (route.query.page == undefined) {
        router.replace({name: 'ModelListPage', params: {model: props.model}, query: {page: options.page}})
    } else {
        router.push({name: 'ModelListPage', params: {model: props.model}, query: {page: options.page}})
    }

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

// model specific functions

/**
 * convert a RecipeImport to a "real" external recipes and reload the table
 * @param item
 */
function importRecipe(item: RecipeImport) {
    let api = new ApiApi()
    api.apiRecipeImportImportRecipeCreate({id: item.id!, recipeImport: item}).then(r => {
        loadItems({page: 1, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery.value})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

/**
 * convert all RecipeImports to "real" external recipes and reload the table (should be empty afterwards)
 */
function importAllRecipes() {
    let api = new ApiApi()

    api.apiRecipeImportImportAllCreate({recipeImport: {} as RecipeImport}).then(r => {
        loadItems({page: 1, itemsPerPage: useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, search: searchQuery.value})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>