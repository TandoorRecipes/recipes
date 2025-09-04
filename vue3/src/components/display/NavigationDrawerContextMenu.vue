<template>

<!--    <template v-if="route.name == 'ModelListPage'">-->
<!--        <v-divider></v-divider>-->
<!--        <v-list-item v-for="m in getListModels()"-->
<!--                     :to="{ name: 'ModelListPage', params: {model: m.name.toLowerCase()} }">-->
<!--            <template #prepend>-->
<!--                <v-icon :icon="m.icon"></v-icon>-->
<!--            </template>-->
<!--            {{ $t(m.localizationKey) }}-->
<!--        </v-list-item>-->
<!--    </template>-->

    <template v-if="route.name == 'MealPlanPage'">
        <v-divider></v-divider>
        <v-list-item prepend-icon="fa-solid fa-calendar-plus" link>
            {{$t('Auto_Planner')}}
            <auto-plan-dialog></auto-plan-dialog>
        </v-list-item>
        <v-list-subheader>{{$t('Settings')}}</v-list-subheader>
        <v-list-item>
            <meal-plan-device-settings></meal-plan-device-settings>
        </v-list-item>
    </template>


</template>

<script setup lang="ts">

import {useRoute} from "vue-router";
import {getListModels} from "@/types/Models";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import MealPlanDeviceSettings from "@/components/settings/MealPlanDeviceSettings.vue";
import AutoPlanDialog from "@/components/dialogs/AutoPlanDialog.vue";

const route = useRoute()

</script>

<style scoped>

</style>