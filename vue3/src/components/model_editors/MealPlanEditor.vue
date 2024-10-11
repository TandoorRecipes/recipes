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
        <v-card-text>
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
                                <v-btn class="w-25" @click="dateRangeValue = shiftDateRange(dateRangeValue, -1); updateDate()"><i class="fa-solid fa-angles-left"></i></v-btn>
                                <v-btn class="w-25" @click="dateRangeValue = shiftDateRange(dateRangeValue, +1); updateDate()"><i class="fa-solid fa-angles-right"></i></v-btn>
                                <v-btn class="w-25" @click="adjustDateRangeLength(dateRangeValue,+1); updateDate()"><i class="fa-solid fa-plus"></i></v-btn>
                            </v-btn-group>
                        </v-input>

                        <ModelSelect model="MealType" :allow-create="true" v-model="editingObj.mealType"></ModelSelect>
                        <v-number-input control-variant="split" :min="0" v-model="editingObj.servings" :label="$t('Servings')"></v-number-input>
                        <ModelSelect model="User" :allow-create="false" v-model="editingObj.shared" item-label="displayName" mode="tags"></ModelSelect>
                    </v-col>
                    <v-col cols="12" md="6">
                        <ModelSelect model="Recipe" v-model="editingObj.recipe"
                                     @update:modelValue="editingObj.servings = editingObj.recipe?.servings ? editingObj.recipe?.servings : 1"></ModelSelect>
                        <!--                                <v-number-input label="Days" control-variant="split" :min="1"></v-number-input>-->
                        <!--TODO create days input with +/- synced to date -->
                        <recipe-card :recipe="editingObj.recipe" v-if="editingObj && editingObj.recipe"></recipe-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-textarea :label="$t('Note')" v-model="editingObj.note"></v-textarea>
                    </v-col>
                </v-row>


            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {ApiApi, MealPlan, MealType} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {DateTime} from "luxon";
import {adjustDateRangeLength, shiftDateRange} from "@/utils/date_utils";
import {VNumberInput} from "vuetify/labs/VNumberInput";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {MessageType, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    item: {type: {} as PropType<MealPlan>, required: false, default: null},
    itemDefaults: {type: {} as PropType<MealPlan>, required: false, default: {} as MealPlan},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, applyItemDefaults, loading, editingObj, modelClass} = useModelEditorFunctions<MealPlan>('MealPlan', emit)

// object specific data (for selects/display)
const dateRangeValue = ref([] as Date[])

onMounted(() => {
    const api = new ApiApi()

    api.apiMealTypeList().then(r => {

        // TODO remove this once moved to user preference from MealType property
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
                console.log('running new Item Function')
                editingObj.value.fromDate = DateTime.now().toJSDate()
                editingObj.value.toDate = DateTime.now().toJSDate()
                editingObj.value.shared = useUserPreferenceStore().userSettings.planShare
                editingObj.value.servings = 1
                editingObj.value.mealType = defaultMealType

                applyItemDefaults(props.itemDefaults)

                initializeDateRange()
                console.log(editingObj.value)
            }, existingItemFunction: () => {
                initializeDateRange()
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