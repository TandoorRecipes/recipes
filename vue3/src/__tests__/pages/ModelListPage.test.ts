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
vi.mock('@vueuse/router', async () => {
    const { ref } = await import('vue')
    return {
        useRouteQuery: (key: string, defaultValue: any, opts?: any) => {
            if (key in routeQueryOverrides) return ref(routeQueryOverrides[key])
            return ref(defaultValue)
        },
    }
})

import ModelListPage from '@/pages/ModelListPage.vue'

describe('ModelListPage', () => {
    beforeEach(() => {
        resetApiMock()
        mockList.mockReset().mockResolvedValue({ results: [], count: 0 })
        for (const k of Object.keys(routeQueryOverrides)) delete routeQueryOverrides[k]
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
})
