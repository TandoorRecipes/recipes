<template>
    <div v-if="recipes.length > 0">
        <div id="switcher">
            <i class="btn btn-outline-dark fas fa-receipt fa-xl shadow-none btn-circle" v-b-toggle.related-recipes />
        </div>
        <b-sidebar id="related-recipes" :title="title" backdrop right shadow="sm" style="z-index: 10000">
            <template #default="{ hide }">
                <nav class="mb-3">
                    <b-nav vertical>
                        <b-nav-item
                            variant="link"
                            @click="
                                navRecipe(-1)
                                hide()
                            "
                            >{{ name }}</b-nav-item
                        >
                        <div v-for="r in recipes" :key="r.id">
                            <b-nav-item
                                variant="link"
                                @click="
                                    navRecipe(r)
                                    hide()
                                "
                                >{{ r.name }}</b-nav-item
                            >
                        </div>
                    </b-nav>
                </nav>
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
        name: { type: String, default: undefined },
        mode: { type: String, default: "recipe" },
    },
    data() {
        return {
            recipes: [],
            recipe_list: [],
        }
    },
    computed: {
        title() {
            let title = ""
            switch (this.mode) {
                case "recipe":
                    title = this.$t("related_recipes")
                    break
                case "mealplan":
                    title = this.$t("today_recipes")
                    break
            }
            return title
        },
    },
    mounted() {
        this.recipes = []
        switch (this.mode) {
            case "recipe":
                this.loadRecipes()
                break
            case "mealplan":
                this.loadMealPlans()
                break
        }
    },

    methods: {
        navRecipe: function (recipe) {
            switch (this.mode) {
                case "recipe":
                    this.$emit("switch", recipe)
                    break
                case "mealplan":
                    window.location.href = this.resolveDjangoUrl("view_recipe", recipe.id)
                    break
                default:
                    console.log(this.mode, " isn't defined.")
            }
        },
        loadRecipes: function () {
            let apiClient = new ApiApiFactory()

            apiClient
                .relatedRecipe(this.recipe, { query: { levels: 2 } })
                // get related recipes and save them for later
                .then((result) => {
                    this.recipe_list = result.data
                })
                // get all recipes for today
                .then(() => {
                    this.loadMealPlans()
                })
        },
        loadMealPlans: function () {
            let apiClient = new ApiApiFactory()
            let today = new Date(Date.now()).toISOString().split("T")[0]
            apiClient
                .listMealPlans({
                    query: {
                        from_date: today,
                        to_date: today,
                    },
                })
                .then((result) => {
                    let promises = []
                    result.data.forEach((mealplan) => {
                        this.recipe_list.push({ ...mealplan?.recipe, servings: mealplan?.servings })
                        const serving_factor = (mealplan?.servings ?? mealplan?.recipe?.servings ?? 1) / (mealplan?.recipe?.servings ?? 1)
                        promises.push(
                            apiClient.relatedRecipe(mealplan?.recipe?.id, { query: { levels: 2 } }).then((r) => {
                                // scale all recipes to mealplan servings
                                r.data = r.data.map((x) => {
                                    return { ...x, factor: serving_factor }
                                })
                                this.recipe_list = [...this.recipe_list, ...r.data]
                            })
                        )
                    })

                    return Promise.all(promises).then(() => {
                        console.log(this.recipe_list)
                        let promises = []
                        let dedup = []
                        this.recipe_list.forEach((recipe) => {
                            if (!dedup.includes(recipe.id)) {
                                dedup.push(recipe.id)
                                promises.push(
                                    apiClient.retrieveRecipe(recipe.id).then((result) => {
                                        // scale all recipes to mealplan servings
                                        result.data.servings = recipe?.servings ?? result.data.servings * (recipe?.factor ?? 1)
                                        this.recipes.push(result.data)
                                    })
                                )
                            }
                        })
                        return Promise.all(promises)
                    })
                })
        },
    },
}
</script>

<style>
.btn-circle {
    width: 50px;
    height: 50px;
    padding: 10px 16px;
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
