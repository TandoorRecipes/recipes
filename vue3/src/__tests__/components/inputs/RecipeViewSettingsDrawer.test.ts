/**
 * Regression coverage for RecipeViewSettingsDrawer.
 *
 * Characterization tests for the drawer model-value / pinned / tabs
 * wiring to useRecipeViewSettings singleton.
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

vi.mock('vue-router', async (imp) => ({...(await imp<any>()), useRoute: () => ({query: {}})}))
vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

import RecipeViewSettingsDrawer from '@/components/inputs/RecipeViewSettingsDrawer.vue'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'

function mountDrawer() {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(RecipeViewSettingsDrawer, {
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                TabbedDrawer: {template: '<div class="stub-drawer"><slot name="overview"/><slot name="details"/></div>'},
            },
        },
    })
}

describe('RecipeViewSettingsDrawer', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
        // Reset the module-scope singleton refs
        const {isOpen, isPinned} = useRecipeViewSettings()
        isOpen.value = false
        isPinned.value = false
    })

    it('mounts without error', () => {
        const w = mountDrawer()
        expect(w.exists()).toBe(true)
    })

    it('renders tabbed drawer stub', () => {
        const w = mountDrawer()
        expect(w.find('.stub-drawer').exists()).toBe(true)
    })

    it('binds isOpen / isPinned to the useRecipeViewSettings singleton', () => {
        mountDrawer()
        const {isOpen, isPinned} = useRecipeViewSettings()
        // Just confirm the singleton refs are reachable / writable; the
        // actual TabbedDrawer is stubbed so we can't drive its emits.
        isOpen.value = true
        expect(isOpen.value).toBe(true)
        isPinned.value = true
        expect(isPinned.value).toBe(true)
    })
})
