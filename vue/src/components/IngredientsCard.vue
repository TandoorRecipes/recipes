<template>
    <div :class="{ 'card border-primary no-border': header }">
        <div :class="{ 'card-body': header }">
            <div class="row" v-if="header">
                <div class="col col-md-6">
                    <h4 class="card-title"><i class="fas fa-pepper-hot"></i> {{ $t("Ingredients") }}</h4>
                </div>
                <div class="col col-md-6 text-right" v-if="header">
                    <h4>
                        <i v-if="show_shopping && ShoppingRecipes.length > 0" class="fas fa-trash text-danger px-2" @click="saveShopping(true)"></i>
                        <i v-if="show_shopping" class="fas fa-save text-success px-2" @click="saveShopping()"></i>
                        <i class="fas fa-shopping-cart px-2" @click="getShopping()"></i>
                    </h4>
                </div>
            </div>
            <div class="row text-right" v-if="ShoppingRecipes.length > 1 && !add_shopping_mode">
                <div class="col col-md-6 offset-md-6 text-right">
                    <b-form-select v-model="selected_shoppingrecipe" :options="ShoppingRecipes" size="sm"></b-form-select>
                </div>
            </div>
            <br v-if="header" />
            <div class="row no-gutter">
                <div class="col-md-12">
                    <table class="table table-sm">
                        <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                        <template v-for="s in steps">
                            <tr v-bind:key="s.id" v-if="s.show_as_header && s.name !== '' && !add_shopping_mode">
                                <td colspan="5">
                                    <b>{{ s.name }}</b>
                                </td>
                            </tr>
                            <template v-for="i in s.ingredients">
                                <ingredient-component
                                    :ingredient="prepareIngredient(i)"
                                    :ingredient_factor="ingredient_factor"
                                    :key="i.id"
                                    :show_shopping="show_shopping"
                                    :detailed="detailed"
                                    @checked-state-changed="$emit('checked-state-changed', $event)"
                                    @add-to-shopping="addShopping($event)"
                                />
                            </template>
                        </template>
                        <!-- eslint-enable vue/no-v-for-template-key-on-child -->
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import IngredientComponent from "@/components/IngredientComponent"
import { ApiMixin, StandardToasts } from "@/utils/utils"
import ShoppingListViewVue from "../apps/ShoppingListView/ShoppingListView.vue"

Vue.use(BootstrapVue)

