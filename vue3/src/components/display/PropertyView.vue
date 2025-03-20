<template>
{{hasFoodProperties}}
{{hasRecipeProperties}}
</template>

<script setup lang="ts">

import {computed, PropType} from "vue";
import {Recipe} from "@/openapi";

const props = defineProps({
    recipe: {type: {} as PropType<Recipe>, required: true}
})

const hasRecipeProperties = computed(() => {
    return props.recipe.properties != undefined && props.recipe.properties.length > 0
})

const hasFoodProperties = computed(() => {
    let propertiesFound = false
    for (const [key, fp] of Object.entries(props.recipe.foodProperties)) {
        if (fp.total_value !== 0) {
            propertiesFound = true
        }
    }
    return propertiesFound
})


</script>

<style scoped>

</style>