import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getGenericModelFromString, canRouteToModel, DATABASE_MODELS } from '@/types/Models'

const t = (k: string) => k

describe('GenericModel delete-relationship dispatch', () => {
    it('returns an empty result (no throw) when the generated client lacks the endpoint', async () => {
        // Space has no apiSpaceProtectingList on the generated client; the old
        // code threw "this.api[...] is not a function" on this path.
        const gm = getGenericModelFromString('Space', t)
        const r = await gm.getDeleteProtecting({ id: 1, page: 1, pageSize: 10, cache: true })
        expect(r).toEqual({ count: 0, results: [] })
    })

    it('invokes the generated endpoint when it exists', async () => {
        const gm = getGenericModelFromString('Food', t)
        const spy = vi.fn().mockResolvedValue({ count: 2, results: [{ id: 7 }] })
        ;(gm as any).api = { apiFoodProtectingList: spy }

        const params = { id: 1, page: 1, pageSize: 10, cache: true }
        const r = await gm.getDeleteProtecting(params)

        expect(spy).toHaveBeenCalledWith(params)
        expect(r.count).toBe(2)
    })
})

describe('canRouteToModel — guards the generic /list /edit /delete routes', () => {
    // editable = has editorComponent; listable = in DATABASE_MODELS (the curated DatabasePage set);
    // deletable = editable OR listable.

    it('allows all three operations for a fully user-facing, editable model', () => {
        expect(canRouteToModel('Food', 'list')).toBe(true)
        expect(canRouteToModel('Food', 'edit')).toBe(true)
        expect(canRouteToModel('Food', 'delete')).toBe(true)
    })

    it('is case-insensitive (call-sites use both Food and food)', () => {
        expect(canRouteToModel('food', 'list')).toBe(true)
        expect(canRouteToModel('unit', 'list')).toBe(true)
    })

    it('allows list/delete but NOT edit for a read-only listed model (AiLog has no editor)', () => {
        expect(canRouteToModel('AiLog', 'list')).toBe(true)
        expect(canRouteToModel('AiLog', 'delete')).toBe(true)
        expect(canRouteToModel('AiLog', 'edit')).toBe(false)
    })

    it('allows edit/delete but NOT list for an editable model not in the database view (Recipe)', () => {
        // recipe browsing is via search, not /list/Recipe — but recipe deletion uses /delete/Recipe
        expect(canRouteToModel('Recipe', 'edit')).toBe(true)
        expect(canRouteToModel('Recipe', 'delete')).toBe(true)
        expect(canRouteToModel('Recipe', 'list')).toBe(false)
    })

    it('blocks every operation for unwired relational/internal models', () => {
        for (const m of ['SearchFields', 'RecipeBookEntry', 'FoodInheritField', 'Step', 'Ingredient']) {
            expect(canRouteToModel(m, 'list'), `${m} list`).toBe(false)
            expect(canRouteToModel(m, 'edit'), `${m} edit`).toBe(false)
            expect(canRouteToModel(m, 'delete'), `${m} delete`).toBe(false)
        }
    })

    it('blocks list for InventoryEntry/InventoryLog (commented out of DatabasePage despite no disableListView flag)', () => {
        // the key reason DATABASE_MODELS membership is used instead of the stale disableListView flag
        expect(canRouteToModel('InventoryEntry', 'list')).toBe(false)
        expect(canRouteToModel('InventoryLog', 'list')).toBe(false)
    })

    it('allows list for ShoppingList (wired in DatabasePage even though disableListView is true)', () => {
        expect(canRouteToModel('ShoppingList', 'list')).toBe(true)
    })

    it('blocks an unregistered/garbage model name', () => {
        expect(canRouteToModel('NotARealModel', 'edit')).toBe(false)
        expect(canRouteToModel('NotARealModel', 'list')).toBe(false)
    })
})

describe('DATABASE_MODELS stays in sync with DatabasePage.vue', () => {
    it('matches exactly the non-commented <database-model-col> entries', () => {
        const src = readFileSync(
            resolve(process.cwd(), 'src/pages/DatabasePage.vue'),
            'utf-8',
        )
        // strip HTML comments so commented-out cols (InventoryEntry/InventoryLog) are excluded
        const uncommented = src.replace(/<!--[\s\S]*?-->/g, '')
        const wired = new Set(
            [...uncommented.matchAll(/<database-model-col[^>]*\bmodel="([^"]+)"/g)].map((m) => m[1]),
        )
        expect(new Set(DATABASE_MODELS)).toEqual(wired)
    })
})
