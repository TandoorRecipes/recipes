<template>
    <v-card :loading="loading">
        <v-closable-card-title :title="$t(modelClass.model.localizationKey)" :sub-title="objectName" :icon="modelClass.model.icon" @close="emit('close');" :hide-close="!dialog"></v-closable-card-title>

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
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";

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