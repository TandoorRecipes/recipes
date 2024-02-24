<template>
    <RecipeView :recipe="recipe"></RecipeView>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import RecipeView from "@/components/display/RecipeView.vue";

export default defineComponent({
    name: "RecipeSearchPage",
    components: {RecipeView},
    props: {
        id: {type: String, required: true}
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