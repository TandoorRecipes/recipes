<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-tabs v-model="tab" :disabled="loading" grow>
            <v-tab prepend-icon="$mealplan" value="plan">{{ $t('Meal_Plan') }}</v-tab>
            <v-tab prepend-icon="$shopping" value="shopping">{{ $t('Shopping_list') }}</v-tab>
        </v-tabs>

        <v-card-text>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="plan">
                    <v-form :disabled="loading">

                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('Title')" v-model="editingObj.title"></v-text-field>
                                <v-date-input
                                    v-model="dateRangeValue"
                                    :label="$t('Date')"
                                    multiple="range"
                                    prepend-icon=""
                                    prepend-inner-icon="$calendar"
                                ></v-date-input>

                                <v-input>
                                    <v-btn-group elevation="1" class="w-100" divided border>
                                        <v-btn class="w-25" @click="adjustDateRangeLength(dateRangeValue,-1); updateDate()"><i class="fa-solid fa-minus"></i></v-btn>
                                        <v-btn class="w-25" @click="dateRangeValue = shiftDateRange(dateRangeValue, -1); updateDate()"><i class="fa-solid fa-angles-left"></i>
                                        </v-btn>
                                        <v-btn class="w-25" @click="dateRangeValue = shiftDateRange(dateRangeValue, +1); updateDate()"><i class="fa-solid fa-angles-right"></i>
                                        </v-btn>
                                        <v-btn class="w-25" @click="adjustDateRangeLength(dateRangeValue,+1); updateDate()"><i class="fa-solid fa-plus"></i></v-btn>
                                    </v-btn-group>
                                </v-input>

                                <ModelSelect model="MealType" :allow-create="true" v-model="editingObj.mealType"></ModelSelect>
                                <v-number-input control-variant="split" :min="0" v-model="editingObj.servings" :label="$t('Servings')"></v-number-input>
                                <ModelSelect model="User" :allow-create="false" v-model="editingObj.shared" item-label="displayName" mode="tags"></ModelSelect>
                            </v-col>
                            <v-col cols="12" md="6">
                                <ModelSelect model="Recipe" v-model="editingObj.recipe"
                                             @update:modelValue="editingObj.servings = editingObj.recipe ? editingObj.recipe.servings : 1"></ModelSelect>
                                <!--                                <v-number-input label="Days" control-variant="split" :min="1"></v-number-input>-->
                                <!--TODO create days input with +/- synced to date -->
                                <recipe-card :recipe="editingObj.recipe" v-if="editingObj && editingObj.recipe"></recipe-card>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-textarea :label="$t('Note')" v-model="editingObj.note" rows="3"></v-textarea>
                            </v-col>
                            <v-col cols="12" md="6" v-if="!isUpdate()">
                                <v-checkbox :label="$t('AddToShopping')" v-model="editingObj.addshopping" hide-details></v-checkbox>
                                <!--                        <v-checkbox :label="$t('review_shopping')" v-model="addToShopping" hide-details></v-checkbox>-->
                            </v-col>
                        </v-row>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="shopping">
                    <v-text-field :label="$t('Shopping_input_placeholder')" density="compact" @keyup.enter="addIngredient()" v-model="ingredientInput" hide-details>
                        <template #append>
                            <v-btn
                                density="comfortable"
                                @click="addIngredient()"
                                :icon="ingredientInputIcon"
                                color="create"
                            ></v-btn>
                        </template>
                    </v-text-field>

                    <v-progress-linear class="mt-2" indeterminate v-if="useShoppingStore().currentlyUpdating"></v-progress-linear>

                    <v-list v-if="editingObj.id">
                        <shopping-line-item
                            v-for="slf in useShoppingStore().getMealPlanEntries(editingObj.id)"
                            :shopping-list-food="slf"
                            hide-info-row
                        ></shopping-line-item>
                    </v-list>
                </v-tabs-window-item>
            </v-tabs-window>


        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {ApiApi, MealPlan, MealType, ShoppingListEntry} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {DateTime} from "luxon";
import {adjustDateRangeLength, shiftDateRange} from "@/utils/date_utils";
import {VNumberInput} from "vuetify/labs/VNumberInput";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";
import ShoppingLineItem from "@/components/display/ShoppingLineItem.vue";
import {IShoppingListFood} from "@/types/Shopping";
import {useShoppingStore} from "@/stores/ShoppingStore";

const props = defineProps({
    item: {type: {} as PropType<MealPlan>, required: false, default: null},
    itemDefaults: {type: {} as PropType<MealPlan>, required: false, default: {} as MealPlan},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, applyItemDefaults, loading, editingObj, modelClass} = useModelEditorFunctions<MealPlan>('MealPlan', emit)

// object specific data (for selects/display)
const tab = ref('shopping')

const dateRangeValue = ref([] as Date[])

onMounted(() => {
    const api = new ApiApi()

    // load meal types and create new object based on default type when initially loading
    // TODO remove this once moved to user preference from MealType property
    loading.value = true
    api.apiMealTypeList().then(r => {

        let defaultMealType = {} as MealType
        r.results.forEach(r => {
            if (r._default) {
                defaultMealType = r
            }
        })
        if (Object.keys(defaultMealType).length == 0 && r.results.length > 0) {
            defaultMealType = r.results[0]
        }

        setupState(props.item, props.itemId, {
            newItemFunction: () => {
                editingObj.value.fromDate = DateTime.now().toJSDate()
                editingObj.value.toDate = DateTime.now().toJSDate()
                editingObj.value.shared = useUserPreferenceStore().userSettings.planShare
                editingObj.value.servings = 1
                editingObj.value.mealType = defaultMealType

                editingObj.value.addshopping = !!useUserPreferenceStore().userSettings.mealplanAutoaddShopping

                applyItemDefaults(props.itemDefaults)

                initializeDateRange()
            }, existingItemFunction: () => {
                initializeDateRange()
                useShoppingStore().refreshFromAPI(editingObj.value.id!)
            }
        },)
    })
})

/**
 * update the editing object with data from the date range selector whenever its changed (could probably be a watcher)
 */
// TODO properly hook into beforeSave hook if i ever implement one for model editors
function updateDate() {
    if (dateRangeValue.value != null) {
        editingObj.value.fromDate = dateRangeValue.value[0]
        editingObj.value.toDate = dateRangeValue.value[dateRangeValue.value.length - 1]
    } else {
        useMessageStore().addMessage(MessageType.WARNING, 'Missing Date', 7000)
        return
    }
}

/**
 * initialize the dateRange selector when the editingObject is initialized
 */
function initializeDateRange() {
    if (editingObj.value.toDate && DateTime.fromJSDate(editingObj.value.toDate).diff(DateTime.fromJSDate(editingObj.value.fromDate), 'days').toObject().days! >= 1) {
        dateRangeValue.value = [editingObj.value.fromDate]
        let currentDate = DateTime.fromJSDate(editingObj.value.fromDate).plus({day: 1}).toJSDate()
        while (currentDate <= editingObj.value.toDate) {
            dateRangeValue.value.push(currentDate)
            currentDate = DateTime.fromJSDate(currentDate).plus({day: 1}).toJSDate()
        }
    } else {
        dateRangeValue.value = [editingObj.value.fromDate, editingObj.value.fromDate]
    }
}

</script>

<style scoped>

</style>