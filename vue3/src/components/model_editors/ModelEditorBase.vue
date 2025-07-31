<template>
    <v-card :loading="loading">
        <v-closable-card-title
            :sub-title="$t(modelClass.model.localizationKey) + ((isChanged) ? ` (${$t('unsaved')})` : '')"
            :title="objectName"
            :icon="modelClass.model.icon"
            @close="closeDialog()"
            :hide-close="!dialog"
        ></v-closable-card-title>

        <v-divider></v-divider>
        <slot name="default">

        </slot>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="delete" prepend-icon="$delete" v-if="isUpdate && !modelClass.model.disableDelete" :disabled="loading">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName" :model-name="$t(modelClass.model.localizationKey)" @delete="emit('delete')"></delete-confirm-dialog>
            </v-btn>
            <v-btn color="save" prepend-icon="$create" @click="emit('save')" v-if="!isUpdate && !modelClass.model.disableCreate" :loading="loading">{{ $t('Create') }}</v-btn>
            <v-btn color="save" prepend-icon="$save" @click="emit('save')" v-if="isUpdate && !modelClass.model.disableUpdate" :loading="loading"> {{ $t('Save') }}</v-btn>
        </v-card-actions>
    </v-card>

    <v-dialog width="600px" v-model="leaveConfirmDialog">
        <v-card>
            <v-closable-card-title v-model="leaveConfirmDialog" :title="$t('Confirm')"></v-closable-card-title>
            <v-card-text>
                {{ $t('WarnPageLeave') }}
            </v-card-text>
            <v-card-actions>
                <v-btn @click="leaveConfirmDialog = false; leaveGoTo = null">{{ $t('Cancel') }}</v-btn>
                <v-btn :to="leaveGoTo" color="warning" v-if="!dialog">{{ $t('Confirm') }}</v-btn>
                <v-btn @click="emit('close')" color="warning" v-if="dialog">{{ $t('Confirm') }}</v-btn>
            </v-card-actions>
        </v-card>

    </v-dialog>
</template>

<script setup lang="ts">

import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {GenericModel} from "@/types/Models";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {onBeforeRouteLeave, RouteLocationNormalized} from "vue-router";
import {onBeforeUnmount, onMounted, ref} from "vue";

const emit = defineEmits(['save', 'delete', 'close'])

const props = defineProps({
    loading: {type: Boolean, default: false},
    dialog: {type: Boolean, default: false},
    objectName: {type: String, default: ''},
    modelClass: {type: GenericModel, default: null},
    isUpdate: {type: Boolean, default: false},
    isChanged: {type: Boolean, default: false},
})

const leaveConfirmDialog = ref(false)
const leaveGoTo = ref<RouteLocationNormalized | null>(null)

onMounted(() => {
    window.addEventListener("keydown", keyEvent)
})

onBeforeUnmount(() => {
    window.removeEventListener("keydown", keyEvent)
})

/**
 * before navigating to another page check for unsaved changes, if so display confirmation dialog
 */
onBeforeRouteLeave((to, from) => {
    if (props.isChanged && !leaveConfirmDialog.value) {
        leaveConfirmDialog.value = true
        leaveGoTo.value = to
        return false
    }
    return true
})

/**
 * if object was changed open leave confirm dialog, if not emit close for parent to close dialog
 * does not trigger when user clicks outside of dialog
 */
function closeDialog() {
    if (props.isChanged && !leaveConfirmDialog.value) {
        leaveConfirmDialog.value = true
    } else {
        emit('close');
    }
}

/**
 * add hotkey functionality to model editor
 * @param e
 */
function keyEvent(e: KeyboardEvent) {
    if (e.code === "KeyS" && e.ctrlKey) {
        e.preventDefault()
        emit('save')
    }
}

</script>


<style scoped>

</style>