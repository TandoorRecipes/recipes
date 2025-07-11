<template>
    <v-container>
        <v-card :loading="filtersLoading">
            <v-card-title>{{ $t('Ingredient Editor') }}</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <closable-help-alert
                            class="mb-2"
                            :text="$t('IngredientEditorHelp')"></closable-help-alert>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="6">

                        <model-select model="Food" v-model="selectedFood" @update:modelValue="refreshPage()" append-to-body>
                            <template #append>
                                <v-btn icon variant="plain">
                                    <v-icon icon="$menu"></v-icon>
                                    <v-menu activator="parent">
                                        <v-list density="compact">
                                            <v-list-item link prepend-icon="$edit" :disabled="!selectedFood">
                                                {{ $t('Edit') }}
                                                <model-edit-dialog model="Food" :item="selectedFood" activator="parent" @save="(obj: Food) => {selectedFood = obj}"
                                                                   @delete="selectedFood = null; refreshPage()"></model-edit-dialog>
                                            </v-list-item>
                                            <v-list-item link prepend-icon="fa-solid fa-arrows-to-dot" :disabled="!selectedFood">
                                                {{ $t('Merge') }}
                                                <model-merge-dialog :source="selectedFood" model="Food"
                                                                    @change="(obj: Food) => {selectedFood = obj;refreshPage()} "></model-merge-dialog>
                                            </v-list-item>

                                            <v-list-item link prepend-icon="$automation" :disabled="!selectedFood">
                                                {{ $t('Automate') }}
                                                <model-edit-dialog model="Automation"  activator="parent" :item-defaults="{param1: selectedFood.name, type: 'FOOD_ALIAS'}" v-if="selectedFood"></model-edit-dialog>
                                            </v-list-item>

                                            <v-list-item link prepend-icon="$delete" :disabled="!selectedFood">
                                                {{ $t('Delete') }}
                                                <delete-confirm-dialog :model-name="$t('Food')" :object-name="selectedFood.name" v-if="selectedFood"
                                                                       @delete="deleteFood()"></delete-confirm-dialog>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-btn>
                                <v-btn icon="fa-solid fa-carrot" :to="{name: 'ModelListPage', params: {model: 'food'}}" variant="plain"></v-btn>
                            </template>
                        </model-select>
                    </v-col>
                    <v-col cols="12" md="6">
                        <model-select model="Unit" v-model="selectedUnit" @update:modelValue="refreshPage()" append-to-body>
                            <template #append>
                                <v-btn icon variant="plain">
                                    <v-icon icon="$menu"></v-icon>
                                    <v-menu activator="parent">
                                        <v-list density="compact">
                                            <v-list-item link prepend-icon="$edit" :disabled="!selectedUnit">
                                                {{ $t('Edit') }}
                                                <model-edit-dialog model="Unit" :item="selectedUnit" activator="parent" @save="(obj: Food) => {selectedUnit = obj}"
                                                                   @delete="selectedUnit = null; refreshPage()"></model-edit-dialog>
                                            </v-list-item>
                                            <v-list-item link prepend-icon="fa-solid fa-arrows-to-dot" :disabled="!selectedUnit">
                                                {{ $t('Merge') }}
                                                <model-merge-dialog :source="selectedUnit" model="Unit"
                                                                    @change="(obj: Food) => {selectedUnit = obj;refreshPage()} "></model-merge-dialog>
                                            </v-list-item>
                                            <v-list-item link prepend-icon="$automation" :disabled="!selectedUnit">
                                                {{ $t('Automate') }}
                                                <model-edit-dialog model="Automation"  activator="parent" :item-defaults="{param1: selectedUnit.name, type: 'UNIT_ALIAS'}" v-if="selectedUnit"></model-edit-dialog>
                                            </v-list-item>
                                            <v-list-item link prepend-icon="$delete" :disabled="!selectedUnit">
                                                {{ $t('Delete') }}
                                                <delete-confirm-dialog :model-name="$t('Unit')" :object-name="selectedUnit.name" v-if="selectedUnit"
                                                                       @delete="deleteUnit()"></delete-confirm-dialog>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-btn>
                                <v-btn icon="fa-solid fa-scale-balanced" :to="{name: 'ModelListPage', params: {model: 'unit'}}" variant="plain"></v-btn>
                            </template>
                        </model-select>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card class="mt-2">
            <v-data-table-server
                @update:options="loadItems"
                :items="items"
                :items-length="tableItemCount"
                :items-per-page="tablePageSize"
                :headers="tableHeaders"
                :expanded="items.flatMap((i:Ingredient) => i.id)"
                :page="tablePage"
                :loading="ingredientsLoading"
                disable-sort
            >
                <template v-slot:header.action="{ column }">
                    <v-btn size="small" color="save" @click="updateAllIngredients()">
                        <v-icon icon="$save"></v-icon>
                    </v-btn>
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <tr>
                        <td :colspan="columns.length">
                            <v-btn variant="outlined" color="secondary" target="_blank" :to="{name: 'RecipeViewPage', params: {id: r.id}}" v-for="r in item.usedInRecipes">
                                {{ r.name }} (#{{ r.id }})
                            </v-btn>
                        </td>
                    </tr>
                </template>

                <template v-slot:item.amount="{ item }">
                    <v-number-input :label="$t('Amount')" v-model="item.amount" inset control-variant="stacked" hide-details :min="0" density="compact"
                                    @update:modelValue="item.changed = true" :precision="2"></v-number-input>
                </template>
                <template v-slot:item.unit="{ item }">
                    <model-select model="Unit" v-model="item.unit" :label="$t('Unit')" density="compact" hide-details allow-create append-to-body
                                  @update:modelValue="item.changed = true">
                    </model-select>
                </template>
                <template v-slot:item.food="{ item }">
                    <model-select model="Food" v-model="item.food" :label="$t('Food')" density="compact" hide-details allow-create append-to-body
                                  @update:modelValue="item.changed = true"></model-select>
                </template>
                <template v-slot:item.note="{ item }">
                    <v-text-field v-model="item.note" :label="$t('Note')" density="compact" hide-details @update:modelValue="item.changed = true"></v-text-field>
                </template>

                <template v-slot:item.action="{ item }">
                    <v-btn-group density="comfortable">
                        <v-btn size="small" color="save" :loading="item.loading" @click="updateIngredient(item)" :disabled="!item.changed">
                            <v-icon icon="$save"></v-icon>
                        </v-btn>
                        <v-btn size="small" color="delete" :loading="item.loading">
                            <v-icon icon="$delete"></v-icon>
                            <delete-confirm-dialog :model-name="$t('Ingredient')" @delete="deleteIngredient(item)"></delete-confirm-dialog>
                        </v-btn>
                    </v-btn-group>
                </template>

            </v-data-table-server>

        </v-card>


    </v-container>
</template>

<script setup lang="ts">

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import ClosableHelpAlert from "@/components/display/ClosableHelpAlert.vue";
import {ApiApi, ApiIngredientListRequest, Food, Ingredient, Unit} from "@/openapi";
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useUrlSearchParams} from "@vueuse/core";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import ModelMergeDialog from "@/components/dialogs/ModelMergeDialog.vue";

