import { describe, it, expect } from 'vitest'
import {
    isDelayed,
    isSpaceAboveLimit,
    isSpaceAboveUserLimit,
    isSpaceAboveRecipeLimit,
    isSpaceAtRecipeLimit,
    isSpaceAboveStorageLimit,
} from '@/utils/logic_utils'
import type { ShoppingListEntry, Space } from '@/openapi'

// Minimal factories — only the fields these functions inspect
function makeEntry(overrides: Partial<ShoppingListEntry> = {}): ShoppingListEntry {
    return {
        delayUntil: undefined,
        checked: false,
        ...overrides,
    } as ShoppingListEntry
}

function makeSpace(overrides: Partial<Space> = {}): Space {
    return {
        userCount: 1,
        maxUsers: 0,
        recipeCount: 0,
        maxRecipes: 0,
        fileSizeMb: 0,
        maxFileStorageMb: 0,
        ...overrides,
    } as Space
}

describe('isDelayed', () => {
    it('returns false when delayUntil is undefined', () => {
        expect(isDelayed(makeEntry({ delayUntil: undefined }))).toBe(false)
    })

    it('returns true when delayUntil is in the future', () => {
        const future = new Date(Date.now() + 86400000) // tomorrow
        expect(isDelayed(makeEntry({ delayUntil: future }))).toBe(true)
    })

    it('returns false when delayUntil is in the past', () => {
        const past = new Date(Date.now() - 86400000) // yesterday
        expect(isDelayed(makeEntry({ delayUntil: past }))).toBe(false)
    })

    it('returns false for the 1997 sentinel date', () => {
        // Per the comment in logic_utils, un-delaying sets date to 1997-1-1
        const sentinel = new Date('1997-01-01T00:00:00')
        expect(isDelayed(makeEntry({ delayUntil: sentinel }))).toBe(false)
    })
})

describe('space limit checks', () => {
    describe('isSpaceAboveUserLimit', () => {
        it('returns false when maxUsers is 0 (unlimited)', () => {
            expect(isSpaceAboveUserLimit(makeSpace({ userCount: 100, maxUsers: 0 }))).toBe(false)
        })

        it('returns false when under limit', () => {
            expect(isSpaceAboveUserLimit(makeSpace({ userCount: 3, maxUsers: 5 }))).toBe(false)
        })

        it('returns false when at limit', () => {
            expect(isSpaceAboveUserLimit(makeSpace({ userCount: 5, maxUsers: 5 }))).toBe(false)
        })

        it('returns true when above limit', () => {
            expect(isSpaceAboveUserLimit(makeSpace({ userCount: 6, maxUsers: 5 }))).toBe(true)
        })
    })

    describe('isSpaceAboveRecipeLimit', () => {
        it('returns false when unlimited', () => {
            expect(isSpaceAboveRecipeLimit(makeSpace({ recipeCount: 999, maxRecipes: 0 }))).toBe(false)
        })

        it('returns true when above limit', () => {
            expect(isSpaceAboveRecipeLimit(makeSpace({ recipeCount: 101, maxRecipes: 100 }))).toBe(true)
        })
    })

    describe('isSpaceAtRecipeLimit', () => {
        it('returns true when exactly at limit', () => {
            expect(isSpaceAtRecipeLimit(makeSpace({ recipeCount: 100, maxRecipes: 100 }))).toBe(true)
        })

        it('returns true when above limit', () => {
            expect(isSpaceAtRecipeLimit(makeSpace({ recipeCount: 101, maxRecipes: 100 }))).toBe(true)
        })

        it('returns false when under limit', () => {
            expect(isSpaceAtRecipeLimit(makeSpace({ recipeCount: 99, maxRecipes: 100 }))).toBe(false)
        })
    })

    describe('isSpaceAboveStorageLimit', () => {
        it('returns false when unlimited', () => {
            expect(isSpaceAboveStorageLimit(makeSpace({ fileSizeMb: 9999, maxFileStorageMb: 0 }))).toBe(false)
        })

        it('returns true when above limit', () => {
            expect(isSpaceAboveStorageLimit(makeSpace({ fileSizeMb: 501, maxFileStorageMb: 500 }))).toBe(true)
        })
    })

    describe('isSpaceAboveLimit (composite)', () => {
        it('returns false when all limits are zero (unlimited)', () => {
            expect(isSpaceAboveLimit(makeSpace())).toBe(false)
        })

        it('returns true when any single limit is exceeded', () => {
            expect(isSpaceAboveLimit(makeSpace({ userCount: 6, maxUsers: 5 }))).toBe(true)
            expect(isSpaceAboveLimit(makeSpace({ recipeCount: 11, maxRecipes: 10 }))).toBe(true)
            expect(isSpaceAboveLimit(makeSpace({ fileSizeMb: 101, maxFileStorageMb: 100 }))).toBe(true)
        })
    })
})
