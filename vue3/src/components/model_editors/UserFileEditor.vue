<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">
        <v-card-text>
            <v-form :disabled="loading">

                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
<!--                <v-file-input :label="$t('File')" v-model="editingObj.file" @change="uploadFile()"></v-file-input>-->

                <v-label> {{ $t('Preview') }}</v-label>
                <v-img max-height="25vh" rounded :src="editingObj.preview"></v-img>

                <v-alert v-if="!loading">
                    {{ $n(editingObj.fileSizeKb / 1000) }} MB <br/>
                    {{ editingObj.createdBy.displayName }} <br/>
                    {{ DateTime.fromJSDate(editingObj.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                    <template #append>
                        <v-btn :href="editingObj.fileDownload" target="_blank" color="success" prepend-icon="fa-solid fa-file-arrow-down">{{ $t('Download') }}</v-btn>
                    </template>
                </v-alert>


            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType} from "vue";
import {Keyword, UserFile, UserFileFromJSON} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {useI18n} from "vue-i18n";
import {DateTime} from "luxon";
import UserFileField from "@/components/inputs/UserFileField.vue";
import {getCookie} from "@/utils/cookie";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

const {t} = useI18n()

const props = defineProps({
    item: {type: {} as PropType<UserFile>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<UserFile>('UserFile', emit)

// object specific data (for selects/display)

onMounted(() => {
    setupState(props.item, props.itemId)
})

// TODO this is aweful, need to fix but works for now
function uploadFile() {
    loading.value = true
    let formData = new FormData()
    formData.append('file', editingObj.value.file)
    formData.append('name', editingObj.value.name)

    if (isUpdate()) {
        //TODO proper URL finding (sub path setups)
        fetch('/api/user-file/' + editingObj.value.id + '/', {
            method: 'PUT',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => { // TODO maybe better use existing URL clients response functions for parsing
            r.json().then(r => {
                editingObj.value = UserFileFromJSON(r)
            })
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    } else {
        //TODO proper URL finding (sub path setups)
        fetch('/api/user-file/', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        }).then(r => { // TODO maybe better use existing URL clients response functions for parsing
            r.json().then(r => {
                editingObj.value = UserFileFromJSON(r)
            })
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }

}

</script>

<style scoped>

</style>