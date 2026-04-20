import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeSpace, makeUserPreference } from '@/__tests__/factories'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import WelcomePage from '@/pages/WelcomePage.vue'

describe('WelcomePage', () => {
    beforeEach(() => {
        resetApiMock()
    })

    function mountWelcome() {
        // Pinia plugin that pre-populates UserPreferenceStore after it's created
        const prePopulatePlugin: PiniaPlugin = ({ store }) => {
            if (store.$id === 'user_preference_store') {
                store.userSettings = makeUserPreference() as any
            }
        }

        const pinia = createPinia()
        pinia.use(prePopulatePlugin)

        const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
        const vuetify = createVuetify()
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', name: 'StartPage', component: { template: '<div/>' } },
                { path: '/welcome', name: 'WelcomePage', component: { template: '<div/>' } },
                { path: '/edit/:model/:id?', name: 'ModelEditPage', component: { template: '<div/>' } },
                { path: '/import', name: 'RecipeImportPage', component: { template: '<div/>' } },
            ],
        })

        return mount(WelcomePage, {
            global: {
                plugins: [pinia, i18n, vuetify, router],
                stubs: {
                    OpenDataImportSettings: { template: '<div class="stub-open-data"/>' },
                    ModelEditDialog: { template: '<div class="stub-model-edit-dialog"/>' },
                },
            },
        })
    }

    it('mounts without error', async () => {
        apiMock.apiSpaceCurrentRetrieve.mockResolvedValue(makeSpace())
        const wrapper = mountWelcome()
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('loads space on mount', async () => {
        apiMock.apiSpaceCurrentRetrieve.mockResolvedValue(makeSpace())
        mountWelcome()
        await flushPromises()
        expect(apiMock.apiSpaceCurrentRetrieve).toHaveBeenCalled()
    })

    it('displays welcome message', async () => {
        apiMock.apiSpaceCurrentRetrieve.mockResolvedValue(makeSpace())
        const wrapper = mountWelcome()
        await flushPromises()
        expect(wrapper.text()).toContain('WelcometoTandoor')
    })

    it('shows user display name', async () => {
        apiMock.apiSpaceCurrentRetrieve.mockResolvedValue(makeSpace())
        const wrapper = mountWelcome()
        await flushPromises()
        expect(wrapper.text()).toContain('testuser')
    })
})
