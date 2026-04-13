<template>
    <crop-image v-if="hasImage" class="cursor-pointer" role="button"
                :src="image"
                :crop-data="cropData"
                :width="width"
                :height="height"
                :rounded="rounded"
                :aria-label="$t('ViewFullImage')"
                @click="lightbox = true">
        <slot name="overlay" />
        <image-lightbox v-model="lightbox" :src="image" />
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
}>(), {
    recipe: undefined,
    height: undefined,
    width: undefined,
    cover: true,
    rounded: false,
})

const hasImage = computed(() => props.recipe?.image != null)

const image = computed(() => props.recipe?.image ?? '')

const placeholderImage = recipeDefaultImage

const cropData = computed(() => (props.recipe as any)?.imageCropData ?? null)

</script>
