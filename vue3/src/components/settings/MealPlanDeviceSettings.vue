<template>

    <v-select v-model="useUserPreferenceStore().deviceSettings.mealplan_displayPeriod" :label="$t('Period')" :hint="$t('Plan_Period_To_Show')" :items="MEALPLAN_PERIODS"
              persistent-hint></v-select>
    <v-select v-model="useUserPreferenceStore().deviceSettings.mealplan_displayPeriodCount" :label="$t('Periods')" :hint="$t('Plan_Show_How_Many_Periods')"
              :items="MEALPLAN_PERIOD_COUNTS" persistent-hint></v-select>

    <v-select v-model="useUserPreferenceStore().deviceSettings.mealplan_startingDayOfWeek" :label="$t('Starting_Day')" :hint="$t('Starting_Day')"
              :items="MEALPLAN_STARTING_DAYS" persistent-hint></v-select>

    <v-checkbox v-model="useUserPreferenceStore().deviceSettings.mealplan_displayWeekNumbers" :label="$t('Week_Numbers')" :hint="$t('Show_Week_Numbers')"
                persistent-hint></v-checkbox>

</template>

<script setup lang="ts">

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useI18n} from "vue-i18n";
import {ref} from "vue";

const {t} = useI18n()

const MEALPLAN_PERIODS = ref([
    {title: t("Week"), value: "week"},
    {title: t("Month"), value: "month"},
    {title: t("Year"), value: "year"},
])
const MEALPLAN_STARTING_DAYS = ref([
    {title: t("Sunday"), value: 0},
    {title: t("Monday"), value: 1},
    {title: t("Tuesday"), value: 2},
    {title: t("Wednesday"), value: 3},
    {title: t("Thursday"), value: 4},
    {title: t("Friday"), value: 5},
    {title: t("Saturday"), value: 6},
])
const MEALPLAN_PERIOD_COUNTS = ref([1, 2, 3, 4])

</script>


<style scoped>

</style>