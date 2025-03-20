<template>
    <v-container>
        <v-card :loading="recipeLoading || propertyTypesLoading">
            <v-card-title>{{ $t('Property_Editor') }}</v-card-title>
            <v-card-text>
                <model-select append-to-body model="Recipe" v-model="recipe" @update:model-value="loadRecipe(recipe.id!)"></model-select>
            </v-card-text>
        </v-card>
        <v-row>
            <v-col>
                <v-table class="mt-2">
                    <thead>
                    <tr>
                        <th>{{ $t('Food') }}</th>
                        <th>
                            <v-btn variant="outlined" block href="https://fdc.nal.usda.gov/food-search" target="_blank" prepend-icon="$search" stacked>{{ $t('FDC_ID') }}</v-btn>
                        </th>
                        <th>
                            <v-btn variant="outlined" @click="dialog = true" block stacked>{{ $t('Amount') }}</v-btn>
                        </th>
                        <th>
                            <v-btn variant="outlined" @click="dialog = true" block stacked>{{ $t('Properties_Food_Unit') }}</v-btn>
                        </th>
                        <th v-for="pt in propertyTypes" :key="pt.id!">
                            <v-btn stacked block variant="outlined" class="mt-2 mb-2">
                                <span>{{ pt.name }}</span>
                                <span>
                        <v-chip color="info" size="x-small"><v-icon icon="fa-solid fa-arrow-down-1-9"></v-icon>{{ pt.order }}</v-chip>
                        <v-chip color="success" size="x-small" v-if="pt.fdcId"><v-icon icon="fa-solid fa-check"></v-icon>FDC</v-chip>
                        <v-chip color="error" size="x-small" v-if="!pt.fdcId"><v-icon icon="fa-solid fa-times"></v-icon>FDC</v-chip>
                        </span>
                                <model-edit-dialog model="PropertyType" :item="pt"></model-edit-dialog>
                            </v-btn>
                        </th>
                        <th>
                            <v-btn color="create" class="mt-1 float-right">
                                <v-icon icon="$create"></v-icon>
                                <model-edit-dialog model="PropertyType" @create="(pt:PropertyType) => propertyTypes.push(pt)"></model-edit-dialog>
                            </v-btn>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="[i, food] in foods.entries()">
                        <td>{{ food.name }}</td>
                        <td>
                            <v-text-field type="number" v-model="food.fdcId" density="compact" hide-details @change="updateFood(food)" style="min-width: 180px"
                                          :loading="food.loading">
                                <template #append-inner>
                                    <v-btn @click="updateFoodFdcData(food)" icon="fa-solid fa-arrows-rotate" size="small" density="compact" variant="plain"
                                           v-if="food.fdcId"></v-btn>
                                    <v-btn :href="`https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`" target="_blank" icon="fa-solid fa-arrow-up-right-from-square"
                                           size="small" variant="plain" v-if="food.fdcId"></v-btn>
                                </template>
                            </v-text-field>
                        </td>
                        <td>
                            <v-text-field type="number" v-model="food.propertiesFoodAmount" density="compact" hide-details @change="updateFood(food)"
                                          :loading="food.loading"></v-text-field>
                        </td>
                        <td>
                            <model-select model="Unit" density="compact" v-model="food.propertiesFoodUnit" hide-details @update:model-value="updateFood(food)"
                                          :loading="food.loading"></model-select>
                        </td>
                        <td v-for="p in food.properties" v-bind:key="`${food.id}_${p.propertyType.id}`">
                            <v-text-field type="number" v-model="p.propertyAmount" density="compact" hide-details v-if="p.propertyAmount != null" @change="updateFood(food)"
                                          :loading="food.loading" @click:clear="deleteFoodProperty(p, food)" clearable></v-text-field>
                            <v-btn variant="outlined" color="create" block v-if="p.propertyAmount == null" @click="p.propertyAmount = 0">
                                <v-icon icon="$create"></v-icon>
                            </v-btn>
                        </td>
                        <td>

                        </td>
                    </tr>
                    </tbody>
                </v-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card prepend-icon="fa-solid fa-calculator" :title="$t('Calculator')">
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="3">
                                <v-text-field type="number" v-model="calculatorFromNumerator">
                                    <template #append>
                                        <i class="fa-solid fa-divide"></i>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field type="number" v-model="calculatorFromDenominator">
                                    <template #append>
                                        <i class="fa-solid fa-equals"></i>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field type="number" v-model="calculatorToNumerator">
                                    <template #append>
                                        <i class="fa-solid fa-divide"></i>
                                    </template>
                                    <template #append-inner>
                                        <btn-copy variant="plain" :copy-value="calculatorToNumerator"></btn-copy>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field type="number" v-model="calculatorToDenominator"></v-text-field>
                            </v-col>
                        </v-row>


                    </v-card-text>
                </v-card>

            </v-col>
        </v-row>
    </v-container>

    <v-dialog v-model="dialog" max-width="600">
        <v-card>
            <v-closable-card-title v-model="dialog" :title="$t('Update')"></v-closable-card-title>
            <v-card-text>
                <p>{{ $t('Update_Existing_Data') }}</p>

                <model-select model="Unit" :label="$t('Properties_Food_Unit')" v-model="dialogUnit">
                    <template v-slot:append>
                        <v-btn @click="changeAllUnits(dialogUnit)" icon="$save" color="save" :disabled="dialogUnit == undefined"></v-btn>
                    </template>
                </model-select>

                <v-text-field type="number" :label="$t('Properties_Food_Amount')" v-model="dialogAmount">
                    <template v-slot:append>
                        <v-btn @click="changeAllPropertyFoodAmounts(dialogAmount)" icon="$save" color="save"></v-btn>
                    </template>
                </v-text-field>

            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {ApiApi, Food, Property, PropertyType, Recipe, Unit} from "@/openapi";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {useUrlSearchParams} from "@vueuse/core";
