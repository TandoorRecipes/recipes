import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia, type PiniaPlugin } from 'pinia'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: unknown; constructor(r: unknown) { super('ResponseError'); this.response = r } },
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }), createI18n: vi.fn(() => ({ install: vi.fn() })) }))
vi.mock('vuetify', () => ({ useTheme: () => ({ change: vi.fn() }), createVuetify: vi.fn(() => ({ install: vi.fn() })) }))
vi.mock('@vueuse/router', () => ({ useRouteQuery: () => ({ value: false }) }))
vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return { useStorage: (_k: string, d: unknown) => ref(d), useTitle: () => ref('') }
})

import { useFilterPlacement } from '@/composables/useFilterPlacement'
import { useUserPreferenceStore } from '@/stores/UserPreferenceStore'

// Regression: the placement toggles read the raw device setting with no
// fallback, so any device whose saved list was empty showed every filter as
// "not set" even though the page still rendered the defaults.
function setup(inline?: string[], drawer?: string[]) {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            if (inline !== undefined) store.deviceSettings.search_inlineFilters = inline
            if (drawer !== undefined) store.deviceSettings.search_drawerFilters = drawer
        }
    }
    const pinia = createPinia(); pinia.use(prePopulate); setActivePinia(pinia)
    let composable!: ReturnType<typeof useFilterPlacement>
    const Wrapper = defineComponent({ setup() { composable = useFilterPlacement(); return {} }, template: '<div/>' })
    mount(Wrapper, { global: { plugins: [pinia] } })
    return { composable, store: useUserPreferenceStore() }
}

describe('useFilterPlacement — default fallback', () => {
    beforeEach(() => resetApiMock())

    it('falls back to defaults only when the setting was never saved (null/undefined)', () => {
        const { composable, store } = setup()
        store.deviceSettings.search_inlineFilters = undefined as unknown as string[]
        store.deviceSettings.search_drawerFilters = undefined as unknown as string[]
        expect(composable.isInlineSelected('_keywordsGroup')).toBe(true)   // an inline default
        expect(composable.isInlineSelected('ratingGte')).toBe(false)       // not an inline default
        expect(composable.isDrawerSelected('ratingGte')).toBe(true)        // a drawer default
    })

    it('respects an explicitly emptied list instead of resurrecting defaults', () => {
        const { composable } = setup([], [])
        expect(composable.isInlineSelected('_keywordsGroup')).toBe(false)
        expect(composable.isDrawerSelected('ratingGte')).toBe(false)
    })

    it('turning off the last inline filter keeps it off (regression: defaults returned)', () => {
        const { composable, store } = setup(['_keywordsGroup'], undefined)
        composable.toggleInline('_keywordsGroup')  // now empty
        expect(store.deviceSettings.search_inlineFilters).toEqual([])
        expect(composable.isInlineSelected('_keywordsGroup')).toBe(false)
        expect(composable.isInlineSelected('_foodsGroup')).toBe(false)
    })

    it('toggling out of the default state keeps the other defaults', () => {
        const { composable, store } = setup(['_keywordsGroup', '_foodsGroup', '_booksGroup'], undefined)
        composable.toggleInline('_keywordsGroup')
        expect(composable.isInlineSelected('_keywordsGroup')).toBe(false)
        expect(composable.isInlineSelected('_foodsGroup')).toBe(true)
        expect(store.deviceSettings.search_inlineFilters).toEqual(['_foodsGroup', '_booksGroup'])
    })

    it('honours a non-empty saved list verbatim', () => {
        const { composable } = setup(['ratingGte'], undefined)
        expect(composable.isInlineSelected('ratingGte')).toBe(true)
        expect(composable.isInlineSelected('_keywordsGroup')).toBe(false)
    })
})
