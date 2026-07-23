/**
 * Regression coverage for InventoryQuickAddDialog manage-mode add.
 *
 * Defect (visually confirmed on preview): clicking "Add" in the Pantry
 * manage dialog posted a payload with a blank food.name and no
 * inventory_location.household, so the backend returned 400
 * ({"inventory_location":{"household":["This field is required."]},
 *   "food":{"name":["This field may not be blank."]}}).
 *
 * These tests lock in that handleManageAdd sends the household (from the
 * selected location) and a non-blank food name (threaded via openManage).
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'

import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {ErrorMessageType} from '@/stores/MessageStore'

vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

// The component only ever calls useMessageStore().addError inline, so a stub
// store lets us assert on it without pulling the real store's useI18n (which
// must run inside a setup function) into the test's top-level scope.
const {addErrorMock} = vi.hoisted(() => ({addErrorMock: vi.fn()}))
vi.mock('@/stores/MessageStore', async (imp) => ({...(await imp<any>()), useMessageStore: () => ({addError: addErrorMock})}))

import InventoryQuickAddDialog from '@/components/dialogs/InventoryQuickAddDialog.vue'

function mountDialog() {
    setActivePinia(createPinia())
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(InventoryQuickAddDialog, {
        attachTo: document.body,
        global: {
            plugins: [i18n, vuetify],
            stubs: {
                // ModelSelect makes its own API calls on load; the Unit field is
                // irrelevant to this defect (unit stays null).
                ModelSelect: {template: '<div class="model-select-stub" />'},
                VClosableCardTitle: {template: '<div class="title-stub" />'},
            },
        },
    })
}

function clickAdd() {
    const addBtn = [...document.querySelectorAll('.v-btn')]
        .find(b => b.textContent?.includes('Add')) as HTMLElement | undefined
    addBtn?.click()
}

describe('InventoryQuickAddDialog manage-mode add', () => {
    beforeEach(() => { resetApiMock(); addErrorMock.mockClear() })

    it('ICM-ADD-01: posts inventory_location.household from the selected location', async () => {
        apiMock.apiInventoryEntryList.mockResolvedValue({results: []})
        apiMock.apiInventoryEntryCreate.mockResolvedValue({id: 99})
        const wrapper = mountDialog()

        // openManage returns a promise that only resolves when the dialog
        // closes — do NOT await it, just let its internal entry-list load run.
        void (wrapper.vm as any).openManage({
            title: 'Pantry: celery',
            foodId: 42,
            foodName: 'celery',
            locations: [{value: 2, label: 'Bar Cart', household: {id: 1, name: 'Default'}}],
            defaultLocationId: 2,
            amount: 4,
            unit: null,
        })
        await flushPromises()

        clickAdd()
        await flushPromises()

        expect(apiMock.apiInventoryEntryCreate).toHaveBeenCalledTimes(1)
        const payload = apiMock.apiInventoryEntryCreate.mock.calls[0][0].inventoryEntry
        expect(payload.inventoryLocation.household).toEqual({id: 1, name: 'Default'})
        wrapper.unmount()
    })

    it('ICM-ADD-02: posts a non-blank food.name', async () => {
        apiMock.apiInventoryEntryList.mockResolvedValue({results: []})
        apiMock.apiInventoryEntryCreate.mockResolvedValue({id: 99})
        const wrapper = mountDialog()

        // openManage returns a promise that only resolves when the dialog
        // closes — do NOT await it, just let its internal entry-list load run.
        void (wrapper.vm as any).openManage({
            title: 'Pantry: celery',
            foodId: 42,
            foodName: 'celery',
            locations: [{value: 2, label: 'Bar Cart', household: {id: 1, name: 'Default'}}],
            defaultLocationId: 2,
            amount: 4,
            unit: null,
        })
        await flushPromises()

        clickAdd()
        await flushPromises()

        expect(apiMock.apiInventoryEntryCreate).toHaveBeenCalledTimes(1)
        const payload = apiMock.apiInventoryEntryCreate.mock.calls[0][0].inventoryEntry
        expect(payload.food.name).toBe('celery')
        wrapper.unmount()
    })

    it('ICM-ADD-03: surfaces a FETCH_ERROR when the existing-entries load fails', async () => {
        const err = new Error('boom')
        apiMock.apiInventoryEntryList.mockRejectedValue(err)
        const wrapper = mountDialog()

        void (wrapper.vm as any).openManage({
            title: 'Pantry: celery',
            foodId: 42,
            foodName: 'celery',
            locations: [{value: 2, label: 'Bar Cart', household: {id: 1, name: 'Default'}}],
            defaultLocationId: 2,
            amount: 4,
            unit: null,
        })
        await flushPromises()

        // A failed load must be signalled — not silently rendered as an empty
        // pantry (which would invite duplicate adds).
        expect(addErrorMock).toHaveBeenCalledWith(ErrorMessageType.FETCH_ERROR, err)
        // ...while the dialog still opens with an empty list so it stays usable.
        expect((wrapper.vm as any).existingEntries).toEqual([])
        wrapper.unmount()
    })
})
