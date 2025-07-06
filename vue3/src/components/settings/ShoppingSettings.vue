<template>
    <v-form>
        <p class="text-h6">{{ $t('Shopping_list') }}</p>
        <v-divider class="mb-3"></v-divider>

        <ModelSelect :hint="$t('shopping_share_desc')" :label="$t('shopping_share')" model="User" :allow-create="false"
                     v-model="useUserPreferenceStore().userSettings.shoppingShare" item-label="displayName"
                     mode="tags"></ModelSelect>

        <v-number-input
            class="mt-2"
            :label="$t('shopping_auto_sync')"
            :hint="$t('shopping_auto_sync_desc')"
            persistent-hint
            controlVariant="split"
            v-model="useUserPreferenceStore().userSettings.shoppingAutoSync"
            :step="Number(useUserPreferenceStore().serverSettings.shoppingMinAutosyncInterval)"
            :min="(useUserPreferenceStore().userSettings.shoppingAutoSync == 0) ? 0 : Number(useUserPreferenceStore().serverSettings.shoppingMinAutosyncInterval)"
        >
            <template #append>
                <v-btn @click="useUserPreferenceStore().userSettings.shoppingAutoSync = 0">{{$t('Disable')}}</v-btn>
            </template>
        </v-number-input>

        <v-checkbox :label="$t('mealplan_autoadd_shopping')" :hint="$t('mealplan_autoadd_shopping_desc')" persistent-hint v-model="useUserPreferenceStore().userSettings.mealplanAutoaddShopping"></v-checkbox>
        <v-checkbox :label="$t('mealplan_autoexclude_onhand')" :hint="$t('mealplan_autoexclude_onhand_desc')" persistent-hint v-model="useUserPreferenceStore().userSettings.mealplanAutoexcludeOnhand"></v-checkbox>
        <v-checkbox :label="$t('mealplan_autoinclude_related')" :hint="$t('mealplan_autoinclude_related_desc')" persistent-hint v-model="useUserPreferenceStore().userSettings.mealplanAutoincludeRelated"></v-checkbox>
        <v-checkbox :label="$t('shopping_add_onhand')" :hint="$t('shopping_add_onhand_desc')" persistent-hint v-model="useUserPreferenceStore().userSettings.shoppingAddOnhand"></v-checkbox>
        <v-checkbox :label="$t('filter_to_supermarket')" :hint="$t('filter_to_supermarket_desc')" persistent-hint v-model="useUserPreferenceStore().userSettings.filterToSupermarket"></v-checkbox>

        <v-number-input
            class="mt-2"
            :label="$t('default_delay')"
            :hint="$t('default_delay_desc')"
            persistent-hint
            controlVariant="split"
            v-model="useUserPreferenceStore().userSettings.defaultDelay"
            :min="1"
        ></v-number-input>

        <v-number-input
            class="mt-2"
            :label="$t('shopping_recent_days')"
            :hint="$t('shopping_recent_days_desc')"
            persistent-hint
            controlVariant="split"
            v-model="useUserPreferenceStore().userSettings.shoppingRecentDays"
            :min="0"
        ></v-number-input>

        <v-text-field :label="$t('csv_delim_label')" :hint="$t('csv_delim_help')" persistent-hint v-model="useUserPreferenceStore().userSettings.csvDelim"></v-text-field>
        <v-text-field :label="$t('csv_prefix_label')" :hint="$t('csv_prefix_help')" persistent-hint v-model="useUserPreferenceStore().userSettings.csvPrefix"></v-text-field>

        <v-btn class="mt-3" color="success" @click="useUserPreferenceStore().updateUserSettings()" prepend-icon="$save">
            {{ $t('Save') }}
        </v-btn>
    </v-form>
</template>


<script setup lang="ts">


import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

</script>

<style scoped>

</style>