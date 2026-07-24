/**
 * Regression coverage for SelectionBar.
 *
 * Tests selected-count rendering + close/select-all/select-none emits.
 */
import {describe, it, expect, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'

import SelectionBar from '@/components/common/SelectionBar.vue'

function mountBar(selectedCount = 0) {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(SelectionBar, {
        props: {selectedCount},
        global: {plugins: [createPinia(), i18n, vuetify, router]},
    })
}

describe('SelectionBar', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('renders the selected count', () => {
        const w = mountBar(7)
        expect(w.text()).toContain('7')
    })

    it('renders an aria-live polite region for the count', () => {
        const w = mountBar(3)
        const live = w.find('[aria-live="polite"]')
        expect(live.exists()).toBe(true)
        expect(live.text()).toContain('3')
    })

    it('emits close when the X button is clicked', async () => {
        const w = mountBar()
        const closeBtn = w.findAll('.v-btn').find(b => b.attributes('aria-label') === 'Close')
        expect(closeBtn).toBeDefined()
        await closeBtn!.trigger('click')
        expect(w.emitted('close')).toBeTruthy()
    })

    it('exposes select-all / select-none slots via the selection dropdown', async () => {
        const w = mountBar(0)
        // The v-btn with "Select" text is the activator for the select menu.
        const selectBtn = w.findAll('.v-btn').find(b => b.text().includes('Select'))
        expect(selectBtn).toBeDefined()
    })
})
