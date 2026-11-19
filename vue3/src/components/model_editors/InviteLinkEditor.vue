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
        :object-name="editingObjName()"
        :editing-object="editingObj">
        <v-card-text>
            <v-form :disabled="loading">
                <user-group-input v-model="editingObj.group"></user-group-input>

                <v-model-select model="Household" :hint="$t('Optional')" persistent-hint v-model="editingObj.household" create></v-model-select>
                <v-text-field :label="$t('Email')" v-model="editingObj.email" :hint="$t('InviteLinkEmailHelp')" persistent-hint class="mt-2"></v-text-field>
                <v-date-input :label="$t('Valid Until')" class="mt-2" v-model="editingObj.validUntil">
                    <template #append-inner>
                        <v-btn variant="plain" icon="fa-solid fa-calendar-xmark" @click="editingObj.validUntil = new Date('01-01-1970')"></v-btn>
                    </template>
                </v-date-input>
                <v-textarea :label="$t('InternalNote')" v-model="editingObj.internalNote" rows="2"></v-textarea>
                <v-checkbox :label="$t('Reusable')" v-model="editingObj.reusable" :hint="$t('InviteLinkReusableHelp')" persistent-hint></v-checkbox>
                <v-text-field :label="$t('Link')" readonly :model-value="inviteLinkUrl(editingObj)" v-if="isUpdate()" class="mt-2">
                    <template #append-inner>
                        <v-btn variant="plain" icon="fa-solid fa-share-nodes" @click="shareIntend()"></v-btn>
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
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore"
import {DateTime} from "luxon";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import BtnCopy from "@/components/buttons/BtnCopy.vue";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";
import {useI18n} from "vue-i18n";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import VModelSelect from "@/components/inputs/VModelSelect.vue";
import UserGroupInput from "@/components/inputs/UserGroupInput.vue";

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<InviteLink>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<InviteLink>, required: false, default: {} as InviteLink},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject: baseSaveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<InviteLink>('InviteLink', emit)

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
function initializeEditor() {
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.validUntil = DateTime.now().plus({month: 1}).toJSDate()
        },
        itemDefaults: props.itemDefaults
    })
}

/**
 * returns url for invite link
 * @param inviteLink InviteLink object to create url for
 */
function inviteLinkUrl(inviteLink: InviteLink) {
    return useDjangoUrls().getFullUrl(`/invite/${inviteLink.uuid}`)
}

/**
 * Custom save handler that shows warning when email fails for new invite links.
 * Base saveObject already shows CREATE_SUCCESS, so we only add a warning for failures.
 */
function saveObject() {
    const wasCreate = !isUpdate()
    const emailProvided = !!editingObj.value.email

    return baseSaveObject()?.then((r: InviteLink) => {
        // Show warning only when email was expected but failed
        if (wasCreate && emailProvided && r && !r.emailSent) {
            useMessageStore().addMessage(
                MessageType.WARNING,
                t('InviteLinkCreatedEmailFailed'),
                8000
            )
        }
        return r
    })
}

/**
 * trigger navigator share event
 */
function shareIntend() {
    let shareData = {
        title: t("Invitation"),
        text: t("JoinTandoor"),
        url: inviteLinkUrl(editingObj.value),
    }
    navigator.share(shareData)
}

</script>

<style scoped>

</style>