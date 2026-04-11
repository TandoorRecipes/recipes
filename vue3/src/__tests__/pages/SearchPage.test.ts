/**
 * SearchPage integration tests.
 *
 * Unit tests for URL ↔ filter ↔ API mapping live in useUrlFilters.test.ts
 * and RecipeList.test.ts. This file covers mount-time fetch, live re-query,
 * and empty-state behavior.
 */
import {describe, it, expect, beforeEach, vi} from 'vitest'
import {flushPromises, mount} from '@vue/test-utils'
import {createPinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'
import {h} from 'vue'
import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeUserPreference} from '@/__tests__/factories'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

import SearchPage from '@/pages/SearchPage.vue'

const HEAVY_STUBS: Record<string, any> = {
    RecipeContextMenu: {render() { return h('div', {class: 'stub-recipe-context-menu'}) }},
    RecipeCard: {props: ['recipe'], render() { return h('div', {class: 'stub-recipe-card'}) }},
    KeywordsBar: {props: ['keywords'], render() { return h('div', {class: 'stub-keywords-bar'}) }},
    RandomIcon: {render() { return h('div', {class: 'stub-random-icon'}) }},
    BatchDeleteDialog: {render() { return h('div') }},
    BatchEditRecipeDialog: {render() { return h('div') }},
    ModelSelect: {props: ['model', 'modelValue'], render() { return h('div', {class: 'stub-model-select'}) }},
    ModelListSettingsPanel: {render() { return h('div', {class: 'stub-settings-panel'}) }},
    ModelListFilterChips: {props: ['filterDefs', 'getFilter', 'setFilter', 'clearFilter', 'clearAllFilters', 'activeFilterCount'], render() { return h('div', {class: 'stub-filter-chips'}) }},
}

function makeRouter(initialQuery: Record<string, any> = {}) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: '/', name: 'StartPage', component: {template: '<div/>'}},
            {path: '/advanced-search', name: 'SearchPage', component: {template: '<div/>'}},
            {path: '/recipe/view/:id', name: 'RecipeViewPage', component: {template: '<div/>'}},
        ],
    })
    return {router, initialQuery}
}

async function mountSearchPage(initialQuery: Record<string, any> = {}, viewMode: 'table' | 'grid' = 'grid') {
    const prePopulatePlugin: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            store.deviceSettings = {
                search_itemsPerPage: 25,
                search_viewMode: viewMode,
                search_visibleFilters: [],
            } as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulatePlugin)

    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components, directives})
    const {router} = makeRouter()

    await router.push({path: '/advanced-search', query: initialQuery})
    await router.isReady()

    const wrapper = mount(SearchPage, {
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: HEAVY_STUBS,
        },
    })
    await flushPromises()
    return {wrapper, router}
}

