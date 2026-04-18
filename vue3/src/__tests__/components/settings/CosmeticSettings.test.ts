/**
 * Regression coverage for CosmeticSettings.
 *
 * Smoke test: mounts without error, renders the Appearance expansion
 * panel, and the theme v-select is bound to userSettings.theme.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'
import {ref} from 'vue'

import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeUserPreference} from '@/__tests__/factories'

// CosmeticSettings → LanguageSelect → @/i18n.ts → virtual:locale-coverage
// which is provided by a Vite plugin not loaded in the vitest env. Short-
// circuit by mocking @/i18n so the virtual module is never reached.
vi.mock('@/i18n', () => ({
    SUPPORT_LOCALES: [{code: 'en', label: 'English'}],
    resolveLocale: (c: string) => c,
    localeCoverage: {en: 100},
    LOCALE_MIN_COVERAGE: 0,
}))

vi.mock('vue-router', async (imp) => ({...(await imp<any>()), useRoute: () => ({query: {}})}))
vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('vuetify', async (imp) => ({...(await imp<typeof import('vuetify')>()), useTheme: () => ({change: vi.fn()})}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

import CosmeticSettings from '@/components/settings/CosmeticSettings.vue'

function mountSettings() {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {Appearance: 'Appearance', Theme: 'Theme'}},
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(CosmeticSettings, {
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                RecipeCard: {template: '<div class="stub-recipe-card"/>'},
                VColorPicker: {template: '<div class="stub-color-picker"/>'},
                LanguageSelect: {template: '<div class="stub-language-select"/>'},
            },
        },
    })
}

describe('CosmeticSettings', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    it('mounts without error', () => {
        const w = mountSettings()
        expect(w.exists()).toBe(true)
    })

    it('renders the Appearance expansion panel', () => {
        const w = mountSettings()
        expect(w.html()).toContain('Appearance')
    })
})
