<template>
    <v-container>

        <v-row justify="space-between">
            <v-col>
                <h2><i class="fas fa-calendar-week fa-fw"></i> Meal Plan</h2>
            </v-col>
        </v-row>

        <v-row>
            <v-col v-for="day in meal_plan_grid">
                <v-list density="compact">
                    <v-list-item>
                        {{ day.date_label }}
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item v-for="p in day.plan_entries">
                        <template #prepend>
                            <v-avatar :image="p.recipe.image" v-if="p.recipe?.image"></v-avatar>
                            <v-avatar image="../../assets/recipe_no_image.svg" v-else></v-avatar>
                        </template>
                        <v-list-item-title>
                            <span v-if="p.recipe">{{ p.recipe.name }}</span>
                            <span v-else>{{ p.title }}</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            {{ p.mealType.name }}
                        </v-list-item-subtitle>
                    </v-list-item>

                </v-list>
            </v-col>
        </v-row>


        <v-row>
            <v-col>
                <v-window show-arrows>
                    <v-window-item>
                        <v-row>

                        </v-row>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>


        <!--TODO ideas for "start page": new recipes, meal plan, "last year/month/cooked long ago", high rated, random keyword -->
        <!--TODO if nothing comes up for a category, hide the element, probably move fetch logic into component -->
        <horizontal-recipe-scroller title="New Recipes" :skeletons="4" :recipes="new_recipes" icon="fas fa-calendar-alt"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller title="Top Rated" :skeletons="2" :recipes="high_rated_recipes" icon="fas fa-star"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :title="random_keyword.label" :skeletons="4" :recipes="random_keyword_recipes" icon="fas fa-tags"></horizontal-recipe-scroller>

    </v-container>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {ApiApi, Keyword, Recipe, RecipeOverview} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeCardComponent from "@/components/display/RecipeCard.vue";
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeScroller.vue";
import {DateTime} from "luxon";
import {useMealPlanStore} from "@/stores/MealPlanStore";


export default defineComponent({
    name: "RecipeSearchPage",
    components: {HorizontalRecipeScroller, RecipeCard, GlobalSearchDialog, RecipeCardComponent, KeywordsComponent},
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

        useMealPlanStore().refreshFromAPI(DateTime.now().toJSDate(), DateTime.now().plus({days: 7}).toJSDate())

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