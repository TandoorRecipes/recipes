<template>
    <v-card class="mt-1 h-100">
        <iframe width="100%" height="700px" :src="externalUrl" v-if="isPdf"></iframe>

        <v-img :src="externalUrl" v-if="isImage"></v-img>
    </v-card>
</template>

<script setup lang="ts">
import {computed, PropType} from "vue";
import {Recipe} from "@/openapi";
import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {useUrlSearchParams} from "@vueuse/core";


const props = defineProps({
    recipe: {type: {} as PropType<Recipe>, required: true}
})

const params = useUrlSearchParams('history')
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

const externalUrl = computed(() => {
    let url = ''
    if (isImage.value) {
        url = `${getDjangoUrl('/api/get_recipe_file/')}${props.recipe.id}/`
    } else if (isPdf.value) {
        url = `${getDjangoUrl('/view-recipe-pdf/')}${props.recipe.id}/`
    }

    if (params.share && typeof params.share == "string") {
        url += `?share=${params.share}`
    }

    return url
})


</script>

<style scoped>

</style>