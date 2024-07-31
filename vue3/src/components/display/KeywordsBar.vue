<template>
    <div v-if="props.keywords">
        <slot name="prepend"></slot>

        <v-chip class="me-1 mb-1" :label="props.label" :color="props.color" :size="props.size" :variant="props.variant" v-for="k in props.keywords"> {{ k.label }}</v-chip>

        <slot name="append"></slot>
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
    label: {type: Boolean, default: true}
})

</script>
