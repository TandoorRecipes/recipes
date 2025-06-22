<template>
    <v-alert :title="props.title" closable @click:close="closeAlert()" v-if="showAlert">
        <template #prepend>
            <v-icon icon="$help"></v-icon>
        </template>
        <p>
        {{ props.text}}
            <v-btn color="success" class="float-right" v-if="props.actionText" @click="emit('click')">{{ actionText}}</v-btn>
        </p>
    </v-alert>
</template>

<script setup lang="ts">

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {MessageType, useMessageStore} from "@/stores/MessageStore";
import {computed} from "vue";

// emit click if action is clicked, actual effect must come from parent component
const emit = defineEmits(['click'])

const props = defineProps({
    title: {type: String, required: false,},
    text: {type: String, required: true},

    // show an action button if any text is given and emit click event if button is pressed
    actionText: {type: String, required: false,},
})

/**
 * somewhat unique hash of the given text to save which alerts have already been closed
 */
const alertHash = computed(() => {
    return props.text.split('').reduce((prevHash, currVal) => (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0).toString()
})

/**
 * only show the alert if it hasn't been closed on that device before
 */
const showAlert = computed(() => {
    return !useUserPreferenceStore().deviceSettings.general_closedHelpAlerts.includes(alertHash.value)
})

/**
 * called when alert is closed to save this alert into the list of closed alerts
 */
function closeAlert() {
    if (!useUserPreferenceStore().deviceSettings.general_closedHelpAlerts.includes(alertHash.value)) {
        useUserPreferenceStore().deviceSettings.general_closedHelpAlerts.push(alertHash.value)
    } else {
        useMessageStore().addMessage(MessageType.ERROR, 'Trying to close already closed alert', 0, props.text)
    }
}

</script>

<style scoped>

</style>