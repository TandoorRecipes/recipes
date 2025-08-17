<template>
    <v-card class="mt-2" v-if="hasFoodProperties || hasRecipeProperties">
        <v-card-title>
            <v-icon icon="$properties"></v-icon>
            {{ $t('Properties') }}

            <v-btn-toggle border divided density="compact" class="float-right d-print-none" v-if="hasRecipeProperties && hasRecipeProperties" v-model="sourceSelectedToShow">
                <v-btn size="small" value="food">{{ $t('Food') }}</v-btn>
                <v-btn size="small" value="recipe">{{ $t('Recipe') }}</v-btn>
            </v-btn-toggle>
        </v-card-title>
        <v-card-text>
            <v-table density="compact" style="max-width: 800px">
                <thead>
                <tr>
                    <th></th>
                    <th>{{ $t('per_serving') }}</th>
                    <th>{{ $t('total') }}</th>
                    <th v-if="sourceSelectedToShow == 'food'"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="p in propertyList" :key="p.id">
                    <td>{{ p.name }}</td>
                    <td>{{ $n(roundDecimals(p.propertyAmountPerServing)) }} {{ p.unit }}</td>
                    <td>{{ $n(roundDecimals(p.propertyAmountTotal)) }} {{ p.unit }}</td>
                    <td v-if="sourceSelectedToShow == 'food'">
                        <v-btn @click="dialogProperty = p; dialog = true" variant="plain" color="warning" icon="fa-solid fa-triangle-exclamation" size="small" class="d-print-none"
                               v-if="p.missingValue"></v-btn>
                        <v-btn @click="dialogProperty = p; dialog = true" variant="plain" icon="fa-solid fa-circle-info" size="small" v-if="!p.missingValue" class="d-print-none"></v-btn>
                    </td>
                </tr>
                </tbody>
            </v-table>
        </v-card-text>
    </v-card>

    <v-dialog max-width="900px" v-model="dialog">
        <v-card v-if="dialogProperty" :loading="loading">
            <v-closable-card-title :title="`${dialogProperty.propertyAmountTotal} ${dialogProperty.unit} ${dialogProperty.name}`" :sub-title="$t('total')" icon="$properties"
                                   v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item border v-for="fv in dialogProperty.foodValues" :key="`${dialogProperty.id}_${fv.id}`">
                        <template #prepend>
                            <v-progress-circular size="55" width="5" :model-value="(fv.value/dialogProperty.propertyAmountTotal)*100"
                                                 :color="colorScale((fv.value/dialogProperty.propertyAmountTotal)*100)" v-if="fv.value != null && dialogProperty.propertyAmountTotal > 0">
                                {{ Math.round((fv.value / dialogProperty.propertyAmountTotal) * 100) }}%
                            </v-progress-circular>
                            <v-progress-circular size="55" width="5" v-if="fv.value == null">?</v-progress-circular>
                        </template>
                        <span class="ms-2">
                            {{ fv.food.name }}
                        </span>
                        <template #append>
                            <v-chip v-if="fv.value != undefined">{{ $n(fv.value) }} {{ dialogProperty.unit }}</v-chip>
                            <v-chip color="create" v-else-if="fv.missing_conversion" class="cursor-pointer" prepend-icon="$create">
                                {{ $t('Conversion') }}: {{ fv.missing_conversion.base_unit.name }} <i class="fa-solid fa-arrow-right me-1 ms-1"></i>
                                {{ fv.missing_conversion.converted_unit.name }}
                                <model-edit-dialog model="UnitConversion" @create="refreshRecipe()"
                                                   :item-defaults="{baseAmount: 1, baseUnit: fv.missing_conversion.base_unit,  convertedUnit: fv.missing_conversion.converted_unit, food: fv.food}"></model-edit-dialog>
                            </v-chip>
                            <v-chip color="warning" prepend-icon="$edit" class="cursor-pointer" :to="{name: 'ModelEditPage', params: {model: 'Recipe', id: recipe.id}}" v-else-if="fv.missing_unit">
                                {{ $t('NoUnit') }}
                            </v-chip>
                            <v-chip color="error" prepend-icon="$edit" class="cursor-pointer" v-else>
                                {{ $t('MissingProperties') }}
                                <model-edit-dialog model="Food" :item-id="fv.food.id" @update:model-value="refreshRecipe()"></model-edit-dialog>
                            </v-chip>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-btn :to="{ name: 'PropertyEditorPage', query: {recipe: recipe.id} }">{{ $t('Property_Editor') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import {computed, nextTick, onMounted, ref} from "vue";
import {ApiApi, PropertyType, Recipe} from "@/openapi";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {roundDecimals} from "@/utils/number_utils.ts";

type PropertyWrapper = {
    id: number,
    name: string,
    description?: string,
    foodValues: [],
    propertyAmountPerServing: number,
    propertyAmountTotal: number,
    missingValue: boolean,
    unit?: string,
    type: PropertyType,
}

const props = defineProps({
    servings: {type: Number, required: true,},
})

const recipe = defineModel<Recipe>({required: true})

/**
 * determines if the recipe has properties on the recipe directly
 */
const hasRecipeProperties = computed(() => {
    return recipe.value.properties != undefined && recipe.value.properties.length > 0
})

/**
 * determines if the recipe has calculated properties based on its foods
 */
const hasFoodProperties = computed(() => {
    let propertiesFound = false
    for (const [key, fp] of Object.entries(recipe.value.foodProperties)) {
        if (fp.total_value !== 0) {
            propertiesFound = true
        }
    }
    return propertiesFound
})

/**
 * compute list of properties based on recipe or food, depending on what is selected
 */
const propertyList = computed(() => {
    let ptList = [] as PropertyWrapper[]
    if (sourceSelectedToShow.value == 'recipe') {
        if (hasRecipeProperties.value) {
            recipe.value.properties.forEach(rp => {

                ptList.push(
                    {
                        id: rp.propertyType.id!,
                        name: rp.propertyType.name,
                        description: rp.propertyType.description,
                        foodValues: [],
                        propertyAmountPerServing: rp.propertyAmount,
                        propertyAmountTotal: rp.propertyAmount * recipe.value.servings * (props.servings / recipe.value.servings),
                        missingValue: false,
                        unit: rp.propertyType.unit,
                        type: rp.propertyType,
                    }
                )
            })
        }
    } else {
        for (const [key, fp] of Object.entries(recipe.value.foodProperties)) {
            ptList.push(
                {
                    id: fp.id,
                    name: fp.name,
                    description: fp.description,
                    icon: fp.icon,
                    foodValues: fp.food_values,
                    propertyAmountPerServing: fp.total_value / recipe.value.servings,
                    propertyAmountTotal: fp.total_value * (props.servings / recipe.value.servings),
                    missingValue: fp.missing_value,
                    unit: fp.unit,
                    type: fp,
                }
            )
        }
    }

    function compare(a, b) {
        if (a.type.order > b.type.order) {
            return 1
        }
        if (a.type.order < b.type.order) {
            return -1
        }
        return 0
    }

    return ptList.sort(compare)
})

const sourceSelectedToShow = ref<'recipe' | 'food'>("food")
const dialog = ref(false)
const dialogProperty = ref<undefined | PropertyWrapper>(undefined)

const loading = ref(false)

onMounted(() => {
    if (!hasFoodProperties) {
        sourceSelectedToShow.value = "recipe"
    }
})

/**
 * refresh recipe data to pull updated conversions/properties
 */
function refreshRecipe() {
    let api = new ApiApi()
    loading.value = true

    api.apiRecipeRetrieve({id: recipe.value.id!}).then(r => {
        recipe.value = r

        nextTick(() => {
            if(dialogProperty.value != undefined && dialog.value){
                propertyList.value.forEach(pLE => {
                    if (dialogProperty.value.id == pLE.id) {
                        dialogProperty.value = pLE
                    }
                })
            }

            loading.value = false
        })
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * return a color based on the given number
 * used to color the percentage of each food contributing to the total value of a property
 * @param percentage
 */
function colorScale(percentage: number) {
    if (percentage > 80) {
        return 'error'
    }
    if (percentage > 50) {
        return 'warning'
    }
    if (percentage > 30) {
        return 'info'
    }
    return 'success'
}

</script>

<style scoped>

</style>