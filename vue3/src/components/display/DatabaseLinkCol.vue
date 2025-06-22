<template>
    <v-col :cols="props.cols" :md="props.md" :lg="props.lg">
        <v-card :prepend-icon="props.prependIcon" :title="props.title" :subtitle="props.subtitle"
                :to="props.to" :link="isLink" :href="props.href"
                append-icon="fa-solid fa-arrow-right">
        </v-card>
    </v-col>
</template>

<script setup lang="ts">

import {computed, onBeforeMount, PropType, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type { RouteLocationRaw } from 'vue-router';

const {t} = useI18n()

const props = defineProps({
    prependIcon: {type: String, default: ''},
    title: {type: String, default: ''},
    subtitle: {type: String, default: ''},
    to: {type: {} as PropType<RouteLocationRaw>  },
    href: {type: String, default: ''},
    cols: {type: Number, default: 12 },
    md: {type: Number, default: 6 },
    lg: {type: Number, default: 4 },
})


const isLink = computed(() => {
    return props.href != '' || props.to != undefined
})

</script>


<style scoped>

</style>