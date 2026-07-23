/**
 * Tests for TabbedDrawer's pinnable gating: the pin (thumbtack) button is shown
 * by default on desktop but can be suppressed with :pinnable="false".
 */
import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'

import TabbedDrawer from '@/components/common/TabbedDrawer.vue'

function mountDrawer(props: Record<string, unknown> = {}) {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({
        components: vuetifyComponents, directives: vuetifyDirectives,
        display: {mobileBreakpoint: 0}, // desktop: the navigation drawer (with pin) renders
    })
    // v-navigation-drawer needs a Vuetify layout, so host it inside a v-app.
    const Host = {
        components: {TabbedDrawer},
        data: () => ({drawerProps: {modelValue: true, tabs: [{key: 'a', label: 'A', icon: 'fa-solid fa-gear'}], ...props}}),
        template: '<v-app><TabbedDrawer v-bind="drawerProps" /></v-app>',
    }
    return mount(Host, {global: {plugins: [i18n, vuetify]}})
}

describe('TabbedDrawer pinnable', () => {
    it('shows the pin button by default on desktop', () => {
        expect(mountDrawer().find('[aria-label="Pin"]').exists()).toBe(true)
    })

    it('hides the pin button when pinnable is false', () => {
        expect(mountDrawer({pinnable: false}).find('[aria-label="Pin"]').exists()).toBe(false)
    })
})
