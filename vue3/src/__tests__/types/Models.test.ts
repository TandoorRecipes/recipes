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

describe('GenericModel.list normalizes paginated vs non-paginated responses', () => {
    it('wraps a bare-array (isPaginated:false) response into {count, results, next}', async () => {
        const gm = getGenericModelFromString('User', t)
        ;(gm as any).api = { apiUserList: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) }
        const r = await gm.list({ page: 1, pageSize: 10 } as any)
        expect(r).toEqual({ count: 2, results: [{ id: 1 }, { id: 2 }], next: null })
    })

    it('passes a paginated response through unchanged (preserving next)', async () => {
        const gm = getGenericModelFromString('Food', t)
        const paginated = { count: 5, results: [{ id: 7 }], next: 'http://x/?page=2' }
        ;(gm as any).api = { apiFoodList: vi.fn().mockResolvedValue(paginated) }
        const r = await gm.list({ page: 1, pageSize: 10 } as any)
        expect(r).toEqual(paginated)
    })

    it('wraps an empty bare array as count 0 (the former NaN source)', async () => {
        const gm = getGenericModelFromString('Group', t)
        ;(gm as any).api = { apiGroupList: vi.fn().mockResolvedValue([]) }
        const r = await gm.list({} as any)
        expect(r).toEqual({ count: 0, results: [], next: null })
    })
})

describe('list-empty-actions — curated editable models expose row edit/delete', () => {
    // These models are surfaced on the Database page (DATABASE_MODELS), have an
    // editor component and are deletable, and declare an "Actions" column — but
    // never defined actionDefs, so their /list Actions column rendered empty
    // (no way to edit or delete a row). Each must expose at least edit + delete.
    const EDITABLE_MODELS = [
        'Supermarket', 'SupermarketCategory', 'MealType',
        'PropertyType', 'InventoryLocation', 'UserSpace',
    ]

    it.each(EDITABLE_MODELS)('%s declares an Actions column header', (name) => {
        const model = getGenericModelFromString(name, t).model
        const headers = model.tableHeaders ?? []
        expect(headers.some(h => h.key === 'action')).toBe(true)
    })

    it.each(EDITABLE_MODELS)('%s defines edit + delete actionDefs', (name) => {
        const model = getGenericModelFromString(name, t).model
        const keys = (model.actionDefs ?? []).map(a => a.key)
        expect(keys).toContain('edit')
        expect(keys).toContain('delete')
    })
})

describe('list-empty-actions — read-only ViewLog has no dead Actions column', () => {
    // ViewLog has no editor component and disableDelete: a row can never have an
    // edit or delete action, so the "Actions" column header was permanently empty.
    // Drop the header rather than render an always-blank column.
    it('ViewLog declares no Actions column header', () => {
        const model = getGenericModelFromString('ViewLog', t).model
        const headers = model.tableHeaders ?? []
        expect(headers.some(h => h.key === 'action')).toBe(false)
    })
})

describe('list-inert-search — tiny config models hide the non-working search box', () => {
    // These models have no meaningful search (1-4 rows) and no backend query
    // filter, so the ModelListPage search box (rendered when !disableSearch) was
    // inert. Hide it. CookLog/ViewLog keep search (real recipe-name filtering).
    const NON_SEARCHABLE = ['InventoryLocation', 'MealType', 'PropertyType', 'Space', 'UserSpace']

    it.each(NON_SEARCHABLE)('%s disables the search box', (name) => {
        const model = getGenericModelFromString(name, t).model
        expect(model.disableSearch).toBe(true)
    })

    it.each(['CookLog', 'ViewLog'])('%s keeps search enabled (real recipe-name filter)', (name) => {
        const model = getGenericModelFromString(name, t).model
        expect(model.disableSearch).toBeFalsy()
    })
})

describe('list-numeric-id — log lists show the recipe name, not its id', () => {
    // CookLog/ViewLog displayed the recipe FK id (e.g. "81") instead of the
    // recipe name. The serializer now exposes recipeName; the Recipe column
    // must render that field.
    it.each(['CookLog', 'ViewLog'])('%s Recipe column keys on recipeName', (name) => {
        const model = getGenericModelFromString(name, t).model
        const recipeCol = (model.tableHeaders ?? []).find(h => h.title === 'Recipe')
        expect(recipeCol?.key).toBe('recipeName')
    })
})

describe('list-mobile-collapse — log mobile rows render recipe name + date', () => {
    // On mobile the log lists rendered empty rows: ModelListMobileView reads the
    // primary title from item[itemLabel ?? 'name'] and these models have no name
    // field. Point itemLabel at recipeName and default the mobile subtitle to the
    // created date so each row shows "<recipe name> / <date>".
    it.each(['CookLog', 'ViewLog'])('%s uses recipeName as the mobile primary label', (name) => {
        const model = getGenericModelFromString(name, t).model
        expect(model.itemLabel).toBe('recipeName')
    })

    it.each(['CookLog', 'ViewLog'])('%s defaults the mobile subtitle to createdAt', (name) => {
        const model = getGenericModelFromString(name, t).model
        expect(model.listSettings?.defaults?.mobileSubtitle).toContain('createdAt')
    })
})
