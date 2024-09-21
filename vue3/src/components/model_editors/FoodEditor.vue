<template>
    <v-card>
        <v-card-title>
            {{ $t(OBJ_LOCALIZATION_KEY) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
        </v-card-title>
        <v-card-text>
            <v-form>
                <v-text-field v-model="editingObj.name"></v-text-field>
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
import {ApiApi, Food} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

const {t} = useI18n()

const emit = defineEmits(['create', 'save', 'delete', 'close'])

const props = defineProps({
    item: {type: {} as Food, required: false},
    itemId: {type: String, required: false},
    dialog: {type: Boolean, default: false}
})

const OBJ_LOCALIZATION_KEY = 'Food'
const editingObj = ref({} as Food)
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
    } else if(props.itemId != null){
        const api = new ApiApi()
        api.apiFoodRetrieve({id: props.itemId}).then(r => {
            editingObj.value = r
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    } else {
        // functions to populate defaults for new item

    }
})

/**
 * saves the edited object in the database
 */
async function saveObject() {
    let api = new ApiApi()
    if (isUpdate.value) {
        api.apiFoodUpdate({id: editingObj.value.id, accessToken: editingObj.value}).then(r => {
            editingObj.value = r
            emit('save', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    } else {
        api.apiFoodCreate({accessToken: editingObj.value}).then(r => {
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
    api.apiFoodDestroy({id: editingObj.value.id}).then(r => {
        editingObj.value = {} as Food
        emit('delete', editingObj.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

</script>

<style scoped>

</style>