<template>
    <v-chip color="info" size="x-small" v-for="k in keywords"> {{ k?.label }} </v-chip>
</template>

<script lang="ts">

import {Keyword} from "@/openapi";

export default {
    name: 'KeywordsComponent',
    mixins: [],
    props: {
        keywords: [] as Keyword[],
    },
    computed: {

    },
    methods: {

    }
}
</script>
