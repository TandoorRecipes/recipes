<template>
    <div v-if="keywords">
        <v-chip class="ms-1" :color="color" :size="size" :variant="variant" v-for="k in keywords"> {{ k.label }}</v-chip>
    </div>

</template>

<script lang="ts">

import {Keyword, KeywordLabel} from "@/openapi";
import {PropType} from "vue";

export default {
    name: 'KeywordsBar',
    mixins: [],
    props: {
        keywords: Array as PropType<Array<Keyword> | Array<KeywordLabel> | undefined>,
        size: {type: String, default: 'x-small'},
        color: {type: String, default: ''},
        variant: {type: String as PropType<NonNullable<"tonal" | "flat" | "text" | "elevated" | "outlined" | "plain"> | undefined>, default: 'tonal'},
    },
    computed: {
    },
    methods: {}
}
</script>
