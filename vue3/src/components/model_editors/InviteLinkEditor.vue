<template>
    <v-card>
        <v-card-title>
            {{ $t(OBJ_LOCALIZATION_KEY) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
        </v-card-title>
        <v-card-text>
            <v-form>

                <v-text-field :label="$t('Email')" v-model="editingObj.email"></v-text-field>
                <v-select :label="$t('Role')" :items="groups" item-value="id" item-title="name" return-object v-model="editingObj.group"></v-select>
                <v-date-input :label="$t('Valid Until')" v-model="editingObj.validUntil"></v-date-input>
                <v-textarea :label="$t('Note')" v-model="editingObj.internalNote"></v-textarea>
                <v-checkbox :label="$t('Reusable')" v-model="editingObj.reusable"></v-checkbox>

            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="delete" prepend-icon="$delete" v-if="isUpdate">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName" @delete="deleteObject"></delete-confirm-dialog>
            </v-btn>
            <v-btn color="save" prepend-icon="$save" @click="saveObject">{{ isUpdate ? $t('Save') : $t('Create') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {computed, onMounted, ref} from "vue";
import {AccessToken, ApiApi, Group, InviteLink} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import {useClipboard} from "@vueuse/core";

const {t} = useI18n()
const {copy} = useClipboard()

const emit = defineEmits(['create', 'save', 'delete', 'close'])

const props = defineProps({
    item: {type: {} as InviteLink, required: false},
    dialog: {type: Boolean, default: false}
})

const OBJ_LOCALIZATION_KEY = 'Invite_Link'
const editingObj = ref({} as InviteLink)
const loading = ref(false)

// object specific data (for selects/display)
const groups = ref([] as Group[])


/**
 * checks if given object has ID property to determine if it needs to be updated or created
 */
const isUpdate = computed(() => {
    return editingObj.value.id !== undefined
})

/**
 * display name for object in headers/delete dialog/...
 */
const objectName = computed(() => {
    return isUpdate ? `${t(OBJ_LOCALIZATION_KEY)} ${editingObj.value.token}` : `${t(OBJ_LOCALIZATION_KEY)} (${t('New')})`
})

onMounted(() => {
    const api = new ApiApi()

    api.apiGroupList().then(r => {
        groups.value = r


        if (props.item != null) {
            editingObj.value = props.item
        } else {
            // functions to populate defaults
            editingObj.value.validUntil = DateTime.now().plus({month: 1}).toJSDate()
            editingObj.value.group = groups.value[0]
        }

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

/**
 * saves the edited object in the database
 */
async function saveObject() {
    let api = new ApiApi()
    if (isUpdate.value) {
        api.apiInviteLinkUpdate({id: editingObj.value.id, inviteLink: editingObj.value}).then(r => {
            editingObj.value = r
            emit('save', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    } else {
        api.apiInviteLinkCreate({inviteLink: editingObj.value}).then(r => {
            editingObj.value = r
            emit('create', r)
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    }
}

/**
 * deletes the editing object from the database
 */
async function deleteObject() {
    let api = new ApiApi()
    api.apiInviteLinkDestroy({id: editingObj.value.id}).then(r => {
        editingObj.value = {} as InviteLink
        emit('delete')
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

</script>

<style scoped>

</style>