<template>
    <v-dialog activator="parent" max-width="600px" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title :title="$t('Add_Servings_to_Shopping', {servings: servings})" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-expansion-panels variant="accordion">
                    <v-expansion-panel v-for="r in dialogRecipes">
                        <v-expansion-panel-title>{{ r.recipe.name }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-list>
                                <v-list-item v-for="e in r.entries">
                                    <v-checkbox v-model="e.checked" size="small" density="compact" hide-details>
                                        <template #label>
                                            {{ $n(e.amount * (servings / r.recipe.servings)) }}
                                            <span class="ms-1" v-if="e.unit">{{ e.unit.name }}</span>
                                            <span class="ms-1" v-if="e.food">{{e.food.name }}</span>
                                        </template>
                                    </v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
                <v-number-input v-model="servings" class="mt-3" control-variant="split" :label="$t('Servings')"></v-number-input>
            </v-card-text>
            <v-card-actions>
                <v-btn class="float-right" prepend-icon="$create" color="create" @click="createShoppingListRecipe()">{{ $t('Add_to_Shopping') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ApiApi, Recipe, RecipeFlat, RecipeOverview, type ShoppingListEntryBulkCreate, ShoppingListRecipe} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {VNumberInput} from 'vuetify/labs/VNumberInput'
import {ShoppingDialogRecipe, ShoppingDialogRecipeEntry} from "@/types/Shopping";

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true},
})

const dialog = ref(false)
const loading = ref(false)

const servings = ref(1)
const recipe = ref({} as Recipe)
const relatedRecipes = ref([] as Recipe[])

const dialogRecipes = ref([] as ShoppingDialogRecipe[])

onMounted(() => {
    loadRecipeData()
})

/**
 * load data for the given recipe and all of its related recipes
 */
function loadRecipeData() {
    let api = new ApiApi()
    let promises: Promise<any>[] = []

    let recipeRequest = api.apiRecipeRetrieve({id: props.recipe.id!}).then(r => {
        recipe.value = r
        servings.value = r.servings ? r.servings : 1
        console.log('main loaded')
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
    promises.push(recipeRequest)

    api.apiRecipeRelatedList({id: props.recipe.id!}).then(r => {
        r.forEach(rs => {
            let p = api.apiRecipeRetrieve({id: rs.id!}).then(recipe => {
                relatedRecipes.value.push(recipe)
                console.log('related loaded', recipe.name)
            })
            promises.push(p)
        })

        Promise.allSettled(promises).then(() => {
            console.log('ALL LOADED')
            loading.value = false

            let allRecipes = [recipe.value].concat(relatedRecipes.value)

            allRecipes.forEach(recipe => {
                let dialogRecipe = {
                    recipe: recipe,
                    entries: [] as ShoppingDialogRecipeEntry[]
                } as ShoppingDialogRecipe

                recipe.steps.forEach(step => {
                    step.ingredients.forEach(ingredient => {
                        dialogRecipe.entries.push({
                            amount: ingredient.amount,
                            food: ingredient.food,
                            unit: ingredient.unit,
                            ingredient: ingredient,
                            checked: (ingredient.food ? !(ingredient.food.ignoreShopping || ingredient.food.foodOnhand) : true),
                        })
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