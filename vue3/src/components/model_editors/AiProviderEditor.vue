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
        :object-name="editingObjName()">
        <v-card-text>
            <v-form :disabled="loading">
                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                <v-textarea :label="$t('Description')" v-model="editingObj.description"></v-textarea>


                <v-text-field :label="$t('APIKey')" v-model="editingObj.apiKey"></v-text-field>

                <v-combobox :label="$t('Model')" :items="aiModels" v-model="editingObj.modelName" hide-details>

                </v-combobox>

                <p class="mt-2 mb-2">{{ $t('AiModelHelp') }} <a href="https://docs.litellm.ai/docs/providers" target="_blank">LiteLLM</a></p>

                <v-checkbox :label="$t('LogCredits')" :hint="$t('LogCreditsHelp')" v-model="editingObj.logCreditCost" v-if="useUserPreferenceStore().userSettings.user.isSuperuser" persistent-hint
                            class="mb-2"></v-checkbox>
                <v-text-field :label="$t('Url')" v-model="editingObj.url"></v-text-field>

                <v-checkbox :label="$t('Global')" :hint="$t('GlobalHelp')" v-model="globalProvider" v-if="useUserPreferenceStore().userSettings.user.isSuperuser" persistent-hint
                            class="mb-2"></v-checkbox>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {AiProvider} from "@/openapi";

import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import editor from "mavon-editor";


const props = defineProps({
    item: {type: {} as PropType<AiProvider>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<AiProvider>, required: false, default: {} as AiProvider},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<AiProvider>('AiProvider', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)
const aiModels = ref(['gemini/gemini-2.5-pro', 'gemini/gemini-2.5-flash', 'gemini/gemini-2.5-flash-lite', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano'])

const globalProvider = ref(false)

watch(() => globalProvider.value, () => {
    if (globalProvider.value) {
        editingObj.value.space = undefined
    } else {
        editingObj.value.space = useUserPreferenceStore().activeSpace.id!
    }
})

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor() {
    setupState(props.item, props.itemId, {
        itemDefaults: props.itemDefaults,
        newItemFunction: () => {
            editingObj.value.logCreditCost = true
            editingObj.value.space = useUserPreferenceStore().activeSpace.id!
        },
    }).then(() => {
        globalProvider.value = editingObj.value.space == undefined
    })
}


</script>

<style scoped>

</style>