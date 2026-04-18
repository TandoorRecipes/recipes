/**
 * Shared API mock setup for tests that need the OpenAPI client.
 *
 * Usage: import this file's vi.mock at the TOP of your test file:
 *   vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()), ApiApi: class { constructor() { return apiMock } }, ... }))
 *   import { apiMock, resetApiMock } from '@/__tests__/api-mock'
 */

import { vi } from 'vitest'

/** All ApiApi method names that stores/composables/pages actually call */
const API_METHODS = [
    // UserPreferenceStore
    'apiUserPreferenceList',
    'apiUserPreferencePartialUpdate',
    'apiServerSettingsCurrentRetrieve',
    'apiSpaceCurrentRetrieve',
    'apiSpacePartialUpdate',
    'apiUserSpaceAllPersonalList',
    'apiSpaceList',
    'apiSwitchActiveSpaceRetrieve',
    'apiUnitList',
    // ShoppingStore
    'apiShoppingListEntryList',
    'apiShoppingListEntryCreate',
    'apiShoppingListEntryUpdate',
    'apiShoppingListEntryDestroy',
    'apiShoppingListEntryBulkCreate',
    'apiSupermarketCategoryList',
    'apiSupermarketList',
    'apiShoppingListList',
    'apiShoppingListRecipeDestroy',
    'apiFoodUpdate',
    'apiFoodBatchUpdateUpdate',
    // MealPlanStore
    'apiMealPlanList',
    'apiMealPlanCreate',
    'apiMealPlanUpdate',
    'apiMealPlanPartialUpdate',
    'apiMealPlanDestroy',
    // Pages — recipes
    'apiRecipeList',
    'apiRecipeRetrieve',
    'apiRecipeSearchList',
    // Pages — books
    'apiRecipeBookList',
    'apiRecipeBookRetrieve',
    'apiRecipeBookEntryList',
    // Pages — misc
    'apiViewLogCreate',
    'apiRecipeImportList',
    'apiCustomFilterList',
    'apiKeywordList',
    'apiMealTypeList',
    'apiCookLogCreate',
    'apiCookLogList',
    'apiRecipeStatsRetrieve',
    // GenericModel dynamic methods (added per-test as needed)
    'apiFoodRetrieve',
    'apiFoodCreate',
    'apiFoodDestroy',
] as const

function buildApiMock(): Record<string, ReturnType<typeof vi.fn>> {
    const mock = {} as Record<string, ReturnType<typeof vi.fn>>
    for (const method of API_METHODS) {
        mock[method] = vi.fn().mockRejectedValue(new Error(`unmocked API call: ${method}`))
    }
    return mock
}

/** The shared mock instance — configure per-test with apiMock.method.mockResolvedValue(...) */
export const apiMock = buildApiMock()

/** Reset all mock implementations to default (unmocked) state. Uses mockReset to preserve references. */
export function resetApiMock() {
    for (const method of API_METHODS) {
        if (apiMock[method]) {
            apiMock[method].mockReset()
            apiMock[method].mockRejectedValue(new Error(`unmocked API call: ${method}`))
        }
    }
}
