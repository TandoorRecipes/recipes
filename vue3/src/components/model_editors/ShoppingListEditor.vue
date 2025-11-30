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
        <v-card-text>
            <v-form :disabled="loading">
                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                <v-textarea :label="$t('Description')" v-model="editingObj.description" :rows="2" auto-grow></v-textarea>
                <v-color-picker :label="$t('Color')" v-model="editingObj.color" mode="hex" :modes="['hex']" show-swatches
                                :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"></v-color-picker>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {ShoppingList, ShoppingListEntry} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const props = defineProps({
    item: {type: {} as PropType<ShoppingList>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<ShoppingList>, required: false, default: {} as ShoppingList},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<ShoppingList>('ShoppingList', emit)

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