<template>
    <v-card :loading="loading">
        <v-card-title>{{ props.recipeOverview.name }}</v-card-title>
        <recipe-image height="25vh" :recipe="props.recipeOverview"></recipe-image>
        <v-card-subtitle>{{ props.recipeOverview.description }}</v-card-subtitle>
        <v-card-text>
            <keywords-bar :keywords="props.recipeOverview.keywords"></keywords-bar>
        </v-card-text>
        <ingredients-table :ingredient-factor="1" v-model="ingredients" :show-checkbox="false"></ingredients-table>
        <v-card-actions>
            <v-btn :to="{name: 'RecipeViewPage', params: {id: props.recipeOverview.id}}">{{$t('Open')}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import RecipeImage from "@/components/display/RecipeImage.vue";
import {ApiApi, Ingredient, Recipe, RecipeOverview} from "@/openapi";
import {onMounted, PropType, ref} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import {getRecipeIngredients} from "@/utils/model_utils";
import {useI18n} from "vue-i18n";
import KeywordsBar from "@/components/display/KeywordsBar.vue";

const props = defineProps({
    recipeOverview: {type: {} as PropType<RecipeOverview>, required: true}
})

const {t} = useI18n()

const loading = ref(false)
const recipe = ref({} as Recipe)
const ingredients = ref([] as Ingredient[])

onMounted(() => {
    loadRecipe()
})

function loadRecipe() {
    let api = new ApiApi()

    loading.value = true

    api.apiRecipeRetrieve({id: props.recipeOverview.id!}).then(r => {
        recipe.value = r
        ingredients.value = getRecipeIngredients(recipe.value, t,{showStepHeaders: true})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>


<style scoped>

</style>