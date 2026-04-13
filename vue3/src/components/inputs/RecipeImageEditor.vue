<template>
    <div>
        <div class="d-flex align-center mb-2">
            <span class="text-subtitle-1">{{ $t('Images') }}</span>
            <v-spacer />
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
        <v-dialog v-model="showUpload" max-width="1000">
            <v-card>
                <v-card-title>{{ $t('add_image') }}</v-card-title>
                <v-card-text>
                    <image-editor ref="uploadEditorRef" @file-selected="onNonImageFile" />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="save" prepend-icon="$save" @click="uploadImage()" :loading="uploading">{{ $t('Save') }}</v-btn>
                    <v-btn @click="showUpload = false; uploadEditorRef?.reset()">{{ $t('Cancel') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Crop dialog -->
        <v-dialog v-model="cropDialog" max-width="1000">
            <v-card>
                <v-card-title>{{ $t('AdjustFocalPoint') }}</v-card-title>
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
import {ref} from "vue"
import {VueDraggable} from "vue-draggable-plus"
import type {RecipeImage as RecipeImageType} from "@/openapi"
import {RecipeImageFromJSON} from "@/openapi"
import {useFileApi} from "@/composables/useFileApi"
import {useDjangoUrls} from "@/composables/useDjangoUrls"
import {getCookie} from "@/utils/cookie"
import {cropPosition, cropPreviewStyle} from "@/utils/image_crop"
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore"
import ImageEditor from "@/components/inputs/ImageEditor.vue"

const props = defineProps<{
    recipeId: number
}>()

const localImages = defineModel<RecipeImageType[]>('images', {default: () => []})

const {createRecipeImage, updateRecipeImageCropData, deleteRecipeImage} = useFileApi()
const {getDjangoUrl} = useDjangoUrls()

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
        const r = await fetch(getDjangoUrl(`api/recipe-image/${img.id}/`), {
            method: 'PATCH',
            headers: {'X-CSRFToken': getCookie('csrftoken'), 'Content-Type': 'application/json'},
            body: JSON.stringify({is_primary: true}),
        })
        if (r.ok) {
            const updated = RecipeImageFromJSON(await r.json())
            localImages.value.forEach((im, i) => {
                if (i === idx) {
                    Object.assign(im, updated)
                } else {
                    im.isPrimary = false
                }
            })
        }
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
            fetch(getDjangoUrl(`api/recipe-image/${img.id}/`), {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
                body: JSON.stringify({order: idx}),
            }).catch((err: any) => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            })
        }
    })
}
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
