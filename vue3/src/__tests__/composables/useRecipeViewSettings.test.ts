/**
 * Regression coverage for useRecipeViewSettings.
 *
 * Code already ships — characterization tests locking in the singleton-
 * state contract (two refs shared across all call sites).
 */
import {describe, expect, it, beforeEach} from 'vitest'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'

describe('useRecipeViewSettings', () => {
    beforeEach(() => {
        // Reset module-scope refs between tests
        const {isOpen, isPinned} = useRecipeViewSettings()
        isOpen.value = false
        isPinned.value = false
    })

    it('exposes reactive isOpen and isPinned refs', () => {
        const s = useRecipeViewSettings()
        expect(s.isOpen.value).toBe(false)
        expect(s.isPinned.value).toBe(false)
    })

    it('shares state across calls (module-scope refs, singleton-style)', () => {
        const a = useRecipeViewSettings()
        const b = useRecipeViewSettings()
        a.isOpen.value = true
        expect(b.isOpen.value).toBe(true)
        b.isPinned.value = true
        expect(a.isPinned.value).toBe(true)
    })

    it('returns the same ref identities across calls', () => {
        const a = useRecipeViewSettings()
        const b = useRecipeViewSettings()
        expect(a.isOpen).toBe(b.isOpen)
        expect(a.isPinned).toBe(b.isPinned)
    })
})
