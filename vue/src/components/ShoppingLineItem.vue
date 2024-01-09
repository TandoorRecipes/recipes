<template>
    <div id="shopping_line_item">

        <b-button-group class="w-100" v-if="(useUserPreferenceStore().device_settings.shopping_show_checked_entries || !is_checked) && (useUserPreferenceStore().device_settings.shopping_show_delayed_entries || !is_delayed)">
            <b-button variant="primary" v-if="is_delayed">
                <i class="fa-fw fas fa-hourglass-half"></i>
            </b-button>

            <b-button variant="dark" block class="btn btn-block text-left" @click="detail_modal_visible = true">
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
                <i class="fa-fw fas" :class="{'fa-check': !is_checked , 'fa-cart-plus': is_checked }"></i>
            </b-button>
        </b-button-group>


        <b-modal v-model="detail_modal_visible" @hidden="detail_modal_visible = false">
            <template #modal-title>
                <h5> {{ food_row }}</h5>
                <small class="text-muted">{{ food.description }}</small>

            </template>

            <template #default>
                <h5 class="mt-2">{{ $t('Quick actions') }}</h5>
                {{ $t('Category') }}
                <b-form-select
                    class="form-control mb-2"
                    :options="useShoppingListStore().supermarket_categories"
                    text-field="name"
                    value-field="id"
                    v-model="food.supermarket_category"
                    @change="detail_modal_visible = false; updateFoodCategory(food)"
                ></b-form-select>

                <!-- TODO implement -->
                <!--                <b-button variant="success" block @click="detail_modal_visible = false;"> {{ $t("Edit_Food") }}</b-button>  -->

                <b-button variant="info" block @click="detail_modal_visible = false;useShoppingListStore().delayEntries(entries)">{{ $t('Postpone') }}</b-button>


                <h6 class="mt-2">{{ $t('Entries') }}</h6>

                <b-button variant="danger" block @click="detail_modal_visible = false;useShoppingListStore().deleteEntries(entries)">{{ $t('Delete_All') }}</b-button>

                <b-row v-for="e in entries" v-bind:key="e.id">
                    <b-col cold="12">
                        <b-button-group class="mt-1 w-100">
                            <b-button variant="dark" block class="btn btn-block text-left">
                                <span><span v-if="e.amount > 0">{{e.amount}}</span> {{e.unit?.name}} {{ food.name }}</span>
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

                        <number-scaler-component :number="e.amount" @change="e.amount = $event; useShoppingListStore().updateObject(e)" v-if="e.recipe_mealplan === null"></number-scaler-component>

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
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import NumberScalerComponent from "@/components/NumberScalerComponent.vue";


Vue.use(BootstrapVue)

export default {
    name: "ShoppingLineItem",
    mixins: [ApiMixin],
    components: {NumberScalerComponent},
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
                if (Date.parse(this.entries[i].delay_until) > new Date(Date.now())) {
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
            let info_row = []

            let authors = []
            let recipes = []
            let meal_pans = []

            for (let i in this.entries) {
                let e = this.entries[i]

                if (authors.indexOf(e.created_by.display_name) === -1) {
                    authors.push(e.created_by.display_name)
                }


                if (e.recipe_mealplan !== null) {
                    let recipe_name = e.recipe_mealplan.recipe_name
                    if (recipes.indexOf(recipe_name) === -1) {
                        recipes.push(recipe_name)
                    }

                    if ('mealplan_from_date' in e.recipe_mealplan) {
                        let meal_plan_entry = (e?.recipe_mealplan?.mealplan_type || '') + ' (' + this.formatDate(e.recipe_mealplan.mealplan_from_date) + ')'
                        if (meal_pans.indexOf(meal_plan_entry) === -1) {
                            meal_pans.push(meal_plan_entry)
                        }
                    }
                }

                if (recipes.length > 1) {
                    let short_recipes = []
                    recipes.forEach(r => {
                        short_recipes.push(r.substring(0, 14) + (r.length > 14 ? '..' : ''))
                    })
                    recipes = short_recipes
                }
            }

            if (useUserPreferenceStore().device_settings.shopping_item_info_created_by && authors.length > 0) {
                info_row.push(authors.join(', '))
            }
            if (useUserPreferenceStore().device_settings.shopping_item_info_recipe && recipes.length > 0) {
                info_row.push(recipes.join(', '))
            }
            if (useUserPreferenceStore().device_settings.shopping_item_info_mealplan && meal_pans.length > 0) {
                info_row.push(meal_pans.join(', '))
            }

            return info_row.join(' - ')
        }
    },
    watch: {},
    mounted() {

    },
    methods: {
        useUserPreferenceStore,
        useShoppingListStore,
        resolveDjangoUrl,

        formatDate: function (datetime) {
            if (!datetime) {
                return
            }
            return Intl.DateTimeFormat(window.navigator.language, {
                dateStyle: "short",
            }).format(Date.parse(datetime))
        },

        updateFoodCategory: function (food) {

            if (typeof food.supermarket_category === "number") { // not the best solution, but as long as generic multiselect does not support caching, I don't want to use a proper model
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
