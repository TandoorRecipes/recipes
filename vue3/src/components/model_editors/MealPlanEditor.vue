<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject().then((obj:MealPlan) => { useMealPlanStore().plans.set(obj.id, obj); loadShoppingListEntries()})"
        @delete="useMealPlanStore().plans.delete(editingObj.id); deleteObject()"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-card-text class="pa-0">
            <v-tabs v-model="tab" :disabled="loading" grow>
                <v-tab prepend-icon="$mealplan" value="plan">{{ $t('Meal_Plan') }}</v-tab>
                <v-tab prepend-icon="$shopping" value="shopping" :disabled="!isUpdate()">{{ $t('Shopping_list') }}</v-tab>
            </v-tabs>
        </v-card-text>

        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="plan">
                    <v-form :disabled="loading">

                        <v-row>
                            <v-col cols="12" md="6">
                                <ModelSelect model="Recipe" v-model="editingObj.recipe"
                                             @update:modelValue="editingObj.servings = editingObj.recipe ? editingObj.recipe.servings : 1"></ModelSelect>
                                <!--                                <v-number-input label="Days" control-variant="split" :min="1"></v-number-input>-->
                                <!--TODO create days input with +/- synced to date -->
                                <recipe-card :recipe="editingObj.recipe" v-if="editingObj && editingObj.recipe" link-target="_blank"></recipe-card>
                                <v-btn prepend-icon="$shopping" color="create" class="mt-1" v-if="!editingObj.shopping && editingObj.recipe && isUpdate()">
                                    {{$t('Add')}}
                                    <add-to-shopping-dialog :recipe="editingObj.recipe" :meal-plan="editingObj" @created="loadShoppingListEntries(); editingObj.shopping = true;"></add-to-shopping-dialog>
                                </v-btn>

                                <v-checkbox :label="$t('AddToShopping')" v-model="editingObj.addshopping" hide-details v-if="editingObj.recipe && !isUpdate()"></v-checkbox>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field :label="$t('Title')" v-model="editingObj.title"></v-text-field>
                                <v-date-input
                                    v-model="dateRangeValue"
                                    @update:modelValue="updateDate()"
                                    :first-day-of-week="useUserPreferenceStore().deviceSettings.mealplan_startingDayOfWeek"
                                    :show-week="useUserPreferenceStore().deviceSettings.mealplan_displayWeekNumbers"
                                    :label="$t('Date')"
                                    multiple="range"
                                    prepend-icon=""
                                    prepend-inner-icon="$calendar"
                                    hide-details
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
                                <v-number-input control-variant="split" :min="0" v-model="editingObj.servings" :label="$t('Servings')" :precision="2"></v-number-input>
                                <ModelSelect model="User" :allow-create="false" v-model="editingObj.shared" item-label="displayName" mode="tags"></ModelSelect>
                            </v-col>

                        </v-row>
                        <v-row dense>
                            <v-col cols="12">
                                <v-textarea :label="$t('Note')" v-model="editingObj.note" rows="3"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="shopping">
                    <closable-help-alert class="mb-2" :text="$t('MealPlanShoppingHelp')"></closable-help-alert>

                    <v-row v-if="isUpdate()" dense style="max-height: 75vh; min-height: 30vh" class="overflow-y-scroll">
                        <v-col>
                            <shopping-list-entry-input :loading="useShoppingStore().currentlyUpdating" :meal-plan="editingObj"></shopping-list-entry-input>
                            <v-list v-if="editingObj.id">
                                <shopping-line-item
                                    v-for="slf in useShoppingStore().getMealPlanEntries(editingObj.id)"
                                    :shopping-list-food="slf"
                                    hide-info-row
                                    :key="slf.food.id"
                                ></shopping-line-item>
                            </v-list>
                        </v-col>
                    </v-row>

                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {nextTick, onMounted, PropType, ref, toRaw, watch} from "vue";
import {ApiApi, MealPlan, MealType, ShoppingListRecipe} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {DateTime} from "luxon";
import {adjustDateRangeLength, shiftDateRange} from "@/utils/date_utils";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore";
import ShoppingLineItem from "@/components/display/ShoppingLineItem.vue";
import {useShoppingStore} from "@/stores/ShoppingStore";
import ShoppingListEntryInput from "@/components/inputs/ShoppingListEntryInput.vue";
import ClosableHelpAlert from "@/components/display/ClosableHelpAlert.vue";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import AddToShoppingDialog from "@/components/dialogs/AddToShoppingDialog.vue";

const props = defineProps({
    item: {type: {} as PropType<MealPlan>, required: false, default: null},
    itemDefaults: {type: {} as PropType<MealPlan>, required: false, default: {} as MealPlan},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {
    setupState,
    deleteObject,
    saveObject,
    isUpdate,
    editingObjName,
    applyItemDefaults,
    loading,
    editingObj,
    editingObjChanged,
    modelClass
} = useModelEditorFunctions<MealPlan>('MealPlan', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)
const tab = ref('plan')

const dateRangeValue = ref([] as Date[])

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor(){
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

                editingObj.value.addshopping = useUserPreferenceStore().userSettings.mealplanAutoaddShopping

                applyItemDefaults(props.itemDefaults)

                if (editingObj.value.toDate < editingObj.value.fromDate) {
                    editingObj.value.toDate = editingObj.value.fromDate
                }

                initializeDateRange()

                nextTick(() => {
                    editingObjChanged.value = false
                })
            }, existingItemFunction: () => {
                editingObj.value = structuredClone(toRaw(editingObj.value))
                initializeDateRange()
                loadShoppingListEntries()
            }
        },)
    })
}

/**
 * update the editing object with data from the date range selector whenever its changed (could probably be a watcher)
 */
// TODO properly hook into beforeSave hook if i ever implement one for model editors
function updateDate() {
    if (dateRangeValue.value != null) {
        editingObj.value.fromDate = dateRangeValue.value[0]
        if (dateRangeValue.value[dateRangeValue.value.length - 1] > editingObj.value.fromDate) {
            editingObj.value.toDate = dateRangeValue.value[dateRangeValue.value.length - 1]
        } else {
            editingObj.value.toDate = editingObj.value.fromDate
        }
    } else {
        useMessageStore().addMessage(MessageType.WARNING, 'Missing Date', 7000)
    }
}

/**
 * load all shopping list entries associated with meal plan
 */
function loadShoppingListEntries() {
    useShoppingStore().refreshFromAPI(editingObj.value.id!)
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