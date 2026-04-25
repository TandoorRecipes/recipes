import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, reactive, ref, nextTick } from 'vue'
import type { FilterDef } from '@/composables/modellist/types'

const mockQuery = ref<Record<string, string | string[]>>({})
const replacedQueries: Record<string, string | string[]>[] = []

const mockRoute = reactive({
    get query() { return mockQuery.value },
})

vi.mock('vue-router', () => ({
    useRoute: () => mockRoute,
    useRouter: () => ({
        isReady: () => Promise.resolve(),
        replace: (opts: { query: Record<string, string | string[]> }) => {
            replacedQueries.push({ ...opts.query })
            mockQuery.value = { ...opts.query }
            return Promise.resolve()
        },
    }),
}))

import { useUrlFilters } from '@/composables/useUrlFilters'

function makeDefs(defs: Partial<FilterDef>[]): FilterDef[] {
    return defs.map((d, i) => ({
        key: d.key ?? `key${i}`,
        labelKey: d.labelKey ?? `Label${i}`,
        type: d.type ?? 'tristate',
        ...d,
    })) as FilterDef[]
}

describe('useUrlFilters (multi-param)', () => {
    beforeEach(() => {
        mockQuery.value = {}
        replacedQueries.length = 0
    })

    describe('reading from route query', () => {
        it('empty query yields empty params', () => {
            const defs = computed(() => makeDefs([]))
            const { filterParams, activeFilterCount } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({})
            expect(activeFilterCount.value).toBe(0)
        })

        it('reads individual query params matching filter keys', () => {
            mockQuery.value = { onHand: '1', hasRecipe: '0' }
            const defs = computed(() => makeDefs([
                { key: 'onHand', type: 'tristate' },
                { key: 'hasRecipe', type: 'tristate' },
            ]))
            const { filterParams, activeFilterCount } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ onHand: 1, hasRecipe: 0 })
            expect(activeFilterCount.value).toBe(2)
        })

        it('ignores query params that are not in filterDefs', () => {
            mockQuery.value = { onHand: '1', page: '3', query: 'chicken' }
            const defs = computed(() => makeDefs([
                { key: 'onHand', type: 'tristate' },
            ]))
            const { filterParams, activeFilterCount } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ onHand: 1 })
            expect(activeFilterCount.value).toBe(1)
        })

        it('passes filter keys through to filterParams unchanged', () => {
            mockQuery.value = { foodOnhand: '1' }
            const defs = computed(() => makeDefs([{ key: 'foodOnhand', type: 'tristate' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toHaveProperty('foodOnhand', 1)
        })

        it('coerces tristate, model-select, and number types to Number', () => {
            mockQuery.value = { tri: '1', num: '42', ms: '5' }
            const defs = computed(() => makeDefs([
                { key: 'tri', type: 'tristate' },
                { key: 'num', type: 'number' },
                { key: 'ms', type: 'model-select' },
            ]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ tri: 1, num: 42, ms: 5 })
        })

        it('excludes NaN values from numeric coercion', () => {
            mockQuery.value = { tri: 'notanumber' }
            const defs = computed(() => makeDefs([{ key: 'tri', type: 'tristate' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({})
        })

        it('handles select type as string array', () => {
            mockQuery.value = { internal: 'true' }
            const defs = computed(() => makeDefs([{ key: 'internal', type: 'select' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ internal: ['true'] })
        })

        // Before the multi-param refactor (commit b56131264), date/number ranges
        // were shipped to the backend as separate snake_case params
        // (?createdon_gte=X&createdon_lte=Y). Bookmarked URLs in that old shape
        // must still populate the new combined state so user deep-links don't
        // silently drop filters after upgrade.
        it('back-compat: accepts legacy {key}_gte/{key}_lte pair for date-range', () => {
            mockQuery.value = {createdon_gte: '2026-04-16', createdon_lte: '2026-04-20'}
            const defs = computed(() => makeDefs([{key: 'createdon', type: 'date-range'}]))
            const {filterParams, activeFilterCount} = useUrlFilters(defs)
            const gte = (filterParams.value as any).createdonGte as Date
            const lte = (filterParams.value as any).createdonLte as Date
            expect(gte.toISOString().slice(0, 10)).toBe('2026-04-16')
            expect(lte.toISOString().slice(0, 10)).toBe('2026-04-20')
            expect(activeFilterCount.value).toBe(1)
        })

        it('back-compat: accepts legacy {key}_gte alone (open-ended upper)', () => {
            mockQuery.value = {createdon_gte: '2026-04-16'}
            const defs = computed(() => makeDefs([{key: 'createdon', type: 'date-range'}]))
            const {filterParams} = useUrlFilters(defs)
            const gte = (filterParams.value as any).createdonGte as Date
            expect(gte.toISOString().slice(0, 10)).toBe('2026-04-16')
            expect('createdonLte' in (filterParams.value as any)).toBe(false)
        })

        it('back-compat: accepts legacy {key}_lte alone for number-range', () => {
            mockQuery.value = {timescooked_lte: '0'}
            const defs = computed(() => makeDefs([{key: 'timescooked', type: 'number-range'}]))
            const {filterParams} = useUrlFilters(defs)
            expect(filterParams.value).toEqual({timescookedLte: 0})
        })

        it('modern range param wins if both shapes are present', () => {
            mockQuery.value = {createdon: '2026-04-16~2026-04-20', createdon_gte: '1999-01-01'}
            const defs = computed(() => makeDefs([{key: 'createdon', type: 'date-range'}]))
            const {filterParams} = useUrlFilters(defs)
            const gte = (filterParams.value as any).createdonGte as Date
            expect(gte.toISOString().slice(0, 10)).toBe('2026-04-16')
        })

        // The OpenAPI client types date-range params as Date and serializes
        // via .toISOString(). If filterParams emits a plain string the client
        // throws "error while fetching" on apiRecipeList. Coerce to Date so
        // the API call survives.
        it('date-range values are coerced to Date for the API client', () => {
            mockQuery.value = {createdon: '2026-04-16~2026-04-20'}
            const defs = computed(() => makeDefs([{key: 'createdon', type: 'date-range'}]))
            const {filterParams} = useUrlFilters(defs)
            const gte = (filterParams.value as any).createdonGte
            const lte = (filterParams.value as any).createdonLte
            expect(gte).toBeInstanceOf(Date)
            expect(lte).toBeInstanceOf(Date)
            expect((gte as Date).toISOString().slice(0, 10)).toBe('2026-04-16')
            expect((lte as Date).toISOString().slice(0, 10)).toBe('2026-04-20')
        })

        it('open-ended date-range gte-only still returns Date', () => {
            mockQuery.value = {createdon: '2026-04-16~'}
            const defs = computed(() => makeDefs([{key: 'createdon', type: 'date-range'}]))
            const {filterParams} = useUrlFilters(defs)
            const gte = (filterParams.value as any).createdonGte
            expect(gte).toBeInstanceOf(Date)
            expect('createdonLte' in (filterParams.value as any)).toBe(false)
        })

        // ModelListPage loads filterDefs from a computed that depends on
        // `genericModel`, which isn't set until onBeforeMount — so at
        // `useUrlFilters` setup time `filterDefs.value` is still `[]`. Without
        // a re-init trigger, URL params like ?expiringSoon=3 would be dropped.
        it('re-reads route params when filterDefs arrive asynchronously', async () => {
            mockQuery.value = { expiringSoon: '3' }
            const pendingDefs = ref<FilterDef[]>([])
            const defs = computed(() => pendingDefs.value)
            const { filterParams, activeFilterCount } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({})
            expect(activeFilterCount.value).toBe(0)
            pendingDefs.value = makeDefs([{ key: 'expiringSoon', type: 'number' }])
            await nextTick()
            expect(filterParams.value).toEqual({ expiringSoon: 3 })
            expect(activeFilterCount.value).toBe(1)
        })
    })

    describe('setFilter / getFilter', () => {
        it('sets a filter and updates route query', async () => {
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, getFilter } = useUrlFilters(defs)
            setFilter('status', '1')
            await nextTick()
            expect(getFilter('status')).toBe('1')
            expect(replacedQueries.length).toBeGreaterThan(0)
            expect(replacedQueries[replacedQueries.length - 1]).toHaveProperty('status', '1')
        })

        it('overwrites existing filter', async () => {
            mockQuery.value = { status: '1' }
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, getFilter } = useUrlFilters(defs)
            setFilter('status', '0')
            await nextTick()
            expect(getFilter('status')).toBe('0')
        })

        it('removes filter when value is undefined', async () => {
            mockQuery.value = { status: '1' }
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, activeFilterCount } = useUrlFilters(defs)
            setFilter('status', undefined)
            await nextTick()
            expect(activeFilterCount.value).toBe(0)
        })

        it('removes filter when value is empty string', async () => {
            mockQuery.value = { status: '1' }
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, activeFilterCount } = useUrlFilters(defs)
            setFilter('status', '')
            await nextTick()
            expect(activeFilterCount.value).toBe(0)
        })

        it('clearAllFilters removes all filter params', async () => {
            mockQuery.value = { a: '1', b: '2' }
            const defs = computed(() => makeDefs([{ key: 'a' }, { key: 'b' }]))
            const { clearAllFilters, activeFilterCount } = useUrlFilters(defs)
            clearAllFilters()
            await nextTick()
            expect(activeFilterCount.value).toBe(0)
        })

        it('preserves non-filter query params on setFilter', async () => {
            mockQuery.value = { page: '3', query: 'chicken', onHand: '1' }
            const defs = computed(() => makeDefs([{ key: 'onHand', type: 'tristate' }]))
            const { setFilter } = useUrlFilters(defs)
            setFilter('onHand', '0')
            await nextTick()
            const last = replacedQueries[replacedQueries.length - 1]
            expect(last).toHaveProperty('page', '3')
            expect(last).toHaveProperty('query', 'chicken')
            expect(last).toHaveProperty('onHand', '0')
        })

        it('preserves non-filter query params on clearAllFilters', async () => {
            mockQuery.value = { page: '3', onHand: '1' }
            const defs = computed(() => makeDefs([{ key: 'onHand', type: 'tristate' }]))
            const { clearAllFilters } = useUrlFilters(defs)
            clearAllFilters()
            await nextTick()
            const last = replacedQueries[replacedQueries.length - 1]
            expect(last).toHaveProperty('page', '3')
            expect(last).not.toHaveProperty('onHand')
        })
    })

    describe('batching', () => {
        it('batches multiple synchronous setFilter calls into one router.replace', async () => {
            const defs = computed(() => makeDefs([
                { key: 'a', type: 'tristate' },
                { key: 'b', type: 'tristate' },
            ]))
            const { setFilter } = useUrlFilters(defs)
            replacedQueries.length = 0
            setFilter('a', '1')
            setFilter('b', '0')
            await nextTick()
            expect(replacedQueries).toHaveLength(1)
            expect(replacedQueries[0]).toMatchObject({ a: '1', b: '0' })
        })
    })

    describe('session persistence (E-4)', () => {
        beforeEach(() => {
            window.sessionStorage.clear()
        })

        it('persists active filters to sessionStorage keyed by route path', async () => {
            mockQuery.value = {}
            ;(mockRoute as any).path = '/search'
            const defs = computed(() => makeDefs([{ key: 'onHand', type: 'tristate' }]))
            const { setFilter } = useUrlFilters(defs)
            setFilter('onHand', '1')
            await nextTick()
            const stored = window.sessionStorage.getItem('url_filters:/search')
            expect(stored).toBeTruthy()
            expect(JSON.parse(stored as string)).toEqual({ onHand: '1' })
        })

        it('hydrates from sessionStorage when URL has no filter keys', async () => {
            ;(mockRoute as any).path = '/search'
            window.sessionStorage.setItem('url_filters:/search', JSON.stringify({ onHand: '1' }))
            mockQuery.value = {}
            const defs = computed(() => makeDefs([{ key: 'onHand', type: 'tristate' }]))
            const { activeFilterCount, getFilter } = useUrlFilters(defs)
            expect(activeFilterCount.value).toBe(1)
            expect(getFilter('onHand')).toBe('1')
            await nextTick()
            const last = replacedQueries[replacedQueries.length - 1]
            expect(last).toHaveProperty('onHand', '1')
        })

        it('URL query wins over sessionStorage when both have filters', () => {
            ;(mockRoute as any).path = '/search'
            window.sessionStorage.setItem('url_filters:/search', JSON.stringify({ onHand: '1' }))
            mockQuery.value = { onHand: '0' }
            const defs = computed(() => makeDefs([{ key: 'onHand', type: 'tristate' }]))
            const { getFilter } = useUrlFilters(defs)
            expect(getFilter('onHand')).toBe('0')
        })

        it('clearAllFilters clears session-persisted filters', async () => {
            ;(mockRoute as any).path = '/search'
            mockQuery.value = { onHand: '1' }
            const defs = computed(() => makeDefs([{ key: 'onHand', type: 'tristate' }]))
            const { clearAllFilters } = useUrlFilters(defs)
            clearAllFilters()
            await nextTick()
            expect(window.sessionStorage.getItem('url_filters:/search')).toBeNull()
        })
    })

    describe('groupedFilterDefs', () => {
        it('partitions defs by group', () => {
            const defs = computed(() => makeDefs([
                { key: 'a', group: 'inventory' },
                { key: 'b', group: 'inventory' },
                { key: 'c', group: 'status' },
                { key: 'd' },
            ]))
            const { groupedFilterDefs } = useUrlFilters(defs)
            expect(groupedFilterDefs.value.get('inventory')).toHaveLength(2)
            expect(groupedFilterDefs.value.get('status')).toHaveLength(1)
            expect(groupedFilterDefs.value.get('')).toHaveLength(1)
        })
    })

    describe('tag-select (multi-value array filters)', () => {
        it('parses comma-joined values into a number array', () => {
            mockQuery.value = { keywords: '7,14,21' }
            const defs = computed(() => makeDefs([{ key: 'keywords', type: 'tag-select' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ keywords: [7, 14, 21] })
        })

        it('handles a single-element array (no delimiter)', () => {
            mockQuery.value = { keywords: '42' }
            const defs = computed(() => makeDefs([{ key: 'keywords', type: 'tag-select' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ keywords: [42] })
        })

        it('setFilter accepts an array of numbers and round-trips', () => {
            const defs = computed(() => makeDefs([{ key: 'foods', type: 'tag-select' }]))
            const { setFilter, filterParams } = useUrlFilters(defs)
            setFilter('foods', [3, 5, 9])
            expect(filterParams.value).toEqual({ foods: [3, 5, 9] })
        })

        it('setFilter with empty array removes the filter', () => {
            mockQuery.value = { foods: '1,2' }
            const defs = computed(() => makeDefs([{ key: 'foods', type: 'tag-select' }]))
            const { setFilter, activeFilterCount } = useUrlFilters(defs)
            setFilter('foods', [])
            expect(activeFilterCount.value).toBe(0)
        })

    })

    describe('number-range filters', () => {
        it('parses gte~lte into two API params', () => {
            mockQuery.value = { rating: '3~5' }
            const defs = computed(() => makeDefs([{ key: 'rating', type: 'number-range' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ ratingGte: 3, ratingLte: 5 })
        })

        it('parses gte-only (no lte) into one param', () => {
            mockQuery.value = { rating: '3~' }
            const defs = computed(() => makeDefs([{ key: 'rating', type: 'number-range' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ ratingGte: 3 })
        })

        it('parses lte-only (no gte) into one param', () => {
            mockQuery.value = { rating: '~5' }
            const defs = computed(() => makeDefs([{ key: 'rating', type: 'number-range' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ ratingLte: 5 })
        })

        it('setFilter accepts {gte, lte} object and round-trips', () => {
            const defs = computed(() => makeDefs([{ key: 'rating', type: 'number-range' }]))
            const { setFilter, filterParams } = useUrlFilters(defs)
            setFilter('rating', { gte: 3, lte: 5 })
            expect(filterParams.value).toEqual({ ratingGte: 3, ratingLte: 5 })
        })

        it('setFilter with both null/undefined removes the filter', () => {
            mockQuery.value = { rating: '3~5' }
            const defs = computed(() => makeDefs([{ key: 'rating', type: 'number-range' }]))
            const { setFilter, activeFilterCount } = useUrlFilters(defs)
            setFilter('rating', { gte: null, lte: null })
            expect(activeFilterCount.value).toBe(0)
        })
    })

    describe('date-range filters (Date values for OpenAPI client)', () => {
        it('parses ISO gte~lte into two Date API params', () => {
            mockQuery.value = { cookedon: '2025-01-01~2025-12-31' }
            const defs = computed(() => makeDefs([{ key: 'cookedon', type: 'date-range' }]))
            const { filterParams } = useUrlFilters(defs)
            const gte = (filterParams.value as any).cookedonGte as Date
            const lte = (filterParams.value as any).cookedonLte as Date
            expect(gte).toBeInstanceOf(Date)
            expect(lte).toBeInstanceOf(Date)
            expect(gte.toISOString().slice(0, 10)).toBe('2025-01-01')
            expect(lte.toISOString().slice(0, 10)).toBe('2025-12-31')
        })
    })

    describe('unknown def type', () => {
        it('passes through string value when def type has no special handler', () => {
            mockQuery.value = { custom: 'somevalue' }
            const defs = computed(() => makeDefs([{ key: 'custom', type: 'string' as any }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ custom: 'somevalue' })
        })
    })

    describe('clearFilter', () => {
        it('removes a filter by key', () => {
            mockQuery.value = { a: '1', b: '2' }
            const defs = computed(() => makeDefs([{ key: 'a' }, { key: 'b' }]))
            const { clearFilter, activeFilterCount, getFilter } = useUrlFilters(defs)
            clearFilter('a')
            expect(getFilter('a')).toBeUndefined()
            expect(getFilter('b')).toBe('2')
            expect(activeFilterCount.value).toBe(1)
        })
    })
})
