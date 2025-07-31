<template>
    <v-input :hint="hint" :persistent-hint="persistentHint">
        <v-card width="100%" link @click="dialog = !dialog" >
            <v-card-text class="pt-2 pb-2">
                <div class="d-flex flex-row">
                    <div>
                        <v-avatar v-if="model == null" color="primary"><i class="fa-solid fa-file-arrow-up"></i></v-avatar>
                        <v-avatar v-if="model != null && model.preview != ''" :image="model.preview"></v-avatar>
                        <v-avatar v-if="model != null && model.preview == ''" color="success"><i class="fa-solid fa-eye-slash"></i></v-avatar>

                    </div>
                    <div class="align-content-center">
                        <template v-if="label != ''"><span class="ms-2 text-disabled">{{ label }}</span><br/></template>
                        <span class="ms-2" v-if="model == null">{{ $t('select_file') }}</span>
                        <span class="ms-2" v-if="model != null">{{ model.name }}</span></div>
                </div>

            </v-card-text>

            <!--TODO right floating edit/remove/delete/??? button -->
        </v-card>
    </v-input>

    <v-dialog max-width="1000px" height="90vh" v-model="dialog">
        <v-card>
            <v-card-title>{{ $t('Files') }}</v-card-title>
            <v-tabs v-model="tab" grow>
                <v-tab v-if="model != null">{{ $t('Preview') }}</v-tab>
                <v-tab>{{ $t('New') }}</v-tab>
                <v-tab>{{ $t('Search') }}</v-tab>
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

                        <v-img class="mr-4 ml-4" max-height="50vh" rounded :src="model.preview"></v-img>

                        <v-card-actions>
                            <v-btn :href="model.fileDownload" target="_blank" color="success" prepend-icon="fa-solid fa-file-arrow-down">{{ $t('Download') }}</v-btn>
                            <!-- TODO implement -->
                            <v-btn color="warning" prepend-icon="fa-solid fa-link-slash" @click="model = null">{{ $t('Remove') }}</v-btn>
                            <v-btn color="delete" prepend-icon="$delete" @click="model = null">{{ $t('Delete') }}</v-btn>
                            <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
                        </v-card-actions>
                    </v-card>


                </v-tabs-window-item>
                <v-tabs-window-item>
                    <v-card>
                        <v-card-text>
                            <v-text-field :label="$t('Name')" v-model="newUserFile.name"></v-text-field>
                            <v-file-input :label="$t('File')" v-model="newUserFile.file"></v-file-input>


                        </v-card-text>

                        <v-card-actions>
                            <v-btn color="save" prepend-icon="$save" @click="uploadFile()">{{ $t('Save') }}</v-btn>
                            <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tabs-window-item>
                <v-tabs-window-item>
                    <v-card>
                        <v-card-text>
                            <v-text-field :label="$t('Search')" prepend-inner-icon="$search" v-model="tableSearch"></v-text-field>
                            <v-data-table density="compact" :headers="tableHeaders" :items="userFiles" v-model:search="tableSearch">
                                <template #item.preview="{item}">
                                    <v-avatar :image="item.preview"></v-avatar>
                                </template>
                                <template #item.actions="{item}">
                                    <v-btn icon="fa-solid fa-hand-pointer" color="save" density="comfortable" @click="model = item; tab=0"></v-btn>
                                </template>
                            </v-data-table>

                        </v-card-text>

                        <v-card-actions>
                            <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
                        </v-card-actions>
                    </v-card>
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
import {useI18n} from "vue-i18n";

const emit = defineEmits(['update:modelValue', 'create'])

const props = defineProps({
    model: {type: {} as UserFile, default: null},
    label: {type: String, default: ''},
    hint: {type: String, default: ''},
    persistentHint: {type: Boolean, default: false},
})

const model = defineModel()
const {t} = useI18n()

const dialog = ref(false)
const tab = ref(0)
const newUserFile = ref({} as UserFile)
const userFiles = ref([] as UserFile[])

const tableSearch = ref('')
const tableHeaders = ref([
    {title: t('Quick actions'), key: 'actions'},
    {title: t('Preview'), key: 'preview'},
    {title: t('Name'), value: 'name'},
    {title: t('created_on'), key: 'createdAt', value: item => DateTime.fromJSDate(item.createdAt).toLocaleString(DateTime.DATETIME_MED)},
    {title: t('created_by'), value: 'createdBy.displayName',},
])

onMounted(() => {
    //TODO move to open function of file tab
    loadFiles()
})

function loadFiles() {
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