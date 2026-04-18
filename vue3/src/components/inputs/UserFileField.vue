<template>
    <div>
    <v-input :hint="hint" :persistent-hint="persistentHint">
        <v-card width="100%" link @click="dialog = !dialog" >
            <v-card-text class="pt-2 pb-2">
                <div class="d-flex flex-row">
                    <div>
                        <v-avatar v-if="!model?.id" color="primary"><i class="fa-solid fa-file-arrow-up"></i></v-avatar>
                        <v-avatar v-else-if="model.preview">
                            <v-img :src="model.preview" cover :position="cropPosition(model?.cropData)" />
                        </v-avatar>
                        <v-avatar v-else color="success"><i class="fa-solid fa-eye-slash"></i></v-avatar>
                    </div>
                    <div class="align-content-center">
                        <template v-if="label != ''"><span class="ms-2 text-disabled">{{ label }}</span><br/></template>
                        <span class="ms-2" v-if="!model?.id">{{ $t('select_file') }}</span>
                        <span class="ms-2" v-if="model?.id">{{ model.name }}</span>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-input>

    <v-dialog max-width="1000px" v-model="dialog">
        <v-card max-height="90vh" class="d-flex flex-column">
            <v-card-title>{{ $t('Files') }}</v-card-title>
            <v-tabs v-model="tab" grow>
                <v-tab v-if="model?.id" value="preview">{{ $t('Preview') }}</v-tab>
                <v-tab value="new">{{ $t('New') }}</v-tab>
                <v-tab value="search">{{ $t('Search') }}</v-tab>
            </v-tabs>
            <v-tabs-window v-model="tab" class="overflow-y-auto">
                <!-- Preview tab -->
                <v-tabs-window-item v-if="model?.id" value="preview">
                    <v-card>
                        <v-card-title>{{ model.name }}</v-card-title>
                        <v-card-text>
                            {{ model.fileSizeKb ? $n(model.fileSizeKb / 1000) + ' MB' : '' }} <br/>
                            {{ model.createdBy?.displayName }} <br/>
                            {{ model.createdAt ? DateTime.fromJSDate(model.createdAt).toLocaleString(DateTime.DATETIME_SHORT) : '' }}
                        </v-card-text>

                        <!-- Re-crop mode -->
                        <template v-if="recropActive">
                            <div class="mx-4">
                                <image-editor
                                    ref="recropEditor"
                                    :image-src="model.preview"
                                    :existing-crop-data="model.cropData as Record<string, number> | null"
                                />
                            </div>
                            <v-card-actions>
                                <v-btn color="save" prepend-icon="$save" @click="saveRecrop()" :loading="uploading">{{ $t('Save') }}</v-btn>
                                <v-btn @click="recropActive = false">{{ $t('Cancel') }}</v-btn>
                            </v-card-actions>
                        </template>

                        <!-- Normal preview -->
                        <template v-else>
                            <v-img class="mr-4 ml-4" max-height="50vh" rounded :src="model.preview" />
                            <v-card-actions>
                                <v-btn :href="model.fileDownload" target="_blank" color="success" prepend-icon="fa-solid fa-file-arrow-down">{{ $t('Download') }}</v-btn>
                                <v-btn v-if="model.preview" color="info" prepend-icon="fa-solid fa-crop" @click="recropActive = true">{{ $t('Crop') }}</v-btn>
                                <v-btn color="warning" prepend-icon="fa-solid fa-link-slash" @click="model = null">{{ $t('Remove') }}</v-btn>
                                <v-btn color="delete" prepend-icon="$delete" @click="model = null">{{ $t('Delete') }}</v-btn>
                                <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
                            </v-card-actions>
                        </template>
                    </v-card>
                </v-tabs-window-item>

                <!-- New upload tab -->
                <v-tabs-window-item value="new">
                    <v-card>
                        <v-card-text>
                            <v-text-field :label="$t('Name')" v-model="newFileName" />
                            <image-editor
                                ref="uploadEditor"
                                :allowed-extensions="allowedExtensions"
                                @file-selected="onNonImageFileSelected"
                            />
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="save" prepend-icon="$save" @click="uploadFile()" :loading="uploading">{{ $t('Save') }}</v-btn>
                            <v-btn @click="dialog = false">{{ $t('Close') }}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tabs-window-item>

                <!-- Search existing tab -->
                <v-tabs-window-item value="search">
                    <v-card>
                        <v-card-text>
                            <v-text-field :label="$t('Search')" prepend-inner-icon="$search" v-model="tableSearch" />
                            <v-data-table density="compact" :headers="tableHeaders" :items="userFiles" v-model:search="tableSearch">
                                <template #item.preview="{item}">
                                    <v-avatar>
                                        <v-img :src="item.preview" cover :position="cropPosition(item?.cropData)" />
                                    </v-avatar>
                                </template>
                                <template #item.actions="{item}">
                                    <v-btn icon="fa-solid fa-hand-pointer" color="save" density="comfortable" @click="model = item; tab='preview'" />
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
    </div>
