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
                <v-text-field v-model="editingObj.name" :label="$t('Name')"></v-text-field>

                <v-text-field
                    max-width="200px"
                    v-model="editingObj.time"
                    :active="timePickerMenu"
                    :focus="timePickerMenu"
                    :label="$t('Time')"
                    prepend-icon="fa-solid fa-clock"
                    readonly>
                    <v-menu
                        v-model="timePickerMenu"
                        :close-on-content-click="false"
                        activator="parent"
                        transition="scale-transition">
                        <v-time-picker v-if="timePickerMenu" format="24hr" v-model="editingObj.time"></v-time-picker>
                    </v-menu>
                </v-text-field>

                <v-checkbox v-model="editingObj._default" :label="$t('Default')"></v-checkbox>

                <v-color-picker v-model="editingObj.color" mode="hex" :modes="['hex']" show-swatches
                                :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"></v-color-picker>
            </v-form>
        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {MealType} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";

const props = defineProps({
    item: {type: {} as PropType<MealType>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<MealType>, required: false, default: {} as MealType},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<MealType>('MealType', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})


// object specific data (for selects/display)
const timePickerMenu = ref(false)

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