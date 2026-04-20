<template>
    <v-dialog v-model="show" fullscreen transition="fade-transition" content-class="image-lightbox">
        <div class="d-flex align-center justify-center fill-height bg-black" @click="show = false" @touchstart="onTouchStart" @touchend="onTouchEnd">
            <v-img :src="currentSrc" contain max-height="100vh" max-width="100vw" @click.stop />

            <!-- Navigation arrows (only when multiple images) -->
            <template v-if="images.length > 1">
                <v-btn
                    icon="fa-solid fa-chevron-left"
                    size="large"
                    variant="text"
                    color="white"
                    class="lightbox-nav lightbox-prev"
                    :aria-label="$t('Previous')"
                    @click.stop="prev"
                />
                <v-btn
                    icon="fa-solid fa-chevron-right"
                    size="large"
                    variant="text"
                    color="white"
                    class="lightbox-nav lightbox-next"
                    :aria-label="$t('Next')"
                    @click.stop="next"
                />
                <div class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</div>
            </template>

            <v-btn
                icon="fa-solid fa-xmark"
                size="large"
                variant="text"
                color="white"
                class="lightbox-close"
                :aria-label="$t('Close')"
                @click="show = false"
            />
        </div>
    </v-dialog>
</template>

<script setup lang="ts">
import {computed, ref, watch, onMounted, onBeforeUnmount} from "vue"

const show = defineModel<boolean>({default: false})

const props = withDefaults(defineProps<{
    images?: string[]
    startIndex?: number
    // legacy single-image mode
    src?: string
}>(), {
    images: () => [],
    startIndex: 0,
    src: '',
})

const currentIndex = ref(0)

// Touch swipe tracking
let touchStartX = 0

const currentSrc = computed(() => {
    if (props.images.length > 0) {
        return props.images[currentIndex.value] ?? ''
    }
    return props.src
})

watch(() => props.startIndex, (val) => {
    currentIndex.value = val
})

watch(show, (val) => {
    if (val) currentIndex.value = props.startIndex
})

function prev() {
    if (props.images.length === 0) return
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
    if (props.images.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function onKeyDown(e: KeyboardEvent) {
    if (!show.value) return
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
    else if (e.key === 'Escape') show.value = false
}

function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 50) {
        if (delta < 0) next()
        else prev()
        e.preventDefault()
    }
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    min-width: 48px;
    min-height: 48px;
    z-index: 1;
}
.lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    min-width: 48px;
    min-height: 48px;
    z-index: 1;
}
.lightbox-prev { left: 16px; }
.lightbox-next { right: 16px; }
.lightbox-counter {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 14px;
    opacity: 0.7;
}
</style>
