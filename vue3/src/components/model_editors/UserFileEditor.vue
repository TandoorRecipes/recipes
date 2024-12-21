<template>
    <model-editor-base
        :loading="loading || fileApiLoading"
        :dialog="dialog"
        @save="saveFile"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">
        <v-card-text>
            <v-form :disabled="loading || fileApiLoading">

                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                <!--                <v-file-input :label="$t('File')" v-model="editingObj.file" @change="uploadFile()"></v-file-input>-->

                <v-row>
                    <v-col cols="12" md="6">
                        <v-file-upload v-model="file"></v-file-upload>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-label> {{ $t('Preview') }}</v-label>
                        <v-img max-height="25vh" rounded :src="editingObj.preview"></v-img>
                        <v-btn :href="editingObj.fileDownload" target="_blank" color="success" class="float-right" prepend-icon="fa-solid fa-file-arrow-down">{{ $t('Download') }}</v-btn>
                    </v-col>
                </v-row>

                <v-alert class="mt-2" v-if="!loading && !fileApiLoading && Object.keys(editingObj).length > 0">
                    {{ $n(editingObj.fileSizeKb / 1000) }} MB <br/>
                    {{ editingObj.createdBy.displayName }} <br/>
                    {{ DateTime.fromJSDate(editingObj.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                </v-alert>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, shallowRef} from "vue";
import {UserFile} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {DateTime} from "luxon";
import {VFileUpload} from 'vuetify/labs/VFileUpload'
import {useFileApi} from "@/composables/useFileApi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    item: {type: {} as PropType<UserFile>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<UserFile>('UserFile', emit)
const {fileApiLoading, createOrUpdateUserFile} = useFileApi()

// object specific data (for selects/display)

const file = shallowRef<File | null>(null)

onMounted(() => {
    setupState(props.item, props.itemId)
})


function saveFile() {

    createOrUpdateUserFile(editingObj.value.name, file.value, editingObj.value.id).then(r => {
        editingObj.value = r
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })

}

</script>

<style scoped>

</style>