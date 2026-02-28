import {ref, type Ref} from 'vue'

let _hasTouchInput: Ref<boolean> | undefined

/**
 * Detect touch-primary input device via CSS media query (W3C standard).
 * Singleton — shared across all consumers, no cleanup needed.
 */
export function useTouchDetect() {
    if (!_hasTouchInput) {
        _hasTouchInput = ref(false)
        if (typeof window !== 'undefined') {
            const mql = window.matchMedia('(pointer: coarse)')
            _hasTouchInput.value = mql.matches
            mql.addEventListener('change', (e) => { _hasTouchInput!.value = e.matches })
        }
    }
    return {hasTouchInput: _hasTouchInput}
}