describe('SearchPage (Phase 3 rewrite)', () => {
    beforeEach(() => {
        vi.useRealTimers()
        resetApiMock()
        apiMock.apiRecipeList = vi.fn().mockResolvedValue({results: [], count: 0, next: null, previous: null})
        apiMock.apiCustomFilterList = vi.fn().mockResolvedValue({results: [], count: 0, next: null, previous: null})
    })

    describe('initial fetch', () => {
        it('calls apiRecipeList on mount with default params (no filters)', async () => {
            await mountSearchPage()
            expect(apiMock.apiRecipeList).toHaveBeenCalled()
            const arg = (apiMock.apiRecipeList as any).mock.calls[0][0]
            expect(arg.page).toBe(1)
            expect(arg.pageSize).toBe(25)
        })

        it('translates ?keywords=1,2 into a keywords array on the API call', async () => {
            await mountSearchPage({keywords: '1,2'})
            const arg = (apiMock.apiRecipeList as any).mock.calls[0][0]
            expect(arg.keywords).toEqual([1, 2])
        })

        it('translates ?ratingGte=3 into ratingGte on the API call', async () => {
            await mountSearchPage({ratingGte: '3'})
            const arg = (apiMock.apiRecipeList as any).mock.calls[0][0]
            expect(arg.ratingGte).toBe(3)
        })

        it('passes ?ordering=-lastcooked to the API call', async () => {
            await mountSearchPage({ordering: '-lastcooked'})
            const arg = (apiMock.apiRecipeList as any).mock.calls[0][0]
            expect(arg.sortOrder).toBe('-lastcooked')
        })

        it('passes ?query=pasta to the API call', async () => {
            await mountSearchPage({query: 'pasta'})
            const arg = (apiMock.apiRecipeList as any).mock.calls[0][0]
            expect(arg.query).toBe('pasta')
        })
    })

    describe('direct URL params', () => {
        it('fires exactly one apiRecipeList call on mount', async () => {
            await mountSearchPage({keywords: '1,2'})
            expect((apiMock.apiRecipeList as any).mock.calls.length).toBe(1)
        })
    })

    describe('live re-query', () => {
        it('re-fetches when ordering changes', async () => {
            vi.useFakeTimers({shouldAdvanceTime: true})
            const {wrapper, router} = await mountSearchPage()
            const callsBefore = (apiMock.apiRecipeList as any).mock.calls.length
            await router.push({path: '/advanced-search', query: {ordering: '-rating'}})
            await flushPromises()
            vi.advanceTimersByTime(350)
            await flushPromises()
            const callsAfter = (apiMock.apiRecipeList as any).mock.calls.length
            expect(callsAfter).toBeGreaterThan(callsBefore)
            const arg = (apiMock.apiRecipeList as any).mock.calls[callsAfter - 1][0]
            expect(arg.sortOrder).toBe('-rating')
            wrapper.unmount()
            vi.useRealTimers()
        })

        it('re-fetches when filters change', async () => {
            vi.useFakeTimers({shouldAdvanceTime: true})
            const {wrapper, router} = await mountSearchPage()
            const callsBefore = (apiMock.apiRecipeList as any).mock.calls.length
            await router.push({path: '/advanced-search', query: {internal: '1'}})
            await flushPromises()
            vi.advanceTimersByTime(350)
            await flushPromises()
            const callsAfter = (apiMock.apiRecipeList as any).mock.calls.length
            expect(callsAfter).toBeGreaterThan(callsBefore)
            wrapper.unmount()
            vi.useRealTimers()
        })
    })

    describe('empty state', () => {
        it('renders a visible empty-state message when the API returns zero results', async () => {
            apiMock.apiRecipeList = vi.fn().mockResolvedValue({results: [], count: 0, next: null, previous: null})
            const {wrapper} = await mountSearchPage()
            await new Promise(r => setTimeout(r, 0))
            await flushPromises()
            // Assert using the data-test attribute which is a stable selector.
            expect(wrapper.find('[data-test="empty-state-reset"]').exists()).toBe(true)
        })

        it('empty-state exposes a reset-filters button that triggers a re-fetch', async () => {
            vi.useFakeTimers({shouldAdvanceTime: true})
            apiMock.apiRecipeList = vi.fn().mockResolvedValue({results: [], count: 0, next: null, previous: null})
            const {wrapper} = await mountSearchPage({query: 'zzznoresults'})
            vi.advanceTimersByTime(350)
            await flushPromises()
            const resetBtn = wrapper.find('[data-test="empty-state-reset"]')
            expect(resetBtn.exists()).toBe(true)
            const callsBefore = (apiMock.apiRecipeList as any).mock.calls.length
            await resetBtn.trigger('click')
            await flushPromises()
            vi.advanceTimersByTime(350)
            await flushPromises()
            expect((apiMock.apiRecipeList as any).mock.calls.length).toBeGreaterThan(callsBefore)
            vi.useRealTimers()
        })

        it('does NOT render the empty state when recipes are present', async () => {
            apiMock.apiRecipeList = vi.fn().mockResolvedValue({
                results: [{id: 1, name: 'R1', image: null, keywords: []}],
                count: 1, next: null, previous: null,
            })
            const {wrapper} = await mountSearchPage()
            await flushPromises()
            expect(wrapper.find('[data-test="empty-state-reset"]').exists()).toBe(false)
        })
    })

    describe('settings panel default tab (UX Critical #1)', () => {
        it('opens Settings tab in grid view (includes children + filter visibility)', async () => {
            // Settings tab now has include-children and filter visibility controls
            // that apply in both grid and table modes.
            const {wrapper} = await mountSearchPage({}, 'grid')
            const vm = wrapper.vm as any
            vm.openSettingsPanel('settings')
            await flushPromises()
            expect(vm.settingsActiveTab).toBe('settings')
            expect(vm.settingsPanelOpen).toBe(true)
        })

        it('allows Settings tab to be active when explicitly opened in table view', async () => {
            // In table view the Settings tab's column controls are meaningful,
            // so a user click on the gear should land on Settings as requested.
            const {wrapper} = await mountSearchPage({}, 'table')
            const vm = wrapper.vm as any
            vm.openSettingsPanel('settings')
            await flushPromises()
            expect(vm.settingsActiveTab).toBe('settings')
        })

    })

    describe('settings panel injection contract', () => {
        it('mounts the real ModelListSettingsPanel without crashing', async () => {
            // Regression: ModelListSettingsPanel reads inject(MODEL_LIST_SETTINGS_KEY)
            // in its setup(). If SearchPage doesn't provide the key, the inject
            // returns null, the destructuring throws, and the panel crashes the
            // first time it opens. The HEAVY_STUBS map normally hides this by
            // stubbing the panel out — this test re-mounts with the real component.
            const errors: any[] = []
            const origError = console.error
            console.error = (...args: any[]) => { errors.push(args) }
            try {
                // Same setup as mountSearchPage but with the real ModelListSettingsPanel
                const prePopulatePlugin: PiniaPlugin = ({store}) => {
                    if (store.$id === 'user_preference_store') {
                        store.userSettings = makeUserPreference() as any
                        store.deviceSettings = {
                            search_itemsPerPage: 25,
                            search_viewMode: 'table',
                            search_visibleFilters: [],
                        } as any
                    }
                }
                const pinia = createPinia()
                pinia.use(prePopulatePlugin)

                const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
                const vuetify = createVuetify({components, directives})
                const {router} = makeRouter()
                await router.push({path: '/advanced-search', query: {}})
                await router.isReady()

                // Stubs MINUS ModelListSettingsPanel — that's what we're exercising.
                const stubs = {...HEAVY_STUBS}
                delete (stubs as any).ModelListSettingsPanel

                const wrapper = mount(SearchPage, {
                    global: {plugins: [pinia, i18n, vuetify, router], stubs},
                })
                await flushPromises()
                await new Promise(r => setTimeout(r, 0))
                await flushPromises()

                // The panel's setup() runs as soon as it's instantiated by SearchPage's
                // template render — even before it's opened — because Vue creates
                // child components eagerly. If the inject contract is missing, the
                // mount itself throws.
                expect(wrapper.exists()).toBe(true)
                // No "Cannot destructure property" or similar console.error.
                const fatalErrors = errors.filter(args =>
                    args.some((a: any) => typeof a === 'object' && a?.message?.includes('destructure'))
                )
                expect(fatalErrors).toEqual([])
            } finally {
                console.error = origError
            }
        })
    })

    describe('random sort pagination gating', () => {
        it('hides v-pagination when ordering is random', async () => {
            const {wrapper} = await mountSearchPage({ordering: 'random'})
            // Pagination component is not rendered in random mode; the random
            // re-roll button is shown instead.
            expect(wrapper.find('.v-pagination').exists()).toBe(false)
        })

        it('shows v-pagination for non-random ordering', async () => {
            // Need at least 1 result for pagination to render at all
            apiMock.apiRecipeList = vi.fn().mockResolvedValue({
                results: [{id: 1, name: 'Test', image: null, keywords: []}],
                count: 100,
                next: null,
                previous: null,
            })
            const {wrapper} = await mountSearchPage({ordering: '-lastcooked'})
            await flushPromises()
            expect(wrapper.find('.v-pagination').exists()).toBe(true)
        })
    })
})
