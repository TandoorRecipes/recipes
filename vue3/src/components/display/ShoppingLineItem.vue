<template>
    <v-list-item class="swipe-container border-t-sm" :id="itemContainerId" @touchend="handleSwipe()"
                 v-if="isShoppingListFoodVisible(props.shoppingListFood, useUserPreferenceStore().deviceSettings)"
    >
        <!--        <div class="swipe-action" :class="{'bg-success': !isChecked , 'bg-warning': isChecked }">-->
        <!--            <i class="swipe-icon fa-fw fas" :class="{'fa-check': !isChecked , 'fa-cart-plus': isChecked }"></i>-->
        <!--        </div>-->


        <div class="flex-grow-1 p-2" @click="dialog = true;">
            <div class="d-flex">
                <div class="d-flex flex-column pr-2">
                    <span v-for="a in amounts" v-bind:key="a.key">
                        <span>
                            <i class="fas fa-check text-success fa-fw" v-if="a.checked"></i>
                            <i class="fas fa-clock-rotate-left text-info fa-fw" v-if="a.delayed"></i> <b>
                            <span :class="{'text-disabled': a.checked || a.delayed}" class="text-no-wrap">
                                <span v-if="amounts.length > 1 || (amounts.length == 1 && a.amount != 1)">{{ $n(a.amount) }}</span>
                                <span class="ms-1" v-if="a.unit">{{ pluralString(a.unit, a.amount) }}</span>
                            </span>
                            </b>
                        </span>
                        <br/>
                    </span>
                </div>
                <div class="d-flex  flex-column flex-grow-1 align-self-center">
                    {{ pluralString(shoppingListFood.food, (amounts.length > 1 || (amounts.length == 1 && amounts[0].amount > 1) ? 2 : 1)) }} <br/>
                    <span v-if="infoRow"><small class="text-disabled">{{ infoRow }}</small></span>
                </div>
            </div>
        </div>

        <template v-slot:[checkBtnSlot]>
            <v-btn color="success" @click.native.stop="useShoppingStore().setEntriesCheckedState(entries, !isChecked, true);"
                   :class="{'btn-success': !isChecked, 'btn-warning': isChecked}" :icon="actionButtonIcon" variant="plain">
            </v-btn>
            <!--                <i class="d-print-none fa-fw fas" :class="{'fa-check': !isChecked , 'fa-cart-plus': isChecked }"></i>-->
        </template>

        <!--        <div class="swipe-action bg-primary justify-content-end">-->
        <!--            <i class="fa-fw fas fa-hourglass-half swipe-icon"></i>-->
        <!--        </div>-->

    </v-list-item>

    <shopping-line-item-dialog v-model="dialog" v-model:shopping-list-food="props.shoppingListFood"></shopping-line-item-dialog>
</template>

<script setup lang="ts">


import {computed, PropType, ref} from "vue";
import {DateTime} from "luxon";
import {useShoppingStore} from "@/stores/ShoppingStore.js";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.js";
import {ApiApi, Food, ShoppingListEntry} from '@/openapi'
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {IShoppingListFood, ShoppingLineAmount} from "@/types/Shopping";
import {isDelayed, isEntryVisible, isShoppingListFoodDelayed, isShoppingListFoodVisible} from "@/utils/logic_utils";
import ShoppingLineItemDialog from "@/components/dialogs/ShoppingLineItemDialog.vue";
import {pluralString} from "@/utils/model_utils.ts";

const emit = defineEmits(['clicked'])

const props = defineProps({
    shoppingListFood: {type: {} as PropType<IShoppingListFood>, required: true},
    hideInfoRow: {type: Boolean, default: false}
})
const checkBtnSlot = ref(useUserPreferenceStore().userSettings.leftHanded ? 'prepend' : 'append')

const dialog = ref(false)

const entries = computed(() => {
    return Array.from(props.shoppingListFood.entries.values())
})

/**
 * ID of outer container, used by swipe system
 */
const itemContainerId = computed(() => {
    let id = 'id_sli_'
    for (let i in entries.value) {
        id += i + '_'
    }
    return id
})


/**
 * tests if all entries of the given food are checked
 */
const isChecked = computed(() => {
    for (let i in entries.value) {
        if (!entries.value[i].checked) {
            return false
        }
    }
    return true
})

/**
 * style action button depending on if all items are checked or not
 */
const actionButtonIcon = computed(() => {
    if (isChecked.value) {
        return 'fa-solid fa-plus'
    }
    return 'fa-solid fa-check'
})


/**
 * calculate the amounts for the given line
 * can combine 1 to n entries with the same unit
 * can contain more 0 to n different entries for different units
 */
const amounts = computed((): ShoppingLineAmount[] => {
    let unitAmounts: ShoppingLineAmount[] = []

    for (let i in entries.value) {
        let e = entries.value[i]

        if (isEntryVisible(e, useUserPreferenceStore().deviceSettings)) {
            let unit = -1
            if (e.unit !== undefined && e.unit !== null) {
                unit = e.unit.id!
            }

            if (e.amount > 0) {

                let uaMerged = false
                unitAmounts.forEach(ua => {
                    if (((ua.unit == null && e.unit == null) || (ua.unit != null && ua.unit.id! == unit)) && ua.checked == e.checked && ua.delayed == isDelayed(e)) {
                        ua.amount += e.amount
                        uaMerged = true
                    }
                })

                if (!uaMerged) {
                    unitAmounts.push({
                        key: `${unit}_${e.checked}_${isDelayed(e)}`,
                        amount: e.amount,
                        unit: e.unit,
                        checked: e.checked,
                        delayed: isDelayed(e)
                    } as ShoppingLineAmount)
                }
            }
        }
    }
    return unitAmounts
})

/**
 * compute the second (info) row of the line item based on the entries and the device settings
 */
const infoRow = computed(() => {
    if (props.hideInfoRow) {
        return ''
    }

    let info_row = []

    let authors = []
    let recipes = []
    let meal_pans = []

    for (let i in entries.value) {
        let e = entries.value[i]

        if (isEntryVisible(e, useUserPreferenceStore().deviceSettings)) {

            if (authors.indexOf(e.createdBy.displayName) === -1) {
                authors.push(e.createdBy.displayName)
            }

            if (e.listRecipe != null) {
                if (e.listRecipeData.recipe != null) {
                    let recipe_name = e.listRecipeData.recipeData.name
                    if (recipes.indexOf(recipe_name) === -1) {
                        recipes.push(recipe_name.substring(0, 14) + (recipe_name.length > 14 ? '..' : ''))
                    }
                }

                if (e.listRecipeData.mealplan != null) {
                    let meal_plan_entry = (e.listRecipeData.mealPlanData.mealType.name.substring(0, 8) || '') + (e.listRecipeData.mealPlanData.mealType.name.length > 8 ? '..' : '') + ' (' + DateTime.fromJSDate(e.listRecipeData.mealPlanData.fromDate).toLocaleString(DateTime.DATE_SHORT) + ')'
                    if (meal_pans.indexOf(meal_plan_entry) === -1) {
                        meal_pans.push(meal_plan_entry)
                    }
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

    useShoppingStore().setEntriesCheckedState(entries.value, true, false)
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