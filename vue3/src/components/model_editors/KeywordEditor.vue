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

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType} from "vue";
import {Keyword} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";

const props = defineProps({
    item: {type: {} as PropType<Keyword>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Keyword>, required: false, default: {} as Keyword},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<Keyword>('Keyword', emit)

// object specific data (for selects/display)

onMounted(() => {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
})

</script>

<style scoped>

</style>