const {t} = useI18n()
const params = useUrlSearchParams('history', {})

type EditorIngredient = Ingredient & { changed: boolean, loading: boolean }

const items = ref([] as EditorIngredient[])

const tableHeaders = [
    {title: t('Amount'), key: 'amount', minWidth: '120px', cellProps: {class: 'pr-0'}},
    {title: t('Unit'), key: 'unit', minWidth: '120px', cellProps: {class: 'pr-0'}},
    {title: t('Food'), key: 'food', minWidth: '120px', cellProps: {class: 'pr-0'}},
    {title: t('Note'), key: 'note', minWidth: '120px', cellProps: {class: 'pr-0'}},
    {key: 'action', width: '1%', noBreak: true, align: 'end'},
]

const tablePage = ref(1)
const tablePageSize = ref(25)
const tableItemCount = ref(0)

const ingredientsLoading = ref(false)
const filtersLoading = ref(true)

const selectedFood = ref<null | Food>(null)
const selectedUnit = ref<null | Unit>(null)

const deleteConfirmDialog = ref(false)

onMounted(() => {
    getAndLoadParameters()
})

/**
 * update all changed ingredients
 */
function updateAllIngredients() {
    items.value.forEach((item) => {
        if (item.changed) {
            updateIngredient(item)
        }
    })
}

