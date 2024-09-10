<template>

    <v-dialog max-width="400" activator="parent" v-model="dialog">
        <v-card>
            <v-card-title>{{ $t('Delete') }}</v-card-title>
            <v-card-text>
                {{ $t('DeleteConfirmQuestion')}}
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

import {ref} from "vue";

const emit = defineEmits(['delete'])

const props = defineProps({
    objectName: {type: String, default: ''}
})

const dialog = ref(false)

</script>

<style scoped>

</style>