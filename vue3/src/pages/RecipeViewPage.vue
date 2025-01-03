<template>
    <v-container :class="{'ps-0 pe-0 pt-0': mobile}">
        <recipe-view v-model="recipe"></recipe-view>
    </v-container>

</template>

<script setup lang="ts">
import {defineComponent, onMounted, ref, watch} from 'vue'
import {ApiApi, Recipe, ViewLog} from "@/openapi";
import RecipeView from "@/components/display/RecipeView.vue";
import {useDisplay} from "vuetify";

const props = defineProps({
    id: {type: String, required: true}
})

const {mobile} = useDisplay()

const recipe = ref({} as Recipe)

watch(() => props.id, () => {
    refreshData(props.id)
})

onMounted(() => {
    refreshData(props.id)
})

function refreshData(recipeId: string) {
    const api = new ApiApi()
    recipe.value = {} as Recipe
    api.apiRecipeRetrieve({id: Number(recipeId)}).then(r => {
        recipe.value = r
    })

    api.apiViewLogCreate({
        viewLog: {
            recipe: Number(recipeId)
        } as ViewLog
    })
}

</script>

<style scoped>

</style>