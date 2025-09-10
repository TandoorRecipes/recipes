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
                <v-text-field :label="$t('Link')" readonly :model-value="inviteLinkUrl(editingObj)" v-if="isUpdate()">
                    <template #append-inner>
                        <btn-copy variant="plain" color="undefined" :copy-value="inviteLinkUrl(editingObj)"></btn-copy>
                    </template>
                </v-text-field>
            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, Group, InviteLink} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import BtnCopy from "@/components/buttons/BtnCopy.vue";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";


const props = defineProps({
    item: {type: {} as PropType<InviteLink>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<InviteLink>, required: false, default: {} as InviteLink},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<InviteLink>('InviteLink', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)
const groups = ref([] as Group[])

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor(){
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
}

/**
 * returns url for invite link
 * @param inviteLink InviteLink object to create url for
 */
function inviteLinkUrl(inviteLink: InviteLink) {
    return useDjangoUrls().getDjangoUrl(`/invite/${inviteLink.uuid}`)
}


</script>

<style scoped>

</style>