/**
 * Regression coverage for useTouchDetect.
 *
 * Characterization tests for the module-scope singleton pattern:
 * - First call initializes from matchMedia('(pointer: coarse)')
 * - Subsequent calls return the SAME ref (singleton, no new listener)
 * - matchMedia 'change' event updates the ref reactively
 *
 * Uses `vi.resetModules()` between tests so each test gets a fresh
 * singleton.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {mockMatchMedia, resetMatchMediaMock, getMatchMediaListenerCount} from '../touch-helpers'

const COARSE_QUERY = '(pointer: coarse)'

describe('useTouchDetect', () => {
    beforeEach(() => {
        vi.resetModules()  // fresh module-scope singleton per test
    })

    afterEach(() => {
        resetMatchMediaMock()
    })

    it('initializes hasTouchInput=true when matchMedia(coarse).matches is true', async () => {
        mockMatchMedia((q) => q === COARSE_QUERY)
        const {useTouchDetect} = await import('@/composables/useTouchDetect')
        const {hasTouchInput} = useTouchDetect()
        expect(hasTouchInput.value).toBe(true)
    })

    it('initializes hasTouchInput=false when matchMedia(coarse).matches is false', async () => {
        mockMatchMedia(() => false)
        const {useTouchDetect} = await import('@/composables/useTouchDetect')
        const {hasTouchInput} = useTouchDetect()
        expect(hasTouchInput.value).toBe(false)
    })

    it('returns the SAME ref on subsequent calls (singleton contract)', async () => {
        mockMatchMedia(() => false)
        const {useTouchDetect} = await import('@/composables/useTouchDetect')
        const a = useTouchDetect()
        const b = useTouchDetect()
        expect(a.hasTouchInput).toBe(b.hasTouchInput)
    })

    it('registers exactly ONE change-listener regardless of call count', async () => {
        mockMatchMedia(() => false)
        const {useTouchDetect} = await import('@/composables/useTouchDetect')
        useTouchDetect()
        useTouchDetect()
        useTouchDetect()
        expect(getMatchMediaListenerCount(COARSE_QUERY)).toBe(1)
    })

    it('reacts to matchMedia change event', async () => {
        let matches = false
        let listener: ((e: any) => void) | null = null
        vi.mocked(window.matchMedia).mockImplementation((_q: string) => ({
            get matches() { return matches },
            media: _q,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((evt: string, cb: any) => {
                if (evt === 'change') listener = cb
            }),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }) as any)

        const {useTouchDetect} = await import('@/composables/useTouchDetect')
        const {hasTouchInput} = useTouchDetect()
        expect(hasTouchInput.value).toBe(false)

        // Simulate the OS-level touch-input detection flipping
        matches = true
        listener!({matches: true} as any)
        expect(hasTouchInput.value).toBe(true)

        matches = false
        listener!({matches: false} as any)
        expect(hasTouchInput.value).toBe(false)
    })
})
