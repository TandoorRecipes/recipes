<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title v-model="dialog" :title="$t('Auto_Planner')" icon="fa-solid fa-calendar-plus"></v-closable-card-title>

            <v-card-text>

                <v-form>
                    <model-select model="MealType" v-model="autoMealPlan.mealTypeId" :object="false"></model-select>
                    <model-select model="Keyword" v-model="autoMealPlan.keywordIds" mode="tags" :object="false"></model-select>

                    <v-number-input :label="$t('Servings')" v-model="autoMealPlan.servings"></v-number-input>

                    <v-date-input :label="$t('Date')"
                                  multiple="range"
                                  v-model="dateRangeValue"
                                  :first-day-of-week="useUserPreferenceStore().deviceSettings.mealplan_startingDayOfWeek"
                                  :show-week="useUserPreferenceStore().deviceSettings.mealplan_displayWeekNumbers"
                                  prepend-icon=""
                                  prepend-inner-icon="$calendar"
                    ></v-date-input>

                    <model-select model="User" v-model="autoMealPlan.shared" mode="tags"></model-select>
                    <v-checkbox v-model="autoMealPlan.addshopping" :label="$t('AddToShopping')" hide-details></v-checkbox>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="create" prepend-icon="fa-solid fa-person-running" @click="doAutoPlan()" :loading="loading">{{ $t('Create') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {useI18n} from "vue-i18n";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ApiApi, AutoMealPlan} from "@/openapi";
import {onMounted, ref} from "vue";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {DateTime} from "luxon";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useMealPlanStore} from "@/stores/MealPlanStore.ts";

const emit = defineEmits(['change'])

const props = defineProps({
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const dateRangeValue = ref([] as Date[])
const autoMealPlan = ref({} as AutoMealPlan)

onMounted(() => {
    initializeRequest()
})

/**
 * load default values for auto plan creation
 */
function initializeRequest() {
    autoMealPlan.value = {
        servings: 1,
        startDate: DateTime.now().toJSDate(),
        endDate: DateTime.now().plus({day: 7}).toJSDate(),
        shared: useUserPreferenceStore().userSettings.planShare,
        addshopping: useUserPreferenceStore().userSettings.mealplanAutoaddShopping,
    } as AutoMealPlan

    dateRangeValue.value = []
    let currentDate = DateTime.fromJSDate(autoMealPlan.value.startDate).plus({day: 1}).toJSDate()
    while (currentDate <= autoMealPlan.value.endDate) {
        dateRangeValue.value.push(currentDate)
        currentDate = DateTime.fromJSDate(currentDate).plus({day: 1}).toJSDate()
    }

}

/**
 * perform auto plan creation
 */
function doAutoPlan() {
    let api = new ApiApi()
    loading.value = true

    autoMealPlan.value.startDate = dateRangeValue.value[0]
    autoMealPlan.value.endDate = dateRangeValue.value[dateRangeValue.value.length - 1]
    console.log('requesting auto plan from ', autoMealPlan.value.startDate, ' to ', autoMealPlan.value.endDate)

    api.apiAutoPlanCreate({autoMealPlan: autoMealPlan.value}).then(r => {
        dialog.value = false
        useMealPlanStore().refreshLastUpdatedPeriod()
        initializeRequest()
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>