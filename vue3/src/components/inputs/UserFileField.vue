<template>
    <v-input>
        <v-card width="100%" link @click="dialog = !dialog">
            <v-card-text class="pt-2 pb-2">
                <v-avatar v-if="model == null" color="primary"><i class="fa-solid fa-file-arrow-up"></i></v-avatar>
                <v-avatar v-if="model != null && model.preview != ''" :image="model.preview"></v-avatar>
                <v-avatar v-if="model != null && model.preview == ''" color="success"><i class="fa-solid fa-eye-slash"></i></v-avatar>
                <span class="ms-2" v-if="model == null">{{ $t('select_file') }}</span>
                <span class="ms-2" v-if="model != null">{{ model.name }}</span>
            </v-card-text>

            <!--TODO right floating edit/remove/delete/??? button -->
        </v-card>
    </v-input>

    <v-dialog max-width="600px" v-model="dialog">
        <v-card>
            <v-card-title>{{ $t('Files') }}</v-card-title>
            <v-btn @click="dialog = false">close</v-btn>
            <v-tabs v-model="tab" grow>
                <v-tab v-if="model != null">Preview</v-tab>
                <v-tab>New</v-tab>
                <v-tab>Browse</v-tab>
            </v-tabs>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item v-if="model != null">
                    <v-card>

                        <v-card-title>
                            {{ model.name }}
                        </v-card-title>
                        <v-card-text>
                            {{ $n(model.fileSizeKb / 1000) }} MB <br/>
                            {{ model.createdBy.displayName }} <br/>
                            {{ DateTime.fromJSDate(model.createdAt).toLocaleString(DateTime.DATETIME_SHORT) }}
                        </v-card-text>

                        <v-img class="mr-4 ml-4" rounded :src="model.preview"></v-img>

                        <v-card-actions>
                            <v-btn :href="model.fileDownload" target="_blank" color="success" prepend-icon="fa-solid fa-file-arrow-down">{{ $t('Download') }}</v-btn>
                            <!-- TODO implement -->
                            <v-btn color="delete" prepend-icon="$delete" @click="model = null">{{ $t('Delete') }}</v-btn>
                        </v-card-actions>
                    </v-card>


                </v-tabs-window-item>
                <v-tabs-window-item>
                    <v-card>
                        <v-card-text>
                            <v-text-field :label="$t('Name')" v-model="newUserFile.name"></v-text-field>
                            <v-file-input :label="$t('File')" v-model="newUserFile.file"></v-file-input>
                            <v-btn color="save" prepend-icon="$save" @click="uploadFile()">{{ $t('Save') }}</v-btn>
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>
                <v-tabs-window-item>
                    <v-data-table :items="userFiles"></v-data-table>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {ApiApi, UserFile, UserFileFromJSON} from "@/openapi";
import {onMounted, ref} from "vue";
import {DateTime} from "luxon";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {getCookie} from "@/utils/cookie";

const emit = defineEmits(['update:modelValue', 'create'])

const props = defineProps({
    model: {type: {} as UserFile, default: null}
})

const model = defineModel()

const dialog = ref(false)
const tab = ref(0)
const newUserFile = ref({} as UserFile)
const userFiles = ref([] as UserFile[])

onMounted(() => {
    //TODO move to open function of file tab
    loadFiles()
})

function loadFiles(){
    let api = new ApiApi()
    api.apiUserFileList().then(r => {
        // TODO implement pagination
        userFiles.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

function uploadFile() {

    let formData = new FormData()
    formData.append('file', newUserFile.value.file)
    formData.append('name', newUserFile.value.name)

    //TODO proper URL finding (sub path setups)
    fetch('/api/user-file/', {
        method: 'POST',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        body: formData
    }).then(r => { // TODO maybe better use existing URL clients response functions for parsing
        r.json().then(r => {
            model.value = UserFileFromJSON(r)
        })
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}

</script>


<style scoped>

</style>