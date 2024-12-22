<template>
    <v-dialog activator="parent" max-width="600px" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title :title="$t('Add_Servings_to_Shopping', servings)" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-expansion-panels variant="accordion">
                    <v-expansion-panel>
                        <v-expansion-panel-title>{{ recipe.name }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-list>
                                <template v-for="s in recipe.steps">
                                    <v-list-item v-for="i in s.ingredients">
                                        {{ i }}
                                    </v-list-item>
                                </template>
                            </v-list>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel v-for="r in relatedRecipes">
                        <v-expansion-panel-title>{{ r.name }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-list>
                                <template v-for="s in r.steps">
                                    <v-list-item v-for="i in s.ingredients">{{ i }}</v-list-item>
                                </template>
                            </v-list>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
                <v-number-input v-model="servings" class="mt-3" control-variant="split" :label="$t('Servings')"></v-number-input>
            </v-card-text>
            <v-card-actions>
                <v-btn class="float-right" prepend-icon="$create" color="create" @click="createShoppingListRecipe()">{{$t('Add_to_Shopping')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ApiApi, Recipe, RecipeFlat, RecipeOverview, type RecipeShoppingUpdate, type ShoppingListEntryBulkCreate, ShoppingListRecipe} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {VNumberInput} from 'vuetify/labs/VNumberInput'

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true},
})

const dialog = ref(false)
const loading = ref(false)

const servings = ref(1)
const recipe = ref({} as Recipe)
const relatedRecipes = ref([] as Recipe[])

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
        })
    })
}

/**
 * creates a shopping list recipe from all selected ingredients
 */
function createShoppingListRecipe() {
    let api = new ApiApi()
    let shoppingListRecipe = {
        recipe: props.recipe.id,
        servings: servings.value,
    } as ShoppingListRecipe

    let shoppingListEntries = {
        entries: []
    } as ShoppingListEntryBulkCreate

    recipe.value.steps.forEach(step => {
        step.ingredients.forEach(ingredient => {
            shoppingListEntries.entries.push({
                amount: ingredient.amount * (servings.value / (recipe.value.servings ? recipe.value.servings : 1)),
                foodId: ingredient.food ? ingredient.food.id! : null,
                unitId: ingredient.unit ? ingredient.unit.id! : null
            })
        })
    })

    api.apiShoppingListRecipeCreate({shoppingListRecipe: shoppingListRecipe}).then(slr => {

        api.apiShoppingListRecipeBulkCreateEntriesCreate({id: slr.id!, shoppingListEntryBulkCreate: shoppingListEntries}).then(r => {

        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>