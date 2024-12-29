<template>
    <div class="swipe-container" :id="item_container_id" @touchend="handleSwipe()"
         v-if="(useUserPreferenceStore().device_settings.shopping_show_checked_entries || !is_checked) && (useUserPreferenceStore().device_settings.shopping_show_delayed_entries || !is_delayed)"
    >
        <div class="swipe-action" :class="{'bg-success': !is_checked , 'bg-warning': is_checked }">
            <i class="swipe-icon fa-fw fas" :class="{'fa-check': !is_checked , 'fa-cart-plus': is_checked }"></i>
        </div>

        <b-button-group class="swipe-element">
            <b-button variant="primary" v-if="is_delayed">
                <i class="fa-fw fas fa-hourglass-half"></i>
            </b-button>
            <div class="card flex-grow-1 btn-block p-2" @click="detail_modal_visible = true">
                <div class="d-flex">
                    <div class="d-flex flex-column pr-2" v-if="Object.keys(amounts).length> 0">
                        <span v-for="a in amounts" v-bind:key="a.id">

                            <span><i class="fas fa-check" v-if="a.checked && !is_checked"></i><i class="fas fa-hourglass-half" v-if="a.delayed && !a.checked"></i> <b>{{ a.amount }} {{
                                    a.unit
                                }} </b></span>
                            <br/></span>

                    </div>
                    <div class="d-flex  flex-column flex-grow-1 align-self-center">
                        {{ food.name }} <br/>
                        <span v-if="info_row"><small class="text-muted">{{ info_row }}</small></span>
                    </div>
                </div>


            </div>
            <b-button variant="success" @click="useShoppingListStore().setEntriesCheckedState(entries, !is_checked, true)"
                      :class="{'btn-success': !is_checked, 'btn-warning': is_checked}">
                <i class="d-print-none fa-fw fas" :class="{'fa-check': !is_checked , 'fa-cart-plus': is_checked }"></i>
            </b-button>
        </b-button-group>
        <div class="swipe-action bg-primary justify-content-end">
            <i class="fa-fw fas fa-hourglass-half swipe-icon"></i>
        </div>

        <b-modal v-model="detail_modal_visible" @hidden="detail_modal_visible = false" body-class="pr-4 pl-4 pt-0">
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
                    @input="detail_modal_visible = false; updateFoodCategory(food)"
                ></b-form-select>

                <b-button variant="info" block
                          @click="detail_modal_visible = false;useShoppingListStore().delayEntries(entries,!is_delayed, true)">
                    {{ $t('Postpone') }}
                </b-button>


                <h6 class="mt-2">{{ $t('Entries') }}</h6>


                <b-row v-for="e in entries" v-bind:key="e.id">
                    <b-col cold="12">

                        <b-button-group class="w-100">
                            <div class="card flex-grow-1 btn-block p-2">
                                <span><i class="fas fa-check" v-if="e.checked"></i><i class="fas fa-hourglass-half" v-if="e.delay_until !== null && !e.checked"></i>
                                     <b><span v-if="e.amount > 0">{{ e.amount }}</span> {{ e.unit?.name }}</b> {{ food.name }}</span>
                                <span><small class="text-muted">
                                    <span v-if="e.recipe_mealplan && e.recipe_mealplan.recipe_name !== ''">
                                        <a :href="resolveDjangoUrl('view_recipe', e.recipe_mealplan.recipe)"> <b>  {{
                                                e.recipe_mealplan.recipe_name
                                            }} </b></a>({{
                                            e.recipe_mealplan.servings
                                        }} {{ $t('Servings') }})<br/>
                                    </span>
                                    <span
                                        v-if="e.recipe_mealplan && e.recipe_mealplan.mealplan_type !== undefined"> {{
                                            e.recipe_mealplan.mealplan_type
                                        }} {{ formatDate(e.recipe_mealplan.mealplan_from_date) }} <br/></span>

                                    {{ e.created_by.display_name }} {{ formatDate(e.created_at) }}<br/>
                                </small></span>

                            </div>
                            <b-button variant="outline-danger"
                                      @click="useShoppingListStore().deleteObject(e)"><i
                                class="fas fa-trash"></i></b-button>
                        </b-button-group>

                        <generic-multiselect
                            class="mt-1"
                            v-if="e.recipe_mealplan === null"
                            :initial_single_selection="e.unit"
                            :model="Models.UNIT"
                            :multiple="false"
                            @change="e.unit = $event.val; useShoppingListStore().updateObject(e)"
                        >
                        </generic-multiselect>

                        <number-scaler-component :number="e.amount"
                                                 @change="e.amount = $event; useShoppingListStore().updateObject(e)"
                                                 v-if="e.recipe_mealplan === null"></number-scaler-component>
                        <hr class="m-2"/>
                    </b-col>

                </b-row>

                <b-button variant="success" block @click="useShoppingListStore().createObject({ amount: 0, unit: null, food: food, })"> {{ $t("Add") }}</b-button>
                <b-button variant="warning" block @click="detail_modal_visible = false; setFoodIgnoredAndChecked(food)"> {{ $t("Ignore_Shopping") }}</b-button>
                <b-button variant="danger" block class="mt-2"
                          @click="detail_modal_visible = false;useShoppingListStore().deleteEntries(entries)">
                    {{ $t('Delete_All') }}
                </b-button>
            </template>

            <template #modal-footer>
                <span></span>
            </template>
        </b-modal>

        <generic-modal-form :model="Models.FOOD" :show="editing_food !== null"
                            @hidden="editing_food = null; useShoppingListStore().refreshFromAPI()"></generic-modal-form>

    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, FormatMixin, resolveDjangoUrl, StandardToasts} from "@/utils/utils"
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {useShoppingListStore} from "@/stores/ShoppingListStore";
import {ApiApiFactory} from "@/utils/openapi/api";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import NumberScalerComponent from "@/components/NumberScalerComponent.vue";
import GenericModalForm from "@/components/Modals/GenericModalForm.vue";
import GenericMultiselect from "@/components/GenericMultiselect.vue";


