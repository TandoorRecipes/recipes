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
})
