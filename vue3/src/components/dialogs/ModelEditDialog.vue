<template>
    <v-dialog max-width="1400" :activator="activator" v-model="dialog">
        <component :is="editorComponent" :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false"></component>
    </v-dialog>
</template>

<script setup lang="ts">


import {defineAsyncComponent, PropType, ref, shallowRef, watch} from "vue";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const emit = defineEmits(['create', 'save', 'delete'])

const props = defineProps({
    model: { type: String as PropType<EditorSupportedModels>, required: true, },
    activator: {default: 'parent'},
    item: {default: null},
    disabledFields: {default: []},
    closeAfterCreate: {default: true},
    closeAfterSave: {default: true},
    closeAfterDelete: {default: true},
})

const editorComponent = shallowRef(defineAsyncComponent(() => import(`@/components/model_editors/${getGenericModelFromString(props.model, t).model.name}Editor.vue`)))

const dialog = ref(false)
const model = defineModel<Boolean>({default: false})

/**
 * Allow opening the model edit dialog trough v-model property of the dialog by watching for model changes
 */
watch(model, (value, oldValue, onCleanup) => {
    console.log('model changed to ', value)
    dialog.value = !!value
})

watch(dialog, (value, oldValue, onCleanup) => {
    console.log('dialog changed to ', value)
    model.value = !!value
})


function createEvent(arg: any) {
    emit('create', arg)
    dialog.value = dialog.value && !props.closeAfterCreate
}

function saveEvent(arg: any) {
    emit('save', arg)
    dialog.value = dialog.value && !props.closeAfterSave
}

function deleteEvent(arg: any) {
    emit('delete', arg)
    dialog.value = dialog.value && !props.closeAfterDelete
}

</script>

<style scoped>

</style>