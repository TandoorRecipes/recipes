<template>
    <div>
        <div class="d-flex align-center mb-2">
            <span class="text-subtitle-1">{{ $t('Images') }}</span>
            <v-spacer />
            <v-btn v-if="canImportFromSource" size="small" prepend-icon="fa-solid fa-globe" variant="text" @click="openSourceImport">{{ $t('ImportFromSource') }}</v-btn>
            <v-btn size="small" prepend-icon="$create" variant="text" @click="showUpload = true">{{ $t('add_image') }}</v-btn>
        </div>

        <!-- Image list -->
        <vue-draggable v-model="localImages" handle=".drag-handle" @end="onReorder" v-if="localImages.length > 0">
            <div v-for="(img, idx) in localImages" :key="img.id ?? idx" class="d-flex align-center ga-2 mb-1 pa-1 border-sm rounded">
                <v-icon icon="fa-solid fa-grip-vertical" class="drag-handle cursor-grab" size="small" />
                <div class="crop-thumb" :style="cropPreviewStyle(imageUrl(img), img.cropData, true)" />
                <div class="flex-grow-1 text-truncate text-body-2">
                    {{ img.file?.name ?? imageName(img) }}
                </div>
                <v-btn :icon="img.isPrimary ? 'fa-solid fa-star' : 'fa-regular fa-star'"
                       :color="img.isPrimary ? 'warning' : undefined"
                       size="small" variant="plain" :aria-label="$t('Primary')"
                       @click="setPrimary(idx)" />
                <v-btn icon="fa-solid fa-crop" size="small" variant="plain" :aria-label="$t('Crop')" @click="startCrop(idx)" />
                <v-btn icon="$delete" size="small" variant="plain" color="delete" :aria-label="$t('Delete')" @click="removeImage(idx)" />
            </div>
        </vue-draggable>

        <!-- Empty state -->
        <v-card v-if="localImages.length === 0 && !showUpload" variant="outlined" class="pa-4 text-center text-disabled" @click="showUpload = true">
            <v-icon icon="fa-solid fa-camera" size="large" class="mb-2" /><br/>
            {{ $t('AddRecipePhotos') }}
        </v-card>

        <!-- Upload dialog -->
        <v-dialog v-model="showUpload" max-width="1000" scrollable>
            <v-card>
                <v-closable-card-title v-model="showUpload" :title="$t('add_image')" @close="uploadEditorRef?.reset()" />
                <v-card-text>
                    <image-editor ref="uploadEditorRef" @file-selected="onNonImageFile" />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="save" prepend-icon="$save" @click="uploadImage()" :loading="uploading">{{ $t('Save') }}</v-btn>
                    <v-btn @click="showUpload = false; uploadEditorRef?.reset()">{{ $t('Cancel') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Import from source dialog -->
        <v-dialog v-model="showSourceImport" max-width="1000" scrollable>
            <v-card :loading="sourceLoading">
                <v-closable-card-title v-model="showSourceImport" :title="$t('ImportFromSource')" />
                <v-card-text>
                    <div v-if="!sourceLoading && sourceImages.length === 0" class="text-center text-disabled pa-4">
                        {{ $t('NoNewImages') }}
                    </div>
                    <source-image-picker v-else :images="sourceImages" v-model="selectedSourceImages" />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="save" prepend-icon="$save" @click="importSelectedSourceImages"
                           :loading="sourceLoading" :disabled="selectedSourceImages.length === 0">{{ $t('Save') }}</v-btn>
                    <v-btn @click="showSourceImport = false">{{ $t('Cancel') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Crop dialog -->
        <v-dialog v-model="cropDialog" max-width="1000" scrollable>
            <v-card>
                <v-closable-card-title v-model="cropDialog" :title="$t('Crop')" />
                <v-card-text>
                    <image-editor
                        ref="cropEditorRef"
                        :image-src="cropImageSrc"
                        :existing-crop-data="cropExistingData"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="save" prepend-icon="$save" @click="saveCrop()" :loading="uploading">{{ $t('Save') }}</v-btn>
                    <v-btn @click="cropDialog = false">{{ $t('Cancel') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue"
import {VueDraggable} from "vue-draggable-plus"
import type {RecipeImage as RecipeImageType} from "@/openapi"
import {useFileApi} from "@/composables/useFileApi"
import {cropPosition, cropPreviewStyle} from "@/utils/image_crop"
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore"
import ImageEditor from "@/components/inputs/ImageEditor.vue"
import SourceImagePicker from "@/components/inputs/SourceImagePicker.vue"
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue"

const props = defineProps<{
    recipeId: number
    sourceUrl?: string | null
}>()

const localImages = defineModel<RecipeImageType[]>('images', {default: () => []})

const {createRecipeImage, createRecipeImageFromUrl, scrapeSourceImages, updateRecipeImageCropData, deleteRecipeImage, patchRecipeImage} = useFileApi()

const uploading = ref(false)
const showUpload = ref(false)
const uploadEditorRef = ref<InstanceType<typeof ImageEditor> | null>(null)

// Crop state
const cropDialog = ref(false)
const cropImageSrc = ref<string | null>(null)
const cropExistingData = ref<Record<string, number> | null>(null)
const cropEditorRef = ref<InstanceType<typeof ImageEditor> | null>(null)
const cropImageIndex = ref(-1)

function imageUrl(img: RecipeImageType): string {
    if (typeof img.file === 'string') return img.file
    return ''
}

// Import-from-source state: only offered when the recipe was imported from a URL.
const canImportFromSource = computed(() => !!props.sourceUrl)
const showSourceImport = ref(false)
const sourceLoading = ref(false)
const sourceImages = ref<string[]>([])
const selectedSourceImages = ref<string[]>([])

async function openSourceImport() {
    if (!props.sourceUrl) return
    showSourceImport.value = true
    sourceLoading.value = true
    selectedSourceImages.value = []
    sourceImages.value = []
    try {
        const scraped = await scrapeSourceImages(props.sourceUrl)
        // hide images already in the gallery so the same URL can't be added twice
        const existing = new Set(localImages.value.map((img) => imageUrl(img)))
        sourceImages.value = scraped.filter((url) => !existing.has(url))
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        showSourceImport.value = false
    } finally {
        sourceLoading.value = false
    }
}

async function importSelectedSourceImages() {
    if (selectedSourceImages.value.length === 0) return
    sourceLoading.value = true
    try {
        // sequential; each returned image already comes back non-primary (the recipe has a
        // primary), so the existing cover is untouched and additions simply append.
        for (const url of selectedSourceImages.value) {
            const result = await createRecipeImageFromUrl(props.recipeId, url)
            localImages.value.push(result)
        }
        showSourceImport.value = false
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        sourceLoading.value = false
    }
}

function imageName(img: RecipeImageType): string {
    const url = imageUrl(img)
    return url.split('/').pop() ?? 'image'
}

function onNonImageFile(_file: File, _cropData: Record<string, number> | null) {
    // Non-image files shouldn't be uploaded as recipe images
}

async function uploadImage() {
    if (!uploadEditorRef.value) return
    const file = uploadEditorRef.value.selectedFile
    if (!file) return

    uploading.value = true
    try {
        const cropData = uploadEditorRef.value.extractCropData()
        const isPrimary = localImages.value.length === 0
        const order = localImages.value.length
        const result = await createRecipeImage(props.recipeId, file, cropData, isPrimary, order)
        localImages.value.push(result)
        showUpload.value = false
        uploadEditorRef.value.reset()
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        uploading.value = false
    }
}

async function removeImage(idx: number) {
    const img = localImages.value[idx]
    if (!img.id) {
        localImages.value.splice(idx, 1)
        return
    }
    try {
        await deleteRecipeImage(img.id)
        const wasPrimary = img.isPrimary
        localImages.value.splice(idx, 1)
        if (wasPrimary && localImages.value.length > 0) {
            await setPrimary(0)
        }
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    }
}

async function setPrimary(idx: number) {
    const img = localImages.value[idx]
    if (!img.id) return
    try {
        const updated = await patchRecipeImage(img.id, {is_primary: true})
        localImages.value.forEach((im, i) => {
            if (i === idx) {
                Object.assign(im, updated)
            } else {
                im.isPrimary = false
            }
        })
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }
}

function startCrop(idx: number) {
    const img = localImages.value[idx]
    cropImageIndex.value = idx
    cropImageSrc.value = imageUrl(img)
    cropExistingData.value = img.cropData ?? null
    cropDialog.value = true
}

async function saveCrop() {
    if (!cropEditorRef.value || cropImageIndex.value < 0) return
    const cropData = cropEditorRef.value.extractCropData()
    if (!cropData) return
    const img = localImages.value[cropImageIndex.value]
    if (!img.id) return

    uploading.value = true
    try {
        const result = await updateRecipeImageCropData(img.id, cropData)
        Object.assign(localImages.value[cropImageIndex.value], result)
        cropDialog.value = false
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    } catch (err: any) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    } finally {
        uploading.value = false
    }
}

function onReorder() {
    localImages.value.forEach((img, idx) => {
        img.order = idx
        if (img.id) {
            patchRecipeImage(img.id, {order: idx}).catch((err: any) => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            })
        }
    })
}

// Exposed for testing the primary/reorder API calls and the source-import flow.
defineExpose({setPrimary, onReorder, canImportFromSource, openSourceImport, importSelectedSourceImages, sourceImages, selectedSourceImages})
</script>

<style scoped>
.crop-thumb {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background-color: rgb(var(--v-theme-surface));
}
</style>
