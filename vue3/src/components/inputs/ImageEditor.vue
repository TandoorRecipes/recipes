<template>
    <div @paste="onPaste">
        <!-- New image mode: file input (shown when no cropper active) -->
        <template v-if="!imageSrc && !cropperSrc">
            <v-file-input
                :label="$t('File')"
                v-model="selectedFile"
                @update:model-value="onFileSelected"
                :accept="acceptString"
                :hint="$t('PasteImageHint')"
                persistent-hint
            />
        </template>

        <!-- Cropper (shown for new image after selection, or for re-crop of existing) -->
        <div v-if="cropperSrc">
            <div class="cropper-container">
                <img ref="imgRef" :src="cropperSrc" class="cropper-image" @load="onImageLoad" />
            </div>

            <!-- Zoom controls -->
            <div class="d-flex align-center ga-2 mt-2">
                <v-tooltip :text="$t('ZoomOut')" location="bottom">
                    <template #activator="{ props: tp }">
                        <v-btn v-bind="tp" icon="fa-solid fa-magnifying-glass-minus" size="small" variant="tonal" @click="zoom(-0.1)" />
                    </template>
                </v-tooltip>
                <v-tooltip :text="$t('ZoomIn')" location="bottom">
                    <template #activator="{ props: tp }">
                        <v-btn v-bind="tp" icon="fa-solid fa-magnifying-glass-plus" size="small" variant="tonal" @click="zoom(0.1)" />
                    </template>
                </v-tooltip>
                <v-tooltip :text="$t('Reset')" location="bottom">
                    <template #activator="{ props: tp }">
                        <v-btn v-bind="tp" icon="fa-solid fa-expand" size="small" variant="tonal" @click="resetZoom" />
                    </template>
                </v-tooltip>
            </div>

            <v-switch v-model="fitToFrame" :label="$t('FitToFrame')" density="compact" hide-details class="mt-2" />

            <!-- Live preview strip -->
            <div v-if="liveCropData" class="text-caption text-disabled mt-3">{{ $t('Preview') }}</div>
            <div v-if="liveCropData" class="d-flex ga-3 mt-1 align-end">
                <div v-for="p in previewContexts" :key="p.label" class="text-center">
                    <crop-image class="preview-box"
                                :src="cropperSrc ?? ''"
                                :crop-data="liveCropData"
                                :width="p.previewWidth + 'px'"
                                :height="p.previewHeight + 'px'"
                                :force-crop="p.ratio === 1" />
                    <div class="text-caption text-disabled mt-1">{{ p.label }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from "vue"
import Cropper from "cropperjs"
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore"
import {useI18n} from "vue-i18n"
import CropImage from "@/components/display/CropImage.vue"

const previewContexts = [
    {label: 'Card', ratio: 16 / 9, previewWidth: 120, previewHeight: 68},
    {label: 'Banner', ratio: 3 / 1, previewWidth: 150, previewHeight: 50},
    {label: 'Square', ratio: 1, previewWidth: 64, previewHeight: 64},
]

const props = withDefaults(defineProps<{
    imageSrc?: string | null
    allowedExtensions?: string[]
    existingCropData?: Record<string, number> | null
}>(), {
    imageSrc: null,
    allowedExtensions: () => ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    existingCropData: null,
})

const emit = defineEmits<{
    'file-selected': [file: File, cropData: Record<string, number> | null]
    'recrop': [cropData: Record<string, number>]
    'cancel': []
}>()

const {t} = useI18n()
const imgRef = ref<HTMLImageElement | null>(null)
const cropperInstance = ref<Cropper | null>(null)
const cropperSrc = ref<string | null>(props.imageSrc ?? null)
const selectedFile = ref<File | null>(null)
const liveCropData = ref<Record<string, number> | null>(null)
const fitToFrame = ref(false)
let changeObserverRaf = 0
let lastSelectionKey = ''

const acceptString = computed(() => props.allowedExtensions.join(','))

watch(() => props.imageSrc, (src) => {
    destroyCropper()
    cropperSrc.value = src ?? null
})

onBeforeUnmount(() => {
    destroyCropper()
})

function destroyCropper() {
    if (changeObserverRaf) {
        cancelAnimationFrame(changeObserverRaf)
        changeObserverRaf = 0
    }
    if (cropperInstance.value) {
        cropperInstance.value.destroy()
        cropperInstance.value = null
    }
    liveCropData.value = null
    lastSelectionKey = ''
}

function onImageLoad() {
    if (!imgRef.value) return
    destroyCropper()

    cropperInstance.value = new Cropper(imgRef.value, {})

    const cropperImage = cropperInstance.value.getCropperImage()
    if (!cropperImage) return

    cropperImage.$ready().then(() => {
        const selection = cropperInstance.value?.getCropperSelection()
        if (!selection) return

        selection.aspectRatio = 1
        fitToFrame.value = !!props.existingCropData?.['fit']

        const crop = props.existingCropData
        const isValidCrop = crop && crop.width > 10 && crop.height > 10

        if (isValidCrop) {
            // Use image bounds (not canvas) since crop data is stored as image percentages
            const imgBounds = getImageBounds()
            if (imgBounds && imgBounds.w > 0 && imgBounds.h > 0) {
                const rawX = imgBounds.x + (crop.x / 100) * imgBounds.w
                const rawY = imgBounds.y + (crop.y / 100) * imgBounds.h
                const rawW = (crop.width / 100) * imgBounds.w
                const rawH = (crop.height / 100) * imgBounds.h
                // Enforce square: use smaller dimension, center within original crop
                const size = Math.min(rawW, rawH)
                const sx = rawX + (rawW - size) / 2
                const sy = rawY + (rawH - size) / 2
                selection.$change(sx, sy, size, size)
            }
        } else {
            const imgBounds = getImageBounds()
            if (imgBounds && imgBounds.w > 0 && imgBounds.h > 0) {
                const size = Math.min(imgBounds.w, imgBounds.h)
                const cx = imgBounds.x + (imgBounds.w - size) / 2
                const cy = imgBounds.y + (imgBounds.h - size) / 2
                selection.$change(cx, cy, size, size)
            }
        }

        updateLivePreview()
        startSelectionObserver()
    })
}

/**
 * Poll the selection position via rAF. Cropperjs v2 dispatches change events
 * on the canvas element (not the selection), and the event detail doesn't
 * reliably bubble to Vue event listeners. Polling is cheap (~0.1ms per frame)
 * and guarantees the preview always reflects the current selection.
 */
function getImageBounds(): {x: number, y: number, w: number, h: number} | null {
    const canvas = cropperInstance.value?.getCropperCanvas()
    const cropperImage = cropperInstance.value?.getCropperImage()
    if (!canvas || !cropperImage) return null
    const canvasRect = canvas.getBoundingClientRect()
    const imageRect = cropperImage.getBoundingClientRect()
    return {
        x: imageRect.left - canvasRect.left,
        y: imageRect.top - canvasRect.top,
        w: imageRect.width,
        h: imageRect.height,
    }
}

function startSelectionObserver() {
    function tick() {
        const selection = cropperInstance.value?.getCropperSelection()
        if (!selection) return

        // Clamp selection to image bounds
        const bounds = getImageBounds()
        if (bounds && bounds.w > 0 && bounds.h > 0) {
            let {x, y, width, height} = selection
            let changed = false
            const maxX = bounds.x + bounds.w
            const maxY = bounds.y + bounds.h
            // Clamp position first
            if (x < bounds.x) { x = bounds.x; changed = true }
            if (y < bounds.y) { y = bounds.y; changed = true }
            // Then clamp size, shifting position if needed to keep selection inside
            if (x + width > maxX) {
                x = Math.max(bounds.x, maxX - width)
                width = Math.min(width, maxX - x)
                changed = true
            }
            if (y + height > maxY) {
                y = Math.max(bounds.y, maxY - height)
                height = Math.min(height, maxY - y)
                changed = true
            }
            if (width < 10) width = 10
            if (height < 10) height = 10
            // Re-enforce square after independent axis clamping
            if (changed && Math.abs(width - height) > 1) {
                const squareSize = Math.min(width, height)
                if (squareSize < width) x += (width - squareSize) / 2
                if (squareSize < height) y += (height - squareSize) / 2
                width = squareSize
                height = squareSize
            }
            if (changed) {
                selection.$change(x, y, width, height)
            }
        }

        const key = `${selection.x},${selection.y},${selection.width},${selection.height}`
        if (key !== lastSelectionKey) {
            lastSelectionKey = key
            updateLivePreview()
        }
        changeObserverRaf = requestAnimationFrame(tick)
    }
    changeObserverRaf = requestAnimationFrame(tick)
}

function updateLivePreview() {
    const data = extractCropData()
    if (data && fitToFrame.value) data['fit'] = 1
    liveCropData.value = data
}

watch(fitToFrame, () => updateLivePreview())

function zoom(delta: number) {
    const cropperImage = cropperInstance.value?.getCropperImage()
    if (cropperImage) {
        cropperImage.$zoom(delta)
    }
}

function resetZoom() {
    const cropperImage = cropperInstance.value?.getCropperImage()
    if (cropperImage) {
        cropperImage.$center('contain')
    }
    // Reset selection to max centered square
    const selection = cropperInstance.value?.getCropperSelection()
    if (selection) {
        // Wait a frame for the image to re-center before computing bounds
        requestAnimationFrame(() => {
            const imgBounds = getImageBounds()
            if (imgBounds && imgBounds.w > 0 && imgBounds.h > 0) {
                const size = Math.min(imgBounds.w, imgBounds.h)
                const cx = imgBounds.x + (imgBounds.w - size) / 2
                const cy = imgBounds.y + (imgBounds.h - size) / 2
                selection.$change(cx, cy, size, size)
            }
        })
    }
}

function onFileSelected(value: File[] | File | null) {
    const file = Array.isArray(value) ? value[0] : value
    selectedFile.value = file ?? null
    if (!file) {
        cropperSrc.value = null
        return
    }
    const lower = file.name.toLowerCase()
    if (!props.allowedExtensions.some(ext => lower.endsWith(ext))) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, t('FileTypeNotAllowed'))
        selectedFile.value = null
        return
    }
    if (file.type?.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
            cropperSrc.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    } else {
        cropperSrc.value = null
        emit('file-selected', file, null)
    }
}

