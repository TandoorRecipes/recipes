import {acceptHMRUpdate, defineStore} from 'pinia'
import {ref} from "vue";
import {useStorage} from "@vueuse/core";
import {DateTime} from "luxon";
import {ResponseError} from "@/openapi";
import {useI18n} from "vue-i18n";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

/** @enum {string} different message types */
export enum MessageType {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
    SUCCESS = 'success',
}

/** @enum {string} pre defined error messages */
export enum ErrorMessageType {
    FETCH_ERROR = 'FETCH_ERROR',
    UPDATE_ERROR = 'UPDATE_ERROR',
    DELETE_ERROR = 'DELETE_ERROR',
    CREATE_ERROR = 'CREATE_ERROR',
}

/** @enum {MessageType} prepared messages */
export enum PreparedMessage {
    UPDATE_SUCCESS = 'UPDATE_SUCCESS',
    CREATE_SUCCESS = 'CREATE_SUCCESS',
    DELETE_SUCCESS = 'DELETE_SUCCESS',
    MERGE_SUCCESS = 'MERGE_SUCCESS',
    MOVE_SUCCESS = 'MOVE_SUCCESS',
    NOT_FOUND = 'NOT_FOUND',
    RATE_LIMIT = 'RATE_LIMIT',
}

/**
 * structured message type
 */
export interface StructuredMessage {
    title: string
    text: string
}

/**
 * Type Message holding all required contents of a message
 */
export class Message {
    type = {} as MessageType
    createdAt = -1
    showTimeout = 0
    msg = {} as StructuredMessage
    data = {} as any
    code = ''

    constructor(type: MessageType, msg: string | StructuredMessage, showTimeout?: number, data?: any) {
        if (typeof showTimeout === 'undefined') {
            showTimeout = 0
        }
        if (typeof data === 'undefined') {
            data = {}
        }
        if (typeof msg === 'string') {
            msg = {title: '', text: msg} as StructuredMessage
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

    const {t} = useI18n()

    /**
     * Add a message to the message store. If showTimeout is greater than 0 it is also added to the display queue.
     * @param {MessageType} type  type of message
     * @param {String|StructuredMessage} msg message text or structured message
     * @param {number} showTimeout optional number of ms to show message to user, set to 0 or leave undefined for silent message
     * @param {string} data optional additional data only shown in log
     */
    function addMessage(type: MessageType, msg: string | StructuredMessage, showTimeout?: number, data?: any) {
        if (typeof msg == 'string') {
            msg = {title: '', text: msg} as StructuredMessage
        }
        let message = new Message(type, msg, showTimeout, data)

        messages.value.push(message)
        if (message.showTimeout > 0) {
            snackbarQueue.value.push(message)
        }
    }

    /**
     * shorthand function to quickly add an error message
     * automatically show additional information when given supported error types (e.g. ResponseError)
     * @param errorType pre defined error type
     * @param data optional error data
     */
    function addError(errorType: ErrorMessageType | string, data?: any) {
        if (data instanceof ResponseError) {
            let messageText = ""
            messageText += `URL: ${data.response.url} \n\nErrors:\n`
            try {
                data.response.json().then(responseJson => {
                    let flatResponseJson = flattenObject(responseJson)
                    for (let key in flatResponseJson) {
                        messageText += `    - ${key}: ${flatResponseJson[key]}\n`
                    }
                    addMessage(MessageType.ERROR, {
                        title: `${t(errorType)} - ${data.response.statusText} (${data.response.status})`,
                        text: messageText
                    } as StructuredMessage, 5000 + Object.keys(responseJson).length * 1500, responseJson)
                }).catch(() => {
                    // if response does not contain parsable JSON or parsing fails for some other reason show generic error
                    addMessage(MessageType.ERROR, {title: t(errorType), text: ''} as StructuredMessage, 7000, data)
                })
            } catch (e) {
                addMessage(MessageType.ERROR, {title: t(errorType), text: ''} as StructuredMessage, 7000, data)
            }
        } else {
            addMessage(MessageType.ERROR, {title: t(errorType), text: ''} as StructuredMessage, 7000, data)
        }
    }

    /**
     * shorthand function to quickly add a message
     * @param preparedMessage pre defined message
     * @param data optional data to log along with the message
     */
    function addPreparedMessage(preparedMessage: PreparedMessage, data?: any) {
        if (preparedMessage == PreparedMessage.UPDATE_SUCCESS) {
            addMessage(MessageType.SUCCESS, {title: t('Updated'), text: ''} as StructuredMessage, 1500, data)
        }
        if (preparedMessage == PreparedMessage.DELETE_SUCCESS) {
            addMessage(MessageType.SUCCESS, {title: t('Deleted'), text: ''} as StructuredMessage, 1500, data)
        }
        if (preparedMessage == PreparedMessage.CREATE_SUCCESS) {
            addMessage(MessageType.SUCCESS, {title: t('Created'), text: ''} as StructuredMessage, 1500, data)
        }
        if (preparedMessage == PreparedMessage.MERGE_SUCCESS) {
            addMessage(MessageType.SUCCESS, {title: t('Merge'), text: ''} as StructuredMessage, 1500, data)
        }
        if (preparedMessage == PreparedMessage.MOVE_SUCCESS) {
            addMessage(MessageType.SUCCESS, {title: t('Move'), text: ''} as StructuredMessage, 1500, data)
        }
        if (preparedMessage == PreparedMessage.NOT_FOUND) {
            addMessage(MessageType.WARNING, {title: t('NotFound'), text: t('NotFoundHelp')} as StructuredMessage, 6000, data)
        }

        if (preparedMessage == PreparedMessage.RATE_LIMIT) {
            data.response.json().then(responseJson => {
                addMessage(MessageType.WARNING, {title: t(''), text: t('RateLimitHelp') + '\n' + responseJson.detail} as StructuredMessage, 6000, data)
            }).catch(() => {
                addMessage(MessageType.WARNING, {title: t(''), text: t('RateLimitHelp')} as StructuredMessage, 6000, data)
            })
        }
    }

    /**
     * recursively flatten any multi level object to a flat object with previously nested keys seperated by dots
     * @param obj object to flatten
     * @param keyPrefix key prefix for recursive calls to build structure
     */
    function flattenObject(obj: any, keyPrefix = '') {
        return Object.keys(obj).reduce((acc, key) => {
            if (typeof obj[key] === 'object') {
                Object.assign(acc, flattenObject(obj[key], (keyPrefix.length ? keyPrefix + '.' : '') + key))
            } else {
                acc[keyPrefix] = obj[key]
            }
            return acc;
        }, {});
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