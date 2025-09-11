<template>
    <v-container>


        <v-stepper editable v-model="stepper">
            <v-stepper-header>

                <v-stepper-item :title="$t('Settings')" value="1"></v-stepper-item>
                <v-stepper-item :title="$t('Open Data')" value="2"></v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
                <v-stepper-window-item value="1">
                    <v-card flat>
                        <v-card-title class="text-h5">Welcome to Tandoor</v-card-title>
                        <v-card-text v-if="space">
                            <p class="text-h6">Please choose the basic settings for your Tandoor space. You can change all of these later trough the settings.</p>

                            <v-text-field v-model="space.name" :label="$t('Name')"></v-text-field>

                            <v-select :label="$t('Theme')" class="mt-4" v-model="useUserPreferenceStore().userSettings.theme"
                                      :items="[{title: 'Tandoor', value: 'TANDOOR'}, {title: 'Tandoor Dark', value: 'TANDOOR_DARK'}, ]">
                            </v-select>

                            <v-text-field v-model="useUserPreferenceStore().userSettings.defaultUnit" :label="$t('Default_Unit')"></v-text-field>

                            <v-checkbox :label="$t('Use_Fractions')" :hint="$t('Use_Fractions_Help')" persistent-hint v-model="useUserPreferenceStore().userSettings.useFractions"></v-checkbox>

                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-spacer></v-spacer>
                        </template>
                        <template #next>
                            <v-btn @click="updateSpaceAndUserSettings()" :loading="loading" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="2">
                    <v-card flat>
                        <v-card-text>
                            <v-card-title>Test</v-card-title>
                            <open-data-import-settings></open-data-import-settings>
                        </v-card-text>


                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-spacer></v-spacer>
                        </template>
                        <template #next>
                            <v-btn @click="updateSpaceAndUserSettings()" :loading="loading" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>
            </v-stepper-window>

        </v-stepper>

    </v-container>
</template>

<script setup lang="ts">


import {ApiApi, Space} from "@/openapi";
import {onMounted, ref} from "vue";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import LanguageSelect from "@/components/inputs/LanguageSelect.vue";
import OpenDataImportSettings from "@/components/settings/OpenDataImportSettings.vue";

const space = ref<undefined | Space>(undefined)
const stepper = ref(1)
const loading = ref(false)

onMounted(() => {
    loadSpace()
})

function loadSpace() {
    let api = new ApiApi()

    api.apiSpaceCurrentRetrieve().then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

function updateSpaceAndUserSettings() {
    let promises = [] as Promise<any>[]
    loading.value = true

    promises.push(updateSpace())
    promises.push(useUserPreferenceStore().updateUserSettings(true))

    Promise.allSettled(promises).then(r => {
        loading.value = false
        stepper.value = 2
    })
}

function updateSpace() {
    let api = new ApiApi()
    return api.apiSpacePartialUpdate({id: space.value.id, patchedSpace: space.value}).then(r => {
        space.value = r
        useUserPreferenceStore().activeSpace = Object.assign({}, space.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>


</style>