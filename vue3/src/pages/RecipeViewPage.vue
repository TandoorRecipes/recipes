<template>
    <v-container class="ps-0 pe-0 pt-0">
        <RecipeView :recipe="recipe"></RecipeView>
    </v-container>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import RecipeView from "@/components/display/RecipeView.vue";

export default defineComponent({
    name: "RecipeSearchPage",
    components: {RecipeView},
    watch: {
        id: function (newValue) {
            this.refreshData(newValue)
        },
    },
    props: {
        id: {type: String, required: true}
    },
    data() {
        return {
            recipe: {} as Recipe
        }
    },
    mounted() {
        this.refreshData(this.id)
    },
    methods: {
        refreshData(recipeId: string) {
            const api = new ApiApi()
            api.apiRecipeRetrieve({id: Number(recipeId)}).then(r => {
                this.recipe = r
            })
        }
    }
})
</script>

<style scoped>

</style>