import {acceptHMRUpdate, defineStore} from 'pinia'
import {ref} from "vue";
import {useStorage} from "@vueuse/core";
import {DateTime} from "luxon";

/** @enum {string} different message types */
export enum MessageType {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
    SUCCESS = 'success',
}

/** @enum {string} pre defined error messages */
export enum ErrorMessageType {
    FETCH_ERROR = 'Fetch Error',
    UPDATE_ERROR = 'Update Error',
    CREATE_ERROR = 'Update Error',
    DELETE_ERROR = 'Update Error',
}

/** @enum {MessageType} prepared messages */
export enum PreparedMessage {
    UPDATE_SUCCESS = 'UPDATE_SUCCESS',
    CREATE_SUCCESS = 'CREATE_SUCCESS',
    DELETE_SUCCESS = 'DELETE_SUCCESS',
}

/**
 * Type Message holding all required contents of a message
 */
export class Message {
    type = {} as MessageType
    createdAt = -1
    showTimeout = 0
    msg = ""
    data = {} as any
    code = ''

    constructor(type: MessageType, msg: string, showTimeout?: number, data?: any) {
        if (typeof showTimeout === 'undefined') {
            showTimeout = 0
        }
        if (typeof data === 'undefined') {
            data = {}
        }

        this.type = type
        this.msg = msg
        this.showTimeout = showTimeout
        this.data = data
        this.createdAt = DateTime.now().toSeconds()
    }

    toString() {
        return {'type': this.type, 'createdAt': this.createdAt, 'msg': this.msg, 'data': this.data}
    }
}

export const useMessageStore = defineStore('message_store', () => {
    let messages = useStorage('LOCAL_MESSAGES', [] as Message[])
    let snackbarQueue = ref([] as Message[])

    /**
     * Add a message to the message store. If showTimeout is greater than 0 it is also added to the display queue.
     * @param {MessageType} type  type of message
     * @param {String} msg message text
     * @param {number} showTimeout optional number of ms to show message to user, set to 0 or leave undefined for silent message
     * @param {string} data optional additional data only shown in log
     */
    function addMessage(type: MessageType, msg: string, showTimeout?: number, data?: any) {
        let message = new Message(type, msg, showTimeout, data)

        messages.value.push(message)
        if (message.showTimeout > 0) {
            snackbarQueue.value.push(message)
        }
    }

    /**
     * shorthand function to quickly add an error message
     * @param errorType pre defined error type
     * @param data optional error data
     */
    function addError(errorType: ErrorMessageType | string, data?: any) {
        addMessage(MessageType.ERROR, errorType, 7000, data)
    }

    /**
     * shorthand function to quickly add a message
     * @param preparedMessage pre defined message
     */
    function addPreparedMessage(preparedMessage: PreparedMessage) {
        if (preparedMessage == PreparedMessage.UPDATE_SUCCESS) {
            addMessage(MessageType.SUCCESS, 'Updated Successfully', 7000, {}) // TODO localize and make more useful ?
            addMessage(MessageType.SUCCESS, 'Created Successfully', 7000, {})
            addMessage(MessageType.SUCCESS, 'Deleted Successfully', 7000, {})
        }
    }

    /**
     * delete all messages from store
     */
    function deleteAllMessages() {
        messages.value = [] as Message[]
    }

    return {snackbarQueue, messages, addMessage, addError, addPreparedMessage, deleteAllMessages}
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMessageStore, import.meta.hot))
}