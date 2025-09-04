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

                <v-textarea :label="$t('Comment')" rows="2" v-model="editingObj.comment"></v-textarea>
                <v-row dense>
                    <v-col cols="12" md="4">
                        <v-label>{{ $t('Rating') }}</v-label>
                        <br/>
                        <v-rating v-model="editingObj.rating" clearable hover density="compact"></v-rating>
                    </v-col>
                    <v-col cols="12" md="4">

                        <v-number-input :label="$t('Servings')" v-model="editingObj.servings" :precision="2"></v-number-input>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-date-input :label="$t('Date')" v-model="editingObj.createdAt"></v-date-input>

                    </v-col>
                </v-row>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {CookLog} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";


const props = defineProps({
    item: {type: {} as PropType<CookLog>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<CookLog>, required: false, default: {} as CookLog},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<CookLog>('CookLog', emit)

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