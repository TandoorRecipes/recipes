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
            <v-form>
                <v-row>
                    <v-col>
                        <model-select model="Food" v-model="editingObj.food" :label="$t('Food')"></model-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col md="6">
                        <v-number-input :label="$t('Amount')" :step="10" v-model="editingObj.baseAmount" control-variant="stacked" :precision="3"></v-number-input>
                    </v-col>
                    <v-col md="6">
                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                        <model-select :label="$t('Unit')" v-model="editingObj.baseUnit" model="Unit"></model-select>
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
                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                        <model-select :label="$t('Unit')" v-model="editingObj.convertedUnit" model="Unit"></model-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field :label="$t('Open_Data_Slug')" :hint="$t('open_data_help_text')" persistent-hint v-model="editingObj.openDataSlug" disabled></v-text-field>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, watch} from "vue";
import {UnitConversion} from "@/openapi";

import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";

const props = defineProps({
    item: {type: {} as PropType<UnitConversion>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<UnitConversion>, required: false, default: {} as UnitConversion},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<UnitConversion>('UnitConversion', emit)

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