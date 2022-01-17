<template>
    <div v-if="recipes !== {}">
        <div id="switcher" class="align-center">
            <i class="btn btn-outline-dark fas fa-receipt fa-xl fa-fw shadow-none btn-circle"
               v-b-toggle.related-recipes/>
        </div>
        <b-sidebar id="related-recipes" title="Quick actions" backdrop right shadow="sm" style="z-index: 10000">
            <template #default="{ hide }">

                <nav class="mb-3 ml-3">
                    <b-nav vertical>
                        <h5><i class="fas fa-calendar fa-fw"></i> Planned</h5>

                        <div v-for="r in planned_recipes" :key="`plan${r.id}`">
                            <b-nav-item variant="link" @click="
                                    navRecipe(r)
                                    hide()
                                ">{{ r.name }}
                            </b-nav-item>
                        </div>
                        <hr/>
                        <h5><i class="fas fa-thumbtack fa-fw"></i> Pinned</h5>

                        <div v-for="r in pinned_recipes" :key="`pin${r.id}`">
                            <b-nav-item variant="link" @click="
                                    navRecipe(r)
                                    hide()
                                ">{{ r.name }} <a href="javascript:void(0);">x</a>
                            </b-nav-item>
                        </div>
                        <hr/>
                        <h5><i class="fas fa-link fa-fw"></i> Related</h5>

                        <div v-for="r in related_recipes" :key="`related${r.id}`">
                            <b-nav-item variant="link" @click="
                                    navRecipe(r)
                                    hide()
                                ">{{ r.name }}
                            </b-nav-item>
                        </div>

                        <h5><i class="fas fa-link fa-fw"></i> TEST</h5>

                        <div v-for="r in test" :key="`test${r.id}`">
                            <b-nav-item variant="link" @click="
                                    navRecipe(r)
                                    hide()
                                ">{{ r.name }}
                            </b-nav-item>
                        </div>
                    </b-nav>
                </nav>
            </template>
        </b-sidebar>
    </div>
</template>

<script>
const {ApiApiFactory} = require("@/utils/openapi/api")
import {ResolveUrlMixin} from "@/utils/utils"

export default {
    name: "RecipeSwitcher",
    mixins: [ResolveUrlMixin],
    props: {
        recipe: {type: Number, default: undefined},
    },
    data() {
        return {
            related_recipes: [],
            planned_recipes: [],
            pinned_recipes: [],
            recipes: {},
            test : []
        }
    },
    computed: {
        is_recipe_view: function () {
            // determine if the currently open view is the recipe view to decide if links should switch to or link to a recipe
            return this.$root._vnode.tag.includes('RecipeView')
        },
    },
    mounted() {

        let promises = []
        promises.push(this.loadRelatedRecipes())
        this.loadPinnedRecipes()
        promises.push(this.loadMealPlans())

        Promise.all(promises).then(() => {
            this.loadRecipeData()
        })
    },
    methods: {
        navRecipe: function (recipe) {

            if (this.is_recipe_view) {
                this.$emit("switch", recipe)
            } else {
                window.location.href = this.resolveDjangoUrl("view_recipe", recipe.id)
            }
        },
        loadRecipeData: function () {
            let apiClient = new ApiApiFactory()

            let recipe_list = [...this.related_recipes, ...this.planned_recipes, ...this.pinned_recipes]

            let recipe_ids = []
            recipe_list.forEach((recipe) => {
                let id = recipe.id
                if (id === undefined){
                    id = recipe
                }

                if (!recipe_ids.includes(id)) {
                    recipe_ids.push(id)
                }
            })
            console.log(recipe_list, recipe_ids)
            recipe_ids.forEach((id) => {
                apiClient.retrieveRecipe(id).then((result) => {
                    this.recipes[id] = result.data
                    this.test.push(result.data)
                })
            })

        },
        loadRelatedRecipes: function () {
            let apiClient = new ApiApiFactory()

            // get related recipes and save them for later
            if (this.recipe){
                return apiClient.relatedRecipe(this.recipe, {query: {levels: 2}}).then((result) => {
                    this.related_recipes = result.data
                })
            }
        },
        loadPinnedRecipes: function () {
            let pinned_recipe_ids = JSON.parse(localStorage.getItem('pinned_recipes')) || []
            this.pinned_recipes = pinned_recipe_ids
        },
        loadMealPlans: function () {
            let apiClient = new ApiApiFactory()
            // TODO move to utility function moment is in maintenance mode https://momentjs.com/docs/
            var tzoffset = new Date().getTimezoneOffset() * 60000 //offset in milliseconds
            let today = new Date(Date.now() - tzoffset).toISOString().split("T")[0]
            return apiClient.listMealPlans({query: {from_date: today, to_date: today,},}).then((result) => {
                let promises = []
                result.data.forEach((mealplan) => {
                    this.planned_recipes.push({...mealplan?.recipe, servings: mealplan?.servings})
                    const serving_factor = (mealplan?.servings ?? mealplan?.recipe?.servings ?? 1) / (mealplan?.recipe?.servings ?? 1)
                    promises.push(
                        apiClient.relatedRecipe(mealplan?.recipe?.id, {query: {levels: 2}}).then((r) => {
                            // scale all recipes to mealplan servings
                            r.data = r.data.map((x) => {
                                return {...x, factor: serving_factor}
                            })
                            this.planned_recipes = [...this.planned_recipes, ...r.data]
                        })
                    )
                })
                return Promise.all(promises)
            })
        },
    },
}
</script>

<style>
.btn-circle {
    width: 50px;
    height: 50px;
    padding: 10px 12px;
    text-align: center;
    border-radius: 35px;
    font-size: 24px;
    line-height: 1.33;
    z-index: 9000;
}

@media screen and (max-width: 600px) {
    #switcher .btn-circle {
        position: fixed;
        top: 9px;
        left: 80px;
        color: white;
    }
}

@media screen and (max-width: 2000px) {
    #switcher .btn-circle {
        position: fixed;
        bottom: 10px;
        right: 50px;
    }
}
</style>
