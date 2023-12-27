<template>
    <div id="shopping_line_item">

        <b-button-group class="w-100" v-if="useShoppingListStore().show_checked_entries || !is_checked">
            <b-button :class="{'btn-dark': (!is_checked && !is_delayed), 'btn-success': is_checked, 'btn-warning': is_delayed}" block class="btn btn-block text-left" @click="detail_modal_visible = true">
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
            <b-button variant="success" @click="useShoppingListStore().setEntriesCheckedState(entries, !is_checked)" :class="{'btn-success': !is_checked, 'btn-warning': is_checked}">
                <i class="fas" :class="{'fa-check': !is_checked, 'fa-times': is_checked}"></i>
            </b-button>
        </b-button-group>


        <b-modal v-model="detail_modal_visible" @hidden="detail_modal_visible = false">
            <template #modal-title>
                <h5> {{ food_row }}</h5>
                <small class="text-muted">{{ food.description }}</small>

            </template>

            <template #default>
                <h6 class="mt-2">{{ $t('Quick actions')}}</h6>
                <b-form-select
                    class="form-control mb-2"
                    :options="useShoppingListStore().supermarket_categories"
                    text-field="name"
                    value-field="id"
                    v-model="food.supermarket_category"
                    @change="detail_modal_visible = false; updateFoodCategory(food)"
                ></b-form-select>

                <b-button variant="success" block @click="detail_modal_visible = false;"> {{ $t("Edit_Food") }}</b-button>  <!-- TODO implement -->

                <b-button variant="info" block @click="detail_modal_visible = false;useShoppingListStore().delayEntries(entries)">{{ $t('Delay') }}</b-button>


                <h6 class="mt-2">{{ $t('Entries') }}</h6>

                <b-button variant="danger" block @click="detail_modal_visible = false;useShoppingListStore().deleteFood(food)">{{ $t('Delete_All') }}</b-button>

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
import {ApiMixin, resolveDjangoUrl, StandardToasts} from "@/utils/utils"
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {useShoppingListStore} from "@/stores/ShoppingListStore";
import {ApiApiFactory} from "@/utils/openapi/api";


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
        is_delayed: function () {
            for (let i in this.entries) {
                if ( Date.parse(this.entries[i].delay_until) > new Date(Date.now())) {
                    return true
                }
            }
            return false
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

            if (Object.keys(this.entries).length === 123) {
                return "Abendessen 31.12" // TODO implement mealplan or manual
            }

            return "IMPLEMENT INFO ROW!!"
        }
    },
    watch: {},
    mounted() {

    },
    methods: {
        useShoppingListStore,
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

        updateFoodCategory: function (food) {

            if (typeof food.supermarket_category === "number"){ // not the best solution, but as long as generic multiselect does not support caching, I don't want to use a proper model
                food.supermarket_category = this.useShoppingListStore().supermarket_categories.filter(sc => sc.id === food.supermarket_category)[0]
            }

            let apiClient = new ApiApiFactory()
            apiClient.updateFood(food.id, food).then(r => {

            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        }


    },
}
</script>


<style>

</style>
