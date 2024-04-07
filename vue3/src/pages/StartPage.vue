<template>
    <v-container>

        <horizontal-meal-plan-window></horizontal-meal-plan-window>


        <!--TODO ideas for "start page": new recipes, meal plan, "last year/month/cooked long ago", high rated, random keyword -->
        <!--TODO if nothing comes up for a category, hide the element, probably move fetch logic into component -->
        <horizontal-recipe-scroller title="New Recipes" :skeletons="4" :recipes="new_recipes" icon="fas fa-calendar-alt"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller title="Top Rated" :skeletons="2" :recipes="high_rated_recipes" icon="fas fa-star"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :title="random_keyword.label" :skeletons="4" :recipes="random_keyword_recipes" icon="fas fa-tags" v-if="random_keyword.label"></horizontal-recipe-scroller>

    </v-container>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {ApiApi, Keyword, Recipe, RecipeOverview} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeCardComponent from "@/components/display/RecipeCard.vue";
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeWindow.vue";
import {DateTime} from "luxon";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import HorizontalMealPlanWindow from "@/components/display/HorizontalMealPlanWindow.vue";
import MealPlanDialog from "@/components/dialogs/MealPlanDialog.vue";


export default defineComponent({
    name: "StartPage",
    components: {MealPlanDialog, HorizontalMealPlanWindow, HorizontalRecipeScroller, RecipeCard, GlobalSearchDialog, RecipeCardComponent, KeywordsComponent},
    computed: {

        meal_plan_grid: function () {
            let grid = []

            if (useMealPlanStore().plan_list.length > 0) {
                console.log('found plans')
                for (const x of Array(4).keys()) {
                    let grid_day_date = DateTime.now().plus({days: x})
                    console.log('going trough days ', x, grid_day_date)
                    grid.push({
                        date: grid_day_date,
                        create_default_date: grid_day_date.toISODate(), // improve meal plan edit modal to do formatting itself and accept dates
                        date_label: grid_day_date.toLocaleString(DateTime.DATE_MED),
                        plan_entries: useMealPlanStore().plan_list.filter(m => (DateTime.fromJSDate(m.fromDate) <= grid_day_date && DateTime.fromJSDate((m.toDate != undefined) ? m.toDate : m.fromDate) >= grid_day_date)),
                    })
                }
            }
            return grid
        },
    },
    data() {
        return {
            recipes: [] as Recipe[],
            items: Array.from({length: 50}, (k, v) => v + 1),

            new_recipes: [] as RecipeOverview[],
            high_rated_recipes: [] as RecipeOverview[],
            random_keyword: {} as Keyword,
            random_keyword_recipes: [] as RecipeOverview[],
        }
    },
    mounted() {
        const api = new ApiApi()

        api.apiRecipeList({_new: 'true', pageSize: 16}).then(r => {
            if (r.results != undefined) { // TODO openapi generator makes arrays nullable for some reason
                this.new_recipes = r.results
            }
        })

        api.apiRecipeList({rating: 4, pageSize: 16}).then(r => {
            if (r.results != undefined) {
                this.high_rated_recipes = r.results
            }
        })

        api.apiKeywordList({random: 'true', limit: '1'}).then(r => {
            if (r.results != undefined && r.results.length > 0) {
                this.random_keyword = r.results[0]
                api.apiRecipeList({keywords: r.results[0].id}).then(r => {
                    if (r.results != undefined) {
                        this.random_keyword_recipes = r.results
                    }
                })
            }
        })
    },
    methods: {}
})
</script>

<style scoped>

</style>