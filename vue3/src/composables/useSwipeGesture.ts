/**
 * Composable for managing swipe gestures on list items.
 * Provides touch event handlers, transform styles, and snap-open/close logic.
 *
 * When a swipe snaps open, a document-level touchstart listener auto-closes it
 * on any tap outside the swipe action buttons (data-swipe-action attribute).
 *
 * Full-swipe: dragging past the button area into the execute zone triggers
 * the outermost action (onFullSwipe callback) instead of snapping open.
 */
import {type Ref, ref, watch, onScopeDispose} from 'vue'

export const SLOT_WIDTH = 64
const SWIPE_THRESHOLD = 64
const DIRECTION_LOCK_DISTANCE = 10
/** How far past the buttons before a full-swipe triggers */
const EXECUTE_EXTRA = 48
/** Rubber-band resistance beyond button area (0–1, lower = more resistance) */
const RUBBER_BAND_FACTOR = 0.3

interface SwipeState {
    startX: number
    startY: number
    direction: 'horizontal' | 'vertical' | null
}

export function useSwipeGesture(
    enabled: Ref<boolean>,
    leftSlotCount: Ref<number>,
    rightSlotCount: Ref<number>,
    onFullSwipe?: (id: number, direction: 'left' | 'right') => void,
) {
    const activeStates = new Map<number, SwipeState>()
    const swipingId = ref<number | null>(null)
    /** Reactive offset during active drag — drives template re-renders */
    const swipingOffset = ref(0)
    const snappedId = ref<number | null>(null)
    const snappedOffset = ref(0)

    // --- Document-level dismiss listener ---
    function onDocumentTouch(e: TouchEvent) {
        const target = e.target as HTMLElement
        if (target.closest?.('[data-swipe-action]')) return
        closeSnap()
    }

    function installDismissListener() {
        document.addEventListener('touchstart', onDocumentTouch, {capture: true})
    }

    function removeDismissListener() {
        document.removeEventListener('touchstart', onDocumentTouch, {capture: true})
    }

    watch(snappedId, (id) => {
        if (id !== null) {
            installDismissListener()
        } else {
            removeDismissListener()
        }
    })

    onScopeDispose(() => {
        removeDismissListener()
        activeStates.clear()
    })

    function closeSnap() {
        snappedId.value = null
        snappedOffset.value = 0
    }

    function onTouchStart(e: TouchEvent, id: number) {
        if (!enabled.value) return

        const touch = e.touches[0]!
        activeStates.set(id, {
            startX: touch.clientX,
            startY: touch.clientY,
            direction: null,
        })
    }

    function onTouchMove(e: TouchEvent, id: number) {
        if (!enabled.value) return
        const state = activeStates.get(id)
        if (!state) return

        const touch = e.touches[0]!
        const dx = touch.clientX - state.startX
        const dy = touch.clientY - state.startY

        if (state.direction === null) {
            const absDx = Math.abs(dx)
            const absDy = Math.abs(dy)
            if (absDx < DIRECTION_LOCK_DISTANCE && absDy < DIRECTION_LOCK_DISTANCE) return
            state.direction = absDx > absDy ? 'horizontal' : 'vertical'
        }

        if (state.direction === 'vertical') return

        // No preventDefault needed — touch-action:pan-y on the container
        // tells the browser to block horizontal scroll natively, allowing
        // all listeners to be passive.

        const baseOffset = snappedId.value === id ? snappedOffset.value : 0
        let raw = baseOffset + dx

        // Clamp with rubber-band beyond button area
        const leftSnap = -(leftSlotCount.value * SLOT_WIDTH)
        const rightSnap = rightSlotCount.value * SLOT_WIDTH

        if (raw < leftSnap) {
            raw = leftSnap + (raw - leftSnap) * RUBBER_BAND_FACTOR
        } else if (raw > rightSnap) {
            raw = rightSnap + (raw - rightSnap) * RUBBER_BAND_FACTOR
        }

        swipingId.value = id
        swipingOffset.value = raw
    }

    function onTouchEnd(_e: TouchEvent, id: number) {
        if (!enabled.value) return
        const state = activeStates.get(id)
        if (!state) return

        const offset = swipingId.value === id ? swipingOffset.value : 0
        activeStates.delete(id)

        if (state.direction !== 'horizontal') {
            swipingId.value = null
            swipingOffset.value = 0
            return
        }

        const leftSnap = -(leftSlotCount.value * SLOT_WIDTH)
        const rightSnap = rightSlotCount.value * SLOT_WIDTH
        const leftExecute = leftSnap - EXECUTE_EXTRA * RUBBER_BAND_FACTOR
        const rightExecute = rightSnap + EXECUTE_EXTRA * RUBBER_BAND_FACTOR

        swipingId.value = null
        swipingOffset.value = 0

        // Full-swipe execute: past the button area + threshold
        if (offset < leftExecute && leftSlotCount.value > 0 && onFullSwipe) {
            closeSnap()
            onFullSwipe(id, 'left')
            return
        }
        if (offset > rightExecute && rightSlotCount.value > 0 && onFullSwipe) {
            closeSnap()
            onFullSwipe(id, 'right')
            return
        }

        // Normal snap logic
        let snapTarget = 0
        if (offset < 0 && Math.abs(offset) >= SWIPE_THRESHOLD && leftSnap < 0) {
            snapTarget = leftSnap
        } else if (offset > 0 && offset >= SWIPE_THRESHOLD && rightSnap > 0) {
            snapTarget = rightSnap
        }

        if (snapTarget !== 0) {
            snappedId.value = id
            snappedOffset.value = snapTarget
        } else {
            closeSnap()
        }
    }

    /** True when the current drag has entered the full-swipe execute zone */
    function isFullSwipe(id: number): boolean {
        if (swipingId.value !== id) return false
        const offset = swipingOffset.value
        const leftExecute = -(leftSlotCount.value * SLOT_WIDTH) - EXECUTE_EXTRA * RUBBER_BAND_FACTOR
        const rightExecute = rightSlotCount.value * SLOT_WIDTH + EXECUTE_EXTRA * RUBBER_BAND_FACTOR
        return offset < leftExecute || offset > rightExecute
    }

    function getSwipeTransform(id: number): string {
        if (swipingId.value === id) {
            return `translateX(${swipingOffset.value}px)`
        }
        if (snappedId.value === id) {
            return `translateX(${snappedOffset.value}px)`
        }
        return 'translateX(0)'
    }

    function isSwiping(id: number): boolean {
        return swipingId.value === id
    }

    function hasActiveSwipe(id: number): boolean {
        return swipingId.value === id || snappedId.value === id
    }

    function resetSwipe(id?: number) {
        if (id !== undefined) {
            activeStates.delete(id)
            if (swipingId.value === id) {
                swipingId.value = null
                swipingOffset.value = 0
            }
            if (snappedId.value === id) {
                closeSnap()
            }
        } else {
            resetAll()
        }
    }

    function resetAll() {
        activeStates.clear()
        swipingId.value = null
        swipingOffset.value = 0
        closeSnap()
    }

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        getSwipeTransform,
        isSwiping,
        isFullSwipe,
        hasActiveSwipe,
        resetSwipe,
        resetAll,
    }
}
