<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">
        <v-card-text>
            <v-form>
                <v-select :label="$t('Role')" :items="groups" item-value="id" item-title="name" return-object multiple v-model="editingObj.groups"></v-select>
            </v-form>
        </v-card-text>
    </model-editor-base>


</template>

<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {ApiApi, Group, UserSpace} from "@/openapi";

import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";

const props = defineProps({
    item: {type: {} as PropType<UserSpace>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<UserSpace>('UserSpace', emit)

// object specific data (for selects/display)
const groups = ref([] as Group[])

onMounted(() => {
    const api = new ApiApi()
    api.apiGroupList().then(r => {
        groups.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })

    setupState(props.item, props.itemId)
})


</script>

<style scoped>

</style>