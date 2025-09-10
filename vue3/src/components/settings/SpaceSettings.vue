<template>
    <v-form>
        <p class="text-h6">{{ useUserPreferenceStore().activeSpace.name }}</p>
        <v-divider class="mb-3"></v-divider>

        <v-row v-if="space.name != undefined">
            <v-col cols="12" md="4">
                <v-card>
                    <v-card-title><i class="fa-solid fa-book"></i> {{ $t('Recipes') }}</v-card-title>
                    <v-card-text>{{ $n(space.recipeCount) }} / {{ space.maxRecipes == 0 ? '∞' : $n(space.maxRecipes) }}</v-card-text>
                    <v-progress-linear :color="isSpaceAboveRecipeLimit(space) ? 'error' : 'success'" height="10"
                                       :model-value="(space.recipeCount / space.maxRecipes) * 100"></v-progress-linear>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card>

                    <v-card-title><i class="fa-solid fa-users"></i> {{ $t('Users') }}</v-card-title>
                    <v-card-text>{{ $n(space.userCount) }} / {{ space.maxUsers == 0 ? '∞' : $n(space.maxUsers) }}</v-card-text>
                    <v-progress-linear :color="isSpaceAboveUserLimit(space) ? 'error' : 'success'" height="10"
                                       :model-value="(space.userCount / space.maxUsers) * 100"></v-progress-linear>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card>
                    <v-card-title><i class="fa-solid fa-file"></i> {{ $t('Files') }}</v-card-title>
                    <v-card-text v-if="space.maxFileStorageMb > -1">{{ $n(Math.round(space.fileSizeMb)) }} / {{ space.maxFileStorageMb == 0 ? '∞' : $n(space.maxFileStorageMb) }}
                        MB
                    </v-card-text>
                    <v-card-text v-if="space.maxFileStorageMb == -1">{{ $t('file_upload_disabled') }}</v-card-text>
                    <v-progress-linear v-if="space.maxFileStorageMb > -1" :color="isSpaceAboveStorageLimit(space) ? 'error' : 'success'" height="10"
                                       :model-value="(space.fileSizeMb / space.maxFileStorageMb) * 100"></v-progress-linear>
                </v-card>
            </v-col>
        </v-row>
        <v-divider class="mt-3 mb-3"></v-divider>

        <v-alert color="primary" variant="tonal" v-if="useUserPreferenceStore().serverSettings.hosted">
            <v-alert-title>
                <v-row>
                    <v-col>
                        <v-avatar image="../../assets/logo_color.svg" class="me-2"></v-avatar>
                        {{ $t('ThankYou') }}!

                    </v-col>
                    <v-col>
                        <v-btn color="primary" class="float-right" href="https://tandoor.dev/manage" target="_blank">{{ $t('ManageSubscription') }}</v-btn>

                    </v-col>
                </v-row>
            </v-alert-title>
            <p class="mt-2">{{ $t('ThanksTextHosted') }}</p>
        </v-alert>

        <v-alert color="primary" variant="tonal" v-if="!useUserPreferenceStore().serverSettings.hosted">
            <v-alert-title>
                <v-row>
                    <v-col>
                        <v-avatar image="../../assets/logo_color.svg" class="me-2"></v-avatar>
                        {{ $t('ThankYou') }}!

                    </v-col>
                    <v-col>
                        <v-btn color="primary" class="float-right" href="https://github.com/sponsors/vabene1111" target="_blank"><i class="fa-brands fa-github"></i> GitHub Sponsors
                        </v-btn>

                    </v-col>
                </v-row>
            </v-alert-title>
            <p class="mt-2">{{ $t('ThanksTextSelfhosted') }}</p>
        </v-alert>


        <p class="text-h6 mt-2">{{ $t('Settings') }}</p>
        <v-divider class="mb-2"></v-divider>

        <user-file-field v-model="space.image" :label="$t('Image')" :hint="$t('CustomImageHelp')" persistent-hint></user-file-field>


        <v-textarea v-model="space.message" :label="$t('Message')"></v-textarea>
        <v-btn color="success" @click="updateSpace()" prepend-icon="$save">{{ $t('Save') }}</v-btn>

        <p class="text-h6 mt-2">{{ $t('AI') }}</p>
        <v-divider class="mb-2"></v-divider>
        <p class="text-disabled font-italic text-body-2">
            <span v-if="useUserPreferenceStore().serverSettings.hosted">
                {{ $t('AISettingsHostedHelp') }}
            </span>
            <span v-else>
                {{ $t('SettingsOnlySuperuser') }}
            </span>
        </p>

        <v-checkbox v-model="space.aiEnabled" :label="$t('Enabled')" :disabled="!useUserPreferenceStore().userSettings.user.isSuperuser" hide-details></v-checkbox>

        <template v-if="space.aiEnabled">
            <model-select model="AiProvider" :label="$t('Default')" v-model="space.aiDefaultProvider"></model-select>

            <v-number-input v-model="space.aiCreditsMonthly" :precision="2" :label="$t('MonthlyCredits')" :disabled="!useUserPreferenceStore().userSettings.user.isSuperuser"></v-number-input>
            <v-number-input v-model="space.aiCreditsBalance" :precision="4" :label="$t('AiCreditsBalance')" :disabled="!useUserPreferenceStore().userSettings.user.isSuperuser"></v-number-input>

        </template>
        <v-btn color="success" @click="updateSpace()" prepend-icon="$save">{{ $t('Save') }}</v-btn>

        <v-divider class="mt-4 mb-2"></v-divider>
        <h2>{{ $t('Cosmetic') }}</h2>
        <span>{{ $t('Space_Cosmetic_Settings') }}</span>

        <v-label class="mt-4">{{ $t('Nav_Color') }}</v-label>
        <v-color-picker v-model="space.navBgColor" class="mb-4" mode="hex" :modes="['hex']" show-swatches
                        :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"></v-color-picker>
        <v-btn class="mb-4" @click="space.navBgColor = ''">{{ $t('Reset') }}</v-btn>

        <user-file-field v-model="space.navLogo" :label="$t('Logo')" :hint="$t('CustomNavLogoHelp')" persistent-hint></user-file-field>

        <user-file-field v-model="space.logoColor32" :label="$t('Logo') + ' 32x32px'"></user-file-field>
        <user-file-field v-model="space.logoColor128" :label="$t('Logo') + ' 128x128px'"></user-file-field>
        <user-file-field v-model="space.logoColor144" :label="$t('Logo') + ' 144x144px'"></user-file-field>
        <user-file-field v-model="space.logoColor180" :label="$t('Logo') + ' 180x180px'"></user-file-field>
        <user-file-field v-model="space.logoColor192" :label="$t('Logo') + ' 192x192px'"></user-file-field>
        <user-file-field v-model="space.logoColor512" :label="$t('Logo') + ' 512x512px'"></user-file-field>
        <user-file-field v-model="space.logoColorSvg" :label="$t('Logo') + ' SVG'"></user-file-field>
        <user-file-field v-model="space.customSpaceTheme" :label="$t('CustomTheme') + ' CSS'"></user-file-field>


        <v-btn color="success" @click="updateSpace()" prepend-icon="$save">{{ $t('Save') }}</v-btn>
    </v-form>
</template>


<script setup lang="ts">

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {onMounted, ref} from "vue";
import {ApiApi, Space} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import UserFileField from "@/components/inputs/UserFileField.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {isSpaceAboveRecipeLimit, isSpaceAboveStorageLimit, isSpaceAboveUserLimit} from "@/utils/logic_utils";

const space = ref({} as Space)

onMounted(() => {
    let api = new ApiApi()
    api.apiSpaceCurrentRetrieve().then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

function updateSpace() {
    let api = new ApiApi()
    api.apiSpacePartialUpdate({id: space.value.id, patchedSpace: space.value}).then(r => {
        space.value = r
        useUserPreferenceStore().activeSpace = Object.assign({}, space.value)
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS, space.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>

</style>