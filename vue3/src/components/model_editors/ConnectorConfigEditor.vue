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
                <v-select :label="$t('Type')" :items="['HomeAssistant']" v-model="editingObj.type"></v-select>

                <v-text-field :label="$t('Url')" v-model="editingObj.url"></v-text-field>
                <v-text-field :label="$t('Access_Token')" v-model="editingObj.token"></v-text-field>

                <v-text-field label="Todo entity" v-model="editingObj.todoEntity"></v-text-field>
                <v-checkbox :label="$t('SupportsDescriptionField')" hide-details v-model="editingObj.supportsDescriptionField"></v-checkbox>

                <v-checkbox :label="$t('Enabled')"  v-model="editingObj.enabled"></v-checkbox>

                <h3> {{ $t('Events') }}</h3>
                <v-checkbox :label="$t('ShoppingListEntry') + ' - ' + $t('Created')" hide-details v-model="editingObj.onShoppingListEntryCreatedEnabled"></v-checkbox>
                <v-checkbox :label="$t('ShoppingListEntry') + ' - ' + $t('Updated')" hide-details v-model="editingObj.onShoppingListEntryUpdatedEnabled"></v-checkbox>
                <v-checkbox :label="$t('ShoppingListEntry') + ' - ' + $t('Deleted')" hide-details v-model="editingObj.onShoppingListEntryDeletedEnabled"></v-checkbox>
                
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {ConnectorConfig} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";

const props = defineProps({
    item: {type: {} as PropType<ConnectorConfig>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<ConnectorConfig>, required: false, default: {} as ConnectorConfig},
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
} = useModelEditorFunctions<ConnectorConfig>('ConnectorConfig', emit)

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