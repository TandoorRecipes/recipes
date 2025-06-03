<template>
    <v-col cols="12" md="6" lg="4">
        <v-card :prepend-icon="props.prependIcon" :title="props.title" :subtitle="props.subtitle" variant="outlined" elevation="1"
                :to="props.to"
                append-icon="fa-solid fa-arrow-right">
        </v-card>
    </v-col>
</template>

<script setup lang="ts">

import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models.ts";
import {onBeforeMount, PropType, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type { RouteLocationRaw } from 'vue-router';

const {t} = useI18n()

const props = defineProps({
    prependIcon: {type: String, default: ''},
    title: {type: String, default: ''},
    subtitle: {type: String, default: ''},
    to: {type: {} as PropType<RouteLocationRaw>  }
})


</script>


<style scoped>

</style>