/**
 * ModelListToolbar tests focused on mobile touch-target sizing.
 *
 * UX review Critical #5: mobile toolbar buttons rendered at 24px, failing
 * the WCAG 2.5.5 AAA 44×44 minimum recommendation and making buttons hard
 * to hit on a 390-wide phone. The fix bumps button size to `large` (44px)
 * and drops `density="compact"` on the mobile carousel action buttons.
 */
import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {ref} from 'vue'

// Mock useDisplay to force mobile vs desktop mode. Must be a real Vue ref
// so the template auto-unwrap works; a plain {value} object stays truthy
// on the `!mobile` check because Vue doesn't auto-unwrap arbitrary objects.
const mobileRef = ref(true)
vi.mock('vuetify', async (importOriginal) => {
    const orig = await importOriginal<any>()
    return {
        ...orig,
        useDisplay: () => ({mobile: mobileRef}),
    }
})

import ModelListToolbar from '@/components/model_list/ListToolbar.vue'

function mountToolbar(props: Record<string, any> = {}) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {Filters: 'Filters', Select: 'Select', Reset: 'Reset', Settings: 'Settings', Search: 'Search', sort_by: 'Sort by', Actions: 'Actions'}},
        missingWarn: false, fallbackWarn: false,
    })
    return mount(ModelListToolbar, {
        props: {
            hasFilters: true,
            hasMultiSelect: true,
            showReset: true,
            sortOptions: [{key: 'name', labelKey: 'Name'}],
            ...props,
        },
        global: {plugins: [vuetify, i18n]},
    })
}

describe('ModelListToolbar — mobile touch targets', () => {
    it('mobile action buttons use size=large (WCAG 44px target)', async () => {
        mobileRef.value = true
        const wrapper = mountToolbar()
        const carousel = wrapper.find('.model-list-toolbar-carousel')
        expect(carousel.exists()).toBe(true)
        const buttons = carousel.findAll('.v-btn')
        expect(buttons.length).toBeGreaterThan(0)
        for (const btn of buttons) {
            expect(btn.classes()).toContain('v-btn--size-large')
        }
    })

    it('mobile action buttons do NOT use density=compact (which shrinks below 44px)', async () => {
        mobileRef.value = true
        const wrapper = mountToolbar()
        const carousel = wrapper.find('.model-list-toolbar-carousel')
        const buttons = carousel.findAll('.v-btn')
        for (const btn of buttons) {
            expect(btn.classes()).not.toContain('v-btn--density-compact')
        }
    })

    it('desktop layout retains size=small action buttons', async () => {
        mobileRef.value = false
        const wrapper = mountToolbar()
        expect(wrapper.find('.model-list-toolbar-carousel').exists()).toBe(false)
        const iconButtons = wrapper.findAll('.v-btn--size-small')
        expect(iconButtons.length).toBeGreaterThan(0)
    })
})
