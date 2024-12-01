<template>
    <v-dialog :fullscreen="mobile" v-model="showDialog" max-width="500px">
        <v-card>
            <v-closable-card-title :title="shoppingListFood.food.name" v-model="showDialog"></v-closable-card-title>

            <v-card-text class="pt-0 pr-4 pl-4">

                <v-label>{{ $t('Choose_Category') }}</v-label>
                <model-select model="SupermarketCategory" @update:modelValue="categoryUpdate"></model-select>

                <v-row>
                    <v-col class="pr-0">
                        <v-btn height="80px" color="info" density="compact" size="small" block stacked
                               @click="useShoppingStore().delayEntries(entriesList, !isShoppingLineDelayed, true); ">
                            <i class="fa-solid fa-clock-rotate-left fa-2x mb-2"></i>
                            <span v-if="!isShoppingLineDelayed">{{ $t('ShopLater') }}</span>
                            <span v-if="isShoppingLineDelayed">{{ $t('ShopNow') }}</span>

                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn height="80px" color="secondary" density="compact" size="small" block stacked
                               @click="useShoppingStore().setFoodIgnoredState(entriesList,true, true);  showDialog = false">
                            <i class="fa-solid fa-eye-slash fa-2x mb-2"></i>
                            {{ $t('Ignore_Shopping') }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="pr-0 pt-0">
                        <v-btn height="80px" color="primary" density="compact" size="small"
                               :to="{name: 'ModelEditPage', params: {model: 'Food', id: shoppingListFood?.food.id!}}" target="_blank" block stacked>
                            <i class="fa-solid fa-pencil fa-2x mb-2"></i>
                            {{ $t('Edit_Food') }}
                        </v-btn>
                    </v-col>
                    <v-col class="pt-0">
                        <v-btn height="80px" color="success" density="compact" size="small" @click="addEntryForFood()" block stacked>
                            <i class="fa-solid fa-plus fa-2x mb-2"></i>
                            {{ $t('Add') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-label class="mt-3">{{ $t('Entries') }}</v-label>
                <v-list density="compact">
                    <template v-for="[i, e] in shoppingListFood.entries" :key="e.id">
                        <v-list-item border class="mt-1" :class="{'cursor-pointer': !e.recipeMealplan}">
                            <v-list-item-title>
                                <b>
                                    {{ e.amount }}
                                    <span v-if="e.unit">{{ e.unit.name }}</span>
                                </b>
                                {{ e.food.name }}
                            </v-list-item-title>
                            <v-list-item-subtitle v-if="e.recipeMealplan && e.recipeMealplan.recipeName !== ''">
                                {{ e.recipeMealplan.servings }} x
                                <router-link :to="{name: 'view_recipe', params: {id: e.recipeMealplan.id}}" target="_blank" class="text-decoration-none"><b>
                                    {{ e.recipeMealplan.recipeName }} </b>
                                </router-link>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="e.recipeMealplan && e.recipeMealplan.mealplanType !== undefined">
                                {{ e.recipeMealplan.mealplanType }} {{ DateTime.fromJSDate(e.recipeMealplan.mealplanFromDate).toLocaleString(DateTime.DATE_SHORT) }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>
                                {{ e.createdBy.displayName }} - {{ DateTime.fromJSDate(e.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="isDelayed(e)">
                                {{ $t('PostponedUntil') }} {{ DateTime.fromJSDate(e.delayUntil).toLocaleString(DateTime.DATETIME_SHORT) }}
                            </v-list-item-subtitle>

                            <template #append>
                                <v-btn size="small" color="edit" icon="$edit" v-if="!e.recipeMealplan">
                                    <v-icon icon="$edit"></v-icon>
                                    <model-edit-dialog model="ShoppingListEntry" :item="e" @delete="useShoppingStore().entries.delete(e.id); shoppingListFood.entries.delete(e.id)"
                                                       @save="(args: ShoppingListEntry) => (shoppingListFood.entries.set(e.id, args))"></model-edit-dialog>
                                </v-btn>
                            </template>


                        </v-list-item>
                    </template>


                </v-list>


            </v-card-text>
            <v-card-actions v-if="mobile">
                <v-btn @click="showDialog = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {computed, PropType} from "vue";
import {ApiApi, ShoppingListEntry, SupermarketCategory} from "@/openapi";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {IShoppingListFood} from "@/types/Shopping";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {DateTime} from "luxon";
import {useDisplay} from "vuetify";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {isDelayed, isShoppingListFoodDelayed} from "@/utils/logic_utils";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const {mobile} = useDisplay()

const showDialog = defineModel<Boolean>()
const shoppingListFood = defineModel<IShoppingListFood>('shoppingListFood')

/**
 * returns a flat list of entries for the given shopping list food
 */
const entriesList = computed(() => {
    let list = [] as ShoppingListEntry[]
    shoppingListFood.value.entries.forEach(e => {
        list.push(e)
    })
    return list
})

/**
 * checks all entries associated with shopping line, if any is delayed return true else false
 */
const isShoppingLineDelayed = computed(() => {
    return isShoppingListFoodDelayed(shoppingListFood.value)
})

/**
 * change category of food and update via API
 * @param category
 */
function categoryUpdate(category: SupermarketCategory) {
    const api = new ApiApi()
    shoppingListFood.value.food.supermarketCategory = category
    api.apiFoodUpdate({id: shoppingListFood.value.food.id, food: shoppingListFood.value.food}).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

/**
 * add new entry for currently selected food type
 */
function addEntryForFood() {
    useShoppingStore().createObject({
        food: shoppingListFood.value?.food,
        unit: null,
        amount: 1,
    } as ShoppingListEntry, false).then((r: ShoppingListEntry|undefined) => {
        if(r != undefined){
            shoppingListFood.value?.entries.set(r.id!, r)
        }
    })
}

</script>

<style scoped>


</style>