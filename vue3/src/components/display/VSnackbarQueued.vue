<template>
    <div>
        <v-snackbar
            v-model="showSnackbar"
            :timer="true"
            :timeout="visibleMessage.showTimeout"
            :color="visibleMessage.type"
            :vertical="showViewButton && props.vertical"
            :location="props.location"
            :close-on-back="false"
            :multi-line="showViewButton"
        >
<!--            <small>{{ DateTime.fromSeconds(visibleMessage.createdAt).toLocaleString(DateTime.DATETIME_MED) }}</small> <br/>-->
            <h3 v-if="visibleMessage.msg.title">{{ visibleMessage.msg.title }}</h3>
            <span  style="white-space: pre-wrap">{{ visibleMessage.msg.text }}</span>

            <template #actions v-if="showViewButton">

                <v-btn ref="ref_btn_view">{{$t('View')}}</v-btn>
                <v-btn variant="text" @click="removeItem()">
                    <span v-if="useMessageStore().snackbarQueue.length > 1">{{$t('Next')}} ({{ useMessageStore().snackbarQueue.length - 1 }})</span>
                    <span v-else>{{$t('Close')}}</span>
                </v-btn>
            </template>
            <template #actions v-else>
                <v-btn icon="$close" size="x-small" @click="removeItem()"></v-btn>
            </template>
        </v-snackbar>

        <message-list-dialog :activator="viewMessageDialogBtn"></message-list-dialog>
    </div>

</template>

<script setup lang="ts">
import {computed, ref, useTemplateRef} from 'vue'
import {Message, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import MessageListDialog from "@/components/dialogs/MessageListDialog.vue";

const props = defineProps({
    /**
     * passed to VSnackbar location prop https://vuetifyjs.com/en/api/v-snackbar/#props-location
     * Specifies the anchor point for positioning the component, using directional cues to align it either horizontally, vertically, or both…
     */
    location: {
        required: false,
        type: String,
        default: 'bottom'
    },
    /**
     * passed to VSnackbar vertical prop https://vuetifyjs.com/en/api/v-snackbar/#props-vertical
     * Stacks snackbar content on top of the actions (button).
     */
    vertical: {
        required: false,
        type: Boolean,
        default: false
    }
})

/**
 * determine the snackbar layout depending if data is given or not
 */
const showViewButton = computed(() => {
    if(Object.keys(visibleMessage.value).length > 0){
        return Object.keys(visibleMessage.value.data).length > 0
    }
    return false
})

// ref to open message list dialog
const viewMessageDialogBtn = useTemplateRef('ref_btn_view')
// ID of message timeout currently running
const timeoutId = ref(-1)
// currently visible message
const visibleMessage = ref({} as Message)
// visible state binding of snackbar
const showSnackbar = ref(false)

/**
 * subscribe to mutation of the snackbarQueue to detect new messages being added
 */
useMessageStore().$subscribe((mutation, state) => {
    if ('snackbarQueue' in state) {
        processQueue()
    }
})

/**
 * process snackbar queue
 * show oldest message for desired time and remove it afterwards
 */
function processQueue() {
    if (timeoutId.value == -1 && useMessageStore().snackbarQueue.length > 0) {
        visibleMessage.value = useMessageStore().snackbarQueue[0]
        showSnackbar.value = true
        timeoutId.value = setTimeout(() => {
            useMessageStore().snackbarQueue.shift()
            timeoutId.value = -1
            processQueue()
        }, visibleMessage.value.showTimeout + 50)
    }
}

/**
 * after item timeout has been reached remove it from the list
 * and restart processing the queue to check for new items
 */
function removeItem() {
    showSnackbar.value = false
    clearTimeout(timeoutId.value)
    timeoutId.value = -1
    useMessageStore().snackbarQueue.shift()
    processQueue()
}
</script>


<style scoped>

</style>