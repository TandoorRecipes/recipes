<template>
    <v-dialog max-width="1400" :activator="dialogActivator" v-model="dialog" :persistent="editingObjChangedState">
        <component :is="editorComponent" :item="props.item" :item-id="props.itemId" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false; " @changed-state="(state:boolean) => {editingObjChangedState = state}" :itemDefaults="props.itemDefaults"></component>
    </v-dialog>
</template>

<script setup lang="ts">


import {defineAsyncComponent, PropType, ref, shallowRef, watch} from "vue";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";
import {useI18n} from "vue-i18n";
import {MealPlan} from "@/openapi";

const {t} = useI18n()

const emit = defineEmits(['create', 'save', 'delete'])

const props = defineProps({
    model: { type: String as PropType<EditorSupportedModels>, required: true, },
    activator: {default: 'parent'},
    item: {default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {required: false},
    disabledFields: {default: []},
    closeAfterCreate: {default: true},
    closeAfterSave: {default: true},
    closeAfterDelete: {default: true},
})

const editorComponent = shallowRef(getGenericModelFromString(props.model, t).model.editorComponent)

const dialog = defineModel<Boolean|undefined>({default: undefined})
const dialogActivator = (dialog.value !== undefined) ? undefined : props.activator

const editingObjChangedState = ref(false)

/**
 * for some reason editorComponent is not updated automatically when prop is changed
 * because of this watch prop changes and update manually if prop is changed
 */
watch(() => props.model, () => {
    editorComponent.value = getGenericModelFromString(props.model, t).model.editorComponent
})

/**
 * Allow opening the model edit dialog trough v-model property of the dialog by watching for model changes
 */
watch(dialog, (value, oldValue, onCleanup) => {
    dialog.value = !!value
})

/**
 * forward event to parent component and handle closing the editor if configured to do so
 * @param arg model object from editor component
 */
function createEvent(arg: any) {
    emit('create', arg)
    dialog.value = dialog.value && !props.closeAfterCreate
}

/**
 * forward event to parent component and handle closing the editor if configured to do so
 * @param arg model object from editor component
 */
function saveEvent(arg: any) {
    emit('save', arg)
    dialog.value = dialog.value && !props.closeAfterSave
}

/**
 * forward event to parent component and handle closing the editor if configured to do so
 * @param arg model object from editor component
 */
function deleteEvent(arg: any) {
    emit('delete', arg)
    dialog.value = dialog.value && !props.closeAfterDelete
}

</script>

<style scoped>

</style>