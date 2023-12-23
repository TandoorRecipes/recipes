<template>
    <div id="shopping_line_item">

        <b-button-group class="w-100" v-if="useShoppingListStore().show_checked_entries || !is_checked">
            <b-button :class="{'btn-dark': !is_checked, 'btn-success': is_checked}" block class="btn btn-block text-left" @click="detail_modal_visible = true">
                <div class="d-flex ">
                    <div class="d-flex flex-column pr-2" v-if="Object.keys(amounts).length> 0">
                        <span v-for="a in amounts" v-bind:key="a.id">{{ a.amount }} {{ a.unit }}<br/></span>
                    </div>
                    <div class="d-flex  flex-column flex-grow-1 align-self-center">
                        {{ food.name }}
                    </div>
                </div>


                    <span v-if="info_row"><small class="text-muted">{{ info_row }}</small></span>



            </b-button>
            <b-button variant="success" @click="useShoppingListStore().setFoodCheckedState(food, !is_checked)" :class="{'btn-success': !is_checked, 'btn-warning': is_checked}">
                <i class="fas" :class="{'fa-check': !is_checked, 'fa-times': is_checked}"></i>
            </b-button>
        </b-button-group>


        <b-modal v-model="detail_modal_visible" @hidden="detail_modal_visible = false">
            <template #modal-title>
                <h5> {{ food_row }}</h5>
                <small class="text-muted">{{ food.description }}</small>

            </template>

            <template #default>
                <h6 class="mt-2">Actions</h6> <!-- TODO localize -->
                <b-input :placeholder="$t('Category')" class="mb-2"></b-input>  <!-- TODO implement -->

                <b-button variant="success" block @click="detail_modal_visible = false;"> {{ $t("Edit_Food") }}</b-button>  <!-- TODO implement -->

                <b-button variant="info" block @click="detail_modal_visible = false;useShoppingListStore().delayFood(food)">{{ $t('Delay') }}</b-button>

                <b-button variant="danger" block @click="detail_modal_visible = false;useShoppingListStore().deleteFood(food)">{{ $t('Delete_All') }}</b-button>

                <h6 class="mt-2">Details</h6> <!-- TODO localize -->
                <b-row v-for="e in entries" v-bind:key="e.id">
                    <b-col cold="12">
                        <b-button-group class="mt-1 w-100">
                            <b-button variant="dark" block class="btn btn-block text-left">
                                <span>{{ food.name }}</span>
                                <span><br/><small class="text-muted">
                                    <span v-if="e.recipe_mealplan && e.recipe_mealplan.recipe_name !== ''">
                                        <a :href="resolveDjangoUrl('view_recipe', e.recipe_mealplan.recipe)"> {{ e.recipe_mealplan.recipe_name }} </a>({{
                                            e.recipe_mealplan.servings
                                        }} {{ $t('Servings') }})<br/>
                                    </span>
                                    <span
                                        v-if="e.recipe_mealplan && e.recipe_mealplan.mealplan_type !== undefined"> {{
                                            e.recipe_mealplan.mealplan_type
                                        }} {{ formatDate(e.recipe_mealplan.mealplan_from_date) }} <br/></span>

                                    {{ e.created_by.display_name }} {{ formatDate(e.created_at) }}<br/>
                                </small></span>

                            </b-button>
                            <b-button variant="warning" @click="detail_modal_visible = false; useShoppingListStore().deleteObject(e)"><i class="fas fa-trash"></i></b-button> <!-- TODO implement -->
                        </b-button-group>

                    </b-col>
                </b-row>
            </template>

            <template #modal-footer>
                <span></span>
            </template>
        </b-modal>

    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, resolveDjangoUrl} from "@/utils/utils"
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {useShoppingListStore} from "@/stores/ShoppingListStore";


Vue.use(BootstrapVue)

export default {
    name: "ShoppingLineItem",
    mixins: [ApiMixin],
    components: {},
    props: {
        entries: {type: Object,},
    },
    data() {
        return {
            detail_modal_visible: false,
        }
    },
    computed: {
        is_checked: function () {
            for (let i in this.entries) {
                if (!this.entries[i].checked) {
                    return false
                }
            }
            return true
        },
        food: function () {
            return this.entries[Object.keys(this.entries)[0]]['food']
        },
        amounts: function () {
            let unit_amounts = {}

            for (let i in this.entries) {
                let e = this.entries[i]

                let unit = -1
                if (e.unit !== undefined && e.unit !== null) {
                    unit = e.unit.id
                }
                if (e.amount > 0) {
                    if (unit in unit_amounts) {
                        unit_amounts[unit]['amount'] += e.amount
                    } else {
                        if (unit === -1) {
                            unit_amounts[unit] = {id: -1, unit: "", amount: e.amount}
                        } else {
                            unit_amounts[unit] = {id: e.unit.id, unit: e.unit.name, amount: e.amount}
                        }

                    }
                }

            }
            return unit_amounts
        },
        food_row: function () {
            return this.food.name
        },
        info_row: function () {
            // TODO add setting

            // author
            if (this.entries.length === 123) {
                let authors = []
                this.entries.forEach(e => {
                    if (authors.indexOf(e.created_by.display_name) === -1) {
                        authors.push(e.created_by.display_name)
                    }
                })
                return authors.join(', ')
            }

            if (this.entries.length === 1123) {
                let recipes = []
                this.entries.forEach(e => {
                    if (e.recipe_mealplan !== null) {
                        let recipe_name = e.recipe_mealplan.recipe_name
                        if (recipes.indexOf(recipe_name) === -1) {
                            recipes.push(recipe_name)
                        }
                    }
                })
                if (recipes.length > 1) {
                    let short_recipes = []
                    recipes.forEach(r => {
                        short_recipes.push(r.substring(0, 14) + (r.length > 14 ? '..' : ''))
                    })
                }
                return recipes.join(', ')
            }

            if (Object.keys(this.entries ).length === 1) {
                return "Abendessen 31.12" // TODO implement mealplan or manual
            }

            return this.entries.length
        }
    },
    watch: {},
    mounted() {

    },
    methods: {
        useShoppingListStore,
        useMealPlanStore,
        resolveDjangoUrl,

        formatDate: function (datetime) {
            if (!datetime) {
                return
            }
            return Intl.DateTimeFormat(window.navigator.language, {
                dateStyle: "short",
                timeStyle: "short",
            }).format(Date.parse(datetime))
        },

    },
}
</script>


<style>

</style>
