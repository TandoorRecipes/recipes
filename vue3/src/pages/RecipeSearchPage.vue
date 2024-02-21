<template>
    <h2>Search</h2>
    <v-text-field placeholde="Search"></v-text-field>

    <v-row>
        <v-col cols="12" sm="3" md="4" v-for="r in recipes" :key="r.id">
            <RecipeCardComponent :recipe="r"></RecipeCardComponent>
        </v-col>
    </v-row>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsComponent.vue";
import RecipeCardComponent from "@/components/display/RecipeCardComponent.vue";

export default defineComponent({
    name: "RecipeSearchPage",
    components: {RecipeCardComponent, KeywordsComponent},
    data() {
        return {
            recipes: [] as Recipe[]
        }
    },
    mounted() {
        const api = new ApiApi()
        api.listRecipes().then(r => {
            this.recipes = r.results
        })
    }
})
</script>

<style scoped>

</style>