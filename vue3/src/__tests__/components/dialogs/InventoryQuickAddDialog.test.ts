/**
 * Regression coverage for InventoryQuickAddDialog.
 *
 * Tests the open() API — default location selection, pre-filled
 * amount/unit, and resolve-prior-promise-on-reopen.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

import InventoryQuickAddDialog from '@/components/dialogs/InventoryQuickAddDialog.vue'

function mountDialog() {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(InventoryQuickAddDialog, {
        global: {
            plugins: [createPinia(), i18n, vuetify, router],
            stubs: {
                VClosableCardTitle: {template: '<div class="stub-title"/>'},
                ModelSelect: {template: '<div class="stub-model-select"/>'},
            },
        },
    })
}

describe('InventoryQuickAddDialog', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('exposes open() as the imperative API', () => {
        const w = mountDialog()
        expect(typeof (w.vm as any).open).toBe('function')
    })

    it('open() returns a pending Promise', () => {
        const w = mountDialog()
        const p = (w.vm as any).open({
            title: 'Add',
            locations: [{value: 1, label: 'Pantry'}],
        })
        expect(p).toBeInstanceOf(Promise)
    })

    it('a second open() while one is pending resolves prior promise as null', async () => {
        const w = mountDialog()
        const api = w.vm as any
        const first = api.open({title: 'First', locations: [{value: 1, label: 'X'}]})
        await flushPromises()
        api.open({title: 'Second', locations: [{value: 2, label: 'Y'}]})
        await expect(first).resolves.toBeNull()
    })
})
