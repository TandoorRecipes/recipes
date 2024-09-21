<template>
    <v-card>
        <v-card-title>
            {{ $t(OBJ_LOCALIZATION_KEY) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
        </v-card-title>
        <v-card-text>
            <v-form>
                <v-select :label="$t('Role')" :items="groups" item-value="id" item-title="name" return-object multiple v-model="editingObj.groups"></v-select>
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

import {computed, onMounted, ref} from "vue";
import {AccessToken, ApiApi, Group, InviteLink, UserSpace} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import {useClipboard} from "@vueuse/core";
import {tr} from "vuetify/locale";

const {t} = useI18n()
const {copy} = useClipboard()

const emit = defineEmits(['create', 'save', 'delete', 'close'])

const props = defineProps({
    item: {type: {} as UserSpace, required: true},
    dialog: {type: Boolean, default: false}
})

const OBJ_LOCALIZATION_KEY = 'Invite_Link'
const editingObj = ref({} as UserSpace)
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
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })

    if (props.item != null) {
        editingObj.value = props.item
    } else {
        console.error('UserSpaceEditor cannot create items')
    }
})

/**
 * saves the edited object in the database
 */
async function saveObject() {
    let api = new ApiApi()
    if (isUpdate.value) {
        api.apiUserSpacePartialUpdate({id: editingObj.value.id, patchedUserSpace: editingObj.value}).then(r => {
            editingObj.value = r
            emit('save', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    }
}

/**
 * deletes the editing object from the database
 */
async function deleteObject() {
    let api = new ApiApi()
    api.apiUserSpaceDestroy({id: editingObj.value.id}).then(r => {
        editingObj.value = {} as UserSpace
        emit('delete', editingObj.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

</script>

<style scoped>

</style>