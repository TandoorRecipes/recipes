<template>

    <v-expansion-panels v-model="panelState">
        <v-expansion-panel value="show">
            <v-expansion-panel-title>{{ $t('ExternalRecipe') }}</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-card class="mt-1 h-100">
                    <iframe width="100%" height="700px" :src="externalUrl" v-if="isPdf"></iframe>
                    <v-img :src="externalUrl" v-if="isImage"></v-img>
                </v-card>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup lang="ts">
import {computed, onMounted, PropType, ref} from "vue";
import {Recipe} from "@/openapi";
import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {useUrlSearchParams} from "@vueuse/core";

const props = defineProps({
    recipe: {type: {} as PropType<Recipe>, required: true}
})

const params = useUrlSearchParams('history')
const {getDjangoUrl} = useDjangoUrls()

const panelState = ref('')

onMounted(() => {
    // open panel by default if recipe has not been converted to internal yet or if it does not have any steps
    if (!props.recipe.internal || props.recipe.steps.length == 0) {
        panelState.value = 'show'
    }
})

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