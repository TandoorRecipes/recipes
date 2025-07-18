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


            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType} from "vue";
import {Keyword, OpenDataFood} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";

const props = defineProps({
    item: {type: {} as PropType<OpenDataFood>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<OpenDataFood>, required: false, default: {} as OpenDataFood},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<OpenDataFood>('OpenDataFood', emit)

// object specific data (for selects/display)

onMounted(() => {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
})

</script>

<style scoped>

</style>