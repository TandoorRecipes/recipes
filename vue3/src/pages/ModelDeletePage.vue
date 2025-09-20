<template>
    {{ props.model }}
    {{ props.id }}
    {{ editingObj }}

    {{ protectingObjects }}
</template>

<script setup lang="ts">

import {onBeforeMount, onMounted, PropType, ref, watch} from "vue";
import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models.ts";
import {useTitle} from "@vueuse/core";
import {useI18n} from "vue-i18n";
import {ApiApi} from "@/openapi";

const title = useTitle()
const {t} = useI18n()

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    id: {type: String, required: true},
})

const genericModel = ref({} as GenericModel)
const editingObj = ref({} as EditorSupportedModels)

const protectingObjects = ref([] as GenericModel[])

/**
 * select model class before mount because template renders (and requests item load) before onMounted is called
 */
onBeforeMount(() => {
    try {
        genericModel.value = getGenericModelFromString(props.model, t)
    } catch (Error) {
        console.error('Invalid model passed to ModelListPage, loading Food instead')
        genericModel.value = getGenericModelFromString('Food', t)
    }

    title.value = t(genericModel.value.model.localizationKey)
})

onMounted(() => {
    loadObject()

    loadProtected()
})

function loadObject() {
    genericModel.value.retrieve(Number(props.id!)).then(obj => {
        editingObj.value = obj
    })
}

function loadProtected() {
    let api = new ApiApi()

    api.apiUnitProtectingList({id: props.id}).then(r => {
        protectingObjects.value = r.results
    })
}

</script>

<style scoped>

</style>