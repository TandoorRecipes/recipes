<template>
    <v-dialog max-width="1400" :activator="dialogActivator" v-model="model">
        <component :is="editorComponent" :item="props.item" :item-id="props.itemId" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="model = false" :itemDefaults="props.itemDefaults"></component>
    </v-dialog>
</template>

<script setup lang="ts">


import {defineAsyncComponent, PropType, shallowRef, watch} from "vue";
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

const editorComponent = shallowRef(defineAsyncComponent(() => import(`@/components/model_editors/${getGenericModelFromString(props.model, t).model.name}Editor.vue`)))

const model = defineModel<Boolean|undefined>({default: undefined})
const dialogActivator = (model.value !== undefined) ? undefined : props.activator

/**
 * for some reason editorComponent is not updated automatically when prop is changed
 * because of this watch prop changes and update manually if prop is changed
 */
watch(() => props.model, () => {
    editorComponent.value = defineAsyncComponent(() => import(`@/components/model_editors/${getGenericModelFromString(props.model, t).model.name}Editor.vue`))
})

/**
 * Allow opening the model edit dialog trough v-model property of the dialog by watching for model changes
 */
watch(model, (value, oldValue, onCleanup) => {
    model.value = !!value
})

/**
 * forward event to parent component and handle closing the editor if configured to do so
 * @param arg model object from editor component
 */
function createEvent(arg: any) {
    emit('create', arg)
    model.value = model.value && !props.closeAfterCreate
}

/**
 * forward event to parent component and handle closing the editor if configured to do so
 * @param arg model object from editor component
 */
function saveEvent(arg: any) {
    emit('save', arg)
    model.value = model.value && !props.closeAfterSave
}

/**
 * forward event to parent component and handle closing the editor if configured to do so
 * @param arg model object from editor component
 */
function deleteEvent(arg: any) {
    emit('delete', arg)
    model.value = model.value && !props.closeAfterDelete
}

</script>

<style scoped>

</style>