function onPaste(event: ClipboardEvent) {
    const files = event.clipboardData?.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type?.startsWith('image/')) return
    event.preventDefault()
    selectedFile.value = file
    onFileSelected(file)
}

function extractCropData(): Record<string, number> | null {
    const selection = cropperInstance.value?.getCropperSelection()
    if (!selection) return null

    // Use image bounds (not canvas) so percentages are relative to the actual image
    const bounds = getImageBounds()
    if (!bounds || bounds.w <= 0 || bounds.h <= 0) return null

    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 100) / 100))
    return {
        x: clamp(((selection.x - bounds.x) / bounds.w) * 100),
        y: clamp(((selection.y - bounds.y) / bounds.h) * 100),
        width: clamp((selection.width / bounds.w) * 100),
        height: clamp((selection.height / bounds.h) * 100),
        ...(fitToFrame.value ? {fit: 1} : {}),
    }
}

function confirm() {
    const cropData = extractCropData()
    if (props.imageSrc) {
        if (cropData) {
            emit('recrop', cropData)
        }
    } else if (selectedFile.value) {
        emit('file-selected', selectedFile.value, cropData)
    }
}

function reset() {
    destroyCropper()
    selectedFile.value = null
    cropperSrc.value = props.imageSrc ?? null
}

function getFile(): File | null {
    return selectedFile.value
}

defineExpose({ confirm, reset, extractCropData, getFile, selectedFile })
</script>

<style scoped>
.cropper-container {
    height: 50vh;
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    overflow: hidden;
}

.cropper-container :deep(cropper-canvas) {
    width: 100%;
    height: 100%;
}

.cropper-image {
    max-width: 100%;
    max-height: 100%;
    display: block;
}

.preview-box {
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    background-color: rgb(var(--v-theme-surface));
}
</style>
