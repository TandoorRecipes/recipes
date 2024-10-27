<template>
    <v-dialog :fullscreen="mobile" v-model="showDialog" max-width="500px">
        <v-card>
            <v-closable-card-title :title="props.shoppingListFood.food.name" v-model="showDialog"></v-closable-card-title>

            <v-card-text class="pt-0 pr-4 pl-4">

                <v-label>{{ $t('Choose_Category') }}</v-label>
                <ModelSelect model="SupermarketCategory"></ModelSelect>

                <v-row>
                    <v-col class="pr-0">
                        <v-btn height="80px" color="info" density="compact" size="small" block stacked @click="useShoppingStore().delayEntries(entriesList, !isDelayed, true); ">
                            <i class="fa-solid fa-clock-rotate-left fa-2x mb-2"></i>
                            {{ $t('Postpone') }} {{isDelayed}}
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn height="80px" color="secondary" density="compact" size="small" block stacked @click="useShoppingStore().setFoodIgnoredState(entriesList,true, true);  showDialog = false">
                            <i class="fa-solid fa-eye-slash fa-2x mb-2"></i>
                            {{ $t('Ignore_Shopping') }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="pr-0 pt-0">
                        <v-btn height="80px" color="primary" density="compact" size="small" :to="{name: 'ModelEditPage', params: {model: 'Food', id: props.shoppingListFood?.food.id!}}" target="_blank" block stacked>
                            <i class="fa-solid fa-pencil fa-2x mb-2"></i>
                            {{ $t('Edit_Food') }}
                        </v-btn>
                    </v-col>
                    <v-col class="pt-0">
                        <v-btn height="80px" color="success" density="compact" size="small" block stacked>
                            <i class="fa-solid fa-plus fa-2x mb-2"></i>
                            {{ $t('Add') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-label class="mt-3">{{ $t('Entries') }}</v-label>
                <v-list density="compact">
                    <template v-for="[i, e] in props.shoppingListFood.entries" :key="e.id">
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

                            <template #append>
                                <v-btn size="small" color="delete" icon="$delete" v-if="!e.recipeMealplan">
                                    <v-icon icon="$delete"></v-icon>
                                </v-btn>
                            </template>

                            <!-- TODO make properly reactive or delete from the food instance in this component as well | ADD functionality once reactive -->
                            <model-edit-dialog model="ShoppingListEntry" :item="e" @delete="useShoppingStore().entries.delete(e.id!);" v-if="!e.recipeMealplan"></model-edit-dialog>
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

import {compile, computed, PropType, watch} from "vue";
import {ShoppingListEntry} from "@/openapi";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {IShoppingList, IShoppingListFood} from "@/types/Shopping";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {VNumberInput} from "vuetify/labs/VNumberInput";
import {DateTime} from "luxon";
import {useDisplay} from "vuetify";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import ShoppingListEntryEditor from "@/components/model_editors/ShoppingListEntryEditor.vue";

const {mobile} = useDisplay()

const showDialog = defineModel<Boolean>()

const props = defineProps({
    shoppingListFood: {type: {} as PropType<IShoppingListFood>, required: true},
})

watch(() => {props.shoppingListFood}, () => {
    console.log('PROP WATCH')
})

const entriesList = computed(() => {
    let list = [] as ShoppingListEntry[]
    props.shoppingListFood?.entries.forEach(e => {
        list.push(e)
    })
    return list
})

const isDelayed = computed(() => {

    let isDelayed = false
    props.shoppingListFood.entries.forEach(e => {
        isDelayed = isDelayed || e.delayUntil != null
    })
    console.log('computing is delayed', isDelayed)
    return isDelayed
})

</script>

<style scoped>


</style>