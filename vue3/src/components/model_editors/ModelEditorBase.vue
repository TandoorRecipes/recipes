<template>
    <v-card :loading="loading">
        <v-card-title>
            <i :class="modelClass.model.icon"></i> {{ $t(modelClass.model.localizationKey) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
            <v-card-subtitle class="pa-0">{{ objectName }}</v-card-subtitle>
        </v-card-title>
        <v-divider></v-divider>
        <slot name="default">

        </slot>
        <v-divider></v-divider>
        <v-card-actions >
            <v-btn color="delete" prepend-icon="$delete" v-if="isUpdate && !modelClass.model.disableDelete" :disabled="loading">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName" :model-name="$t(modelClass.model.localizationKey)" @delete="emit('delete')"></delete-confirm-dialog>
            </v-btn>
            <v-btn color="save" prepend-icon="$create" @click="emit('save')" v-if="!isUpdate && !modelClass.model.disableCreate" :disabled="loading">{{ $t('Create') }}</v-btn>
            <v-btn color="save" prepend-icon="$save" @click="emit('save')" v-if="isUpdate && !modelClass.model.disableUpdate" :disabled="loading">{{ $t('Save') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {GenericModel} from "@/types/Models";

const emit = defineEmits(['save', 'delete', 'close'])

const props = defineProps({
    loading: {type: Boolean, default: false},
    dialog: {type: Boolean, default: false},
    objectName: {type: String, default: ''},
    modelClass: {type: GenericModel, default: null},
    isUpdate: {type: Boolean, default: false}
})

</script>


<style scoped>

</style>