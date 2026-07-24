/**
 * Regression guard: verifies that ApiApi.apiRecipeList serializes every
 * number-range and tristate filter from RECIPE_FILTER_DEFS into the correct
 * snake_case query param in the HTTP request.
 *
 * The bug this locks in: recipe_search.py accepted working_time_gte,
 * has_photo, has_keywords etc., but they were missing from the OpenAPI schema
 * so the generated client never emitted them — all 566 recipes returned
 * regardless of the filter value. Adding params to the schema is not enough;
 * this test proves the client actually sends them.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiApi } from '@/openapi'
import { RECIPE_FILTER_DEFS } from '@/composables/modellist/RecipeList'

const NUMBER_RANGE_DEFS = RECIPE_FILTER_DEFS.filter(d => d.type === 'number-range')
const TRISTATE_DEFS = RECIPE_FILTER_DEFS.filter(d => d.type === 'tristate')

// camelCase → snake_case (workingTimeGte → working_time_gte)
function toSnake(s: string): string {
    return s.replace(/([A-Z])/g, '_$1').toLowerCase()
}

describe('ApiApi.apiRecipeList — number-range param serialization', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ count: 0, results: [], next: null, previous: null }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        )
        const base = document.querySelector('base') ?? document.createElement('base')
        ;(base as HTMLBaseElement).href = 'http://localhost:8000/'
        if (!document.querySelector('base')) document.head.appendChild(base)
    })

    it.each(NUMBER_RANGE_DEFS)('$key: sends ${key}Gte → snake_case_gte and ${key}Lte → snake_case_lte', async (def) => {
        const gteKey = `${def.key}Gte`
        const lteKey = `${def.key}Lte`
        const expectedGte = `${toSnake(gteKey)}=10`
        const expectedLte = `${toSnake(lteKey)}=20`

        const api = new ApiApi()
        await api.apiRecipeList({ [gteKey]: 10, [lteKey]: 20 } as any).catch(() => {})

        expect(global.fetch).toHaveBeenCalled()
        const calledUrl: string = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]
        expect(calledUrl, `${gteKey} not serialized — missing ${expectedGte} in URL`).toContain(expectedGte)
        expect(calledUrl, `${lteKey} not serialized — missing ${expectedLte} in URL`).toContain(expectedLte)

        vi.clearAllMocks()
    })
})

describe('ApiApi.apiRecipeList — tristate param serialization', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ count: 0, results: [], next: null, previous: null }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        )
        const base = document.querySelector('base') ?? document.createElement('base')
        ;(base as HTMLBaseElement).href = 'http://localhost:8000/'
        if (!document.querySelector('base')) document.head.appendChild(base)
    })

    it.each(TRISTATE_DEFS)('$key: sends $key → snake_case param with boolean value', async (def) => {
        const expectedParam = `${toSnake(def.key)}=true`

        const api = new ApiApi()
        await api.apiRecipeList({ [def.key]: true } as any).catch(() => {})

        expect(global.fetch).toHaveBeenCalled()
        const calledUrl: string = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]
        expect(calledUrl, `${def.key} not serialized — missing ${expectedParam} in URL`).toContain(expectedParam)

        vi.clearAllMocks()
    })
})
