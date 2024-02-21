<template>
    <RecipeViewComponent :recipe="recipe"></RecipeViewComponent>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import RecipeViewComponent from "@/components/display/RecipeViewComponent.vue";

export default defineComponent({
    name: "RecipeSearchPage",
    components: {RecipeViewComponent},
    props: {
        id: Number
    },
    data() {
        return {
            recipe: {} as Recipe
        }
    },
    mounted() {
        const api = new ApiApi()
        api.retrieveRecipe({id: this.id}).then(r => {
            this.recipe = r
        })
    }
})
</script>

<style scoped>

</style>