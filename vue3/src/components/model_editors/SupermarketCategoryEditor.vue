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
                <v-text-field :label="$t('Open_Data_Slug')" :hint="$t('open_data_help_text')" persistent-hint v-model="editingObj.openDataSlug" disabled></v-text-field>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {SupermarketCategory} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useI18n} from "vue-i18n";

const props = defineProps({
    item: {type: {} as PropType<SupermarketCategory>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<SupermarketCategory>, required: false, default: {} as SupermarketCategory},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<SupermarketCategory>('SupermarketCategory', emit)

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