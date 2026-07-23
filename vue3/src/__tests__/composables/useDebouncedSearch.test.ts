import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'

// Mock @vueuse/router before importing the composable
vi.mock('@vueuse/router', () => ({
    useRouteQuery: vi.fn(() => ({ value: '' })),
}))

import { useDebouncedSearch } from '@/composables/useDebouncedSearch'

describe('useDebouncedSearch', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('initialization', () => {
        it('starts with empty values by default', () => {
            const { inputValue, debouncedValue } = useDebouncedSearch()
            expect(inputValue.value).toBe('')
            expect(debouncedValue.value).toBe('')
        })

        it('accepts initial value', () => {
            const { inputValue, debouncedValue } = useDebouncedSearch({ initialValue: 'hello' })
            expect(inputValue.value).toBe('hello')
            expect(debouncedValue.value).toBe('hello')
        })

        it('provides an AbortSignal', () => {
            const { signal } = useDebouncedSearch()
            expect(signal.value).toBeInstanceOf(AbortSignal)
            expect(signal.value.aborted).toBe(false)
        })
    })

    describe('debouncing', () => {
        it('does not update debouncedValue immediately', async () => {
            const { inputValue, debouncedValue } = useDebouncedSearch({ debounce: 300 })

            inputValue.value = 'test'
            await nextTick()

            expect(debouncedValue.value).toBe('')
        })

        it('updates debouncedValue after debounce delay', async () => {
            const { inputValue, debouncedValue } = useDebouncedSearch({ debounce: 300 })

            inputValue.value = 'test'
            await nextTick()

            vi.advanceTimersByTime(300)
            await nextTick()

            expect(debouncedValue.value).toBe('test')
        })

        it('resets timer on rapid input changes', async () => {
            const { inputValue, debouncedValue } = useDebouncedSearch({ debounce: 300 })

            inputValue.value = 'a'
            await nextTick()
            vi.advanceTimersByTime(200)

            inputValue.value = 'ab'
            await nextTick()
            vi.advanceTimersByTime(200)

            // 400ms total but only 200ms since last change
            expect(debouncedValue.value).toBe('')

            vi.advanceTimersByTime(100)
            await nextTick()

            expect(debouncedValue.value).toBe('ab')
        })
    })

    describe('abort', () => {
        it('aborts the current signal', () => {
            const { signal, abort } = useDebouncedSearch()

            const originalSignal = signal.value
            abort()

            expect(originalSignal.aborted).toBe(true)
        })

        it('provides a new signal after abort', () => {
            const { signal, abort } = useDebouncedSearch()

            const originalSignal = signal.value
            abort()

            expect(signal.value).not.toBe(originalSignal)
            expect(signal.value.aborted).toBe(false)
        })
    })

    describe('flush', () => {
        it('immediately applies the current input value', async () => {
            const { inputValue, debouncedValue, flush } = useDebouncedSearch({ debounce: 300 })

            inputValue.value = 'flushed'
            await nextTick()

            flush()

            expect(debouncedValue.value).toBe('flushed')
        })

        it('aborts previous signal on flush', async () => {
            const { inputValue, signal, flush } = useDebouncedSearch({ debounce: 300 })

            const originalSignal = signal.value
            inputValue.value = 'test'
            await nextTick()
            flush()

            expect(originalSignal.aborted).toBe(true)
        })
    })

    describe('reset', () => {
        it('clears input and debounced values', async () => {
            const { inputValue, debouncedValue, reset } = useDebouncedSearch({ initialValue: 'hello' })

            reset()

            expect(inputValue.value).toBe('')
            expect(debouncedValue.value).toBe('')
        })

        it('aborts signal on reset', () => {
            const { signal, reset } = useDebouncedSearch()

            const originalSignal = signal.value
            reset()

            expect(originalSignal.aborted).toBe(true)
        })
    })
})
