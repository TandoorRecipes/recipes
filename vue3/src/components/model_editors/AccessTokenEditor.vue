<template>
    <v-card>
        <v-card-title>
            {{ $t(OBJ_LOCALIZATION_KEY) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
        </v-card-title>
        <v-card-text>
            <v-form>
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="Token" v-model="editingObj.token" disabled></v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-btn color="info" variant="tonal" icon="$copy" @click="copy(editingObj.token)"></v-btn>
                    </v-col>
                </v-row>

                <v-text-field label="Scope" v-model="editingObj.scope"></v-text-field>
                <v-date-input :label="$t('Valid Until')" v-model="editingObj.expires"></v-date-input>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="save" prepend-icon="$save" @click="saveObject">{{ isUpdate ? $t('Save') : $t('Create') }}</v-btn>
            <v-btn color="delete" prepend-icon="$delete" v-if="isUpdate">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName" @delete="deleteObject"></delete-confirm-dialog>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {computed, onMounted, ref} from "vue";
import {AccessToken, ApiApi} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import {useClipboard} from "@vueuse/core";

const {t} = useI18n()
const {copy} = useClipboard()

const emit = defineEmits(['create', 'save', 'delete', 'close'])

const props = defineProps({
    item: {type: {} as AccessToken, required: false},
    dialog: {type: Boolean, default: false}
})

const OBJ_LOCALIZATION_KEY = 'Access_Token'
const editingObj = ref({} as AccessToken)
const loading = ref(false)

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
    if (props.item != null) {
        editingObj.value = props.item
    } else {
        // functions to populate defaults
        editingObj.value.expires = DateTime.now().plus({year: 1}).toJSDate()
        editingObj.value.scope = 'read write'
    }
})

/**
 * saves the edited object in the database
 */
async function saveObject() {
    let api = new ApiApi()
    if (isUpdate.value) {
        api.apiAccessTokenUpdate({id: editingObj.value.id, accessToken: editingObj.value}).then(r => {
            editingObj.value = r
            emit('save', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    } else {
        api.apiAccessTokenCreate({accessToken: editingObj.value}).then(r => {
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
    api.apiAccessTokenDestroy({id: editingObj.value.id}).then(r => {
        editingObj.value = {} as AccessToken
        emit('delete')
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

</script>

<style scoped>

</style>