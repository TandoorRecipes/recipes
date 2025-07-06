<template>

    <v-btn  ref="copyBtn" :color="color" :size="size" :density="density" @click="clickCopy()" :variant="variant">
        <slot name="default">
            <v-icon icon="$copy"></v-icon>
            <v-tooltip v-model="showToolip" :target="btn" location="top">
                <v-icon icon="$copy"></v-icon>
                {{$t('Copied')}}!
            </v-tooltip>
        </slot>
    </v-btn>

</template>

<script setup lang="ts">

import {useClipboard} from "@vueuse/core";
import {ref, useTemplateRef} from "vue";

const {copy} = useClipboard()

const props = defineProps({
    copyValue: {type: String, default: ''},
    color: {type: String, default: 'success'},
    size: {type: String, default: 'default'},
    density: {type: String, default: 'default'},
    variant: {type: String, default: 'elevated'},

})

const btn = useTemplateRef('copyBtn')
const showToolip = ref(false)

function clickCopy() {
    copy(props.copyValue)
    showToolip.value = true
    setTimeout(() => {
        showToolip.value = false
    }, 3000)
}

</script>


<style scoped>

</style>