export default {
    name: "IngredientCard",
    mixins: [ApiMixin],
    components: { IngredientComponent },
    props: {
        steps: {
            type: Array,
            default() {
                return []
            },
        },
        recipe: { type: Number },
        ingredient_factor: { type: Number, default: 1 },
        servings: { type: Number, default: 1 },
        detailed: { type: Boolean, default: true },
        header: { type: Boolean, default: false },
        add_shopping_mode: { type: Boolean, default: false },
        recipe_list: { type: Number, default: undefined },
    },
    data() {
        return {
            show_shopping: false,
            shopping_list: [],
            update_shopping: [],
            selected_shoppingrecipe: undefined,
        }
    },
    computed: {
        ShoppingRecipes() {
            // returns open shopping lists associated with this recipe
            let recipe_in_list = this.shopping_list
                .map((x) => {
                    return {
                        value: x?.list_recipe,
                        text: x?.recipe_mealplan?.name,
                        recipe: x?.recipe_mealplan?.recipe ?? 0,
                        servings: x?.recipe_mealplan?.servings,
                    }
                })
                .filter((x) => x?.recipe == this.recipe)
            return [...new Map(recipe_in_list.map((x) => [x["value"], x])).values()] //  filter to unique lists
        },
    },
    watch: {
        ShoppingRecipes: function (newVal, oldVal) {
            if (newVal.length === 0 || this.add_shopping_mode) {
                this.selected_shoppingrecipe = this.recipe_list
            } else if (newVal.length === 1) {
                this.selected_shoppingrecipe = newVal[0].value
            }
        },
        selected_shoppingrecipe: function (newVal, oldVal) {
            this.update_shopping = this.shopping_list.filter((x) => x.list_recipe === newVal).map((x) => x.ingredient)
            this.$emit("change-servings", this.ShoppingRecipes.filter((x) => x.value === this.selected_shoppingrecipe)[0].servings)
        },
    },
    mounted() {
        if (this.add_shopping_mode) {
            this.show_shopping = true
            this.getShopping(false)
        }
    },
    methods: {
        getShopping: function (toggle_shopping = true) {
            if (toggle_shopping) {
                this.show_shopping = !this.show_shopping
            }

            if (this.show_shopping) {
                let ingredient_list = this.steps
                    .map((x) => x.ingredients)
                    .flat()
                    .map((x) => x.food.id)

                let params = {
                    id: ingredient_list,
                    checked: "false",
                }
                this.genericAPI(this.Models.SHOPPING_LIST, this.Actions.LIST, params).then((result) => {
                    this.shopping_list = result.data

                    if (this.add_shopping_mode) {
                        if (this.recipe_list) {
                            this.$emit(
                                "starting-cart",
                                this.shopping_list.filter((x) => x.list_recipe === this.recipe_list).map((x) => x.ingredient)
                            )
                        } else {
                            this.$emit(
                                "starting-cart",
                                this.steps
                                    .map((x) => x.ingredients)
                                    .flat()
                                    .filter((x) => x?.food?.food_onhand == false && x?.food?.ignore_shopping == false)
                                    .map((x) => x.id)
                            )
                        }
                    }
                })
            }
        },
        saveShopping: function (del_shopping = false) {
            let servings = this.servings
            if (del_shopping) {
                servings = -1
            }
            let params = {
                id: this.recipe,
                list_recipe: this.selected_shoppingrecipe,
                ingredients: this.update_shopping,
                servings: servings,
            }
            this.genericAPI(this.Models.RECIPE, this.Actions.SHOPPING, params)
                .then((result) => {
                    if (del_shopping) {
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                    } else if (this.selected_shoppingrecipe) {
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    } else {
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    }
                })
                .catch((err) => {
                    if (del_shopping) {
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                    } else if (this.selected_shoppingrecipe) {
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                    } else {
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                    }
                    this.$emit("shopping-failed")
                })
        },
        addShopping: function (e) {
            // ALERT: this will all break if ingredients are re-used between recipes
            if (e.add) {
                this.update_shopping.push(e.item.id)
                this.shopping_list.push({
                    id: Math.random(),
                    amount: e.item.amount,
                    ingredient: e.item.id,
                    food: e.item.food,
                    list_recipe: this.selected_shoppingrecipe,
                })
            } else {
                this.update_shopping = [...this.update_shopping.filter((x) => x !== e.item.id)]
                this.shopping_list = [...this.shopping_list.filter((x) => !(x.ingredient === e.item.id && x.list_recipe === this.selected_shoppingrecipe))]
            }
            if (this.add_shopping_mode) {
                this.$emit("add-to-shopping", e)
            }
        },
        prepareIngredient: function (i) {
            let shopping = this.shopping_list.filter((x) => x.ingredient === i.id)
            let selected_list = this.shopping_list.filter((x) => x.list_recipe === this.selected_shoppingrecipe && x.ingredient === i.id)
            // checked = in the selected shopping list OR if in shoppping mode without a selected recipe, the default value true unless it is ignored or onhand
            let checked = selected_list.length > 0 || (this.add_shopping_mode && !this.selected_shoppingrecipe && !i?.food?.ignore_recipe && !i?.food?.food_onhand)

            let shopping_status = false // not in shopping list
            if (shopping.length > 0) {
                if (selected_list.length > 0) {
                    shopping_status = true // in shopping list for *this* recipe
                } else {
                    shopping_status = null // in shopping list but not *this* recipe
                }
            }

            return {
                ...i,
                shop: checked,
                shopping_status: shopping_status, // possible values: true, false, null
                category: i.food.supermarket_category?.name,
                shopping_list: shopping.map((x) => {
                    return {
                        mealplan: x?.recipe_mealplan?.name,
                        amount: x.amount,
                        food: x.food?.name,
                        unit: x.unit?.name,
                    }
                }),
            }
        },
    },
}
</script>
