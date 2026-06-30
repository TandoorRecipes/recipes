/**
 * Regression coverage for useModelListColumns.
 *
 * Characterization tests for column visibility resolution (sentinel →
 * header defaults; array → explicit), display-mode persistence, and
 * visibleHeaders / enhancedColumns / allColumns projections.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {computed, ref} from 'vue'
import {createPinia, setActivePinia} from 'pinia'

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({push: vi.fn(), replace: vi.fn()}),
}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('vue-i18n', () => ({useI18n: () => ({t: (k: string) => k})}))

import {useModelListColumns} from '@/composables/modellist/useModelListColumns'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

const t = (k: string) => `t:${k}`

function makeModel(opts: {
    headers?: Array<{key: string, title: string, type?: string, hidden?: boolean, defaultDisplayMode?: 'icon' | 'text'}>,
    settingsKey?: string | null,
}) {
    return computed(() => ({
        tableHeaders: opts.headers ?? [],
        listSettings: opts.settingsKey === null ? undefined : {settingsKey: opts.settingsKey ?? 'food'},
    } as any))
}

describe('useModelListColumns', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        // setActivePinia creates a new pinia, but UserPreferenceStore exposes
        // a mutable deviceSettings object that persists across calls in the
        // same module process. Explicitly clear the keys we touch.
        const store = useUserPreferenceStore()
        delete store.deviceSettings.food_hiddenColumns
        delete store.deviceSettings.food_columnDisplayModes
    })

    describe('hasEnhancedList', () => {
        it('is true when model has listSettings', () => {
            const {hasEnhancedList} = useModelListColumns(makeModel({settingsKey: 'food'}), t)
            expect(hasEnhancedList.value).toBe(true)
        })

        it('is false when model has no listSettings', () => {
            const {hasEnhancedList} = useModelListColumns(makeModel({settingsKey: null}), t)
            expect(hasEnhancedList.value).toBe(false)
        })
    })

    describe('visibleHeaders / effectiveHidden', () => {
        it('uses header-level hidden defaults when stored is sentinel (null)', () => {
            const model = makeModel({
                settingsKey: 'food',
                headers: [
                    {key: 'name', title: 'Name'},
                    {key: 'stock', title: 'Stock', hidden: true},
                    {key: 'actions', title: '', type: 'action-menu'},
                ],
            })
            const {visibleHeaders} = useModelListColumns(model, t)
            const keys = (visibleHeaders.value as any[]).map(h => h.key)
            expect(keys).toEqual(['name', 'actions'])  // 'stock' hidden by default
        })

        it('uses user-configured hidden list when stored is an array', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_hiddenColumns = ['name']
            const model = makeModel({
                settingsKey: 'food',
                headers: [
                    {key: 'name', title: 'Name'},
                    {key: 'stock', title: 'Stock', hidden: true},
                ],
            })
            const {visibleHeaders} = useModelListColumns(model, t)
            const keys = (visibleHeaders.value as any[]).map(h => h.key)
            expect(keys).toEqual(['stock'])  // user-configured; ignores header-level hidden
        })

        it('empty array means all columns visible', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_hiddenColumns = []
            const model = makeModel({
                settingsKey: 'food',
                headers: [
                    {key: 'name', title: 'Name'},
                    {key: 'stock', title: 'Stock', hidden: true},
                ],
            })
            const {visibleHeaders} = useModelListColumns(model, t)
            const keys = (visibleHeaders.value as any[]).map(h => h.key)
            expect(keys).toEqual(['name', 'stock'])
        })

        it('non-enhanced model falls back to header-level hidden only (ignores settings)', () => {
            const store = useUserPreferenceStore()
            // Non-enhanced: listSettings undefined → settingsKey lookup skipped.
            store.deviceSettings.food_hiddenColumns = ['name']
            const model = makeModel({
                settingsKey: null,
                headers: [
                    {key: 'name', title: 'Name'},
                    {key: 'stock', title: 'Stock', hidden: true},
                ],
            })
            const {visibleHeaders} = useModelListColumns(model, t)
            const keys = (visibleHeaders.value as any[]).map(h => h.key)
            expect(keys).toEqual(['name'])  // only the header-level hidden applies
        })

        it('applies translation to header titles via the t function', () => {
            const model = makeModel({
                settingsKey: 'food',
                headers: [{key: 'name', title: 'Name'}],
            })
            const {visibleHeaders} = useModelListColumns(model, t)
            expect((visibleHeaders.value as any[])[0].title).toBe('t:Name')
        })

        it('does not mutate the original header objects', () => {
            const original = {key: 'name', title: 'Name'}
            const model = makeModel({settingsKey: 'food', headers: [original]})
            const {visibleHeaders} = useModelListColumns(model, t)
            void visibleHeaders.value
            expect(original.title).toBe('Name')
        })
    })

    describe('enhancedColumns', () => {
        it('returns [] for non-enhanced models', () => {
            const model = makeModel({settingsKey: null, headers: [{key: 'a', title: 'A'}]})
            const {enhancedColumns} = useModelListColumns(model, t)
            expect(enhancedColumns.value).toEqual([])
        })

        it('excludes hidden + action-menu columns for enhanced models', () => {
            const model = makeModel({
                settingsKey: 'food',
                headers: [
                    {key: 'name', title: 'Name'},
                    {key: 'hidden', title: 'H', hidden: true},
                    {key: 'actions', title: '', type: 'action-menu'},
                ],
            })
            const {enhancedColumns} = useModelListColumns(model, t)
            expect(enhancedColumns.value.map(h => h.key)).toEqual(['name'])
        })
    })

    describe('allColumns', () => {
        it('returns every non-action-menu header regardless of hidden state', () => {
            const model = makeModel({
                settingsKey: 'food',
                headers: [
                    {key: 'a', title: 'A'},
                    {key: 'b', title: 'B', hidden: true},
                    {key: 'actions', title: '', type: 'action-menu'},
                ],
            })
            const {allColumns} = useModelListColumns(model, t)
            expect(allColumns.value.map(h => h.key)).toEqual(['a', 'b'])
        })
    })

    describe('toggleColumn', () => {
        it('is a no-op for non-enhanced models', () => {
            const model = makeModel({settingsKey: null, headers: [{key: 'a', title: 'A'}]})
            const store = useUserPreferenceStore()
            const before = {...store.deviceSettings}
            const {toggleColumn} = useModelListColumns(model, t)
            toggleColumn('a')
            // Assert no persistence happened under any likely settingsKey
            expect(store.deviceSettings.food_hiddenColumns).toBeUndefined()
        })

        it('initializes from header-level defaults when stored is sentinel (null)', () => {
            const model = makeModel({
                settingsKey: 'food',
                headers: [
                    {key: 'name', title: 'Name'},
                    {key: 'stock', title: 'Stock', hidden: true},
                ],
            })
            const {toggleColumn} = useModelListColumns(model, t)
            // stock is hidden by default; toggling should make it visible (remove from list)
            toggleColumn('stock')
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.food_hiddenColumns).toEqual([])  // no longer hidden
        })

        it('adds a previously-visible column to the hidden list', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_hiddenColumns = []
            const model = makeModel({settingsKey: 'food', headers: [{key: 'name', title: 'Name'}]})
            const {toggleColumn} = useModelListColumns(model, t)
            toggleColumn('name')
            expect(store.deviceSettings.food_hiddenColumns).toEqual(['name'])
        })

        it('removes a previously-hidden column from the list', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_hiddenColumns = ['name']
            const model = makeModel({settingsKey: 'food', headers: [{key: 'name', title: 'Name'}]})
            const {toggleColumn} = useModelListColumns(model, t)
            toggleColumn('name')
            expect(store.deviceSettings.food_hiddenColumns).toEqual([])
        })
    })

    describe('getDisplayMode / setDisplayMode', () => {
        it('returns stored mode when set', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_columnDisplayModes = {status: 'text'}
            const model = makeModel({settingsKey: 'food', headers: [{key: 'status', title: 'S'}]})
            const {getDisplayMode} = useModelListColumns(model, t)
            expect(getDisplayMode('status')).toBe('text')
        })

        it('falls back to header defaultDisplayMode when not set', () => {
            const model = makeModel({
                settingsKey: 'food',
                headers: [{key: 'status', title: 'S', defaultDisplayMode: 'text'}],
            })
            const {getDisplayMode} = useModelListColumns(model, t)
            expect(getDisplayMode('status')).toBe('text')
        })

        it('final fallback is icon when nothing is set', () => {
            const model = makeModel({settingsKey: 'food', headers: [{key: 'status', title: 'S'}]})
            const {getDisplayMode} = useModelListColumns(model, t)
            expect(getDisplayMode('status')).toBe('icon')
        })

        it('getDisplayMode returns icon for non-enhanced models', () => {
            const model = makeModel({
                settingsKey: null,
                headers: [{key: 'status', title: 'S', defaultDisplayMode: 'text'}],
            })
            const {getDisplayMode} = useModelListColumns(model, t)
            expect(getDisplayMode('status')).toBe('icon')
        })

        it('setDisplayMode persists to device settings under the settingsKey prefix', () => {
            const model = makeModel({settingsKey: 'food', headers: [{key: 'status', title: 'S'}]})
            const {setDisplayMode} = useModelListColumns(model, t)
            setDisplayMode('status', 'text')
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.food_columnDisplayModes).toEqual({status: 'text'})
        })

        it('setDisplayMode is a no-op for non-enhanced models', () => {
            const model = makeModel({settingsKey: null, headers: [{key: 'status', title: 'S'}]})
            const {setDisplayMode} = useModelListColumns(model, t)
            setDisplayMode('status', 'text')
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.food_columnDisplayModes).toBeUndefined()
        })
    })

    describe('isColumnVisible', () => {
        it('returns true for non-hidden columns', () => {
            const model = makeModel({settingsKey: 'food', headers: [{key: 'name', title: 'Name'}]})
            const {isColumnVisible} = useModelListColumns(model, t)
            expect(isColumnVisible('name')).toBe(true)
        })

        it('returns false for hidden columns', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_hiddenColumns = ['name']
            const model = makeModel({settingsKey: 'food', headers: [{key: 'name', title: 'Name'}]})
            const {isColumnVisible} = useModelListColumns(model, t)
            expect(isColumnVisible('name')).toBe(false)
        })
    })
})
