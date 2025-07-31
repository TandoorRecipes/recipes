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

                <model-select model="OpenDataVersion" v-model="editingObj.version"></model-select>
                <v-text-field :label="$t('Open_Data_Slug')" v-model="editingObj.slug"></v-text-field>
                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                <v-text-field :label="$t('Unit')" v-model="editingObj.unit"></v-text-field>
                <v-autocomplete :label="$t('FDC_ID')" :hint="$t('property_type_fdc_hint')" v-model="editingObj.fdcId" :items="FDC_PROPERTY_TYPES" item-title="text"></v-autocomplete>
                <v-textarea :label="$t('Comment')" v-model="editingObj.comment"></v-textarea>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {OpenDataFood, OpenDataProperty} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {FDC_PROPERTY_TYPES} from "@/utils/fdc.ts";

const props = defineProps({
    item: {type: {} as PropType<OpenDataProperty>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<OpenDataProperty>, required: false, default: {} as OpenDataProperty},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<OpenDataProperty>('OpenDataProperty', emit)

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
function initializeEditor(){
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
}

</script>

<style scoped>

</style>