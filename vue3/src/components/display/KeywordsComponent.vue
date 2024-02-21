<template>

    <v-chip color="info" size="x-small" v-for="k in keywords"> {{ k?.label }}</v-chip>

</template>

<script lang="ts">

import {Keyword} from "@/openapi";
import {PropType} from "vue";

export default {
    name: 'KeywordsComponent',
    mixins: [],
    props: {
        keywords: Array as PropType<Array<Keyword>>,
    },
    computed: {},
    methods: {}
}
</script>
