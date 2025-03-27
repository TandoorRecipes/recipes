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
                <v-text-field :label="$t('Email')" v-model="editingObj.email"></v-text-field>
                <v-select :label="$t('Role')" :items="groups" item-value="id" item-title="name" return-object v-model="editingObj.group"></v-select>
                <v-date-input :label="$t('Valid Until')" v-model="editingObj.validUntil"></v-date-input>
                <v-textarea :label="$t('Note')" v-model="editingObj.internalNote"></v-textarea>
                <v-checkbox :label="$t('Reusable')" v-model="editingObj.reusable"></v-checkbox>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {onMounted, PropType, ref} from "vue";
import {ApiApi, Group, InviteLink} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";


const props = defineProps({
    item: {type: {} as PropType<InviteLink>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<InviteLink>, required: false, default: {} as InviteLink},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<InviteLink>('InviteLink', emit)

// object specific data (for selects/display)
const groups = ref([] as Group[])

onMounted(() => {
    const api = new ApiApi()

    api.apiGroupList().then(r => {
        groups.value = r

        setupState(props.item, props.itemId, {
            newItemFunction: () => {
                editingObj.value.validUntil = DateTime.now().plus({month: 1}).toJSDate()
                editingObj.value.group = groups.value[0]
            },
            itemDefaults: props.itemDefaults
        })

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

</script>

<style scoped>

</style>