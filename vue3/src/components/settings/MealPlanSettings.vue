<template>
    <v-form>
        <p class="text-h6">{{ $t('Meal_Plan') }}</p>
        <v-divider class="mb-3"></v-divider>

        <ModelSelect :hint="$t('plan_share_desc')" :label="$t('Share')" model="User" :allow-create="false"
                     v-model="useUserPreferenceStore().userSettings.planShare" item-label="displayName"
                     mode="tags"></ModelSelect>

        <v-btn class="mt-3" color="success" @click="useUserPreferenceStore().updateUserSettings()" prepend-icon="$save">{{ $t('Save') }}</v-btn>

        <p class="text-h6 mt-2">{{ $t('DeviceSettings') }}</p>
        <v-divider></v-divider>
        <p class="text-subtitle-2 mb-2">{{ $t('DeviceSettingsHelp') }}</p>

        <meal-plan-device-settings></meal-plan-device-settings>

        <p class="text-h6 mt-2">{{ $t('Meal_Types') }}
            <v-btn prepend-icon="$create" color="create" size="small" class="float-right">
                {{ $t('New') }}
                <model-edit-dialog model="MealType" @create="item => mealTypes.push(item)" @delete="deleteMealType"></model-edit-dialog>
            </v-btn>

        </p>
        <v-divider></v-divider>

        <v-list class="mt-2">
            <v-list-item v-for="mt in mealTypes.sort(compareSortMealType)">
                <v-avatar :color="mt.color"></v-avatar>
                {{ mt.name }}
                <template #append>
                    <v-chip class="me-2">{{ mt.time}}</v-chip>
                    <v-btn color="edit">
                        <v-icon icon="$edit"></v-icon>
                        <model-edit-dialog model="MealType" :item="mt" @delete="deleteMealType"></model-edit-dialog>
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>

    </v-form>
</template>


<script setup lang="ts">
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import {ApiApi, MealType} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import MealPlanDeviceSettings from "@/components/settings/MealPlanDeviceSettings.vue";

const mealTypes = ref([] as MealType[])

onMounted(() => {
    const api = new ApiApi()
    api.apiMealTypeList().then(r => {
        mealTypes.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

/**
 * compare function to pass to .sort() method of MealType display
 * sorts by meal type time
 * @param a {MealType} MealType a
 * @param b {MealType} MealType b
 */
function compareSortMealType(a: MealType, b: MealType) {
    if (a.time < b.time) {
        return -1
    } else if (a.time > b.time) {
        return 1
    }
    return 0
}


/**
 * delete mealtype from client list (database handled by editor)
 * @param mealType to delete from list
 */
function deleteMealType(mealType: MealType){
    mealTypes.value.splice(mealTypes.value.indexOf(mealType), 1)
}

</script>

<style scoped>

</style>