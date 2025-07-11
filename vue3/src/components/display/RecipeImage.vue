<template>
    <v-img :cover="cover" :style="{'height': height, 'width': width,}" color="recipeImagePlaceholderBg" :src="image" :alt="$t('Recipe_Image')" :rounded="props.rounded">
        <slot name="overlay">

        </slot>
    </v-img>
</template>

<script setup lang="ts">

import {computed, PropType, watch} from "vue";
import {Recipe, RecipeOverview} from "@/openapi";
import recipeDefaultImage from '../../assets/recipe_no_image.svg'

const props = defineProps({
    recipe: {type: {} as PropType<Recipe | RecipeOverview | undefined>, required: false, default: undefined},
    height: {type: String},
    width: {type: String},
    cover: {type: Boolean, default: true},
    rounded: {type: [Boolean, String], default: false},
})

const image = computed(() => {

    if (props.recipe != undefined && props.recipe.image != undefined) {
        return props.recipe.image
    } else {
        return recipeDefaultImage
    }
})

</script>

<style scoped>

</style>