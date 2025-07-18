<template>
    <v-card-title class="pb-1 pt-1 pl-1 pr-1">
        <v-row no-gutters align="center">
            <v-col cols="10" md="11" class="text-truncate pt-0 pb-0 pl-2">
                <slot name="content">
                    <i :class="props.icon" v-if="props.icon != ''"></i>
                    {{ props.title }}
                    <v-card-subtitle class="pa-0" v-if="props.subTitle != ''">{{ props.subTitle }}</v-card-subtitle>
                </slot>
            </v-col>
            <v-col cols="2" md="1">
                <v-btn class="float-right pr-2" icon="$close" variant="plain" @click="model = false; emit('close')" v-if="!props.hideClose"></v-btn>
            </v-col>
        </v-row>
    </v-card-title>
</template>

<script setup lang="ts">
/**
 * Component used to render a VCardTitle with a "close" button that can either close the model bound dialog given via v-model or
 * emit a close event a parent dialog can listen to
 *
 * Should be used for all dialogs that have a "close" function (which likely all dialogs should have)
 */
const emit = defineEmits(['close'])

const props = defineProps({
    title: {type: String, default: ''},
    icon: {type: String, default: ''},
    subTitle: {type: String, default: ''},
    hideClose: {type: Boolean, default: false},
})

const model = defineModel<Boolean>()

</script>

<style scoped>

</style>