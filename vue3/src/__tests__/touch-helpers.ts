/**
 * Test helpers for touch-dependent composables and gesture handlers.
 *
 * jsdom does not implement TouchEvent or pointer-coarse matchMedia,
 * so tests that exercise useSwipeGesture / useTouchDetect / similar
 * need these utilities to simulate:
 *   - matchMedia query results per test (mockMatchMedia)
 *   - touchstart/move/end events with populated touches[] (dispatchTouch)
 *   - listener bookkeeping so we can assert singleton-listener unregister
 *     contracts (getMatchMediaListenerCount)
 *
 * The vitest.setup.ts global stub already returns matches: false for every
 * query; `mockMatchMedia` replaces the mock for the duration of a test.
 * `resetMatchMediaMock()` restores the default behavior.
 */
import {vi} from 'vitest'

type Matcher = (query: string) => boolean

interface TrackedMediaQueryList {
    matches: boolean
    media: string
    onchange: null
    addListener: ReturnType<typeof vi.fn>
    removeListener: ReturnType<typeof vi.fn>
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
    dispatchEvent: ReturnType<typeof vi.fn>
}

// Listeners registered via addEventListener('change', cb) on a media-query mock.
// Keyed by media query string.
const listenerRegistry = new Map<string, Set<any>>()

/**
 * Replace window.matchMedia with a matcher-backed mock for the current test.
 * The returned MediaQueryList tracks addEventListener/removeEventListener calls
 * so tests can assert listener cleanup via getMatchMediaListenerCount.
 */
export function mockMatchMedia(matcher: Matcher): void {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => {
        const list: TrackedMediaQueryList = {
            matches: matcher(query),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((event: string, cb: any) => {
                if (event !== 'change') return
                if (!listenerRegistry.has(query)) listenerRegistry.set(query, new Set())
                listenerRegistry.get(query)!.add(cb)
            }),
            removeEventListener: vi.fn((event: string, cb: any) => {
                if (event !== 'change') return
                listenerRegistry.get(query)?.delete(cb)
            }),
            dispatchEvent: vi.fn(),
        }
        return list as unknown as MediaQueryList
    })
}

/** Returns the number of change-listeners currently registered for a given query. */
export function getMatchMediaListenerCount(query: string): number {
    return listenerRegistry.get(query)?.size ?? 0
}

/** Clear the listener registry and revert to the default vitest.setup.ts mock. */
export function resetMatchMediaMock(): void {
    listenerRegistry.clear()
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList)
}

/**
 * Dispatch a touch-family event on the target element with populated touches[].
 * jsdom has no TouchEvent constructor, so we build a plain Event and attach
 * touches via Object.defineProperty so readers see them as native-like.
 */
export function dispatchTouch(
    target: EventTarget,
    type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
    points: Array<{x: number; y: number; identifier?: number}> = [],
): Event {
    const event = new Event(type, {bubbles: true, cancelable: true})
    const touches = points.map((p, i) => ({
        identifier: p.identifier ?? i,
        clientX: p.x,
        clientY: p.y,
        pageX: p.x,
        pageY: p.y,
        screenX: p.x,
        screenY: p.y,
        target,
    }))
    Object.defineProperty(event, 'touches', {value: touches, configurable: true})
    Object.defineProperty(event, 'targetTouches', {value: touches, configurable: true})
    Object.defineProperty(event, 'changedTouches', {value: touches, configurable: true})
    target.dispatchEvent(event)
    return event
}
