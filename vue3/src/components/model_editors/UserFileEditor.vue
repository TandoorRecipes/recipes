<template>
    <model-editor-base
        :loading="loading || fileApiLoading"
        :dialog="dialog"
        @save="saveFile"
        @delete="deleteObject"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">
        <v-card-text>
            <v-form :disabled="loading || fileApiLoading">

                <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                <!--                <v-file-input :label="$t('File')" v-model="editingObj.file" @change="uploadFile()"></v-file-input>-->

                <v-row>
                    <v-col cols="12" md="6">
                        <v-file-upload v-model="file" @update:modelValue="updateUserFileName"
                                       :title="$t('DragToUpload')"
                                       :browse-text="$t('Select_File')"
                                       :divider-text="$t('or')"
                        ></v-file-upload>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-label> {{ $t('Preview') }}</v-label>
                        <v-img max-height="25vh" rounded :src="editingObj.preview"></v-img>
                        <v-btn :href="editingObj.fileDownload" target="_blank" color="success" class="float-right" prepend-icon="fa-solid fa-file-arrow-down"
                               v-if="editingObj.fileDownload != undefined">
                            {{ $t('Download') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-alert class="mt-2" v-if="!loading && !fileApiLoading && Object.keys(editingObj).length > 0 && Number(editingObj.fileSizeKb)">
                    <p v-if="Number(editingObj.fileSizeKb)">{{ $n(editingObj.fileSizeKb / 1000) }} MB <br/></p>
                    <p v-if="editingObj.createdBy"> {{ editingObj.createdBy.displayName }}</p>
                    <p v-if="editingObj.createdAt"> {{ DateTime.fromJSDate(editingObj.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}</p>
                </v-alert>

            </v-form>
        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, shallowRef, watch} from "vue";
import {UserFile, UserSpace} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import {DateTime} from "luxon";
import {VFileUpload} from 'vuetify/labs/VFileUpload'
import {useFileApi} from "@/composables/useFileApi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    item: {type: {} as PropType<UserFile>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<UserFile>, required: false, default: {} as UserFile},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<UserFile>('UserFile', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)

const {fileApiLoading, createOrUpdateUserFile} = useFileApi()
const file = shallowRef<File | null>(null)

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor(){
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
}

/**
 * save file to database via fileApi composable
 */
function saveFile() {
    loading.value = true

    let event: ("create" | "save") = isUpdate() ? 'save' : 'create'

    createOrUpdateUserFile(editingObj.value.name, file.value, editingObj.value.id).then(r => {
        editingObj.value = r
        editingObjChanged.value = false
        emit(event, r)
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        editingObjChanged.value = false
        loading.value = false
    })
}

/**
 * set name based on file name if name is empty
 */
function updateUserFileName() {
    if (file.value != null && (editingObj.value.name == '' || editingObj.value.name == undefined)) {
        editingObj.value.name = file.value.name
    }
}

</script>

<style scoped>

</style>