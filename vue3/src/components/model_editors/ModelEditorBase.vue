<template>
    <v-card :loading="loading">
        <v-card-title>
            {{ modelName }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
            <v-card-subtitle class="pa-0">{{ objectName }}</v-card-subtitle>
        </v-card-title>
        <v-divider></v-divider>
        <slot name="default">

        </slot>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="delete" prepend-icon="$delete" v-if="isUpdate">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName" :model-name="modelName" @delete="emit('delete')"></delete-confirm-dialog>
            </v-btn>
            <v-btn color="save" prepend-icon="$save" @click="emit('save')">{{ isUpdate ? $t('Save') : $t('Create') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";

const emit = defineEmits(['save', 'delete', 'close'])

const props = defineProps({
    loading: {type: Boolean, default: false},
    dialog: {type: Boolean, default: false},
    objectName: {type: String, default: ''},
    modelName: {type: String, default: ''},
    isUpdate: {type: Boolean, default: false}
})

</script>


<style scoped>

</style>