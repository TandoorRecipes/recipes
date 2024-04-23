<template>
    <div v-if="props.keywords">
        <v-chip class="ms-1" :color="props.color" :size="props.size" :variant="props.variant" v-for="k in props.keywords"> {{ k.label }}</v-chip>
    </div>

</template>

<script setup lang="ts">

import {Keyword, KeywordLabel} from "@/openapi";
import {PropType} from "vue";

const props = defineProps({
    keywords: Array as PropType<Array<Keyword> | Array<KeywordLabel> | undefined>,
    size: {type: String, default: 'x-small'},
    color: {type: String, default: ''},
    variant: {type: String as PropType<NonNullable<"tonal" | "flat" | "text" | "elevated" | "outlined" | "plain"> | undefined>, default: 'tonal'},
})

</script>
