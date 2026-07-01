<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()"
        :editing-object="editingObj">

        <v-card-text class="pa-0">
            <v-tabs v-model="tab" :disabled="loading" grow>
                <v-tab value="space">{{ $t('Space') }}</v-tab>
                <v-tab value="cosmetic">{{ $t('Cosmetic') }}</v-tab>
                <v-tab value="ai">{{ $t('AI') }}</v-tab>
            </v-tabs>
        </v-card-text>

        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="space">
                    <v-form :disabled="loading">

                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>

                        <user-file-field v-model="editingObj.image" :label="$t('Image')" :hint="$t('CustomImageHelp')" persistent-hint></user-file-field>

                        <v-textarea v-model="editingObj.message" :label="$t('Message')" clearable></v-textarea>

                        <model-select model="Unit" :label="$t('DefaultUnit')" v-model="editingObj.defaultUnit" clearable
                                      :hint="$t('DefaultUnitHelp')" persistent-hint class="mb-6"></model-select>

                        <space-limits-info :space="editingObj" :show-thank-you="false" v-if="isUpdate()" class="mt-6"></space-limits-info>

                    </v-form>
                </v-tabs-window-item>
                <v-tabs-window-item value="cosmetic">
                    <v-label class="mt-4">{{ $t('Nav_Color') }}</v-label>
                    <v-color-picker v-model="editingObj.navBgColor" class="mb-4" mode="hex" :modes="['hex']" show-swatches
                                    :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"></v-color-picker>
                    <v-btn class="mb-4" @click="editingObj.navBgColor = ''">{{ $t('Reset') }}</v-btn>

                    <user-file-field v-model="editingObj.navLogo" :label="$t('Logo')" :hint="$t('CustomNavLogoHelp')" persistent-hint></user-file-field>

                    <user-file-field v-model="editingObj.logoColor32" :label="$t('Logo') + ' 32x32px'"></user-file-field>
                    <user-file-field v-model="editingObj.logoColor128" :label="$t('Logo') + ' 128x128px'"></user-file-field>
                    <user-file-field v-model="editingObj.logoColor144" :label="$t('Logo') + ' 144x144px'"></user-file-field>
                    <user-file-field v-model="editingObj.logoColor180" :label="$t('Logo') + ' 180x180px'"></user-file-field>
                    <user-file-field v-model="editingObj.logoColor192" :label="$t('Logo') + ' 192x192px'"></user-file-field>
                    <user-file-field v-model="editingObj.logoColor512" :label="$t('Logo') + ' 512x512px'"></user-file-field>
                    <user-file-field v-model="editingObj.logoColorSvg" :label="$t('Logo') + ' SVG'"></user-file-field>
                    <user-file-field v-model="editingObj.customSpaceTheme" :label="$t('CustomTheme') + ' CSS'"></user-file-field>

                </v-tabs-window-item>
                <v-tabs-window-item value="ai">
                    <p class="text-disabled font-italic text-body-2">
                        <span v-if="useUserPreferenceStore().serverSettings.hosted">
                            {{ $t('AISettingsHostedHelp') }}
                        </span>
                        <span v-else>
                            {{ $t('SettingsOnlySuperuser') }}
                        </span>
                    </p>

                    <v-checkbox v-model="editingObj.aiEnabled" :label="$t('Enabled')" :disabled="!useUserPreferenceStore().userSettings.user.isSuperuser" hide-details></v-checkbox>

                    <template v-if="editingObj.aiEnabled">
                        <model-select model="AiProvider" :label="$t('Default')" v-model="editingObj.aiDefaultProvider"></model-select>

                        <v-number-input v-model="editingObj.aiCreditsMonthly" :precision="2" :label="$t('MonthlyCredits')"
                                        :disabled="!useUserPreferenceStore().userSettings.user.isSuperuser"></v-number-input>
                        <v-number-input v-model="editingObj.aiCreditsBalance" :precision="4" :label="$t('AiCreditsBalance')"
                                        :disabled="!useUserPreferenceStore().userSettings.user.isSuperuser"></v-number-input>

                    </template>
                </v-tabs-window-item>

            </v-tabs-window>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, ConnectorConfig, Space} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import UserFileField from "@/components/inputs/UserFileField.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import editor from "mavon-editor";
import SpaceLimitsInfo from "@/components/display/SpaceLimitsInfo.vue";

const props = defineProps({
    item: {type: {} as PropType<Space>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Space>, required: false, default: {} as Space},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {
    setupState,
    deleteObject,
    saveObject,
    isUpdate,
    editingObjName,
    loading,
    editingObj,
    editingObjChanged,
    modelClass
} = useModelEditorFunctions<Space>('Space', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)

const tab = ref("space")

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor() {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
}

</script>

<style scoped>

</style>