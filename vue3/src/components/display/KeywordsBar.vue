<template>
    <div v-if="props.keywords">
        <slot name="prepend"></slot>

        <v-chip class="me-1 mb-1" :label="props.label" :color="props.color" :size="props.size" :variant="props.variant" v-for="k in keywords"
                :to="useUserPreferenceStore().isAuthenticated ? {name: 'SearchPage', query: {keywords: k.id}} : undefined"> {{ k.label }}
        </v-chip>

        <slot name="append"></slot>
    </div>

</template>

<script setup lang="ts">

import {Keyword, KeywordLabel} from "@/openapi";
import {computed, PropType} from "vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const props = defineProps({
    keywords: Array as PropType<Array<Keyword> | Array<KeywordLabel> | undefined>,
    size: {type: String, default: 'x-small'},
    color: {type: String, default: ''},
    variant: {type: String as PropType<NonNullable<"tonal" | "flat" | "text" | "elevated" | "outlined" | "plain"> | undefined>, default: 'tonal'},
    label: {type: Boolean, default: true},
    // maximum number of keywords, 0 for all
    maxKeywords: {type: Number, default: 0},
})

const keywords = computed(() => {
    if (props.maxKeywords > 0) {
        return props.keywords?.slice(0, props.maxKeywords)
    } else {
        return props.keywords
    }
})

</script>
