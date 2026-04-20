<template>
    <v-col cols="12" md="6" lg="4">
        <v-card :prepend-icon="genericModel.model.icon" :title="$t(genericModel.model.localizationKey)" :subtitle="$t(genericModel.model.localizationKeyDescription)"
                :to="{name: 'ModelListPage', params: {model: genericModel.model.name}}"
                append-icon="fa-solid fa-arrow-right">
        </v-card>
    </v-col>
</template>

<script setup lang="ts">

import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models.ts";
import {onBeforeMount, PropType, ref, watch} from "vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    model: {
        type: String as PropType<EditorSupportedModels>,
        default: 'food'
    },
})

const genericModel = ref({} as GenericModel)

watch(() => props.model, (newValue, oldValue) => {
    if (newValue != oldValue) {
        genericModel.value = getGenericModelFromString(props.model, t)
    }
})

/**
 * select model class before mount because template renders before onMounted is called
 */
onBeforeMount(() => {
    try {
        genericModel.value = getGenericModelFromString(props.model, t)
    } catch (Error) {
        console.error('Invalid model passed to ModelListPage, loading Food instead')
        genericModel.value = getGenericModelFromString('Food', t)
    }
})

</script>


<style scoped>

</style>