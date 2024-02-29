<template>
    <div>
        <b-modal hide-footer :id="`shopping_${this.modal_id}`" @show="loadRecipe" body-class="p-3 pt-0 pt-md-3">
            <template v-slot:modal-title
                ><h5>{{ $t("Add_Servings_to_Shopping", { servings: recipe_servings }) }}</h5></template
            >
            <loading-spinner v-if="loading"></loading-spinner>
            <div class="accordion" role="tablist" v-if="!loading">
                <b-card no-body class="mb-1">
                    <b-card-header header-tag="header" class="p-0" role="tab">
                        <b-button block v-b-toggle.accordion-0 class="text-left" variant="outline-info">{{ recipe.name }}</b-button>
                    </b-card-header>
                    <b-collapse id="accordion-0" class="p-2" visible accordion="my-accordion" role="tabpanel">
                        <div>
                            <table class="table table-sm mb-0">
                                <ingredient-component
                                    v-for="i in steps.flatMap((s) => s.ingredients)"
                                    v-bind:key="i.id"
                                    :detailed="true"
                                    :ingredient="i"
                                    :ingredient_factor="ingredient_factor"
                                    @checked-state-changed="$set(i, 'checked', !i.checked)"
                                />
                            </table>
                        </div>
                    </b-collapse>
                    <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                    <template v-for="r in related_recipes">
                        <b-card no-body class="mb-1" :key="r.recipe.id">
                            <b-card-header header-tag="header" class="p-1" role="tab">
                                <b-button btn-sm block v-b-toggle="'accordion-' + r.recipe.id" class="text-left" variant="outline-primary">{{ r.recipe.name }}</b-button>
                            </b-card-header>
                            <b-collapse :id="'accordion-' + r.recipe.id" accordion="my-accordion" role="tabpanel">
                                <div v-for="i in r.steps.flatMap((s) => s.ingredients)" v-bind:key="i.id">
                                    <table class="table table-sm mb-0">
                                        <ingredient-component
                                            :key="i.id"
                                            :detailed="true"
                                            :ingredient="i"
                                            :ingredient_factor="ingredient_factor"
                                            @checked-state-changed="$set(i, 'checked', !i.checked)"
                                        />
                                    </table>
                                </div>
                            </b-collapse>
                        </b-card>
                    </template>
                    <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                </b-card>
            </div>

            <div>
                <b-input-group>
                    <b-input-group-prepend is-text class="d-inline-flex">
                        <i class="fa fa-calculator"></i>
                    </b-input-group-prepend>
                    <b-form-spinbutton min="1" v-model="recipe_servings" inline style="height: 3em"></b-form-spinbutton>
                    <!-- <CustomInputSpinButton v-model.number="recipe_servings" style="height: 3em" /> -->

                    <b-input-group-append class="d-inline-flex">
                        <b-button variant="success" @click="saveShopping" class="d-none d-lg-inline-block">{{ $t("Save") }}</b-button>
                        <b-button variant="success" @click="saveShopping" class="d-inline-block d-lg-none"><i class="fa fa-cart-plus"></i></b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
        </b-modal>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"

Vue.use(BootstrapVue)

const { ApiApiFactory } = require("@/utils/openapi/api")
import { StandardToasts } from "@/utils/utils"
import IngredientComponent from "@/components/IngredientComponent"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useMealPlanStore } from "@/stores/MealPlanStore"
// import CustomInputSpinButton from "@/components/CustomInputSpinButton"

export default {
    name: "ShoppingModal",
    components: { LoadingSpinner, IngredientComponent },
    mixins: [],
    props: {
        recipe: { required: true, type: Object },
        servings: { type: Number, default: undefined },
        modal_id: { required: true, type: Number },
        mealplan: { type: Object, default: undefined },
        list_recipe: { type: Number, default: undefined },
    },
    data() {
        return {
            loading: true,
            steps: [],
            recipe_servings: undefined,
            add_shopping: [],
            related_recipes: [],
        }
    },
    mounted() {
        this.recipe_servings = this.servings
    },
    computed: {
        ingredient_factor: function () {
            return this.recipe_servings / this.recipe.servings
        },
    },
    watch: {
        servings: function (newVal) {
            this.recipe_servings = parseInt(newVal)
        },
    },
    methods: {
        loadRecipe: function () {
            this.add_shopping = []
            this.related_recipes = []
            let apiClient = new ApiApiFactory()
            apiClient
                .retrieveRecipe(this.recipe.id)
                .then((result) => {
                    this.steps = result.data.steps
                    // ALERT: this will all break if ingredients are re-used between recipes
                    // ALERT: this also doesn't quite work right if the same recipe appears multiple time in the related recipes
                    if (!this.recipe_servings) {
                        this.recipe_servings = result.data?.servings
                    }
                    this.steps.forEach((s) => s.ingredients.filter((i) => i.food?.food_onhand === false).forEach((i) => this.$set(i, "checked", true)))
                    this.loading = false
                })
                .then(() => {
                    // get a list of related recipes
                    apiClient
                        .relatedRecipe(this.recipe.id)
                        .then((result) => {
                            return result.data
                        })
                        .then((related_recipes) => {
                            let promises = []
                            related_recipes.forEach((x) => {
                                promises.push(
                                    apiClient.listSteps(x.id).then((recipe_steps) => {
                                        let sub_recipe_steps = recipe_steps.data.results.filter((x) => x.ingredients.length > 0)
                                        sub_recipe_steps.forEach((s) => s.ingredients.filter((i) => i.food.food_onhand === false).forEach((i) => this.$set(i, "checked", true)))
                                        this.related_recipes.push({
                                            recipe: x,
                                            steps: sub_recipe_steps,
                                        })
                                    })
                                )
                            })
                            return Promise.all(promises)
                        })
                })
        },
        saveShopping: function () {
            // another choice would be to create ShoppingListRecipes for each recipe - this bundles all related recipe under the parent recipe
            let shopping_recipe = {
                id: this.recipe.id,
                ingredients: this.steps
                    .flatMap((s) => s.ingredients.filter((i) => i.checked === true).flatMap((i) => i.id))
                    .concat(this.related_recipes.flatMap((r) => r.steps.flatMap((rs) => rs.ingredients.filter((i) => i.checked === true).flatMap((i) => i.id)))),
                servings: this.recipe_servings,
                mealplan: this.mealplan,
                list_recipe: this.list_recipe,
            }
            let apiClient = new ApiApiFactory()
            apiClient
                .shoppingRecipe(this.recipe.id, shopping_recipe)
                .then((result) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                    this.$emit("finish")
                    if (this.mealplan !== undefined && this.mealplan !== null) {
                        useMealPlanStore().plans[this.mealplan.id].shopping = true
                    }
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                })

            this.$bvModal.hide(`shopping_${this.modal_id}`)
        },
    },
}
</script>
<style>

</style>