</template>

<script setup lang="ts">
import {ApiApi, UserFile} from "@/openapi"
import {ref, watch} from "vue"
import {DateTime} from "luxon"
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore"
import {useI18n} from "vue-i18n"
import {cropPosition} from "@/utils/image_crop"
import {useFileApi} from "@/composables/useFileApi"
import ImageEditor from "@/components/inputs/ImageEditor.vue"

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, '.pdf', '.docx', '.xlsx', '.css', '.mp4', '.mov', '.md', '.txt']

const props = withDefaults(defineProps<{
    label?: string
    hint?: string
    persistentHint?: boolean
    imageOnly?: boolean
}>(), {
    label: '',
    hint: '',
    persistentHint: false,
    imageOnly: false,
})

const model = defineModel<UserFile | null>()
const {t} = useI18n()
const {createOrUpdateUserFile, updateUserFileCropData} = useFileApi()

const allowedExtensions = props.imageOnly ? IMAGE_EXTENSIONS : ALL_EXTENSIONS

const dialog = ref(false)
const tab = ref<string>('new')
const newFileName = ref('')
const userFiles = ref([] as UserFile[])
const uploading = ref(false)
const recropActive = ref(false)

const uploadEditor = ref<InstanceType<typeof ImageEditor> | null>(null)
const recropEditor = ref<InstanceType<typeof ImageEditor> | null>(null)

const tableSearch = ref('')
const tableHeaders = ref([
    {title: t('Quick actions'), key: 'actions'},
    {title: t('Preview'), key: 'preview'},
    {title: t('Name'), value: 'name'},
    {title: t('created_on'), key: 'createdAt', value: (item: any) => DateTime.fromJSDate(item.createdAt).toLocaleString(DateTime.DATETIME_MED)},
    {title: t('created_by'), value: 'createdBy.displayName'},
])

watch(() => dialog.value, (value, oldValue) => {
    if (value && !oldValue) {
        loadFiles()
        tab.value = model.value?.id ? 'preview' : 'new'
    }
    if (!value) {
        recropActive.value = false
        uploadEditor.value?.reset()
        newFileName.value = ''
    }
})

watch(() => model.value?.id, (id) => {
    if (dialog.value && !id) {
        tab.value = 'new'
    }
})

function onNonImageFileSelected(file: File, _cropData: Record<string, number> | null) {
    // For non-image files selected via ImageEditor, auto-fill the name
    if (!newFileName.value) {
        newFileName.value = file.name
    }
}

function loadFiles() {
    let api = new ApiApi()
    api.apiUserFileList().then(r => {
        userFiles.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

async function saveRecrop() {
    if (!recropEditor.value || !model.value) return
    uploading.value = true
    try {
        const cropData = recropEditor.value.extractCropData()
        if (!cropData) return
        model.value = await updateUserFileCropData(model.value.id!, cropData)
        recropActive.value = false
        dialog.value = false
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        uploading.value = false
    }
}

async function uploadFile() {
    if (!uploadEditor.value) return

    // For images, the editor has the file + crop data
    // For non-images, the editor already emitted file-selected
    uploadEditor.value.confirm()

    // Use the explicit getter — refs from defineExpose can be flaky
    const cropData = uploadEditor.value.extractCropData()
    const file = uploadEditor.value.getFile()
    if (!file || !(file instanceof File) || file.size === 0) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, t('select_file'))
        return
    }

    uploading.value = true
    try {
        model.value = await createOrUpdateUserFile(
            newFileName.value || file.name?.replace(/\.[^/.]+$/, '') || 'upload',
            file,
            undefined,
            cropData,
        )
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        uploadEditor.value.reset()
        newFileName.value = ''
        dialog.value = false
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        uploading.value = false
    }
}
</script>
