<template>
    <v-list-item class="swipe-container" :id="itemContainerId" @touchend="handleSwipe()" @click="emit('clicked', entries)"
                 v-if="(useUserPreferenceStore().deviceSettings.shopping_show_checked_entries || !isChecked) && (useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries || !isDelayed)"
    >
        <!--        <div class="swipe-action" :class="{'bg-success': !isChecked , 'bg-warning': isChecked }">-->
        <!--            <i class="swipe-icon fa-fw fas" :class="{'fa-check': !isChecked , 'fa-cart-plus': isChecked }"></i>-->
        <!--        </div>-->

        <template #prepend>
            <v-btn color="primary" v-if="isDelayed">
                <i class="fa-fw fas fa-hourglass-half"></i>
            </v-btn>
        </template>

        <div class="flex-grow-1 p-2">
            <div class="d-flex">
                <div class="d-flex flex-column pr-2">
                    <span v-for="[i, a] in amounts" v-bind:key="a.key">

                        <span>
                            <i class="fas fa-check" v-if="a.checked && !isChecked"></i>
                            <i class="fas fa-hourglass-half" v-if="a.delayed && !a.checked"></i> <b>
                            {{ a.amount }}
                            <span v-if="a.unit">{{ a.unit.name }}</span>
                            </b>
                        </span>
                        <br/>
                    </span>
                </div>
                <div class="d-flex  flex-column flex-grow-1 align-self-center">
                    {{ food.name }} <br/>
                    <span v-if="info_row"><small class="text-disabled">{{ info_row }}</small></span>
                </div>
            </div>
        </div>

        <template #append>
            <v-btn color="success" @click="useShoppingStore().setEntriesCheckedState(entries, !isChecked, true)"
                   :class="{'btn-success': !isChecked, 'btn-warning': isChecked}" icon="fa-solid fa-check" variant="plain">
            </v-btn>
            <!--                <i class="d-print-none fa-fw fas" :class="{'fa-check': !isChecked , 'fa-cart-plus': isChecked }"></i>-->
        </template>

        <!--        <div class="swipe-action bg-primary justify-content-end">-->
        <!--            <i class="fa-fw fas fa-hourglass-half swipe-icon"></i>-->
        <!--        </div>-->

    </v-list-item>

</template>

<script setup lang="ts">


import {computed, PropType, ref} from "vue";
import {DateTime} from "luxon";
import {useShoppingStore} from "@/stores/ShoppingStore.js";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.js";
import {ApiApi, Food, ShoppingListEntry} from '@/openapi'
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {ShoppingLineAmount} from "@/types/Shopping";

const emit = defineEmits(['clicked'])

const props = defineProps({
    entries: {type: Array as PropType<Array<ShoppingListEntry>>, required: true},
})

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

/**
 * calculate the amounts for the given line
 * can combine 1 to n entries with the same unit
 * can contain more 0 to n different entries for different units
 */
const amounts = computed((): Map<number, ShoppingLineAmount> => {
    let unitAmounts = new Map<number, ShoppingLineAmount>()

    for (let i in props.entries) {
        let e = props.entries[i]

        if (!e.checked && (e.delayUntil == null)
            || (e.checked && useUserPreferenceStore().deviceSettings.shopping_show_checked_entries)
            || (e.delayUntil !== null && useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries)) {

            let unit = -1
            if (e.unit !== undefined && e.unit !== null) {
                unit = e.unit.id!
            }

            if (e.amount > 0) {

                if (unitAmounts.get(unit) != undefined) {
                    unitAmounts.get(unit)!.amount += e.amount
                } else {
                    unitAmounts.set(unit, {
                        key: e.food?.id!,
                        amount: e.amount,
                        unit: e.unit,
                        checked: e.checked,
                        delayed: (e.delayUntil != null)
                    } as ShoppingLineAmount)
                }
            }
        }
    }
    return unitAmounts
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
    //
    // const minDistance = 80;
    // const container = document.querySelector('#' + itemContainerId.value);
    // // get the distance the user swiped
    // const swipeDistance = container!.scrollLeft - container!.clientWidth;
    // if (swipeDistance < minDistance * -1) {
    //     useShoppingStore().setEntriesCheckedState(props.entries, !isChecked.value, true)
    // } else if (swipeDistance > minDistance) {
    //     useShoppingStore().delayEntries(props.entries, !isDelayed.value, true)
    // }
}

</script>

<style>
/* TODO swipe system classes removed because not working (visually, touch detection was working), retrieve from old ShoppingLineItem VCS */
</style>