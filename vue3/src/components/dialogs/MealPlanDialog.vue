<template>
    <v-dialog activator="parent" v-model="dialog" max-width="1200">
        <template v-slot:default="{ isActive }">
            <v-card style="overflow: auto">
                <v-card-title>Meal Plan Edit
                    <v-btn icon="fas fa-times" variant="flat" size="x-small" class="mt-2 float-right " @click="isActive.value = false"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-form>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field label="Title" v-model="mutableMealPlan.title"></v-text-field>
                                <v-date-input
                                    v-model="dateRangeValue"
                                    label="Plan Date"
                                    multiple="range"
                                    prepend-icon=""
                                    prepend-inner-icon="$calendar"
                                ></v-date-input>

                                <v-input>
                                    <v-btn-group elevation="1" class="w-100" divided border>
                                        <v-btn class="w-25" @click="adjustDateRangeLength(dateRangeValue,-1)"><i class="fa-solid fa-minus"></i></v-btn>
                                        <v-btn class="w-25" @click="dateRangeValue = shiftDateRange(dateRangeValue, -1)"><i class="fa-solid fa-angles-left"></i></v-btn>
                                        <v-btn class="w-25" @click="dateRangeValue = shiftDateRange(dateRangeValue, +1)"><i class="fa-solid fa-angles-right"></i></v-btn>
                                        <v-btn class="w-25" @click="adjustDateRangeLength(dateRangeValue,+1)"><i class="fa-solid fa-plus"></i></v-btn>
                                    </v-btn-group>
                                </v-input>

                                <ModelSelect model="MealType" :allow-create="true" v-model="mutableMealPlan.mealType"></ModelSelect>
                                <v-number-input control-variant="split" :min="0" v-model="mutableMealPlan.servings" label="Servings"></v-number-input>
                                <ModelSelect model="User" :allow-create="false" v-model="mutableMealPlan.shared" item-label="displayName" mode="tags"></ModelSelect>
                            </v-col>
                            <v-col cols="12" md="6">
                                <ModelSelect model="Recipe" v-model="mutableMealPlan.recipe" @update:modelValue="mutableMealPlan.servings = mutableMealPlan.recipe?.servings ? mutableMealPlan.recipe?.servings : 1"></ModelSelect>
                                <!--                                <v-number-input label="Days" control-variant="split" :min="1"></v-number-input>--> <!--TODO create days input with +/- synced to date -->
                                <recipe-card :recipe="mutableMealPlan.recipe" v-if="mutableMealPlan && mutableMealPlan.recipe"></recipe-card>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-textarea label="Note" v-model="mutableMealPlan.note"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="error" @click="useMealPlanStore().deleteObject(mutableMealPlan); dialog = false">
                        Delete
                    </v-btn>
                    <v-btn color="success" class="ml-auto" @click="saveMealPlan">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import {onMounted, PropType, ref, watch, watchEffect} from "vue";
import {ApiApi, MealPlan, RecipeOverview} from "@/openapi";
import {DateTime} from "luxon";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {VNumberInput} from 'vuetify/labs/VNumberInput' //TODO remove once component is out of labs
import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useMessageStore} from "@/stores/MessageStore";
import {adjustDateRangeLength, shiftDateRange} from "@/utils/date_utils";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const props = defineProps(
    {
        mealPlan: {type: Object as PropType<MealPlan>, required: false},
    }
)

const dialog = ref(false)
let mutableMealPlan = ref(newMealPlan())
const dateRangeValue = ref([] as Date[])

if (props.mealPlan != undefined) {
    mutableMealPlan.value = props.mealPlan
}

/**
 * once dialog is opened check if a meal plan prop is given, if so load it as the default values
 */
watch(dialog, () => {
    if (dialog.value && props.mealPlan != undefined) {
        mutableMealPlan.value = props.mealPlan

        dateRangeValue.value = []
        if (!dateRangeValue.value.includes(mutableMealPlan.value.fromDate)) {
            dateRangeValue.value.push(mutableMealPlan.value.fromDate)
        }
        if (mutableMealPlan.value.toDate && !dateRangeValue.value.includes(mutableMealPlan.value.toDate)) {
            dateRangeValue.value.push(mutableMealPlan.value.toDate)
        }

    } else {
        mutableMealPlan.value = newMealPlan()
    }
});

/**
 * save meal plan into DB, parsing values from dateRange into meal plan object
 */
function saveMealPlan() {

    if (mutableMealPlan.value != undefined) {
        mutableMealPlan.value.recipe = mutableMealPlan.value.recipe as RecipeOverview
        if (dateRangeValue.value != null) {
            mutableMealPlan.value.fromDate = dateRangeValue.value[0]
            mutableMealPlan.value.toDate = dateRangeValue.value[dateRangeValue.value.length - 1]
        } else {
            useMessageStore().addError('Missing Dates')
            return
        }

        console.log('calling save method')
        useMealPlanStore().createOrUpdate(mutableMealPlan.value).catch(err => {
            // TODO handle error
        }).finally(() => {
            dialog.value = false
        })
    }
}

/**
 * create new meal plan on current date
 */
function newMealPlan() {
    // TODO load default meal type
    return {
        fromDate: DateTime.now().toJSDate(),
        toDate: DateTime.now().toJSDate(),
        servings: 1,
        shared: useUserPreferenceStore().userSettings.planShare
    } as MealPlan
}


</script>

<style src="@vueform/multiselect/themes/default.css"></style>

<style scoped>

</style>