<template>
    <v-card class="mt-2">
        <v-card-title>
            <v-icon icon="$properties"></v-icon>
            {{ $t('Properties') }}

            <v-btn-toggle border divided density="compact" class="float-right" v-if="hasRecipeProperties && hasRecipeProperties" v-model="sourceSelectedToShow">
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
                    <td>{{p.name}}</td>
                    <td>{{$n(p.propertyAmountPerServing)}} {{p.unit}}</td>
                    <td>{{$n(p.propertyAmountTotal)}} {{p.unit}}</td>
                    <td v-if="sourceSelectedToShow == 'food'">
                        <v-btn @click="dialogProperty = p; dialog = true" variant="plain" color="warning" icon="fa-solid fa-triangle-exclamation" size="small" v-if="p.missingValue"></v-btn>
                        <v-btn @click="dialogProperty = p; dialog = true" variant="plain"  icon="fa-solid fa-circle-info" size="small" v-if="!p.missingValue"></v-btn>
                    </td>
                </tr>
                </tbody>
            </v-table>
        </v-card-text>
    </v-card>

    <v-dialog max-width="900px" v-model="dialog">
        <v-card v-if="dialogProperty">
            <v-closable-card-title :title="`${dialogProperty.propertyAmountTotal} ${dialogProperty.unit} ${dialogProperty.name}`" :sub-title="$t('total')" icon="$properties" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item border v-for="fv in dialogProperty.foodValues">
                        <template #prepend>
                            <v-progress-circular size="55" width="5" :model-value="(fv.value/dialogProperty.propertyAmountTotal)*100" :color="colorScale((fv.value/dialogProperty.propertyAmountTotal)*100)" v-if="fv.value != null">{{Math.round((fv.value/dialogProperty.propertyAmountTotal)*100)}}%</v-progress-circular>
                            <v-progress-circular size="55" width="5" v-if="fv.value == null">?</v-progress-circular>
                        </template>
                        <span class="ms-2">
                            {{ fv.food }}
                        </span>
                        <template #append>
                            <v-chip v-if="fv.value">{{$n(fv.value)}} {{dialogProperty.unit}}</v-chip>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-btn :to="{ name: 'PropertyEditorPage', query: {recipe: recipe.id} }">{{$t('Property_Editor')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import {PropertyType, Recipe} from "@/openapi";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";

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
    recipe: {type: {} as PropType<Recipe>, required: true},
    servings: { type: Number,  required: true, },
})

/**
 * determines if the recipe has properties on the recipe directly
 */
const hasRecipeProperties = computed(() => {
    return props.recipe.properties != undefined && props.recipe.properties.length > 0
})

/**
 * determines if the recipe has calculated properties based on its foods
 */
const hasFoodProperties = computed(() => {
    let propertiesFound = false
    for (const [key, fp] of Object.entries(props.recipe.foodProperties)) {
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
            props.recipe.properties.forEach(rp => {
                ptList.push(
                    {
                        id: rp.propertyType.id!,
                        name: rp.propertyType.name,
                        description: rp.propertyType.description,
                        foodValues: [],
                        propertyAmountPerServing: rp.propertyAmount,
                        propertyAmountTotal: rp.propertyAmount * props.recipe.servings * (props.servings / props.recipe.servings),
                        missingValue: false,
                        unit: rp.propertyType.unit,
                        type: rp.propertyType,
                    }
                )
            })
        }
    } else {
        for (const [key, fp] of Object.entries(props.recipe.foodProperties)) {
            ptList.push(
                {
                    id: fp.id,
                    name: fp.name,
                    description: fp.description,
                    icon: fp.icon,
                    foodValues: fp.food_values,
                    propertyAmountPerServing: fp.total_value / props.recipe.servings,
                    propertyAmountTotal: fp.total_value * (props.servings / props.recipe.servings),
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
const dialogProperty = ref<undefined|PropertyWrapper>(undefined)

onMounted(() => {
    if (!hasFoodProperties) {
        sourceSelectedToShow.value = "recipe"
    }
})

/**
 * return a color based on the given number
 * used to color the percentage of each food contributing to the total value of a property
 * @param percentage
 */
function colorScale(percentage: number){
    if(percentage > 80){
        return 'error'
    }
    if(percentage > 50){
        return 'warning'
    }
    if(percentage > 30){
        return 'info'
    }
    return 'success'
}

</script>

<style scoped>

</style>