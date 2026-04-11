import { describe, it, expect, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

import { KEYWORD_FILTER_DEFS } from '@/composables/modellist/KeywordList'

describe('KeywordList config', () => {
    describe('KEYWORD_FILTER_DEFS', () => {
        // The generated OpenAPI typescript-fetch client only forwards request
        // parameters whose property name matches the camelCase form. Snake_case
        // keys here would silently drop the filter (see FoodList.test.ts for
        // the same regression check).
        it('every filter key is a valid ApiKeywordListRequest property', () => {
            const validKeys: ReadonlyArray<keyof import('@/openapi').ApiKeywordListRequest> = [
                'hasChildren', 'hasRecipe', 'limit', 'page', 'pageSize', 'query',
                'random', 'root', 'rootTree', 'tree', 'updatedAt',
            ]
            for (const def of KEYWORD_FILTER_DEFS) {
                expect(validKeys).toContain(def.key as any)
            }
        })

        it('keys use camelCase (no underscores)', () => {
            for (const def of KEYWORD_FILTER_DEFS) {
                expect(def.key, `${def.key} must be camelCase`).not.toMatch(/_/)
            }
        })
    })
})
