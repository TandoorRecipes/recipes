import { describe, it, expect, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

import { UNIT_FILTER_DEFS } from '@/composables/modellist/UnitList'

describe('UnitList config', () => {
    describe('UNIT_FILTER_DEFS', () => {
        it('every filter key is a valid ApiUnitListRequest property', () => {
            const validKeys: ReadonlyArray<keyof import('@/openapi').ApiUnitListRequest> = [
                'hasRecipe', 'limit', 'page', 'pageSize', 'query', 'random', 'updatedAt',
            ]
            for (const def of UNIT_FILTER_DEFS) {
                expect(validKeys).toContain(def.key as any)
            }
        })

        it('keys use camelCase (no underscores)', () => {
            for (const def of UNIT_FILTER_DEFS) {
                expect(def.key, `${def.key} must be camelCase`).not.toMatch(/_/)
            }
        })
    })
})
