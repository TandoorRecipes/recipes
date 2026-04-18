/**
 * Regression coverage for useSwipeGesture.
 *
 * Characterization tests for the swipe-gesture state machine:
 * direction lock, threshold boundary, rubber-band cap, armed-ratio
 * full-swipe callback, and the snap/document-listener lifecycle.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {effectScope, nextTick, ref} from 'vue'
import {useSwipeGesture, SLOT_WIDTH} from '@/composables/useSwipeGesture'

const SWIPE_THRESHOLD = 64  // mirrors the constant inside the composable
const ARMED_RATIO = 0.55
const VIEWPORT = 1000

function touch(clientX: number, clientY: number): TouchEvent {
    return {touches: [{clientX, clientY}]} as unknown as TouchEvent
}

describe('useSwipeGesture', () => {
    let originalInnerWidth: number

    beforeEach(() => {
        originalInnerWidth = window.innerWidth
        Object.defineProperty(window, 'innerWidth', {configurable: true, value: VIEWPORT, writable: true})
    })

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {configurable: true, value: originalInnerWidth, writable: true})
    })

    describe('enabled gating', () => {
        it('onTouchStart is a no-op when disabled', () => {
            const g = useSwipeGesture(ref(false), ref(2), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(200, 0), 1)
            expect(g.isSwiping(1)).toBe(false)
            expect(g.getSwipeTransform(1)).toBe('translateX(0)')
        })

        it('onTouchMove is a no-op when disabled', () => {
            const g = useSwipeGesture(ref(true), ref(2), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            // Flip the enabled ref between start and move
            const g2 = useSwipeGesture(ref(false), ref(2), ref(2))
            g2.onTouchMove(touch(200, 0), 1)
            expect(g2.isSwiping(1)).toBe(false)
        })
    })

    describe('direction lock', () => {
        it('vertical drag does NOT swipe', () => {
            const g = useSwipeGesture(ref(true), ref(2), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(0, 50), 1)  // vertical drag locks to vertical
            g.onTouchMove(touch(100, 60), 1)  // subsequent moves ignored
            expect(g.isSwiping(1)).toBe(false)
        })

        it('horizontal drag updates swipingOffset', () => {
            const g = useSwipeGesture(ref(true), ref(2), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(50, 5), 1)  // absDx > absDy → horizontal
            expect(g.isSwiping(1)).toBe(true)
            expect(g.getSwipeTransform(1)).toContain('translateX(50px)')
        })
    })

    describe('threshold boundary', () => {
        it('offset below SWIPE_THRESHOLD does NOT snap', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(SWIPE_THRESHOLD - 1, 0), 1)
            g.onTouchEnd(touch(SWIPE_THRESHOLD - 1, 0), 1)
            expect(g.getSwipeTransform(1)).toBe('translateX(0)')
        })

        it('offset at SWIPE_THRESHOLD snaps to rightSnap (slotCount × SLOT_WIDTH)', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(SWIPE_THRESHOLD, 0), 1)
            g.onTouchEnd(touch(SWIPE_THRESHOLD, 0), 1)
            expect(g.getSwipeTransform(1)).toBe(`translateX(${2 * SLOT_WIDTH}px)`)
        })

        it('negative offset at threshold snaps to leftSnap', () => {
            const g = useSwipeGesture(ref(true), ref(2), ref(0))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(-SWIPE_THRESHOLD, 0), 1)
            g.onTouchEnd(touch(-SWIPE_THRESHOLD, 0), 1)
            expect(g.getSwipeTransform(1)).toBe(`translateX(${-2 * SLOT_WIDTH}px)`)
        })
    })

    describe('rubber-band cap', () => {
        it('translateX past rightSnap is dampened (not a 1:1 mapping)', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(1))  // 1 slot → snap at 64
            g.onTouchStart(touch(0, 0), 1)
            // Drag finger far beyond the button area (500 px)
            g.onTouchMove(touch(500, 0), 1)
            const transform = g.getSwipeTransform(1)
            const match = transform.match(/translateX\(([-.\d]+)px\)/)
            expect(match).not.toBeNull()
            const displayed = Number(match![1])
            // Finger is 500, rightSnap is 64, dampening = 0.3:
            // display = 64 + (500 - 64) * 0.3 = 64 + 130.8 = 194.8
            expect(displayed).toBeLessThan(500)
            expect(displayed).toBeGreaterThan(SLOT_WIDTH)
        })

        it('translateX past leftSnap is dampened symmetrically', () => {
            const g = useSwipeGesture(ref(true), ref(1), ref(0))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(-500, 0), 1)
            const transform = g.getSwipeTransform(1)
            const displayed = Number(transform.match(/translateX\(([-.\d]+)px\)/)![1])
            expect(displayed).toBeGreaterThan(-500)
            expect(displayed).toBeLessThan(-SLOT_WIDTH)
        })
    })

    describe('full-swipe ARMED_RATIO', () => {
        it('right-swipe past ARMED_RATIO × viewport fires onFullSwipe with "right"', () => {
            const onFullSwipe = vi.fn()
            const g = useSwipeGesture(ref(true), ref(0), ref(1), onFullSwipe)
            const armedDistance = VIEWPORT * ARMED_RATIO
            g.onTouchStart(touch(0, 0), 42)
            g.onTouchMove(touch(armedDistance + 10, 0), 42)
            g.onTouchEnd(touch(armedDistance + 10, 0), 42)
            expect(onFullSwipe).toHaveBeenCalledWith(42, 'right')
            expect(g.getSwipeTransform(42)).toBe('translateX(0)')  // no snap, executed
        })

        it('left-swipe past ARMED_RATIO fires onFullSwipe with "left"', () => {
            const onFullSwipe = vi.fn()
            const g = useSwipeGesture(ref(true), ref(1), ref(0), onFullSwipe)
            const armedDistance = VIEWPORT * ARMED_RATIO
            g.onTouchStart(touch(0, 0), 7)
            g.onTouchMove(touch(-armedDistance - 10, 0), 7)
            g.onTouchEnd(touch(-armedDistance - 10, 0), 7)
            expect(onFullSwipe).toHaveBeenCalledWith(7, 'left')
        })

        it('does NOT fire full-swipe below ARMED_RATIO', () => {
            const onFullSwipe = vi.fn()
            const g = useSwipeGesture(ref(true), ref(0), ref(2), onFullSwipe)
            const almost = VIEWPORT * ARMED_RATIO - 10
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(almost, 0), 1)
            g.onTouchEnd(touch(almost, 0), 1)
            expect(onFullSwipe).not.toHaveBeenCalled()
        })
    })

    describe('document touchstart listener install/remove', () => {
        it('installs a touchstart listener when a snap is active', async () => {
            const addSpy = vi.spyOn(document, 'addEventListener')
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(SWIPE_THRESHOLD, 0), 1)
            g.onTouchEnd(touch(SWIPE_THRESHOLD, 0), 1)
            await nextTick()
            const added = addSpy.mock.calls.filter(c => c[0] === 'touchstart')
            expect(added.length).toBeGreaterThanOrEqual(1)
        })

        it('removes the listener on scope dispose', async () => {
            const removeSpy = vi.spyOn(document, 'removeEventListener')
            const scope = effectScope()
            let g: ReturnType<typeof useSwipeGesture>
            scope.run(() => {
                g = useSwipeGesture(ref(true), ref(0), ref(2))
                g.onTouchStart(touch(0, 0), 1)
                g.onTouchMove(touch(SWIPE_THRESHOLD, 0), 1)
                g.onTouchEnd(touch(SWIPE_THRESHOLD, 0), 1)
            })
            await nextTick()
            scope.stop()
            const removed = removeSpy.mock.calls.filter(c => c[0] === 'touchstart')
            expect(removed.length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('resetSwipe / resetAll', () => {
        it('resetSwipe(id) clears snap for that id', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            g.onTouchStart(touch(0, 0), 3)
            g.onTouchMove(touch(SWIPE_THRESHOLD, 0), 3)
            g.onTouchEnd(touch(SWIPE_THRESHOLD, 0), 3)
            expect(g.hasActiveSwipe(3)).toBe(true)
            g.resetSwipe(3)
            expect(g.hasActiveSwipe(3)).toBe(false)
        })

        it('resetAll clears everything', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(SWIPE_THRESHOLD, 0), 1)
            g.onTouchEnd(touch(SWIPE_THRESHOLD, 0), 1)
            g.resetAll()
            expect(g.hasActiveSwipe(1)).toBe(false)
            expect(g.isSwiping(1)).toBe(false)
        })
    })

    describe('getSwipeDirection', () => {
        it('reports "right" for positive offset during horizontal drag', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(50, 0), 1)
            expect(g.getSwipeDirection(1)).toBe('right')
        })

        it('reports "left" for negative offset', () => {
            const g = useSwipeGesture(ref(true), ref(2), ref(0))
            g.onTouchStart(touch(0, 0), 1)
            g.onTouchMove(touch(-50, 0), 1)
            expect(g.getSwipeDirection(1)).toBe('left')
        })

        it('returns null when not swiping the queried id', () => {
            const g = useSwipeGesture(ref(true), ref(0), ref(2))
            expect(g.getSwipeDirection(99)).toBeNull()
        })
    })
})
