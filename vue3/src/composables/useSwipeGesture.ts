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
/** Rubber-band resistance beyond button area (0–1, lower = more resistance) */
const RUBBER_BAND_FACTOR = 0.3
/** Fraction of viewport width the finger must travel before a full-swipe is armed */
const ARMED_RATIO = 0.55

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
    /** Reactive offset during active drag — drives transform re-renders */
    const swipingOffset = ref(0)
    const snappedId = ref<number | null>(null)
    const snappedOffset = ref(0)

    // --- Threshold flags (only change at crossings, not per-frame) ---
    const expandedFlag = ref(false)
    const armedFlag = ref(false)
    const directionFlag = ref<'left' | 'right' | null>(null)

    // --- Non-reactive bookkeeping ---
    let rawFingerOffset = 0
    let cachedViewportWidth = 0

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
        resetFlags()
    })

    function closeSnap() {
        snappedId.value = null
        snappedOffset.value = 0
    }

    function resetFlags() {
        expandedFlag.value = false
        armedFlag.value = false
        directionFlag.value = null
        rawFingerOffset = 0
    }

    function onTouchStart(e: TouchEvent, id: number) {
        if (!enabled.value) return

        cachedViewportWidth = window.innerWidth
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
        const finger = baseOffset + dx
        rawFingerOffset = finger

        // Clamp with rubber-band beyond button area
        const leftSnap = -(leftSlotCount.value * SLOT_WIDTH)
        const rightSnap = rightSlotCount.value * SLOT_WIDTH

        let display = finger
        if (display < leftSnap) {
            display = leftSnap + (display - leftSnap) * RUBBER_BAND_FACTOR
        } else if (display > rightSnap) {
            display = rightSnap + (display - rightSnap) * RUBBER_BAND_FACTOR
        }

        swipingId.value = id
        swipingOffset.value = display

        // Update flags only at threshold crossings to minimize reactive churn
        const newExpanded = display < leftSnap - 1 || display > rightSnap + 1
        if (newExpanded !== expandedFlag.value) expandedFlag.value = newExpanded

        const newArmed = Math.abs(finger) >= cachedViewportWidth * ARMED_RATIO
        if (newArmed !== armedFlag.value) armedFlag.value = newArmed

        const newDir: 'left' | 'right' | null = finger < 0 ? 'left' : finger > 0 ? 'right' : null
        if (newDir !== directionFlag.value) directionFlag.value = newDir
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
            resetFlags()
            return
        }

        const leftSnap = -(leftSlotCount.value * SLOT_WIDTH)
        const rightSnap = rightSlotCount.value * SLOT_WIDTH
        const armedDistance = cachedViewportWidth * ARMED_RATIO
        const finger = rawFingerOffset

        swipingId.value = null
        swipingOffset.value = 0
        resetFlags()

        // Full-swipe execute: only when finger has travelled past the armed threshold
        if (finger < -armedDistance && leftSlotCount.value > 0 && onFullSwipe) {
            closeSnap()
            onFullSwipe(id, 'left')
            return
        }
        if (finger > armedDistance && rightSlotCount.value > 0 && onFullSwipe) {
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

    /** True when the drag has passed the button area (visual expansion) */
    function isExpanded(id: number): boolean {
        return swipingId.value === id && expandedFlag.value
    }

    /** True when the drag has reached the commit threshold — releasing will execute */
    function isArmed(id: number): boolean {
        return swipingId.value === id && armedFlag.value
    }

    /** Returns the current swipe direction for the given item, or null if not swiping */
    function getSwipeDirection(id: number): 'left' | 'right' | null {
        return swipingId.value === id ? directionFlag.value : null
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
                resetFlags()
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
        resetFlags()
        closeSnap()
    }

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        getSwipeTransform,
        isSwiping,
        isExpanded,
        isArmed,
        getSwipeDirection,
        hasActiveSwipe,
        resetSwipe,
        resetAll,
    }
}
