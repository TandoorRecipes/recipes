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
                <v-number-input v-model="editingObj.amount" control-variant="split" :precision="2">
                    <template #prepend>
                        <v-btn icon="" @click="editingObj.amount = editingObj.amount / 2">
                            <v-icon icon="fa-solid fa-divide"></v-icon>
                        </v-btn>
                    </template>
                    <template #append>
                        <v-btn icon="" @click="editingObj.amount = editingObj.amount * 2">
                            <v-icon icon="fa-solid fa-times"></v-icon>
                        </v-btn>
                    </template>
                </v-number-input>
                <model-select model="Unit" allow-create v-model="editingObj.unit"></model-select>
                <model-select model="Food" allow-create v-model="editingObj.food"></model-select>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {ShoppingListEntry} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const props = defineProps({
    item: {type: {} as PropType<ShoppingListEntry>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<ShoppingListEntry>, required: false, default: {} as ShoppingListEntry},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<ShoppingListEntry>('ShoppingListEntry', emit)

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