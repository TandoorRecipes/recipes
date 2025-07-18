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


                <v-row>
                    <v-col>
                        <model-select model="OpenDataVersion" v-model="editingObj.version"></model-select>
                        <v-text-field :label="$t('Open_Data_Slug')" v-model="editingObj.slug"></v-text-field>
                        <model-select model="OpenDataFood" v-model="editingObj.food"></model-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col md="6">
                        <v-number-input :label="$t('Amount')" :step="10" v-model="editingObj.baseAmount" control-variant="stacked" :precision="3"></v-number-input>
                    </v-col>
                    <v-col md="6">
                        <model-select  v-model="editingObj.baseUnit" model="OpenDataUnit"></model-select>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col class="text-center">
                        <v-icon icon="fa-solid fa-arrows-up-down"></v-icon>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col md="6">
                        <v-number-input :label="$t('Amount')" :step="10" v-model="editingObj.convertedAmount" control-variant="stacked" :precision="3"></v-number-input>
                    </v-col>
                    <v-col md="6">
                        <model-select v-model="editingObj.convertedUnit" model="OpenDataUnit"></model-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-textarea :label="$t('Source')" v-model="editingObj.source" rows="1" auto-grow></v-textarea>
                        <v-textarea :label="$t('Comment')" v-model="editingObj.comment"></v-textarea>
                    </v-col>
                </v-row>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {OpenDataConversion, OpenDataFood} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const props = defineProps({
    item: {type: {} as PropType<OpenDataConversion>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<OpenDataConversion>, required: false, default: {} as OpenDataConversion},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<OpenDataConversion>('OpenDataConversion', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)

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