import { describe, it, expect, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

vi.mock('@/composables/useShoppingActions', () => ({
    useShoppingActions: () => ({
        addToShopping: vi.fn(),
        removeFromShopping: vi.fn(),
        checkShoppingStatus: vi.fn(),
    }),
}))

vi.mock('@/composables/useInventoryActions', () => ({
    useInventoryActions: () => ({
        addToInventory: vi.fn(),
        removeFromInventory: vi.fn(),
        quickAddToInventory: vi.fn(),
        checkInventoryStatus: vi.fn(),
    }),
}))

import {
    FOOD_FILTER_DEFS,
    FOOD_ACTION_DEFS,
    FOOD_SORT_OPTIONS,
    FOOD_STAT_DEFS,
    FOOD_LIST_SETTINGS,
    FOOD_BATCH_ACTIONS,
} from '@/composables/modellist/FoodList'

describe('FoodList config', () => {
    describe('FOOD_FILTER_DEFS', () => {
        it('all entries have required keys', () => {
            for (const def of FOOD_FILTER_DEFS) {
                expect(def).toHaveProperty('key')
                expect(def).toHaveProperty('labelKey')
                expect(def).toHaveProperty('type')
            }
        })

        it('model-select entries have modelName', () => {
            const modelSelects = FOOD_FILTER_DEFS.filter(d => d.type === 'model-select')
            for (const def of modelSelects) {
                expect(def.modelName).toBeTruthy()
            }
        })

        // The generated OpenAPI typescript-fetch client exposes request
        // parameters as camelCase properties (e.g. `expiringSoon`) and only
        // maps them to snake_case query strings internally. Passing snake_case
        // keys into `apiFoodList({expiring_soon: 3})` gets silently dropped
        // because the client checks `requestParameters['expiringSoon']`.
        // Every FilterDef.key must match a property on ApiFoodListRequest.
        it('every filter key is a valid ApiFoodListRequest property', () => {
            const validKeys: ReadonlyArray<keyof import('@/openapi').ApiFoodListRequest> = [
                'expired', 'expiringSoon', 'hasChildren', 'hasInventory',
                'hasRecipe', 'hasSubstitute', 'ignoreShopping', 'inShoppingList',
                'inventoryLocation', 'onhand', 'supermarketCategory', 'usedInRecipes',
            ]
            for (const def of FOOD_FILTER_DEFS) {
                expect(validKeys).toContain(def.key as any)
            }
        })

        it('keys use camelCase (no underscores)', () => {
            for (const def of FOOD_FILTER_DEFS) {
                expect(def.key, `${def.key} must be camelCase`).not.toMatch(/_/)
            }
        })
    })

    describe('FOOD_ACTION_DEFS', () => {
        it('toggle actions have toggleField', () => {
            const toggles = FOOD_ACTION_DEFS.filter(a => a.isToggle)
            expect(toggles.length).toBeGreaterThan(0)
            for (const action of toggles) {
                expect(action.toggleField).toBeTruthy()
            }
        })

        it('route actions have routeName', () => {
            const routes = FOOD_ACTION_DEFS.filter(a => a.routeName)
            expect(routes.length).toBeGreaterThan(0)
            for (const action of routes) {
                expect(action.routeName).toBeTruthy()
            }
        })

        it('recipe action is hidden when item has no recipe', () => {
            const recipeAction = FOOD_ACTION_DEFS.find(a => a.key === 'recipe')
            expect(recipeAction).toBeTruthy()
            if (recipeAction?.visible) {
                expect(recipeAction.visible({ recipe: null } as any)).toBe(false)
                expect(recipeAction.visible({ recipe: 42 } as any)).toBe(true)
            }
        })

        it('shopping action isActive handles string booleans', () => {
            const shopping = FOOD_ACTION_DEFS.find(a => a.key === 'shopping')
            expect(shopping).toBeTruthy()
            if (shopping?.isActive) {
                expect(shopping.isActive({ shopping: true } as any)).toBe(true)
                expect(shopping.isActive({ shopping: 'True' } as any)).toBe(true)
                expect(shopping.isActive({ shopping: 'true' } as any)).toBe(true)
                expect(shopping.isActive({ shopping: false } as any)).toBe(false)
                expect(shopping.isActive({ shopping: undefined } as any)).toBe(false)
            }
        })

        it('pantry action isActive handles string booleans', () => {
            const pantry = FOOD_ACTION_DEFS.find(a => a.key === 'pantry')
            expect(pantry).toBeTruthy()
            if (pantry?.isActive) {
                expect(pantry.isActive({ inInventory: true } as any)).toBe(true)
                expect(pantry.isActive({ inInventory: 'True' } as any)).toBe(true)
                expect(pantry.isActive({ inInventory: false } as any)).toBe(false)
                expect(pantry.isActive({ inInventory: null } as any)).toBe(false)
            }
        })
    })

    describe('FOOD_SORT_OPTIONS', () => {
        it('all entries have key and labelKey', () => {
            for (const opt of FOOD_SORT_OPTIONS) {
                expect(opt).toHaveProperty('key')
                expect(opt).toHaveProperty('labelKey')
            }
        })
    })

    describe('FOOD_LIST_SETTINGS', () => {
        it('has treeEnabled', () => {
            expect(FOOD_LIST_SETTINGS.treeEnabled).toBe(true)
        })
    })
})
