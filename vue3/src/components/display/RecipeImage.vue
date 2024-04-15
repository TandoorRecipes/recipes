<template>
    <v-img :cover="cover" :style="{'height': height, 'width': width,}" :src="image" alt="Recipe Image"/>
</template>

<script setup lang="ts">

import {computed, PropType} from "vue";
import {Recipe, RecipeOverview} from "@/openapi";
import recipeDefaultImage from '../../assets/recipe_no_image.svg'

const props = defineProps({
    recipe: {type: {} as PropType<Recipe|RecipeOverview|undefined>, required: false, default: undefined},
    height: {type: String},
    width: {type: String},
    cover: {type: Boolean, default: true}
})

const image = computed(() => {
    if(props.recipe != undefined && props.recipe.image != undefined){
        return props.recipe.image
    } else {
        return recipeDefaultImage
    }
})

</script>

<style scoped>

</style>