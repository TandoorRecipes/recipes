/**
 * Resurrection-guard for the home-settings section-row alignment (UAT item 5).
 *
 * The section rows are a flex card. With `align-center`, the taller rows (a
 * section with a ModelSelect dropdown) vertically-centered the drag-handle and
 * trash, mis-aligning them vs. the simple rows. The fix is `align-start` so the
 * handle/title/trash top-align consistently. This test fails if a rebase reverts
 * the card to `align-center` — caught at the cascade vitest step.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

// importOriginal keeps real named exports (e.g. AutomationTypeEnum, reached transitively
// via ModelSelect -> Models.ts -> AutomationList) so the module doesn't blow up on load.
vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
}))
vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return { useStorage: (_k: string, d: any) => ref(d) }
})
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }) }))
vi.mock('@vueuse/router', () => ({ useRouteQuery: () => ({ value: false }) }))

import StartPageSettings from '@/components/settings/StartPageSettings.vue'

function mountSettings() {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            store.initCompleted = true
            store.userSettings = {
                start_showMealPlan: false,
                default_page: 'Home',
                start_page_sections: [{ mode: 'recent', enabled: true, min_recipes: 10 }],
            } as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const vuetify = createVuetify()
    return mount(StartPageSettings, {
        global: {
            plugins: [pinia, i18n, vuetify],
            stubs: {
                // VueDraggable must render its default slot so the section cards exist
                VueDraggable: { template: '<div><slot /></div>' },
                ModelSelect: { template: '<div class="model-select-stub" />' },
            },
        },
    })
}

describe('StartPageSettings — home-settings row alignment (item 5 guard)', () => {
    beforeEach(() => { setActivePinia(createPinia()); resetApiMock(); (apiMock as any).apiUserList = vi.fn().mockResolvedValue([]) })

    it('section rows top-align (align-start), NOT align-center', async () => {
        const wrapper = mountSettings()
        await flushPromises()
        const rows = wrapper.findAll('.section-row')
        expect(rows.length).toBeGreaterThan(0)
        for (const row of rows) {
            expect(row.classes()).toContain('align-start')
            expect(row.classes()).not.toContain('align-center')
        }
        wrapper.unmount()
    })
})