Vue.use(BootstrapVue)

export default {
    name: "ShoppingLineItem",
    mixins: [ApiMixin, FormatMixin],
    components: {GenericMultiselect, GenericModalForm, NumberScalerComponent},
    props: {
        entries: {type: Object,},
    },
    data() {
        return {
            detail_modal_visible: false,
            editing_food: null,
        }
    },
    computed: {
        item_container_id: function () {
            let id = 'id_sli_'
            for (let i in this.entries) {
                id += i + '_'
            }
            return id
        },
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

                if (!e.checked && e.delay_until === null
                    || (e.checked && useUserPreferenceStore().device_settings.shopping_show_checked_entries)
                    || (e.delay_until !== null && useUserPreferenceStore().device_settings.shopping_show_delayed_entries)) {

                    let unit = -1
                    if (e.unit !== undefined && e.unit !== null) {
                        unit = e.unit.id
                    }
                    if (e.amount > 0) {
                        if (unit in unit_amounts) {
                            unit_amounts[unit]['amount'] += e.amount
                        } else {
                            if (unit === -1) {
                                unit_amounts[unit] = {id: -1, unit: "", amount: e.amount, checked: e.checked, delayed: (e.delay_until !== null)}
                            } else {
                                unit_amounts[unit] = {id: e.unit.id, unit: e.unit.name, amount: e.amount, checked: e.checked, delayed: (e.delay_until !== null)}
                            }

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
                    if (recipes.indexOf(recipe_name) === -1 && recipe_name !== undefined) {
                        recipes.push(recipe_name.substring(0, 14) + (recipe_name.length > 14 ? '..' : ''))
                    }

                    if ('mealplan_from_date' in e.recipe_mealplan) {
                        let meal_plan_entry = (e?.recipe_mealplan?.mealplan_type || '') + ' (' + this.formatDate(e.recipe_mealplan.mealplan_from_date) + ')'
                        if (meal_pans.indexOf(meal_plan_entry) === -1) {
                            meal_pans.push(meal_plan_entry)
                        }
                    }
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
        /**
         * update the food after the category was changed
         * handle changing category to category ID as a workaround
         * @param food
         */
        updateFoodCategory: function (food) {
            if (typeof food.supermarket_category === "number") { // not the best solution, but as long as generic multiselect does not support caching, I don't want to use a proper model
                food.supermarket_category = this.useShoppingListStore().supermarket_categories.filter(sc => sc.id === food.supermarket_category)[0]
            }

            let apiClient = new ApiApiFactory()
            apiClient.updateFood(food.id, food).then(r => {

            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        /**
         * set food on_hand status to true and check all associated entries
         * @param food
         */
        setFoodIgnoredAndChecked: function (food) {
            let apiClient = new ApiApiFactory()

            food.ignore_shopping = true
            apiClient.updateFood(food.id, food).then(r => {
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })

            useShoppingListStore().setEntriesCheckedState(this.entries, true, false)
        },
        /**
         * function triggered by touchend event of swipe container
         * check if min distance is reached and execute desired action
         */
        handleSwipe: function () {
            const minDistance = 80;
            const container = document.querySelector('#' + this.item_container_id);
            // get the distance the user swiped
            const swipeDistance = container.scrollLeft - container.clientWidth;
            if (swipeDistance < minDistance * -1) {
                useShoppingListStore().setEntriesCheckedState(this.entries, !this.is_checked, true)
            } else if (swipeDistance > minDistance) {
                useShoppingListStore().delayEntries(this.entries, !this.is_delayed, true)
            }
        }
    },
}
</script>


<style>
/* scroll snap takes care of restoring scroll position */
.swipe-container {
    display: flex;
    overflow: auto;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
}

/* scrollbar should be hidden */
.swipe-container::-webkit-scrollbar {
    display: none;
}

.swipe-container {
    scrollbar-width: none; /* For Firefox */
}

/* main element should always snap into view */
.swipe-element {
    scroll-snap-align: start;
}

.swipe-icon {
    color: white;
    position: sticky;
    left: 16px;
    right: 16px;
}

/* swipe-actions and element should be 100% wide */
.swipe-action,
.swipe-element {
    min-width: 100%;
}

.swipe-action {
    display: flex;
    align-items: center;
}

.right {
    justify-content: flex-end;
}

</style>
