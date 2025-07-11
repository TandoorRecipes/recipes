<template>
    <v-dialog activator="parent" max-width="600px" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title :title="$t('Add_Servings_to_Shopping', {servings: servings})" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-expansion-panels variant="accordion" v-model="panel">
                    <v-expansion-panel v-for="r in dialogRecipes" :key="r.recipe.id!" :value="r.recipe.id!">
                        <v-expansion-panel-title>{{ r.recipe.name }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-table density="compact">
                                <tbody>
                                <tr v-for="e in r.entries" :key="e.id" @click="e.checked = !e.checked" class="cursor-pointer">
                                    <td style="width: 1%; text-wrap: nowrap" class="pa-0">
                                        <v-checkbox-btn v-model="e.checked" color="success"></v-checkbox-btn>
                                    </td>
                                    <td style="width: 1%; text-wrap: nowrap" class="pr-1"
                                        v-html="calculateFoodAmount(e.amount, ingredientFactor, useUserPreferenceStore().userSettings.useFractions)"></td>
                                    <td style="width: 1%; text-wrap: nowrap" class="pr-1">
                                        <template v-if="e.unit"> {{ ingredientToUnitString(e.ingredient, ingredientFactor) }}</template>
                                    </td>
                                    <td>
                                        <template v-if="e.food"> {{ ingredientToFoodString(e.ingredient, ingredientFactor) }}</template>
                                    </td>
                                </tr>
                                </tbody>
                            </v-table>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
                <v-number-input v-model="servings" class="mt-3" control-variant="split" :label="$t('Servings')" :precision="2" :disabled="loading"></v-number-input>
            </v-card-text>
            <v-card-actions>
                <v-btn class="float-right" prepend-icon="$create" color="create" @click="createShoppingListRecipe()" :disabled="loading">{{ $t('Add_to_Shopping') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ApiApi, MealPlan, Recipe, RecipeFlat, RecipeOverview, type ShoppingListEntryBulkCreate, ShoppingListRecipe} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {ShoppingDialogRecipe, ShoppingDialogRecipeEntry} from "@/types/Shopping";
import {calculateFoodAmount} from "@/utils/number_utils";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {ingredientToUnitString, ingredientToFoodString} from "@/utils/model_utils.ts";

const emit = defineEmits(['created'])

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true},
    mealPlan: {type: Object as PropType<MealPlan>, required: false},
})

const dialog = ref(false)
const loading = ref(false)
const panel = ref(0)

const servings = ref(1)
const recipe = ref({} as Recipe)
const relatedRecipes = ref([] as Recipe[])

const dialogRecipes = ref([] as ShoppingDialogRecipe[])

const ingredientFactor = computed(() => {
    return servings.value / ((recipe.value.servings != undefined) ? recipe.value.servings : 1)
})

onMounted(() => {
    loadRecipeData()
})

/**
 * load data for the given recipe and all of its related recipes
 */
function loadRecipeData() {
    let api = new ApiApi()
    let promises: Promise<any>[] = []
    loading.value = true

    let recipeRequest = api.apiRecipeRetrieve({id: props.recipe.id!}).then(r => {
        recipe.value = r
        servings.value = r.servings ? r.servings : 1
        panel.value = r.id!
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
    promises.push(recipeRequest)

    api.apiRecipeRelatedList({id: props.recipe.id!}).then(r => {
        r.forEach(rs => {
            let p = api.apiRecipeRetrieve({id: rs.id!}).then(recipe => {
                relatedRecipes.value.push(recipe)
            })
            promises.push(p)
        })

        Promise.allSettled(promises).then(() => {
            loading.value = false

            let allRecipes = [recipe.value].concat(relatedRecipes.value)

            allRecipes.forEach(recipe => {
                let dialogRecipe = {
                    recipe: recipe,
                    entries: [] as ShoppingDialogRecipeEntry[]
                } as ShoppingDialogRecipe

                recipe.steps.forEach(step => {
                    step.ingredients.forEach(ingredient => {
                        if (!ingredient.isHeader) {
                            dialogRecipe.entries.push({
                                amount: ingredient.amount,
                                food: ingredient.food,
                                unit: ingredient.unit,
                                ingredient: ingredient,
                                checked: (ingredient.food ? !(ingredient.food.ignoreShopping || ingredient.food.foodOnhand) : true),
                            })
                        }
                    })
                })

                dialogRecipes.value.push(dialogRecipe)
            })
        })
    })
}

/**
 * creates a shopping list recipe from all selected ingredients
 */
function createShoppingListRecipe() {
    let api = new ApiApi()
    loading.value = true

    let shoppingListRecipe = {
        recipe: props.recipe.id,
        servings: servings.value,
    } as ShoppingListRecipe

    if (props.mealPlan && props.mealPlan.id) {
        shoppingListRecipe.mealplan = props.mealPlan.id!
    }

    let shoppingListEntries = {
        entries: []
    } as ShoppingListEntryBulkCreate

    dialogRecipes.value.forEach(dialogRecipe => {
        dialogRecipe.entries.forEach(entry => {
            if (entry.checked) {
                shoppingListEntries.entries.push({
                    amount: entry.amount * (servings.value / (recipe.value.servings ? recipe.value.servings : 1)),
                    foodId: entry.food ? entry.food.id! : null,
                    unitId: entry.unit ? entry.unit.id! : null,
                    ingredientId: entry.ingredient ? entry.ingredient.id! : null,
                })
            }
        })
    })

    api.apiShoppingListRecipeCreate({shoppingListRecipe: shoppingListRecipe}).then(slr => {
        api.apiShoppingListRecipeBulkCreateEntriesCreate({id: slr.id!, shoppingListEntryBulkCreate: shoppingListEntries}).then(r => {
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
            dialog.value = false
            emit('created')
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>