import { describe, it, expect, vi } from 'vitest'
import { computed, ref } from 'vue'
import type { FilterDef } from '@/composables/modellist/types'

const mockRouteQuery = ref('')
vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => mockRouteQuery,
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

describe('useUrlFilters', () => {
    beforeEach(() => {
        mockRouteQuery.value = ''
    })

    describe('parseFilters / filterParams', () => {
        it('empty string yields empty params', () => {
            const defs = computed(() => makeDefs([]))
            const { filterParams, activeFilterCount } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({})
            expect(activeFilterCount.value).toBe(0)
        })

        it('parses key:value pairs', () => {
            mockRouteQuery.value = 'on_hand:1,has_recipe:0'
            const defs = computed(() => makeDefs([
                { key: 'on_hand', type: 'tristate' },
                { key: 'has_recipe', type: 'tristate' },
            ]))
            const { filterParams, activeFilterCount } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ onHand: 1, hasRecipe: 0 })
            expect(activeFilterCount.value).toBe(2)
        })

        it('splits only on first colon (values can contain colons)', () => {
            mockRouteQuery.value = 'name:foo:bar'
            const defs = computed(() => makeDefs([{ key: 'name', type: 'string' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ name: 'foo:bar' })
        })

        it('decodes URI-encoded values', () => {
            mockRouteQuery.value = 'name:hello%2Cworld'
            const defs = computed(() => makeDefs([{ key: 'name', type: 'string' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ name: 'hello,world' })
        })

        it('converts snake_case keys to camelCase', () => {
            mockRouteQuery.value = 'food_onhand:1'
            const defs = computed(() => makeDefs([{ key: 'food_onhand', type: 'tristate' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toHaveProperty('foodOnhand', 1)
        })

        it('coerces tristate and number types to Number', () => {
            mockRouteQuery.value = 'tri:1,num:42'
            const defs = computed(() => makeDefs([
                { key: 'tri', type: 'tristate' },
                { key: 'num', type: 'number' },
            ]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ tri: 1, num: 42 })
        })

        it('excludes NaN values from numeric coercion', () => {
            mockRouteQuery.value = 'tri:notanumber'
            const defs = computed(() => makeDefs([{ key: 'tri', type: 'tristate' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({})
        })

        it('skips pairs with no colon', () => {
            mockRouteQuery.value = 'badformat,ok:1'
            const defs = computed(() => makeDefs([{ key: 'ok', type: 'tristate' }]))
            const { filterParams } = useUrlFilters(defs)
            expect(filterParams.value).toEqual({ ok: 1 })
            expect(useUrlFilters(defs).activeFilterCount.value).toBe(1)
        })
    })

    describe('setFilter / clearFilter', () => {
        it('sets a filter value', () => {
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, getFilter } = useUrlFilters(defs)
            setFilter('status', '1')
            expect(getFilter('status')).toBe('1')
        })

        it('overwrites existing filter', () => {
            mockRouteQuery.value = 'status:1'
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, getFilter } = useUrlFilters(defs)
            setFilter('status', '0')
            expect(getFilter('status')).toBe('0')
        })

        it('removes filter when value is empty string', () => {
            mockRouteQuery.value = 'status:1'
            const defs = computed(() => makeDefs([{ key: 'status', type: 'tristate' }]))
            const { setFilter, activeFilterCount } = useUrlFilters(defs)
            setFilter('status', '')
            expect(activeFilterCount.value).toBe(0)
        })

        it('clearAllFilters resets to empty', () => {
            mockRouteQuery.value = 'a:1,b:2'
            const defs = computed(() => makeDefs([{ key: 'a' }, { key: 'b' }]))
            const { clearAllFilters, activeFilterCount } = useUrlFilters(defs)
            clearAllFilters()
            expect(activeFilterCount.value).toBe(0)
        })
    })

    describe('round-trip', () => {
        it('set then get preserves value with special characters', () => {
            const defs = computed(() => makeDefs([{ key: 'name', type: 'string' }]))
            const { setFilter, getFilter } = useUrlFilters(defs)
            setFilter('name', 'hello,world:test')
            expect(getFilter('name')).toBe('hello,world:test')
        })
    })

    describe('groupedFilterDefs', () => {
        it('partitions defs by group', () => {
            const defs = computed(() => makeDefs([
                { key: 'a', group: 'inventory' },
                { key: 'b', group: 'inventory' },
                { key: 'c', group: 'status' },
                { key: 'd' }, // no group → ''
            ]))
            const { groupedFilterDefs } = useUrlFilters(defs)
            expect(groupedFilterDefs.value.get('inventory')).toHaveLength(2)
            expect(groupedFilterDefs.value.get('status')).toHaveLength(1)
            expect(groupedFilterDefs.value.get('')).toHaveLength(1)
        })
    })
})
