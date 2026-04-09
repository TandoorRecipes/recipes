import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeFood, makeGenericModelReference } from '@/__tests__/factories'
import { mountPage } from '@/__tests__/pages/page-mount-helper'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

const mockRetrieve = vi.fn()
const mockDestroy = vi.fn()
const mockGetDeleteProtecting = vi.fn()
const mockGetDeleteCascading = vi.fn()
const mockGetDeleteNulling = vi.fn()

const mockGenericModel = {
    model: {
        name: 'Food',
        icon: 'fa-solid fa-carrot',
        localizationKey: 'Food',
        disableCreate: false,
        disableDelete: false,
        disableUpdate: false,
        isMerge: true,
        isAdvancedDelete: true,
        editorComponent: null,
    },
    retrieve: mockRetrieve,
    destroy: mockDestroy,
    getDeleteProtecting: mockGetDeleteProtecting,
    getDeleteCascading: mockGetDeleteCascading,
    getDeleteNulling: mockGetDeleteNulling,
    getLabel: (obj: any) => obj?.name ?? '',
}

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => mockGenericModel,
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

import ModelDeletePage from '@/pages/ModelDeletePage.vue'

describe('ModelDeletePage', () => {
    beforeEach(() => {
        resetApiMock()
        mockRetrieve.mockReset().mockResolvedValue(makeFood({ id: 1, name: 'Butter' }))
        mockDestroy.mockReset().mockResolvedValue(undefined)
        mockGetDeleteProtecting.mockReset().mockResolvedValue({ results: [], count: 0 })
        mockGetDeleteCascading.mockReset().mockResolvedValue({ results: [], count: 0 })
        mockGetDeleteNulling.mockReset().mockResolvedValue({ results: [], count: 0 })
    })

    it('mounts without error', async () => {
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('loads the object on mount', async () => {
        mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(mockRetrieve).toHaveBeenCalledWith(1)
    })

    it('displays object name after loading', async () => {
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(wrapper.text()).toContain('Butter')
    })

    it('loads relationship impact data on mount', async () => {
        mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(mockGetDeleteProtecting).toHaveBeenCalled()
        expect(mockGetDeleteCascading).toHaveBeenCalled()
        expect(mockGetDeleteNulling).toHaveBeenCalled()
    })

    it('shows delete button when no protecting objects', async () => {
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(wrapper.text()).toContain('Delete')
    })

    it('shows merge option for mergeable models', async () => {
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(wrapper.text()).toContain('Merge')
    })
})
