<template>
    <v-dialog :fullscreen="mobile" v-model="showDialog" max-width="500px">
        <v-card>
            <v-closable-card-title :title="shoppingListFood.food.name" v-model="showDialog"></v-closable-card-title>

            <v-card-text class="pt-0 pr-4 pl-4">

                <v-label>{{ $t('Choose_Category') }}</v-label>
                <model-select model="SupermarketCategory" @update:modelValue="categoryUpdate" allow-create></model-select>

                <v-row>
                    <v-col class="pr-0">
                        <v-btn height="80px" color="info" density="compact" size="small" block stacked
                               @click="useShoppingStore().delayEntries(entriesList, !isShoppingLineDelayed, true); showDialog=false">
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
                            <i class="fa-solid fa-carrot fa-2x mb-2"></i>
                            {{ $t('Edit') }}
                        </v-btn>
                    </v-col>
                    <v-col class="pt-0">
                        <v-btn height="80px" color="error" density="compact" size="small" @click="deleteAllEntries()" block stacked>
                            <i class="fa-solid fa-trash fa-2x mb-2"></i>
                            {{ $t('Delete_All') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <div class="mt-2">
                    <v-label class="mt-3">{{ $t('Entries') }}</v-label>
                    <v-btn color="success" class="float-right" @click="addEntryForFood()">
                        <v-icon icon="$create"></v-icon>
                    </v-btn>
                </div>
                <v-list density="compact">
                    <template v-for="[i, e] in shoppingListFood.entries" :key="e.id">
                        <v-list-item border class="mt-1">
                            <v-list-item-title>
                                <b>
                                    <span v-if="e.amount != 0">{{ $n(e.amount) }}&nbsp;</span>
                                    <span v-if="e.unit">{{ e.unit.name }}&nbsp;</span>
                                </b>
                                <span v-if="e.food">
                                    {{ e.food.name }}
                                </span>
                            </v-list-item-title>
                            <v-list-item-subtitle v-if="e.completedAt">
                                <v-icon icon="fa-solid fa-check" size="small" color="success"></v-icon>
                                {{ $t('Completed') }} {{ DateTime.fromJSDate(e.completedAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="e.listRecipe && e.listRecipeData.recipe">
                                {{ e.listRecipeData.servings }} x {{ e.listRecipeData.recipeData.name }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="e.listRecipe && e.listRecipeData.mealplan">
                                {{ e.listRecipeData.mealPlanData.mealType.name }} {{ DateTime.fromJSDate(e.listRecipeData.mealPlanData.fromDate).toLocaleString(DateTime.DATE_SHORT) }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>
                                {{ e.createdBy.displayName }} - {{ DateTime.fromJSDate(e.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="isDelayed(e)" class="text-info font-weight-bold">
                                {{ $t('PostponedUntil') }} {{ DateTime.fromJSDate(e.delayUntil!).toLocaleString(DateTime.DATETIME_SHORT) }}
                            </v-list-item-subtitle>

                            <v-btn-group divided border>
                                <v-btn icon="" @click="e.amount = e.amount / 2; updateEntryAmount(e)" v-if="!e.ingredient">
                                    <v-icon icon="fa-solid fa-divide"></v-icon>
                                </v-btn>
                                <v-btn icon="" @click="e.amount--; updateEntryAmount(e)" v-if="!e.ingredient">
                                    <v-icon icon="fa-solid fa-minus"></v-icon>
                                </v-btn>
                                <v-btn icon="" @click="e.amount++; updateEntryAmount(e)" v-if="!e.ingredient">
                                    <v-icon icon="fa-solid fa-plus"></v-icon>
                                </v-btn>

                                <v-btn icon="" @click="e.amount = e.amount * 2; updateEntryAmount(e)" v-if="!e.ingredient">
                                    <v-icon icon="fa-solid fa-times"></v-icon>
                                </v-btn>
                                <v-btn color="edit" icon="$edit" v-if="!e.ingredient">
                                    <v-icon icon="$edit"></v-icon>
                                    <model-edit-dialog model="ShoppingListEntry" :item="e"
                                                       @delete="useShoppingStore().entries.delete(e.id!); shoppingListFood.entries.delete(e.id!)"
                                                       @save="(args: ShoppingListEntry) => { useShoppingStore().entries.set(e.id!, args); shoppingListFood.entries.set(e.id!, args) }"></model-edit-dialog>
                                </v-btn>
                                <v-btn color="edit" icon="$recipes" v-if="e.listRecipe && e.listRecipeData.recipe && e.ingredient"
                                       :to="{name: 'RecipeViewPage', params: {id: e.listRecipeData.recipe}}">
                                    <v-icon icon="$recipes"></v-icon>
                                </v-btn>
                                <v-btn icon="" @click="useShoppingStore().deleteObject(e, true); shoppingListFood.entries.delete(e.id!)" color="delete">
                                    <v-icon icon="$delete"></v-icon>
                                </v-btn>
                            </v-btn-group>
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

import {computed} from "vue";
import {ApiApi, PatchedShoppingListEntry, ShoppingListEntry, SupermarketCategory} from "@/openapi";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {IShoppingListFood} from "@/types/Shopping";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {DateTime} from "luxon";
import {useDisplay} from "vuetify";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import {isDelayed, isShoppingListFoodDelayed} from "@/utils/logic_utils";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

const {mobile} = useDisplay()

const showDialog = defineModel<Boolean>()
const shoppingListFood = defineModel<IShoppingListFood>('shoppingListFood', {required: true})

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
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
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
    } as ShoppingListEntry, false).then((r: ShoppingListEntry | undefined) => {
        if (r != undefined) {
            shoppingListFood.value?.entries.set(r.id!, r)
        }
    })
}

/**
 * delete all shopping list entries for the given shopping list food
 */
function deleteAllEntries() {
    showDialog.value = false
    shoppingListFood.value.entries.forEach(e => {
        useShoppingStore().deleteObject(e, true)
    })
}

/**
 * update the amount for the given shopping list entry in the database
 * @param entry
 */
function updateEntryAmount(entry: ShoppingListEntry) {
    let api = new ApiApi()
    api.apiShoppingListEntryPartialUpdate({id: entry.id!, patchedShoppingListEntry: {amount: entry.amount} as PatchedShoppingListEntry}).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>


</style>