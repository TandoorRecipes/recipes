<template>
    <div v-if="secondaryImages.length > 0" class="d-flex ga-1 mt-1 mx-3 overflow-x-auto recipe-image-strip">
        <v-avatar
            v-for="(img, idx) in secondaryImages"
            :key="img.id ?? idx"
            :size="thumbnailSize"
            rounded="lg"
            class="cursor-pointer flex-shrink-0"
            @click="emit('open-lightbox', allImageIndex(idx))"
        >
            <v-img :src="imageUrl(img)" cover :position="cropPosition(img.cropData)" />
        </v-avatar>
    </div>
</template>

<script setup lang="ts">
import {computed} from "vue"
import {useDisplay} from "vuetify"
import type {RecipeImage as RecipeImageType} from "@/openapi"
import {cropPosition} from "@/utils/image_crop"

const props = withDefaults(defineProps<{
    images: RecipeImageType[]
}>(), {
    images: () => [],
})

const emit = defineEmits<{
    'open-lightbox': [index: number]
}>()

const {mobile} = useDisplay()
const thumbnailSize = computed(() => mobile.value ? 56 : 64)

const secondaryImages = computed(() => props.images.filter(img => !img.isPrimary))

/** Map secondary image index back to the full images array index */
function allImageIndex(secondaryIdx: number): number {
    const img = secondaryImages.value[secondaryIdx]
    return props.images.indexOf(img)
}

function imageUrl(img: RecipeImageType): string {
    if (typeof img.file === 'string') return img.file
    return ''
}
</script>

<style scoped>
.recipe-image-strip {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 6px 0;
}
.recipe-image-strip::-webkit-scrollbar {
    display: none;
}
.recipe-image-strip :deep(.v-avatar) {
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
</style>
