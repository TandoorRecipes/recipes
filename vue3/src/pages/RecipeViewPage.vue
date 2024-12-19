<template>
    <v-container :class="{'ps-0 pe-0 pt-0': mobile}">
        <recipe-view :recipe="recipe"></recipe-view>
    </v-container>

</template>

<script setup lang="ts">
import {defineComponent, onMounted, ref} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import RecipeView from "@/components/display/RecipeView.vue";
import {useDisplay} from "vuetify";

const props = defineProps({
    id: {type: String, required: true}
})

const {mobile} = useDisplay()

const recipe = ref({} as Recipe)

onMounted(() => {
    refreshData(props.id)
})

function refreshData(recipeId: string) {
    const api = new ApiApi()
    api.apiRecipeRetrieve({id: Number(recipeId)}).then(r => {
        recipe.value = r
    })
}

</script>

<style scoped>

</style>