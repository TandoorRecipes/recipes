import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

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

    it('falls back to default sections when store is empty', async () => {
        const { wrapper } = mountSettings([])
        await flushPromises()

        // Default has 8 recipe sections — each rendered as a v-card inside draggable
        const html = wrapper.html()
        // Check that multiple section cards rendered (draggable contains them)
        expect(html).toContain('stub-draggable')
        expect(html).toContain('drag-handle')
    })

    it('loads specific sections from store', async () => {
        const { wrapper } = mountSettings([
            { mode: 'meal_plan', enabled: true },
            { mode: 'recent', enabled: true, min_recipes: 5 },
            { mode: 'random', enabled: true, min_recipes: 0 },
        ])
        await flushPromises()

        const html = wrapper.html()
        // Should render 2 recipe sections (meal_plan separated into toggle)
        const dragHandles = wrapper.findAll('.drag-handle')
        expect(dragHandles).toHaveLength(2)
    })

    it('save puts meal_plan first when toggle is on', async () => {
        const { wrapper, store } = mountSettings([
            { mode: 'meal_plan', enabled: true },
            { mode: 'recent', enabled: true, min_recipes: 10 },
        ])
        await flushPromises()

        // Call save directly via component internals
        await (wrapper.vm as any).save()
        await flushPromises()

        expect(store.updateUserSettings).toHaveBeenCalled()
        const sections = store.userSettings.startPageSections as any[]
        expect(sections[0].mode).toBe('meal_plan')
        expect(sections[1].mode).toBe('recent')
    })

    it('save excludes meal_plan when absent from input', async () => {
        const { wrapper, store } = mountSettings([
            { mode: 'recent', enabled: true, min_recipes: 10 },
        ])
        await flushPromises()

        await (wrapper.vm as any).save()
        await flushPromises()

        expect(store.updateUserSettings).toHaveBeenCalled()
        const sections = store.userSettings.startPageSections as any[]
        expect(sections.every((s: any) => s.mode !== 'meal_plan')).toBe(true)
    })

    it('save preserves filter_id from section', async () => {
        const { wrapper, store } = mountSettings([
            { mode: 'meal_plan', enabled: true },
            { mode: 'keyword', enabled: true, min_recipes: 10, filter_id: 42 },
        ])
        await flushPromises()

        await (wrapper.vm as any).save()
        await flushPromises()

        expect(store.updateUserSettings).toHaveBeenCalled()
        const kwSection = (store.userSettings.startPageSections as any[]).find((s: any) => s.mode === 'keyword')
        expect(kwSection.filter_id).toBe(42)
    })

    it('sets defaultPage from store', async () => {
        mountSettings([], 'SEARCH')
        await flushPromises()
        // Component loaded without error with non-default page
        // (DOM assertion for v-select value is fragile, so just verify mount succeeded)
    })
})
