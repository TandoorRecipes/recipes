<template>
    <v-dialog max-width="600" activator="parent" v-model="dialog">
        <access-token-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == SupportedModels.AccessToken"></access-token-editor>
        <invite-link-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == SupportedModels.InviteLink"></invite-link-editor>
        <user-space-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == SupportedModels.UserSpace"></user-space-editor>
    </v-dialog>
</template>

<script setup lang="ts">


import {PropType, ref} from "vue";
import AccessTokenEditor from "@/components/model_editors/AccessTokenEditor.vue";
import {AccessToken, Food} from "@/openapi";
import InviteLinkEditor from "@/components/model_editors/InviteLinkEditor.vue";
import UserSpaceEditor from "@/components/model_editors/UserSpaceEditor.vue";

enum SupportedModels {
    AccessToken = 'AccessToken',
    InviteLink = 'InviteLink',
    UserSpace = 'UserSpace',
}

const emit = defineEmits(['create', 'save', 'delete'])

const props = defineProps({
    model: {
        type: String,
        required: true,
    },
    item: {default: null},
    closeAfterCreate: {default: true},
    closeAfterSave: {default: true},
    closeAfterDelete: {default: true},
})

const dialog = ref(false)

function createEvent(arg) {
    emit('create', arg)
    dialog.value = dialog.value && !props.closeAfterCreate
}

function saveEvent(arg) {
    emit('save', arg)
    dialog.value = dialog.value && !props.closeAfterSave
}

function deleteEvent(arg) {
    emit('delete', arg)
    dialog.value = dialog.value && !props.closeAfterDelete
}

</script>

<style scoped>

</style>