<template>
    <v-container>

        <!--TODO ideas for "start page": new recipes, meal plan, "last year/month/cooked long ago", high rated, random keyword -->
        <horizontal-recipe-scroller title="New Recipes" :recipes="new_recipes"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller title="Top Rated" :recipes="high_rated_recipes"></horizontal-recipe-scroller>


    </v-container>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {ApiApi, Recipe, RecipeOverview} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeCardComponent from "@/components/display/RecipeCard.vue";
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeScroller.vue";


export default defineComponent({
    name: "RecipeSearchPage",
    components: {HorizontalRecipeScroller, RecipeCard, GlobalSearchDialog, RecipeCardComponent, KeywordsComponent},
    computed: {},
    data() {
        return {
            recipes: [] as Recipe[],
            items: Array.from({length: 50}, (k, v) => v + 1),

            new_recipes: [] as RecipeOverview[],
            high_rated_recipes: [] as RecipeOverview[],
        }
    },
    mounted() {
        const api = new ApiApi()
        api.apiRecipeList({_new: 'true'}).then(r => {
            if (r.results != undefined) { // TODO why this check, worst case its empty
                this.new_recipes = r.results
            }
        })

        api.apiRecipeList({rating: 4}).then(r => {
            if (r.results != undefined) { // TODO why this check, worst case its empty
                this.high_rated_recipes = r.results
            }
        })

    },
    methods: {}
})
</script>

<style scoped>

</style>