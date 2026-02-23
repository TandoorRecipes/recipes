import {ref, onMounted, onUnmounted} from 'vue'

/**
 * Detect touch-primary input device via CSS media query (W3C standard).
 * Cleans up the listener on unmount.
 */
export function useTouchDetect() {
    const hasTouchInput = ref(false)
    let mql: MediaQueryList | undefined

    function onChange(e: MediaQueryListEvent) {
        hasTouchInput.value = e.matches
    }

    onMounted(() => {
        mql = window.matchMedia('(pointer: coarse)')
        hasTouchInput.value = mql.matches
        mql.addEventListener('change', onChange)
    })

    onUnmounted(() => {
        mql?.removeEventListener('change', onChange)
    })

    return {hasTouchInput}
}
