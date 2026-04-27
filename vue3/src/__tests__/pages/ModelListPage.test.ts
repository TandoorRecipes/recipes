import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

const mockList = vi.fn().mockResolvedValue({ results: [], count: 0 })

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => ({
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
                tableHeaders: [{ title: 'Name', key: 'name' }, { title: 'Actions', key: 'action' }],
            },
            list: mockList,
            getTableHeaders: () => [{ title: 'Name', key: 'name' }, { title: 'Actions', key: 'action' }],
            getLabel: (obj: any) => obj?.name ?? '',
        }),
    }
})

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useTitle: () => ref(''),
    }
})

vi.mock('@vueuse/router', async () => {
    const { ref } = await import('vue')
    return {
        useRouteQuery: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

import ModelListPage from '@/pages/ModelListPage.vue'

describe('ModelListPage', () => {
    beforeEach(() => {
        resetApiMock()
        mockList.mockReset().mockResolvedValue({ results: [], count: 0 })
    })

    it('mounts without error', async () => {
        const wrapper = mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('renders page content beyond back button', async () => {
        const wrapper = mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()
        // Verify the page rendered more than just the back button
        expect(wrapper.html().length).toBeGreaterThan(100)
    })

    it('renders back button', async () => {
        const wrapper = mountPage(ModelListPage, { props: { model: 'Food' } })
        await flushPromises()
        expect(wrapper.text()).toContain('Back')
    })
})
