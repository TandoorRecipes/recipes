import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DateTime } from 'luxon'
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
import { ResponseError } from '@/openapi'

describe('ModelDeletePage', () => {
    beforeEach(() => {
        resetApiMock()
        mockGenericModel.model.disableDelete = false
        mockGenericModel.model.isAdvancedDelete = true
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

    it('disables the delete button for models with disableDelete', async () => {
        mockGenericModel.model.disableDelete = true
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Space', id: '1' } })
        await flushPromises()

        const btn = wrapper.find('[data-test="model-delete-button"]')
        expect(btn.exists()).toBe(true)
        expect(btn.classes()).toContain('v-btn--disabled')
    })

    it('does not load delete-relationships for non-advanced-delete models', async () => {
        // Space/User/Group/FoodInheritField have no apiXProtectingList endpoints;
        // calling them throws "this.api[...] is not a function" on mount.
        mockGenericModel.model.isAdvancedDelete = false
        mountPage(ModelDeletePage, { props: { model: 'Space', id: '1' } })
        await flushPromises()

        expect(mockGetDeleteProtecting).not.toHaveBeenCalled()
        expect(mockGetDeleteCascading).not.toHaveBeenCalled()
        expect(mockGetDeleteNulling).not.toHaveBeenCalled()
    })

    it('shows a not-found state (no delete form) when the object does not exist (404)', async () => {
        mockRetrieve.mockReset().mockRejectedValue(new ResponseError({ status: 404 }))
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '999999' } })
        await flushPromises()

        expect(wrapper.find('[data-test="model-not-found"]').exists()).toBe(true)
        // the delete scaffold must NOT render for a phantom object
        expect(wrapper.find('[data-test="model-delete-button"]').exists()).toBe(false)
    })

    // delete-no-name: name-less models (e.g. an unnamed ShoppingList) produced a dangling
    // colon ("Delete Shopping List: "). Fall back to "#id · created date" so the object is
    // always identifiable.
    it('falls back to "#id · created date" when the object has no human label', async () => {
        const created = new Date('2026-06-01T12:00:00Z')
        mockRetrieve.mockReset().mockResolvedValue({ id: 5, createdAt: created })
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'ShoppingList', id: '5' } })
        await flushPromises()

        const expectedDate = DateTime.fromJSDate(created).toLocaleString(DateTime.DATE_MED)
        expect(wrapper.text()).toContain(`#5 · ${expectedDate}`)
    })

    it('falls back to just "#id" when there is no label and no created date', async () => {
        mockRetrieve.mockReset().mockResolvedValue({ id: 7 })
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'ShoppingList', id: '7' } })
        await flushPromises()

        expect(wrapper.text()).toContain('#7')
    })

    it('still shows the human label when present (no fallback)', async () => {
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()
        expect(wrapper.text()).toContain('Butter')
        expect(wrapper.text()).not.toContain('#1')
    })

    // delete-relations-table-mobile-overflow: a related object's Name is truncated so the
    // compact table fits a phone; clicking the name expands it to the full wrapped text.
    it('truncates a relation name and expands it (wraps) on click', async () => {
        mockGetDeleteProtecting.mockReset().mockResolvedValue({
            results: [{ id: 9, model: 'MealPlan', name: 'A very long related object name that overflows' }],
            count: 1,
        })
        const wrapper = mountPage(ModelDeletePage, { props: { model: 'Food', id: '1' } })
        await flushPromises()

        const nameCell = wrapper.find('[data-test="relation-name"]')
        expect(nameCell.exists()).toBe(true)
        expect(nameCell.classes()).not.toContain('relation-name--expanded')

        await nameCell.trigger('click')
        await flushPromises()
        expect(nameCell.classes()).toContain('relation-name--expanded')
    })
})
