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
                                               @create="loadItems({page: page})"
                                               @save="loadItems({page: page })"
                                               @delete="loadItems({page: page})"></model-edit-dialog>
                        </v-btn>
                    </template>

                    <!-- TODO build customizable model component system -->
                    <v-card-actions v-if="genericModel.model.name == 'RecipeImport'">
                        <v-btn prepend-icon="fa-solid fa-rotate" color="success" @click="importAllRecipes()">{{ $t('ImportAll') }}</v-btn>
                    </v-card-actions>

                    <v-card-text v-if="genericModel.model.name == 'AiLog'">
                        {{ $t('MonthlyCreditsUsed') }} ({{ useUserPreferenceStore().activeSpace.aiMonthlyCreditsUsed }} / {{ useUserPreferenceStore().activeSpace.aiCreditsMonthly }})
                        {{ $t('AiCreditsBalance') }} : {{ useUserPreferenceStore().activeSpace.aiCreditsBalance }}
                        <v-progress-linear :model-value="useUserPreferenceStore().activeSpace.aiMonthlyCreditsUsed" :max="useUserPreferenceStore().activeSpace.aiCreditsMonthly"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field prepend-inner-icon="$search" :label="$t('Search')" v-model="query" clearable></v-text-field>

                <v-data-table-server
                    v-model="selectedItems"
                    return-object
                    @update:options="loadItems"
                    :items="items"
                    :items-length="itemCount"
                    :loading="loading"
                    :search="query"
                    :headers="genericModel.getTableHeaders()"
                    :items-per-page-options="itemsPerPageOptions"
                    :show-select="!genericModel.model.disableDelete || genericModel.model.isMerge"
                    :page="page"
                    :items-per-page="pageSize"
                    disable-sort
                >
                    <template v-slot:header.action v-if="selectedItems.length > 0">
                        <v-btn icon="fa-solid fa-ellipsis-v" variant="plain" color="info">
                            <v-icon icon="fa-solid fa-ellipsis-v"></v-icon>
                            <v-menu activator="parent" close-on-content-click>
                                <v-list density="compact" class="pt-1 pb-1" activatable>
                                    <v-list-item prepend-icon="fa-solid fa-list-check" @click="batchEditDialog = true" v-if="genericModel.model.name == 'Food'">
                                        {{ $t('BatchEdit') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="fa-solid fa-arrows-to-dot" @click="batchMergeDialog = true" v-if="genericModel.model.isMerge">
                                        {{ $t('Merge') }}
                                    </v-list-item>
                                    <v-list-item prepend-icon="$delete" @click="batchDeleteDialog = true" v-if="!genericModel.model.disableDelete">
                                        {{ $t('Delete_All') }}
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-btn>
                    </template>
                    <template v-slot:item.space="{ item }" v-if="genericModel.model.name == 'AiProvider'">
                        <v-chip label v-if="item.space == null" color="success">{{ $t('Global') }}</v-chip>
                        <v-chip label v-else color="info">{{ $t('Space') }}</v-chip>
                    </template>
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
                                        <model-merge-dialog :model="model" :source="[item]"
                                                            @change="loadItems({page: page, itemsPerPage: pageSize, search: query})"></model-merge-dialog>
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

        <batch-delete-dialog :items="selectedItems" :model="props.model" v-model="batchDeleteDialog" activator="model"
                             @change="loadItems({page: page, itemsPerPage: pageSize, search: query})"></batch-delete-dialog>

        <model-merge-dialog :model="model" :source="selectedItems" v-model="batchMergeDialog" activator="model"
                            @change="loadItems({page: page, itemsPerPage: pageSize, search: query})"></model-merge-dialog>

        <batch-edit-food-dialog :items="selectedItems" v-model="batchEditDialog" v-if="model == 'Food'" activator="model"
                                @change="loadItems({page: page, itemsPerPage: pageSize, search: query})"></batch-edit-food-dialog>

    </v-container>
</template>

<script setup lang="ts">


import {onBeforeMount, PropType, ref, watch} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import {EditorSupportedModels, EditorSupportedTypes, GenericModel, getGenericModelFromString, Model,} from "@/types/Models";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useRoute, useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelMergeDialog from "@/components/dialogs/ModelMergeDialog.vue";
import {VDataTableUpdateOptions} from "@/vuetify";
import SyncDialog from "@/components/dialogs/SyncDialog.vue";
import {ApiApi, ApiRecipeListRequest, RecipeImport} from "@/openapi";
import {useTitle} from "@vueuse/core";
import RecipeShareDialog from "@/components/dialogs/RecipeShareDialog.vue";
import AddToShoppingDialog from "@/components/dialogs/AddToShoppingDialog.vue";
import BatchDeleteDialog from "@/components/dialogs/BatchDeleteDialog.vue";
import {useRouteQuery} from "@vueuse/router";
import BatchEditFoodDialog from "@/components/dialogs/BatchEditFoodDialog.vue";

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

const query = useRouteQuery('query', "")
const page = useRouteQuery('page', 1, {transform: Number})
const pageSize = useRouteQuery('pageSize', useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, {transform: Number})

const selectedItems = ref([] as EditorSupportedTypes[])

const batchDeleteDialog = ref(false)
const batchMergeDialog = ref(false)
const batchEditDialog = ref(false)

// data
const loading = ref(false);
const items = ref([] as Array<any>)
const itemCount = ref(0)

const genericModel = ref({} as GenericModel)

// when navigating to ModelListPage from ModelListPage with a different model lifecycle hooks are not called so watch for change here
watch(() => props.model, (newValue, oldValue) => {
    if (newValue != oldValue) {
        genericModel.value = getGenericModelFromString(props.model, t)
        loadItems({page: 1})
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
})

/**
 * load items from API whenever the table calls for it
 * parameters defined by vuetify
 * @param options
 */
function loadItems(options: VDataTableUpdateOptions) {
    loading.value = true
    selectedItems.value = []
    window.scrollTo({top: 0, behavior: 'smooth'})

    page.value = options.page
    pageSize.value = options.itemsPerPage

    genericModel.value.list({query: query.value, page: options.page, pageSize: pageSize.value}).then((r: any) => {
        items.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

// model specific functions

/**
 * convert a RecipeImport to a "real" external recipes and reload the table
 * @param item
 */
function importRecipe(item: RecipeImport) {
    let api = new ApiApi()
    api.apiRecipeImportImportRecipeCreate({id: item.id!, recipeImport: item}).then(r => {
        loadItems({page: 1})
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
        loadItems({page: 1})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>