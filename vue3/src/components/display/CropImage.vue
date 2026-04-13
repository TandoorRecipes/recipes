<template>
    <div class="crop-image"
         :class="{'crop-image-fit-frame': isFitFrame}"
         :style="containerStyle">
        <div v-if="isFitFrame" class="crop-image-fit-inner" :style="innerStyle"></div>
        <slot />
    </div>
</template>

<script setup lang="ts">
import {computed} from "vue"
import {cropPreviewStyle, shouldFitFrame} from "@/utils/image_crop"

const props = withDefaults(defineProps<{
    src?: string | null
    cropData?: Record<string, number> | null
    width?: string
    height?: string
    rounded?: boolean | string
    /**
     * When true (square thumbnails), always show the cropped square (zoom-in).
     * When false (cards/banners), respect the fit flag — fit=true letterboxes
     * the cropped square inside the container, fit=false uses cover with
     * focal point.
     */
    forceCrop?: boolean
}>(), {
    src: null,
    cropData: null,
    width: undefined,
    height: undefined,
    rounded: false,
    forceCrop: false,
})

const isFitFrame = computed(() => shouldFitFrame(props.cropData, props.forceCrop))

const cropStyle = computed(() => cropPreviewStyle(props.src ?? '', props.cropData, props.forceCrop))

const containerStyle = computed(() => {
    const base: Record<string, string> = {}
    if (props.width) base['width'] = props.width
    if (props.height) base['height'] = props.height
    if (props.rounded) base['borderRadius'] = typeof props.rounded === 'string' ? props.rounded : '4px'
    if (isFitFrame.value) {
        // Outer container is just the centered frame; inner div carries the image
        return base
    }
    return {...base, ...cropStyle.value}
})

const innerStyle = computed(() => {
    const style = {...cropStyle.value}
    if (props.rounded) {
        style['borderRadius'] = typeof props.rounded === 'string' ? props.rounded : '4px'
    }
    return style
})
</script>

<style scoped>
.crop-image {
    position: relative;
    overflow: hidden;
    background-color: rgb(var(--v-theme-surface));
}

.crop-image-fit-frame {
    container-type: size;
    display: flex;
    align-items: center;
    justify-content: center;
}

.crop-image-fit-inner {
    width: 100cqmin;
    height: 100cqmin;
}
</style>
