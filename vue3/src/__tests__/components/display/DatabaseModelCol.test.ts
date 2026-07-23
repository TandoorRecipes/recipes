/**
 * Regression + resurrection-guard for DatabaseModelCol's `disabled` prop (C4).
 *
 * The prop and its :disabled binding on the v-card were removed, but
 * HouseholdPage.vue still passes :disabled — so the UserSpace management card
 * stayed clickable even with no household (the state it must block). These tests
 * fail if the prop is dropped again (the card no longer reflects `disabled`).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock } from '@/__tests__/api-mock'

vi.mock('@/openapi', async (imp) => ({ ...(await imp<any>()), ApiApi: class { constructor() { return apiMock } } }))

import DatabaseModelCol from '@/components/display/DatabaseModelCol.vue'

function mountCol(disabled: boolean) {
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const vuetify = createVuetify({ components: vuetifyComponents, directives: vuetifyDirectives })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div/>' } }, { path: '/list/:model', name: 'ModelListPage', component: { template: '<div/>' } }] })
    return mount(DatabaseModelCol, {
        props: { model: 'UserSpace', disabled } as any,
        global: { plugins: [i18n, vuetify, router] },
    })
}

describe('DatabaseModelCol — disabled prop (C4)', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('disables the card when disabled=true', () => {
        const wrapper = mountCol(true)
        expect(wrapper.find('.v-card').classes()).toContain('v-card--disabled')
        wrapper.unmount()
    })

    it('leaves the card enabled when disabled=false', () => {
        const wrapper = mountCol(false)
        expect(wrapper.find('.v-card').classes()).not.toContain('v-card--disabled')
        wrapper.unmount()
    })
})