import BtnCopy from "@/components/buttons/BtnCopy.vue";

const params = useUrlSearchParams('history', {})

const calculatorToNumerator = computed(() => {
    return (calculatorFromNumerator.value / calculatorFromDenominator.value * calculatorToDenominator.value).toFixed(2)
})

const dialog = ref(false)
const dialogAmount = ref(100)
const dialogUnit = ref<undefined | Unit>(undefined)

const calculatorFromNumerator = ref(250)
const calculatorFromDenominator = ref(500)
const calculatorToDenominator = ref(100)

const recipe = ref<undefined | Recipe>()
const propertyTypes = ref([] as PropertyType[])
const foods = ref(new Map<number, Food & { loading?: boolean }>())

const recipeLoading = ref(false)
const propertyTypesLoading = ref(false)

onMounted(() => {
    loadPropertyTypes()

    if (params.recipe && typeof params.recipe == "string" && !isNaN(parseInt(params.recipe))) {
        loadRecipe(parseInt(params.recipe))
    }
})

/**
 * select or query param only load limited recipe data
 * function to retrieve recipe with all data
 * if successful trigger building of food map
 * @param id recipe id
 */
function loadRecipe(id: number) {
    let api = new ApiApi()
    recipeLoading.value = true
    api.apiRecipeRetrieve({id: id}).then(r => {
        recipe.value = r
        buildFoodMap()
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        recipeLoading.value = false
    })
}

/**
 * load property types from server, if successful trigger building of food map
 */
function loadPropertyTypes() {
    let api = new ApiApi()
    propertyTypesLoading.value = true
    api.apiPropertyTypeList().then(r => {
        propertyTypes.value = r.results
        buildFoodMap()
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        propertyTypesLoading.value = false
    })
}

/**
 * build map structure with foods and properties
 * add properties if a food is missing any
 * set null to indicate missing property, 0 for properties with the actual value 0
 */
function buildFoodMap() {
    foods.value = new Map<number, Food & { loading?: boolean }>()

    if (recipe.value != undefined) {
        recipe.value.steps.forEach(step => {
            step.ingredients.forEach(ingredient => {
                if (ingredient.food && !foods.value.has(ingredient.food.id!)) {
                    let food: Food & { loading?: boolean } = buildFoodProperties(ingredient.food)
                    food.loading = false
                    foods.value.set(food.id!, food)
                }
            })
        })
    }
}

/**
 * add all property types to food in the correct order
 * add null if no data exists for a property type to indicate a missing property
 * @param food
 */
function buildFoodProperties(food: Food) {
    let existingProperties = new Map<number, Property>()
    food.properties!.forEach(fp => {
        existingProperties.set(fp.propertyType.id!, fp)
    })

    food.properties = [] as Property[]

    propertyTypes.value.forEach(pt => {
        if (existingProperties.has(pt.id!)) {
            food.properties!.push(existingProperties.get(pt.id!))
        } else {
            food.properties!.push({propertyType: pt, propertyAmount: null} as Property)
        }
    })

    return food
}

/**
 * deletes the given property either on client or also on server if it has an id
 * @param p
 * @param food
 */
function deleteFoodProperty(p: Property, food: Food & { loading?: boolean } ){
    let api = new ApiApi()

    if(p.id){
        food.loading = true
        api.apiPropertyDestroy({id: p.id}).then(r => {
            p.propertyAmount = null
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            food.loading = false
        })
    } else {
        p.propertyAmount = null
    }
}

/**
 * update food
 * @param food
 */
function updateFood(food: Food & { loading?: boolean }) {
    let api = new ApiApi()
    food.loading = true
    api.apiFoodPartialUpdate({id: food.id!, patchedFood: food}).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        food.loading = false
    })
}

/**
 * Update the food FDC data on the server and put the updated food into the food map
 * @param food
 */
function updateFoodFdcData(food: Food & { loading?: boolean }) {
    let api = new ApiApi()
    food.loading = true
    if (food.fdcId) {
        api.apiFoodFdcCreate({id: food.id!, food: food}).then(r => {
            foods.value.set(r.id!, buildFoodProperties(r))
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            food.loading = false
        })
    }
}

/**
 * update all foods with the given unit
 * @param unit
 */
function changeAllUnits(unit: Unit) {
    foods.value.forEach(food => {
        food.propertiesFoodUnit = unit
        updateFood(food)
    })
}

/**
 * update all foods with the given amount
 * @param amount
 */
function changeAllPropertyFoodAmounts(amount: number) {
    foods.value.forEach(food => {
        food.propertiesFoodAmount = amount
        updateFood(food)
    })
}

</script>

<style scoped>

</style>