<template>
    <v-alert density="compact" closable @click:close="closeAlert()" v-if="showAlert">
        <!-- Icon inline with the title so the body text below can use the full
             width of the alert instead of being indented under a prepend icon. -->
        <div v-if="props.title" class="d-flex align-center mb-1">
            <v-icon icon="$help" size="small" class="me-2"></v-icon>
            <span class="text-subtitle-2 font-weight-bold">{{ props.title }}</span>
        </div>
        <p>
        {{ props.text}}
            <v-btn color="success" class="float-right" v-if="props.actionText && !props.actionLink" @click="emit('click')">{{ actionText}}</v-btn>
            <v-btn v-if="props.actionLink" icon="$help" variant="plain" size="small" class="float-right" @click="emit('click')" :aria-label="props.actionText" />
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

    // when true, shows a subtle icon button instead of the success button
    actionLink: {type: Boolean, default: false},
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
/* v-alert lays out content and the close button in a flex row, so the close
 * reserves a right-hand column and the body text wraps short of the margin.
 * Float the close out of flow (top-right) so the text uses the full width. */
:deep(.v-alert__close) {
    position: absolute;
    top: 6px;
    inset-inline-end: 6px;
    margin: 0;
}
</style>