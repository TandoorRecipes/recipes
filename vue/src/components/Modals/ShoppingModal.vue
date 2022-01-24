<template>
    <div>
        <b-modal :id="`shopping_${this.modal_id}`" hide-footer @show="loadRecipe">
            <template v-slot:modal-title
                ><h4>{{ $t("Add_Servings_to_Shopping", { servings: recipe_servings }) }}</h4></template
            >
            <loading-spinner v-if="loading"></loading-spinner>
            <div class="accordion" role="tablist" v-if="!loading">
                <b-card no-body class="mb-1">
                    <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-0 class="text-left" variant="outline-info">{{ recipe.name }}</b-button>
                    </b-card-header>
                    <b-collapse id="accordion-0" visible accordion="my-accordion" role="tabpanel">
                        <ingredients-card
                            :steps="steps"
                            :recipe="recipe.id"
                            :ingredient_factor="ingredient_factor"
                            :servings="recipe_servings"
                            :show_shopping="true"
                            :add_shopping_mode="true"
                            :header="false"
                            @add-to-shopping="addShopping($event)"
                        />
                    </b-collapse>
                    <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                    <template v-for="r in related_recipes">
                        <b-card no-body class="mb-1" :key="r.recipe.id">
                            <b-card-header header-tag="header" class="p-1" role="tab">
                                <b-button btn-sm block v-b-toggle="'accordion-' + r.recipe.id" class="text-left" variant="outline-primary">{{ r.recipe.name }}</b-button>
                            </b-card-header>
                            <b-collapse :id="'accordion-' + r.recipe.id" accordion="my-accordion" role="tabpanel">
                                <ingredients-card
                                    :steps="r.steps"
                                    :recipe="r.recipe.id"
                                    :ingredient_factor="ingredient_factor"
                                    :servings="recipe_servings"
                                    :show_shopping="true"
                                    :add_shopping_mode="true"
                                    :header="false"
                                    @add-to-shopping="addShopping($event)"
                                />
                            </b-collapse>
                        </b-card>
                    </template>
                    <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                </b-card>
            </div>

            <b-input-group class="my-3">
                <b-input-group-prepend is-text>
                    {{ $t("Servings") }}
                </b-input-group-prepend>

                <b-form-spinbutton min="1" v-model="recipe_servings" inline style="height: 3em"></b-form-spinbutton>

                <b-input-group-append>
                    <b-button variant="secondary" @click="$bvModal.hide(`shopping_${modal_id}`)">{{ $t("Cancel") }} </b-button>
                    <b-button variant="success" @click="saveShopping">{{ $t("Save") }} </b-button>
                </b-input-group-append>
            </b-input-group>
        </b-modal>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
Vue.use(BootstrapVue)

const { ApiApiFactory } = require("@/utils/openapi/api")
import { StandardToasts } from "@/utils/utils"
import IngredientsCard from "@/components/IngredientsCard"
import LoadingSpinner from "@/components/LoadingSpinner"

export default {
    name: "ShoppingModal",
    components: { IngredientsCard, LoadingSpinner },
    mixins: [],
    props: {
        recipe: { required: true, type: Object },
        servings: { type: Number, default: undefined },
        modal_id: { required: true, type: Number },
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
        recipe: {
            handler() {
                this.loadRecipe()
            },
            deep: true,
        },
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
                    this.add_shopping = [
                        ...this.add_shopping,
                        ...this.steps
                            .map((x) => x.ingredients)
                            .flat()
                            .filter((x) => !x?.food?.food_onhand)
                            .map((x) => x.id),
                    ]
                    if (!this.recipe_servings) {
                        this.recipe_servings = result.data?.servings
                    }
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
                                        this.related_recipes.push({
                                            recipe: x,
                                            steps: recipe_steps.data.results.filter((x) => x.ingredients.length > 0),
                                        })
                                    })
                                )
                            })
                            return Promise.all(promises)
                        })
                        .then(() => {
                            this.add_shopping = [
                                ...this.add_shopping,
                                ...this.related_recipes
                                    .map((x) => x.steps)
                                    .flat()
                                    .map((x) => x.ingredients)
                                    .flat()
                                    .filter((x) => !x.food.override_ignore)
                                    .map((x) => x.id),
                            ]
                        })
                })
        },
        addShopping: function (e) {
            if (e.add) {
                this.add_shopping.push(e.item.id)
            } else {
                this.add_shopping = this.add_shopping.filter((x) => x !== e.item.id)
            }
        },
        saveShopping: function () {
            // another choice would be to create ShoppingListRecipes for each recipe - this bundles all related recipe under the parent recipe
            let shopping_recipe = {
                id: this.recipe.id,
                ingredients: this.add_shopping,
                servings: this.recipe_servings,
            }
            let apiClient = new ApiApiFactory()
            apiClient
                .shoppingRecipe(this.recipe.id, shopping_recipe)
                .then((result) => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    this.$emit("finish")
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                })

            this.$bvModal.hide(`shopping_${this.modal_id}`)
        },
    },
}
</script>
<style>
.b-form-spinbutton.form-control {
    background-color: #e9ecef;
    border: 1px solid #ced4da;
}
</style>
