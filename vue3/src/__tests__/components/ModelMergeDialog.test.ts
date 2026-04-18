import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeFood, makeUserPreference } from '@/__tests__/factories'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

const mockMerge = vi.fn().mockResolvedValue({})

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => ({
            model: {
                name: 'Food',
                localizationKey: 'Food',
                isMerge: true,
                mergeAutomation: 'FOOD_ALIAS',
            },
            merge: mockMerge,
            getLabel: (obj: any) => obj?.name ?? '',
        }),
    }
})

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import ModelMergeDialog from '@/components/dialogs/ModelMergeDialog.vue'

describe('ModelMergeDialog', () => {
    beforeEach(() => {
        resetApiMock()
        mockMerge.mockReset().mockResolvedValue({})
        apiMock.apiAutomationCreate = vi.fn().mockResolvedValue({})
    })

    function mountDialog(source = [makeFood({ id: 1, name: 'Butter' })]) {
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

        return mount(ModelMergeDialog, {
            props: {
                model: 'Food',
                source,
                activator: 'parent',
                modelValue: false,
            },
            global: {
                plugins: [pinia, i18n, vuetify, router],
                stubs: {
                    ModelSelect: { template: '<div class="stub-model-select"/>' },
                    VClosableCardTitle: { template: '<div class="stub-title"/>' },
                },
            },
        })
    }

    it('mounts without error', async () => {
        const wrapper = mountDialog()
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('uses GenericModel for the specified model type', async () => {
        const wrapper = mountDialog()
        await wrapper.setProps({modelValue: true})
        await flushPromises()
        // GenericModel.getLabel(food) renders the food name in the sources list
        // once the dialog opens. If GenericModel resolution failed this would
        // render nothing.
        expect(wrapper.text()).toContain('Butter')
    })

    it('accepts source items as props', async () => {
        const sources = [
            makeFood({ id: 1, name: 'Butter' }),
            makeFood({ id: 2, name: 'Margarine' }),
        ]
        const wrapper = mountDialog(sources)
        await wrapper.setProps({modelValue: true})
        await flushPromises()
        const text = wrapper.text()
        expect(text).toContain('Butter')
        expect(text).toContain('Margarine')
    })
})
