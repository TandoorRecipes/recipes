import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

const mockList = vi.fn().mockResolvedValue({ results: [], count: 0 })

const mockTreeModel = {
    model: {
        name: 'Food',
        icon: 'fa-solid fa-carrot',
        localizationKey: 'Food',
        localizationKeyDescription: 'FoodDescription',
        disableCreate: false,
        disableSearch: false,
        disableDelete: false,
        disableList: false,
        disableUpdate: false,
        isMerge: true,
        isAdvancedDelete: true,
        isTree: true,
        listSettings: { treeEnabled: true, settingsKey: 'Food' },
        tableHeaders: [{ title: 'Name', key: 'name' }, { title: 'Actions', key: 'action' }],
    },
    list: mockList,
    getTableHeaders: () => [{ title: 'Name', key: 'name' }, { title: 'Actions', key: 'action' }],
    getLabel: (obj: any) => obj?.name ?? '',
}

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => mockTreeModel,
    }
})

// treeViewEnabled allows tests to simulate the user having tree view enabled.
// Injected into the TANDOOR_DEVICE_SETTINGS storage so Pinia's useUserPreferenceStore
// sees Food_treeView=true and treeActive flips false→true during model init (the bug).
let treeViewEnabled = false

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (key: string, defaultValue: any) => {
            if (key === 'TANDOOR_DEVICE_SETTINGS' && treeViewEnabled) {
                return ref({ ...(typeof defaultValue === 'object' ? defaultValue : {}), Food_treeView: true })
            }
            return ref(defaultValue)
        },
        useTitle: () => ref(''),
        useResizeObserver: () => ({ stop: vi.fn() }),
        useDebounceFn: (fn: any) => fn,
    }
})

// Mutable per-test override: default returns the defaultValue, but tests can
// override specific keys (e.g. page=2) to reproduce FOOD-01.
const routeQueryOverrides: Record<string, any> = {}
// Cache the ref per key so a test can mutate it after mount (e.g. type a query).
const routeQueryRefs: Record<string, any> = {}
vi.mock('@vueuse/router', async () => {
    const { ref } = await import('vue')
    return {
        useRouteQuery: (key: string, defaultValue: any, opts?: any) => {
            if (!(key in routeQueryRefs)) {
                routeQueryRefs[key] = ref(key in routeQueryOverrides ? routeQueryOverrides[key] : defaultValue)
            }
            return routeQueryRefs[key]
        },
    }
})

import ModelListPage from '@/pages/ModelListPage.vue'

describe('ModelListPage', () => {
    beforeEach(() => {
        resetApiMock()
        mockList.mockReset().mockResolvedValue({ results: [], count: 0 })
        for (const k of Object.keys(routeQueryOverrides)) delete routeQueryOverrides[k]
        for (const k of Object.keys(routeQueryRefs)) delete routeQueryRefs[k]
        treeViewEnabled = false
    })

    it('mounts without error', async () => {
        const wrapper = mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('renders page content beyond back button', async () => {
        const wrapper = mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()
        expect(wrapper.html().length).toBeGreaterThan(100)
    })

    it('renders back button', async () => {
        const wrapper = mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()
        expect(wrapper.text()).toContain('Back')
    })

    it('FOOD-01: page=2 URL param is not reset to page=1 by treeActive init on a tree model', async () => {
        // Simulate navigating to ?page=2 when the user has tree view enabled.
        // Bug: treeActive transitions false→true in onBeforeMount (model not yet set → model set),
        // which fires watch([ordering, filterParams, treeActive]) → loadItems({page:1}),
        // overriding the URL page param and snapping the view back to page 1.
        treeViewEnabled = true   // simulate user having tree view on in localStorage
        routeQueryOverrides['page'] = 2

        mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()

        const pageCalls = mockList.mock.calls.map((c: any[]) => c[0]?.page)
        expect(
            pageCalls,
            `list() was called with page=1 — treeActive init reset the page. All page calls: ${JSON.stringify(pageCalls)}`
        ).not.toContain(1)
    })

    it('R09-2: searching while on page>1 reloads at page 1, never requesting the stale page', async () => {
        // On page 2, entering a query must reset to page 1 before the request fires.
        // Bug: the desktop table re-fetched on :search change with the stale page,
        // yielding GET ?page=2&query=... → backend 404 (out of range) before recovering.
        routeQueryOverrides['page'] = 2
        mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()

        mockList.mockClear()   // ignore the initial page-2 load
        routeQueryRefs['query'].value = 'choc'
        await flushPromises()

        const calls = mockList.mock.calls.map((c: any[]) => c[0])
        expect(
            calls.some(c => c?.page === 2 && c?.query === 'choc'),
            `a stale out-of-range request fired: ${JSON.stringify(calls)}`
        ).toBe(false)
        expect(
            calls.some(c => c?.page === 1 && c?.query === 'choc'),
            `expected a page-1 reload for the new query: ${JSON.stringify(calls)}`
        ).toBe(true)
    })
})
