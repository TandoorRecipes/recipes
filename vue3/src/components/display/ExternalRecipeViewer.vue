<template>
    <v-card class="mt-1 h-100">
        <iframe width="100%" height="700px" :src="`${getDjangoUrl('/view-recipe-pdf/')}${props.recipe.id}/`" v-if="isPdf"></iframe>

        <v-img :src="`${getDjangoUrl('/api/get_recipe_file/')}${props.recipe.id}/`" v-if="isImage"></v-img>
    </v-card>
</template>

<script setup lang="ts">
import {computed, PropType} from "vue";
import {Recipe} from "@/openapi";
import {useDjangoUrls} from "@/composables/useDjangoUrls";


const props = defineProps({
    recipe: {type: {} as PropType<Recipe>, required: true}
})

const {getDjangoUrl} = useDjangoUrls()

/**
 * determines if the file is a PDF based on the path
 */
const isPdf = computed(() => {
    let filePath = props.recipe.filePath
    if (filePath) {
        return filePath.includes('.pdf')
    }
    return false
})

/**
 * determines if the file is an image based on the path
 */
const isImage = computed(() => {
    let filePath = props.recipe.filePath
    if (filePath) {
        return filePath.includes('.png') || filePath.includes('.jpg') || filePath.includes('.jpeg') || filePath.includes('.gif')
    }
    return false
})


</script>

<style scoped>

</style>