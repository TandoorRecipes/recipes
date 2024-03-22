<template>
    <template v-if="keywords">
        <v-chip color="info" size="x-small" v-for="k in keywords"> {{ k.label }}</v-chip>
    </template>

</template>

<script lang="ts">

import {Keyword, KeywordLabel} from "@/openapi";
import {PropType} from "vue";

export default {
    name: 'KeywordsBar',
    mixins: [],
    props: {
        keywords: Array as PropType<Array<Keyword> | Array<KeywordLabel> | undefined>,
    },
    computed: {},
    methods: {}
}
</script>
