<template>
    <v-dialog max-width="600" activator="parent" v-model="dialog">
        <component :is="editorComponent" :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false"></component>
    </v-dialog>
</template>

<script setup lang="ts">


import {defineAsyncComponent, PropType, ref, shallowRef} from "vue";
import {EditorSupportedModels} from "@/types/Models";

const emit = defineEmits(['create', 'save', 'delete'])

const props = defineProps({
    model: { type: String as PropType<EditorSupportedModels>, required: true, },
    item: {default: null},
    disabledFields: {default: []},
    closeAfterCreate: {default: true},
    closeAfterSave: {default: true},
    closeAfterDelete: {default: true},
})

const editorComponent = shallowRef(defineAsyncComponent(() => import(`@/components/model_editors/${props.model}Editor.vue`)))

const dialog = ref(false)

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