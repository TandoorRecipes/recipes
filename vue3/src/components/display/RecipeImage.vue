<template>
    <crop-image v-if="hasImage" :class="{'cursor-pointer': !disableLightbox}" :role="disableLightbox ? undefined : 'button'"
                :src="image"
                :crop-data="cropData"
                :width="width"
                :height="height"
                :rounded="rounded"
                :aria-label="disableLightbox ? undefined : $t('ViewFullImage')"
                @click="onImageClick">
        <slot name="overlay" />
        <image-lightbox v-if="!disableLightbox" v-model="lightbox" :src="image" />
    </crop-image>
    <v-img v-else :style="{'height': height, 'width': width}" color="recipeImagePlaceholderBg"
           :src="placeholderImage" :alt="$t('Recipe_Image')" :rounded="props.rounded">
        <slot name="overlay" />
    </v-img>
</template>

<script setup lang="ts">

import {computed, ref} from "vue"
import {Recipe, RecipeOverview} from "@/openapi"
import recipeDefaultImage from '../../assets/recipe_no_image.svg'
import ImageLightbox from "@/components/display/ImageLightbox.vue"
import CropImage from "@/components/display/CropImage.vue"

const lightbox = ref(false)

const props = withDefaults(defineProps<{
    recipe?: Recipe | RecipeOverview
    height?: string
    width?: string
    cover?: boolean
    rounded?: boolean | string
    disableLightbox?: boolean
}>(), {
    recipe: undefined,
    height: undefined,
    width: undefined,
    cover: true,
    rounded: false,
    disableLightbox: false,
})

function onImageClick() {
    if (!props.disableLightbox) lightbox.value = true
}

const hasImage = computed(() => props.recipe?.image != null)

const image = computed(() => props.recipe?.image ?? '')

const placeholderImage = recipeDefaultImage

const cropData = computed(() => (props.recipe as any)?.imageCropData ?? null)

</script>
