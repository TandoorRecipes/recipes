<template>
    <div :class="{ 'card border-primary no-border': header }">
        <div :class="{ 'card-body': header, 'p-0': header }">
            <div class="card-header" v-if="header">
                <div class="row">
                    <div class="col-6">
                        <h4 class="card-title"><i class="fas fa-pepper-hot"></i> {{ $t("Ingredients") }}</h4>
                    </div>
                </div>
            </div>
            <div class="card-body p-1 p-md-3">

                <div class="row no-gutter">
                    <div class="col-12 m-0" :class="{ 'p-0': !header }">
                        <table class="table table-sm mb-0">
                            <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                            <template v-for="s in steps">
                                <tr v-bind:key="s.id" v-if="s.show_as_header && s.name !== '' && steps.length > 1 && s.ingredients.length > 0">
                                    <td colspan="5">
                                        <b>{{ s.name }}</b>
                                    </td>
                                </tr>
                                <template v-for="i in s.ingredients">
                                    <ingredient-component
                                        :ingredient="i"
                                        :ingredient_factor="ingredient_factor"
                                        :key="i.id"
                                        :detailed="detailed"
                                        @checked-state-changed="$emit('checked-state-changed', $event)"
                                    />
                                </template>
                            </template>
                            <!-- eslint-enable vue/no-v-for-template-key-on-child -->
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import IngredientComponent from "@/components/IngredientComponent"
import {ApiMixin, StandardToasts} from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    name: "IngredientCard",
    mixins: [ApiMixin],
    components: {IngredientComponent},
    props: {
        steps: {
            type: Array,
            default() {
                return []
            },
        },
        recipe: {type: Number},
        ingredient_factor: {type: Number, default: 1},
        servings: {type: Number, default: 1},
        detailed: {type: Boolean, default: true},
        header: {type: Boolean, default: false},
        recipe_list: {type: Number, default: undefined},
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

    },
    mounted() {

    },
    methods: {

    },
}
</script>
