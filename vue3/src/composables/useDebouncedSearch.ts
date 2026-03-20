import {ref, shallowRef, readonly, watch, onUnmounted, type Ref, type DeepReadonly, type ShallowRef} from 'vue'
import {useRouteQuery} from '@vueuse/router'
import {SEARCH_DEBOUNCE_MS} from '@/utils/utils'

export interface UseDebouncedSearchOptions {
    routeQueryKey?: string
    debounce?: number
    initialValue?: string
}

export interface UseDebouncedSearchReturn {
    inputValue: Ref<string>
    debouncedValue: DeepReadonly<Ref<string>>
    signal: Readonly<ShallowRef<AbortSignal>>
    abort: () => void
    flush: () => void
    reset: () => void
}

export function useDebouncedSearch(options: UseDebouncedSearchOptions = {}): UseDebouncedSearchReturn {
    const {
        routeQueryKey,
        debounce = SEARCH_DEBOUNCE_MS,
        initialValue = '',
    } = options

    // Route query ref (only created if routeQueryKey is set)
    const routeRef = routeQueryKey ? useRouteQuery(routeQueryKey, '') : null

    // The value users type into — always a plain ref for instant v-model updates
    const inputValue = ref(routeRef?.value ?? initialValue)

    // The debounced value that consumers use for API calls
    const debouncedValue = ref(inputValue.value)

    // AbortController management
    let controller = new AbortController()
    const signal = shallowRef(controller.signal)

    let timerId: ReturnType<typeof setTimeout> | null = null

    function cancelTimer() {
        if (timerId !== null) {
            clearTimeout(timerId)
            timerId = null
        }
    }

    function abortPrevious() {
        controller.abort()
        controller = new AbortController()
        signal.value = controller.signal
    }

    function applyDebouncedValue(value: string) {
        abortPrevious()
        debouncedValue.value = value
        if (routeRef) {
            routeRef.value = value
        }
    }

    // Watch inputValue — debounce before updating debouncedValue
    watch(inputValue, (newVal) => {
        if (newVal === debouncedValue.value) return
        cancelTimer()
        timerId = setTimeout(() => {
            applyDebouncedValue(newVal)
        }, debounce)
    })

    // Watch route changes (back/forward navigation) — sync immediately, no debounce
    if (routeRef) {
        watch(routeRef, (newRouteVal) => {
            const routeStr = newRouteVal ?? ''
            if (routeStr !== inputValue.value) {
                cancelTimer()
                inputValue.value = routeStr
                abortPrevious()
                debouncedValue.value = routeStr
                // Don't write back to routeRef — it already has this value
            }
        })
    }

    function flush() {
        cancelTimer()
        applyDebouncedValue(inputValue.value)
    }

    function reset() {
        cancelTimer()
        inputValue.value = ''
        abortPrevious()
        debouncedValue.value = ''
        if (routeRef) {
            routeRef.value = ''
        }
    }

    function abort() {
        abortPrevious()
    }

    onUnmounted(() => {
        cancelTimer()
        controller.abort()
    })

    return {
        inputValue,
        debouncedValue: readonly(debouncedValue),
        signal: readonly(signal) as Readonly<ShallowRef<AbortSignal>>,
        abort,
        flush,
        reset,
    }
}
