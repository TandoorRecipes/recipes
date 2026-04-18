/**
 * Regression coverage for useFilterPlacement.
 *
 * Characterization tests for the inline-vs-drawer placement logic and
 * the "show-all-by-default" behavior when defaultDrawer is empty.
 */
import {describe, it, expect, beforeEach, vi} from 'vitest'
import {computed, ref} from 'vue'
import {createPinia, setActivePinia} from 'pinia'
import type {FilterDef} from '@/composables/modellist/types'

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({replace: vi.fn(), push: vi.fn()}),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: (_key: string, defaultValue: any) => ref(defaultValue),
}))

import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {useFilterPlacement} from '@/composables/useFilterPlacement'

function makeDefs(defs: Partial<FilterDef>[]): FilterDef[] {
    return defs.map((d, i) => ({
        key: d.key ?? `k${i}`,
        labelKey: d.labelKey ?? `L${i}`,
        type: d.type ?? 'tristate',
        group: d.group,
        hidden: d.hidden,
        ...d,
    })) as FilterDef[]
}

describe('useFilterPlacement', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        // Ensure deviceSettings starts empty so "never customized" branches run
        const store = useUserPreferenceStore()
        delete store.deviceSettings.search_inlineFilters
        delete store.deviceSettings.search_drawerFilters
        delete store.deviceSettings.myList_inlineFilters
        delete store.deviceSettings.plan_drawerFilters
    })

    describe('inline (page) placement', () => {
        it('uses defaultInline when user has never customized', () => {
            const fp = useFilterPlacement('search', ['a', 'b'], ['a', 'b', 'c'])
            expect(fp.isInlineSelected('a')).toBe(true)
            expect(fp.isInlineSelected('b')).toBe(true)
            expect(fp.isInlineSelected('c')).toBe(false)
        })

        it('toggleInline adds and removes keys', () => {
            const fp = useFilterPlacement('search', ['a'], [])
            fp.toggleInline('b')
            expect(fp.isInlineSelected('b')).toBe(true)
            fp.toggleInline('b')
            expect(fp.isInlineSelected('b')).toBe(false)
        })

        it('toggleInline persists to device settings under the settingsKey prefix', () => {
            const fp = useFilterPlacement('myList', ['x'], [])
            fp.toggleInline('y')
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.myList_inlineFilters).toContain('y')
        })
    })

    describe('drawer (panel) placement', () => {
        it('show-all default: all keys appear as selected when defaultDrawer is empty', () => {
            const fp = useFilterPlacement('search', [], [])
            expect(fp.isDrawerSelected('anything')).toBe(true)
        })

        it('uses defaultDrawer when user has never customized and defaultDrawer is non-empty', () => {
            const fp = useFilterPlacement('search', [], ['a', 'b'])
            expect(fp.isDrawerSelected('a')).toBe(true)
            expect(fp.isDrawerSelected('c')).toBe(false)
        })

        it('toggleDrawer with show-all default seeds from allKeys on first toggle', () => {
            const fp = useFilterPlacement('search', [], [])
            // Initial: all selected implicitly.
            fp.toggleDrawer('b', ['a', 'b', 'c'])
            // After toggle: 'b' is removed from the full set → 'a' and 'c' still selected, 'b' not.
            expect(fp.isDrawerSelected('a')).toBe(true)
            expect(fp.isDrawerSelected('b')).toBe(false)
            expect(fp.isDrawerSelected('c')).toBe(true)
        })

        it('toggleDrawer persists to device settings under the settingsKey prefix', () => {
            const fp = useFilterPlacement('plan', [], ['a'])
            fp.toggleDrawer('b')
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.plan_drawerFilters).toContain('b')
        })
    })

    describe('filteredDrawerDefs', () => {
        it('returns full map when user has never customized', () => {
            const fp = useFilterPlacement('search', [], [])
            const grouped = computed<Map<string, FilterDef[]>>(() => new Map([
                ['Attributes', makeDefs([{key: 'a'}, {key: 'b'}])],
            ]))
            const filtered = fp.filteredDrawerDefs(grouped)
            expect(filtered.value.get('Attributes')?.length).toBe(2)
        })

        it('excludes defs not in the stored drawer list, and drops empty groups', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.search_drawerFilters = ['a']
            const fp = useFilterPlacement('search', [], [])
            const grouped = computed<Map<string, FilterDef[]>>(() => new Map([
                ['Attributes', makeDefs([{key: 'a'}, {key: 'b'}])],
                ['Status', makeDefs([{key: 'c'}])],
            ]))
            const filtered = fp.filteredDrawerDefs(grouped)
            expect(filtered.value.get('Attributes')?.map(d => d.key)).toEqual(['a'])
            expect(filtered.value.has('Status')).toBe(false)
        })

        it('hidden filters are always excluded', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.search_drawerFilters = ['a', 'hidden']
            const fp = useFilterPlacement('search', [], [])
            const grouped = computed<Map<string, FilterDef[]>>(() => new Map([
                ['Attributes', makeDefs([{key: 'a'}, {key: 'hidden', hidden: true}])],
            ]))
            const filtered = fp.filteredDrawerDefs(grouped)
            expect(filtered.value.get('Attributes')?.map(d => d.key)).toEqual(['a'])
        })
    })

    describe('filteredInlineDefs', () => {
        it('only returns grouped filters present in the stored inline list', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.search_inlineFilters = ['a', 'c']
            const fp = useFilterPlacement('search', [], [])
            const grouped = computed<Map<string, FilterDef[]>>(() => new Map([
                ['Attributes', makeDefs([{key: 'a'}, {key: 'b'}])],
                ['Status', makeDefs([{key: 'c'}])],
                // ungrouped section skipped regardless of inline membership
                ['', makeDefs([{key: 'd'}])],
            ]))
            const result = fp.filteredInlineDefs(grouped)
            const groups = Object.fromEntries(result.value)
            expect(groups.Attributes?.map(d => d.key)).toEqual(['a'])
            expect(groups.Status?.map(d => d.key)).toEqual(['c'])
            expect(groups['']).toBeUndefined()
        })
    })

    describe('configurableFiltersByGroup', () => {
        it('drops ungrouped section and hidden filters', () => {
            const fp = useFilterPlacement('search', [], [])
            const grouped = computed<Map<string, FilterDef[]>>(() => new Map([
                ['Attributes', makeDefs([{key: 'a'}, {key: 'b', hidden: true}])],
                ['', makeDefs([{key: 'c'}])],
            ]))
            const configurable = fp.configurableFiltersByGroup(grouped)
            expect(configurable.value.has('')).toBe(false)
            expect(configurable.value.get('Attributes')?.map(d => d.key)).toEqual(['a'])
        })
    })
})
