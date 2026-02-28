<template>
    <v-form>
        <p class="text-h6">{{ $t('Meal_Plan') }}</p>
        <v-divider class="mb-3"></v-divider>

<!--        <ModelSelect :hint="$t('plan_share_desc')" :label="$t('Share')" model="User" :allow-create="false"-->
<!--                     v-model="useUserPreferenceStore().userSettings.planShare" item-label="displayName"-->
<!--                     mode="tags"></ModelSelect>-->

        <model-select model="MealType" v-model="useUserPreferenceStore().userSettings.defaultMealType"></model-select>

        <v-btn class="mt-3" color="success" @click="useUserPreferenceStore().updateUserSettings()" prepend-icon="$save">{{ $t('Save') }}</v-btn>

        <p class="text-h6 mt-2">{{ $t('DeviceSettings') }}</p>
        <v-divider></v-divider>
        <p class="text-subtitle-2 mb-2">{{ $t('DeviceSettingsHelp') }}</p>

        <meal-plan-device-settings></meal-plan-device-settings>

    </v-form>
</template>


<script setup lang="ts">
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import MealPlanDeviceSettings from "@/components/settings/MealPlanDeviceSettings.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";





</script>

<style scoped>

</style>