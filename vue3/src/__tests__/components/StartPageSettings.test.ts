import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { DEFAULT_SECTIONS } from '@/composables/useStartPageSections'

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

vi.mock('vuetify', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vuetify')>()),
    useTheme: () => ({ change: vi.fn() }),
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import StartPageSettings from '@/components/settings/StartPageSettings.vue'
import { useUserPreferenceStore } from '@/stores/UserPreferenceStore'

const DEFAULT_STUBS: Record<string, any> = {
    VueDraggable: {
        template: '<div class="stub-draggable"><slot /></div>',
        props: ['modelValue'],
    },
    ModelSelect: { template: '<div class="stub-model-select"/>' },
}

function mountSettings(sections?: any[], defaultPage = 'HOME') {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useUserPreferenceStore()
    store.initCompleted = true
    store.userSettings = {
        startPageSections: sections ?? [],
        defaultPage,
    } as any
    store.updateUserSettings = vi.fn().mockResolvedValue(undefined)

    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const vuetify = createVuetify()

    const wrapper = mount(StartPageSettings, {
        global: {
            plugins: [pinia, i18n, vuetify],
            stubs: DEFAULT_STUBS,
        },
    })
    return { wrapper, store }
}

describe('StartPageSettings', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiUserList = vi.fn().mockResolvedValue([])
    })

    it('renders default sections when store sections is empty', async () => {
        const { wrapper } = mountSettings([])
        await flushPromises()

        const dragHandles = wrapper.findAll('.drag-handle')
        expect(dragHandles).toHaveLength(DEFAULT_SECTIONS.length)
        expect(wrapper.html()).toContain('stub-draggable')
    })

    it('renders only recipe sections (meal_plan separated into toggle)', async () => {
        const { wrapper } = mountSettings([
            { mode: 'meal_plan', enabled: true },
            { mode: 'recent', enabled: true, min_recipes: 5 },
            { mode: 'random', enabled: true, min_recipes: 0 },
        ])
        await flushPromises()

        const dragHandles = wrapper.findAll('.drag-handle')
        expect(dragHandles).toHaveLength(2)
    })

    it('exposes saved defaultPage to the v-select', async () => {
        const { wrapper } = mountSettings([], 'BOOKS')
        await flushPromises()

        // The composable's defaultPage ref should be initialized from the store on loadFromStore.
        expect((wrapper.vm as any).defaultPage).toBe('BOOKS')
    })
})
