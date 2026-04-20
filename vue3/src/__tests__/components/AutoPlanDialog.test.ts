import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeUserPreference } from '@/__tests__/factories'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
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

import AutoPlanDialog from '@/components/dialogs/AutoPlanDialog.vue'

describe('AutoPlanDialog', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiAutoPlanCreate = vi.fn()
        apiMock.apiMealPlanList.mockResolvedValue({ results: [], count: 0, next: null })
    })

    function mountDialog() {
        const prePopulate: PiniaPlugin = ({ store }) => {
            if (store.$id === 'user_preference_store') {
                store.userSettings = makeUserPreference() as any
            }
        }
        const pinia = createPinia()
        pinia.use(prePopulate)

        const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
        const vuetify = createVuetify()
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/', component: { template: '<div/>' } }],
        })

        return mount(AutoPlanDialog, {
            props: { activator: 'parent' },
            global: {
                plugins: [pinia, i18n, vuetify, router],
                stubs: {
                    ModelSelect: { template: '<div class="stub-model-select"/>' },
                    VClosableCardTitle: { template: '<div class="stub-title"/>' },
                    VDateInput: { template: '<div class="stub-date-input"/>' },
                },
            },
        })
    }

    it('mounts without error', async () => {
        const wrapper = mountDialog()
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('initializes with default servings of 1', async () => {
        const wrapper = mountDialog()
        await flushPromises()
        expect((wrapper.vm as any).autoMealPlan.servings).toBe(1)
    })

    it('initializes date range spanning 7 days', async () => {
        const wrapper = mountDialog()
        await flushPromises()
        expect((wrapper.vm as any).dateRangeValue).toHaveLength(7)
    })
})
