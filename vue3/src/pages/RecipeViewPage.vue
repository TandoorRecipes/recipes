<template>
    <v-img max-height="15vh" :src="recipe.image"></v-img>
    <h3>{{ recipe.name }}</h3>
    {{ recipe.description }}

    {{recipe}}
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";

export default defineComponent({
    name: "RecipeSearchPage",
    components: {},
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