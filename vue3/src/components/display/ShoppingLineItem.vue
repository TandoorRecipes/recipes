<template>
    <div class="swipe-container" :id="itemContainerId" @touchend="handleSwipe()"
         v-if="(useUserPreferenceStore().deviceSettings.shopping_show_checked_entries || !isChecked) && (useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries || !isDelayed)"
    >
        <div class="swipe-action" :class="{'bg-success': !isChecked , 'bg-warning': isChecked }">
            <i class="swipe-icon fa-fw fas" :class="{'fa-check': !isChecked , 'fa-cart-plus': isChecked }"></i>
        </div>

        <v-btn-group class="swipe-element">
            <v-btn color="primary" v-if="isDelayed">
                <i class="fa-fw fas fa-hourglass-half"></i>
            </v-btn>
            <div class="card flex-grow-1 btn-block p-2" @click="detail_modal_visible = true">
                <div class="d-flex">
                    <div class="d-flex flex-column pr-2" v-if="Object.keys(amounts).length> 0">
                        <span v-for="a in amounts" v-bind:key="a.id">

                            <span><i class="fas fa-check" v-if="a.checked && !isChecked"></i><i class="fas fa-hourglass-half" v-if="a.delayed && !a.checked"></i> <b>{{ a.amount }} {{
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
            <v-btn color="success" @click="useShoppingStore().setEntriesCheckedState(entries, !isChecked, true)"
                   :class="{'btn-success': !isChecked, 'btn-warning': isChecked}">
                <i class="d-print-none fa-fw fas" :class="{'fa-check': !isChecked , 'fa-cart-plus': isChecked }"></i>
            </v-btn>
        </v-btn-group>
        <div class="swipe-action bg-primary justify-content-end">
            <i class="fa-fw fas fa-hourglass-half swipe-icon"></i>
        </div>

        <v-dialog v-model="detail_modal_visible">
            <v-card>
                <v-card-title>
                    <h5> {{ food_row }}</h5>
                    <small class="text-muted">{{ food.description }}</small>

                </v-card-title>
                <v-card-text>

                    <h5 class="mt-2">{{ $t('Quick actions') }}</h5>
                    {{ $t('Category') }}
                    <v-select
                        class="form-control mb-2"
                        :items="useShoppingStore().supermarketCategories"
                        item-title="name"
                        item-value="id"
                        return-object
                        v-model="food.supermarket_category"
                        @input="detail_modal_visible = false; updateFoodCategory(food)"
                    ></v-select>

                    <v-btn color="info" block
                           @click="detail_modal_visible = false;useShoppingStore().delayEntries(entries,!isDelayed, true)">
                        {{ $t('Postpone') }}
                    </v-btn>


                    <h6 class="mt-2">{{ $t('Entries') }}</h6>


                    <v-row v-for="e in entries" v-bind:key="e.id">
                        <v-col cold="12">

                            <v-btn-group class="w-100">
                                <div class="card flex-grow-1 btn-block p-2">
                                <span><i class="fas fa-check" v-if="e.checked"></i><i class="fas fa-hourglass-half" v-if="e.delay_until !== null && !e.checked"></i>
                                     <b><span v-if="e.amount > 0">{{ e.amount }}</span> {{ e.unit?.name }}</b> {{ food.name }}</span>
                                    <span><small class="text-muted">
                                    <span v-if="e.recipe_mealplan && e.recipe_mealplan.recipe_name !== ''">
                                        <!-- TOOD used to be a link to view_recipe -->
                                        <a> <b>  {{
                                                e.recipe_mealplan.recipe_name
                                            }} </b></a>({{
                                            e.recipe_mealplan.servings
                                        }} {{ $t('Servings') }})<br/>
                                    </span>
                                    <span v-if="e.recipe_mealplan && e.recipe_mealplan.mealplan_type !== undefined">
                                        {{ e.recipe_mealplan.mealplan_type }}
                                        {{ DateTime().fromJSDate(e.recipe_mealplan.mealplan_from_date).toLocaleString(DateTime.DATETIME_SHORT)}}
                                        <br/>
                                    </span>

                                    {{ e.created_by.display_name }} {{ DateTime().fromJSDate(e.created_at).toLocaleString(DateTime.DATETIME_SHORT) }}<br/>
                                </small>
                                    </span>

                                </div>
                                <v-btn color="error"
                                       @click="useShoppingStore().deleteObject(e)"><i
                                    class="fas fa-trash"></i></v-btn>
                            </v-btn-group>

                            <!-- TODO implement -->
                            <!--                        <generic-multiselect-->
                            <!--                            class="mt-1"-->
                            <!--                            v-if="e.recipe_mealplan === null"-->
                            <!--                            :initial_single_selection="e.unit"-->
                            <!--                            :model="Models.UNIT"-->
                            <!--                            :multiple="false"-->
                            <!--                            @change="e.unit = $event.val; useShoppingListStore().updateObject(e)"-->
                            <!--                        >-->
                            <!--                        </generic-multiselect>-->

                            <!--                        <number-scaler-component :number="e.amount"-->
                            <!--                                                 @change="e.amount = $event; useShoppingListStore().updateObject(e)"-->
                            <!--                                                 v-if="e.recipe_mealplan === null"></number-scaler-component>-->
                            <hr class="m-2"/>
                        </v-col>

                    </v-row>

                    <v-btn color="success" block @click="useShoppingListStore().createObject({ amount: 0, unit: null, food: food, })"> {{ $t("Add") }}</v-btn>
                    <v-btn color="warning" block @click="detail_modal_visible = false; setFoodIgnoredAndChecked(food)"> {{ $t("Ignore_Shopping") }}</v-btn>
                    <v-btn color="danger" block class="mt-2"
                           @click="detail_modal_visible = false;useShoppingListStore().deleteEntries(entries)">
                        {{ $t('Delete_All') }}
                    </v-btn>

                </v-card-text>
            </v-card>


        </v-dialog>

        <!--        <generic-modal-form :model="Models.FOOD" :show="editing_food !== null"-->
        <!--                            @hidden="editing_food = null; useShoppingListStore().refreshFromAPI()"></generic-modal-form>-->

    </div>
</template>

<script setup lang="ts">


import {computed, PropType, ref} from "vue";
import {DateTime} from "luxon";
import {useShoppingStore} from "@/stores/ShoppingStore.js";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.js";
import {ApiApi, Food, ShoppingListEntry} from '@/openapi'
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    entries: {type: [] as PropType<ShoppingListEntry[]>, required: true},
})