/**
 * update a single ingredient in the database
 * @param ingredient
 */
function updateIngredient(ingredient: EditorIngredient) {
    let api = new ApiApi()
    ingredient.loading = true
    api.apiIngredientUpdate({id: ingredient.id!, ingredient: ingredient}).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        ingredient.loading = false
        ingredient.changed = false
    })
}

/**
 * delete the given ingredient form the database and local client data
 * @param ingredient
 */
function deleteIngredient(ingredient: EditorIngredient) {
    let api = new ApiApi()
    ingredient.loading = true
    api.apiIngredientDestroy({id: ingredient.id!}).then(r => {
        items.value = items.value.filter(i => i.id != ingredient.id)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    }).finally(() => {
        ingredient.loading = false
    })
}

/**
 * use URL parameters to retrieve associated food or unit, after that load table data
 */
function getAndLoadParameters() {
    let api = new ApiApi()
    let promises: Promise<any>[] = []
    filtersLoading.value = true

    if (params.food_id && !Number.isNaN(params.food_id)) {
        promises.push(api.apiFoodRetrieve({id: Number(params.food_id)}).then(r => {
            selectedFood.value = r
        }))
    }

    if (params.unit_id && !Number.isNaN(params.unit_id)) {
        promises.push(api.apiUnitRetrieve({id: Number(params.unit_id)}).then(r => {
            selectedUnit.value = r
        }))
    }

    Promise.allSettled(promises).then(() => {
        filtersLoading.value = false
        if (params.food_id || params.unit_id) {
            refreshPage()
        }
    })
}

/**
 * manually trigger item load
 */
function refreshPage() {
    loadItems({page: tablePage.value, itemsPerPage: tablePageSize.value})
}

/**
 * load items from server
 * @param page
 * @param itemsPerPage
 * @param search
 * @param sortBy
 * @param groupBy
 */
function loadItems({page, itemsPerPage, search, sortBy, groupBy}) {
    // never load unfiltered, only load if at least one filter is set
    if (!selectedFood.value && !selectedUnit.value) {
        items.value = []
        return
    }

    let api = new ApiApi()
    ingredientsLoading.value = true

    let requestParameters: ApiIngredientListRequest = {page: page, pageSize: itemsPerPage}
    if (selectedFood.value) {
        requestParameters.food = selectedFood.value.id!
    }

    if (selectedUnit.value) {
        requestParameters.unit = selectedUnit.value.id!
    }

    api.apiIngredientList(requestParameters).then(r => {
        items.value = r.results
        tableItemCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        ingredientsLoading.value = false
    })
}

/**
 * delete the selected food
 */
function deleteFood() {
    let api = new ApiApi()
    if (selectedFood.value) {
        filtersLoading.value = true
        api.apiFoodDestroy({id: selectedFood.value.id!}).then(r => {
            selectedFood.value = null
            refreshPage()
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            filtersLoading.value = false
        })
    }
}

/**
 * delete the selected unit
 */
function deleteUnit() {
    let api = new ApiApi()
    if (selectedUnit.value) {
        filtersLoading.value = true
        api.apiUnitDestroy({id: selectedUnit.value.id!}).then(r => {
            selectedUnit.value = null
            refreshPage()
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            filtersLoading.value = false
        })
    }
}

</script>

<style scoped>

</style>