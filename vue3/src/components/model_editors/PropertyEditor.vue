<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">
        <v-card-text>
            <v-form>
                <v-number-input :step="10" v-model="editingObj.propertyAmount" control-variant="stacked">
                    <template #append-inner v-if="editingObj.propertyType">
                        <v-chip class="me-4">{{ editingObj.propertyType.unit }}</v-chip>
                    </template>
                </v-number-input>
                <model-select :label="$t('Property')" v-model="editingObj.propertyType" model="PropertyType"></model-select>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType} from "vue";
import {Property} from "@/openapi";

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput' //TODO remove once component is out of labs

import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";


const props = defineProps({
    item: {type: {} as PropType<Property>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<Property>('Property', emit)


onMounted(() => {
    setupState(props.item, props.itemId)
})


</script>

<style scoped>

</style>