const detail_modal_visible = ref(false)
const editing_food = ref({} as Food)


const itemContainerId = computed(() => {
    let id = 'id_sli_'
    for (let i in props.entries) {
        id += i + '_'
    }
    return id
})

const isChecked = computed(() => {
    for (let i in props.entries) {
        if (!props.entries[i].checked) {
            return false
        }
    }
    return true
})

const isDelayed = computed(() => {
    for (let i in props.entries) {
        if (props.entries[i].delayUntil != null && props.entries[i].delayUntil! > new Date(Date.now())) {
            return true
        }
    }
    return false
})


const food = computed(() => {
    return props.entries[Object.keys(props.entries)[0]]['food']
})


const amounts = computed(() => {
    let unit_amounts = {}

    for (let i in props.entries) {
        let e = props.entries[i]

        if (!e.checked && e.delayUntil === null
            || (e.checked && useUserPreferenceStore().deviceSettings.shopping_show_checked_entries)
            || (e.delayUntil !== null && useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries)) {

            let unit = -1
            if (e.unit !== undefined && e.unit !== null) {
                unit = e.unit.id!
            }
            if (e.amount > 0) {
                if (unit in unit_amounts) {
                    unit_amounts[unit]['amount'] += e.amount
                } else {
                    if (unit === -1) {
                        unit_amounts[unit] = {id: -1, unit: "", amount: e.amount, checked: e.checked, delayed: (e.delayUntil !== null)}
                    } else {
                        unit_amounts[unit] = {id: e.unit.id, unit: e.unit.name, amount: e.amount, checked: e.checked, delayed: (e.delayUntil !== null)}
                    }

                }
            }
        }
    }
    return unit_amounts
})

const food_row = computed(() => {
    return food.value.name
})

const info_row = computed(() => {
    let info_row = []

    let authors = []
    let recipes = []
    let meal_pans = []

    for (let i in props.entries) {
        let e = props.entries[i]

        if (authors.indexOf(e.createdBy.displayName) === -1) {
            authors.push(e.createdBy.displayName)
        }


        if (e.recipeMealplan !== null) {
            let recipe_name = e.recipeMealplan.recipeName
            if (recipes.indexOf(recipe_name) === -1) {
                recipes.push(recipe_name.substring(0, 14) + (recipe_name.length > 14 ? '..' : ''))
            }

            if ('mealplan_from_date' in e.recipeMealplan) {
                let meal_plan_entry = (e?.recipeMealplan?.mealplanType || '') + ' (' + DateTime.fromJSDate(e.recipeMealplan.mealplanFromDate).toLocaleString(DateTime.DATETIME_SHORT) + ')'
                if (meal_pans.indexOf(meal_plan_entry) === -1) {
                    meal_pans.push(meal_plan_entry)
                }
            }
        }
    }

    if (useUserPreferenceStore().deviceSettings.shopping_item_info_created_by && authors.length > 0) {
        info_row.push(authors.join(', '))
    }
    if (useUserPreferenceStore().deviceSettings.shopping_item_info_recipe && recipes.length > 0) {
        info_row.push(recipes.join(', '))
    }
    if (useUserPreferenceStore().deviceSettings.shopping_item_info_mealplan && meal_pans.length > 0) {
        info_row.push(meal_pans.join(', '))
    }

    return info_row.join(' - ')
})

// TODO implement
/**
 * update the food after the category was changed
 * handle changing category to category ID as a workaround
 * @param food
 */
function updateFoodCategory(food: Food) {
    // if (typeof food.supermarketCategory === "number") { // not the best solution, but as long as generic multiselect does not support caching, I don't want to use a proper model
    //     food.supermarket_category = this.useShoppingListStore().supermarket_categories.filter(sc => sc.id === food.supermarket_category)[0]
    // }
    //
    // let apiClient = new ApiApiFactory()
    // apiClient.updateFood(food.id, food).then(r => {
    //
    // }).catch((err) => {
    //     StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
    // })
}

/**
 * set food on_hand status to true and check all associated entries
 * @param food
 */
function setFoodIgnoredAndChecked(food: Food) {
    let api = new ApiApi()

    food.ignoreShopping = true
    api.apiFoodUpdate({id: food.id!, food: food}).then(r => {

    }).catch((err) => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })

    useShoppingStore().setEntriesCheckedState(props.entries, true, false)
}

/**
 * function triggered by touchend event of swipe container
 * check if min distance is reached and execute desired action
 */
function handleSwipe() {
    const minDistance = 80;
    const container = document.querySelector('#' + itemContainerId.value);
    // get the distance the user swiped
    const swipeDistance = container.scrollLeft - container.clientWidth;
    if (swipeDistance < minDistance * -1) {
        useShoppingStore().setEntriesCheckedState(props.entries, !isChecked.value, true)
    } else if (swipeDistance > minDistance) {
        useShoppingStore().delayEntries(props.entries, !isDelayed.value, true)
    }
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
