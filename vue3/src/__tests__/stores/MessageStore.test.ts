import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useMessageStore, MessageType, ErrorMessageType, PreparedMessage, Message } from '@/stores/MessageStore'

// MessageStore uses useI18n() which requires an i18n instance
// Install a minimal one before each test
const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: {} },
})

// Provide the i18n instance globally so useI18n() works outside components
vi.mock('vue-i18n', async () => {
    const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
    return {
        ...actual,
        useI18n: () => ({
            t: (key: string) => key,
        }),
    }
})

describe('MessageStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('starts with empty messages', () => {
        const store = useMessageStore()
        // localStorage may carry over; deleteAll to reset
        store.deleteAllMessages()
        expect(store.messages.length).toBe(0)
    })

    describe('addMessage', () => {
        it('adds a message to the store', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addMessage(MessageType.INFO, 'test message')

            expect(store.messages.length).toBe(1)
            expect(store.messages[0].type).toBe(MessageType.INFO)
            expect(store.messages[0].msg.text).toBe('test message')
        })

        it('adds to snackbar queue when showTimeout > 0', () => {
            const store = useMessageStore()

            store.addMessage(MessageType.SUCCESS, 'visible', 3000)

            expect(store.snackbarQueue.length).toBe(1)
        })

        it('does not add to snackbar queue when showTimeout is 0', () => {
            const store = useMessageStore()

            store.addMessage(MessageType.INFO, 'silent', 0)

            expect(store.snackbarQueue.length).toBe(0)
        })

        it('accepts structured messages', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addMessage(MessageType.WARNING, { title: 'Warning', text: 'details here' })

            expect(store.messages[0].msg.title).toBe('Warning')
            expect(store.messages[0].msg.text).toBe('details here')
        })
    })

    describe('addError', () => {
        it('adds an error message with title from error type', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addError(ErrorMessageType.FETCH_ERROR)

            expect(store.messages.length).toBe(1)
            expect(store.messages[0].type).toBe(MessageType.ERROR)
        })

        it('accepts string error types', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addError('CUSTOM_ERROR', { some: 'data' })

            expect(store.messages.length).toBe(1)
        })
    })

    describe('addPreparedMessage', () => {
        it('adds UPDATE_SUCCESS message', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)

            expect(store.messages.length).toBe(1)
            expect(store.messages[0].type).toBe(MessageType.SUCCESS)
        })

        it('adds DELETE_SUCCESS message', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addPreparedMessage(PreparedMessage.DELETE_SUCCESS)

            expect(store.messages.length).toBe(1)
        })

        it('adds NOT_FOUND as warning', () => {
            const store = useMessageStore()
            store.deleteAllMessages()

            store.addPreparedMessage(PreparedMessage.NOT_FOUND)

            expect(store.messages[0].type).toBe(MessageType.WARNING)
        })
    })

    describe('deleteAllMessages', () => {
        it('clears all messages', () => {
            const store = useMessageStore()
            store.addMessage(MessageType.INFO, 'msg1')
            store.addMessage(MessageType.INFO, 'msg2')

            store.deleteAllMessages()

            expect(store.messages.length).toBe(0)
        })
    })

    describe('Message class', () => {
        it('sets createdAt timestamp', () => {
            const msg = new Message(MessageType.INFO, 'test')
            expect(msg.createdAt).toBeGreaterThan(0)
        })

        it('converts string to structured message', () => {
            const msg = new Message(MessageType.INFO, 'hello')
            expect(msg.msg.title).toBe('')
            expect(msg.msg.text).toBe('hello')
        })

        it('defaults showTimeout to 0', () => {
            const msg = new Message(MessageType.INFO, 'test')
            expect(msg.showTimeout).toBe(0)
        })
    })
})
