<template>

    <v-dialog max-width="600" activator="parent" v-model="dialog">
        <v-card>
            <v-card-title>{{ $t('Delete') }}</v-card-title>
            <v-card-text>
                {{ $t('DeleteConfirmQuestion')}} <br/>
                <b>{{ modelName }}</b><br/>
                <b>{{ objectName }}</b>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialog=false">{{ $t('Cancel') }}</v-btn>
                <v-btn @click="emit('delete'); dialog=false" color="delete" prepend-icon="$delete">
                    {{ $t('Delete') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import {computed} from "vue";

const emit = defineEmits(['delete', 'update:modelValue'])

const props = defineProps({
    modelValue: {type: Boolean, default: false},
    objectName: {type: String, default: ''},
    modelName: {type: String, default: ''},
})

const dialog = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

</script>

<style scoped>

</style>
