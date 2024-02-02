<template>
    <div v-if="recipes !== {}">
        <div id="switcher" class="align-center">
            <i class="btn btn-primary fas fa-receipt fa-xl fa-fw shadow-none btn-circle" v-b-toggle.related-recipes />
        </div>
        <b-sidebar id="related-recipes" backdrop right bottom no-header shadow="sm" style="z-index: 10000" @shown="updatePinnedRecipes()">
            <template #default="{ hide }">
                <div class="d-flex flex-column justify-content-end h-100 p-3 align-items-end">
                    <h5>{{ $t("Planned") }} <i class="fas fa-calendar fa-fw"></i></h5>

                    <div class="text-right">
                        <template v-if="planned_recipes.length > 0">
                            <div v-for="r in planned_recipes" :key="`plan${r.id}`">
                                <div class="pb-1 pt-1">
                                    <a
                                        @click="
                                            navRecipe(r)
                                            hide()
                                        "
                                        href="javascript:void(0);"
                                        >{{ r.name }}</a
                                    >
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <span class="text-muted">{{ $t("nothing_planned_today") }}</span>
                        </template>
                    </div>

                    <h5>{{ $t("Pinned") }} <i class="fas fa-thumbtack fa-fw"></i></h5>

                    <template v-if="pinned_recipes.length > 0">
                        <div class="text-right">
                            <div v-for="r in pinned_recipes" :key="`pin${r.id}`">
                                <b-row class="pb-1 pt-1">
                                    <b-col cols="2">
                                        <a href="javascript:void(0)" @click="unPinRecipe(r)" class="text-muted"><i class="fas fa-times"></i></a>
                                    </b-col>
                                    <b-col cols="10">
                                        <a
                                            @click="
                                                navRecipe(r)
                                                hide()
                                            "
                                            href="javascript:void(0);"
                                            class="align-self-end"
                                            >{{ r.name }}
                                        </a>
                                    </b-col>
                                </b-row>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <span class="text-muted">{{ $t("no_pinned_recipes") }}</span>
                    </template>

                    <template v-if="related_recipes.length > 0">
                        <h5>Related <i class="fas fa-link fa-fw"></i></h5>
                        <div class="text-right">
                            <div v-for="r in related_recipes" :key="`related${r.id}`">
                                <div class="pb-1 pt-1">
                                    <a
                                        @click="
                                            navRecipe(r)
                                            hide()
                                        "
                                        href="javascript:void(0);"
                                        >{{ r.name }}</a
                                    >
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
            <template #footer="{ hide }">
                <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
                    <strong class="mr-auto">{{ $t("Quick actions") }}</strong>
                    <b-button size="sm" @click="hide">{{ $t("Close") }}</b-button>
                </div>
            </template>
        </b-sidebar>
    </div>
</template>

<script>
const { ApiApiFactory } = require("@/utils/openapi/api")
import { ResolveUrlMixin } from "@/utils/utils"

export default {
    name: "RecipeSwitcher",
    mixins: [ResolveUrlMixin],
    props: {
        recipe: { type: Number, default: undefined },
    },
    data() {
        return {
            related_recipes: [],
            planned_recipes: [],
            pinned_recipes: [],
            recipes: {},
        }
    },
    computed: {
        is_recipe_view: function () {
            // determine if the currently open view is the recipe view to decide if links should switch to or link to a recipe
            return this.$root._vnode.tag.includes("RecipeView")
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
                this.$emit("switch", this.recipes[recipe.id])
            } else {
                window.location.href = this.resolveDjangoUrl("view_recipe", recipe.id)
            }
        },
        updatePinnedRecipes: function () {
            //TODO clean this up to prevent duplicate API calls
            this.loadPinnedRecipes()
            this.loadRecipeData()
        },
        loadRecipeData: function () {
            let apiClient = new ApiApiFactory()

            let recipe_list = [...this.related_recipes, ...this.planned_recipes, ...this.pinned_recipes]

            let recipe_ids = []
            recipe_list.forEach((recipe) => {
                let id = recipe.id

                if (!recipe_ids.includes(id)) {
                    recipe_ids.push(id)
                }
            })

            recipe_ids.forEach((id) => {
                apiClient.retrieveRecipe(id).then((result) => {
                    this.recipes[id] = result.data
                })
            })
        },
        loadRelatedRecipes: function () {
            let apiClient = new ApiApiFactory()

            // get related recipes and save them for later
            if (this.$parent.recipe) {
                this.related_recipes = [this.$parent.recipe]
                return apiClient
                    .relatedRecipe(this.$parent.recipe.id, {
                        query: {
                            levels: 2,
                            format: "json",
                        },
                    })
                    .then((result) => {
                        this.related_recipes = this.related_recipes.concat(result.data)
                    })
            }
        },
        loadPinnedRecipes: function () {
            let pinned_recipe_ids = JSON.parse(localStorage.getItem("pinned_recipes")) || []
            this.pinned_recipes = pinned_recipe_ids
        },
        loadMealPlans: function () {
            let apiClient = new ApiApiFactory()
            // TODO move to utility function moment is in maintenance mode https://momentjs.com/docs/
            var tzoffset = new Date().getTimezoneOffset() * 60000 //offset in milliseconds
            let today = new Date(Date.now() - tzoffset).toISOString().split("T")[0]
            return apiClient.listMealPlans(today, today).then((result) => {
                let promises = []
                result.data.forEach((mealplan) => {
                    this.planned_recipes.push({ ...mealplan?.recipe, servings: mealplan?.servings })
                    const serving_factor = (mealplan?.servings ?? mealplan?.recipe?.servings ?? 1) / (mealplan?.recipe?.servings ?? 1)
                    promises.push(
                        apiClient.relatedRecipe(mealplan?.recipe?.id, { query: { levels: 2 } }).then((r) => {
                            // scale all recipes to mealplan servings
                            r.data = r.data.map((x) => {
                                return { ...x, factor: serving_factor }
                            })
                            this.planned_recipes = [...this.planned_recipes, ...r.data]
                        })
                    )
                })
                return Promise.all(promises)
            })
        },
        unPinRecipe: function (recipe) {
            let pinnedRecipes = JSON.parse(localStorage.getItem("pinned_recipes")) || []
            pinnedRecipes = pinnedRecipes.filter((r) => r.id !== recipe.id)
            console.log("pinned left", pinnedRecipes)
            this.pinned_recipes = pinnedRecipes
            localStorage.setItem("pinned_recipes", JSON.stringify(pinnedRecipes))
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

@media (max-width: 991.98px) {
    #switcher .btn-circle {
        position: fixed;
        top: 12px;
        right: 79px;
        color: rgba(46, 46, 46, 0.5);
        width: 56px;
        height: 40px;
        font-size: 1.25rem;
        line-height: 1;
        background-color: transparent;
        border: 1px solid rgba(46, 46, 46, 0.1);
        border-radius: 0.1875rem;
        z-index: 1001;
    }
}

@media (min-width: 992px) {
    #switcher .btn-circle {
        position: fixed;
        bottom: 40px;
        right: 40px;
    }
}
</style>
