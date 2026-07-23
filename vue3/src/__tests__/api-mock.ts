import { vi } from 'vitest'

const API_METHODS = [
    'apiUserPreferenceList',
    'apiUserPreferencePartialUpdate',
    'apiServerSettingsCurrentRetrieve',
    'apiSpaceCurrentRetrieve',
    'apiSpacePartialUpdate',
    'apiUserSpaceAllPersonalList',
    'apiSpaceList',
    'apiSwitchActiveSpaceRetrieve',
    'apiUnitList',
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
    'apiMealPlanList',
    'apiMealPlanCreate',
    'apiMealPlanUpdate',
    'apiMealPlanPartialUpdate',
    'apiMealPlanDestroy',
    'apiRecipeList',
    'apiRecipeRetrieve',
    'apiRecipeSearchList',
    'apiRecipeBookList',
    'apiRecipeBookRetrieve',
    'apiRecipeBookEntryList',
    'apiViewLogCreate',
    'apiRecipeImportList',
    'apiCustomFilterList',
    'apiKeywordList',
    'apiMealTypeList',
    'apiFoodRetrieve',
    'apiFoodCreate',
    'apiFoodDestroy',
    'apiFoodPartialUpdate',
    'apiInventoryLocationList',
    'apiInventoryEntryList',
    'apiInventoryEntryCreate',
    'apiInventoryEntryDestroy',
] as const

function buildApiMock(): Record<string, ReturnType<typeof vi.fn>> {
    const mock = {} as Record<string, ReturnType<typeof vi.fn>>
    for (const method of API_METHODS) {
        mock[method] = vi.fn().mockRejectedValue(new Error(`unmocked API call: ${method}`))
    }
    return mock
}

export const apiMock = buildApiMock()

export function resetApiMock() {
    for (const method of API_METHODS) {
        if (apiMock[method]) {
            apiMock[method].mockReset()
            apiMock[method].mockRejectedValue(new Error(`unmocked API call: ${method}`))
        }
    }
}
