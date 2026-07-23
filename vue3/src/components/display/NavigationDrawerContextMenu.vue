<template>

    <template v-if="route.name == 'MealPlanPage'">
        <v-divider></v-divider>
        <v-list-item prepend-icon="fa-solid fa-calendar-plus" link>
            {{$t('Auto_Planner')}}
            <auto-plan-dialog></auto-plan-dialog>
        </v-list-item>
        <meal-plan-ical-dialog></meal-plan-ical-dialog>
        <v-list-subheader>{{$t('Settings')}}</v-list-subheader>
        <v-list-item>
            <meal-plan-device-settings></meal-plan-device-settings>
        </v-list-item>
    </template>


</template>

<script setup lang="ts">

import {useRoute} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import MealPlanDeviceSettings from "@/components/settings/MealPlanDeviceSettings.vue";
import AutoPlanDialog from "@/components/dialogs/AutoPlanDialog.vue";
import MealPlanIcalDialog from "@/components/dialogs/MealPlanIcalDialog.vue";

const route = useRoute()

</script>

<style scoped>

</style>