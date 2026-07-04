import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { DateTime } from 'luxon'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

// Spread the real module so branch-specific exports pulled in transitively
// (e.g. AutomationTypeEnum via Models.ts on food-filters+) stay defined; only
// ApiApi is swapped for the shared test double.
vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/openapi')>()),
    ApiApi: class { constructor() { return apiMock } },
}))

import HorizontalRecipeWindow from '@/components/display/HorizontalRecipeWindow.vue'

// Regression coverage for issue #4646 — the homepage "New" section and its
// "More" link surfaced different recipes. Root cause lived entirely in this
// component's `new`-mode query: the "More" link emitted `createdonGte`
// (camelCase, silently dropped by SearchPage's useUrlFilters, which hydrates
// the snake_case `createdon_gte`) over a 14-day window, while the section
// itself shows the backend `_new` flag = created within 7 days. So "More"
// returned the entire catalog instead of the same 7-day set.
describe('HorizontalRecipeWindow — New section "More" link (#4646)', () => {
    beforeEach(() => {
        resetApiMock()
    })

    async function mountNew() {
        apiMock.apiRecipeList = vi.fn().mockResolvedValue({ count: 1, results: [{ id: 2, name: 'Fresh', _new: true }] })

        const pinia = createPinia()
        const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
        const router: Router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', component: { template: '<div/>' } },
                { path: '/advanced-search', name: 'SearchPage', component: { template: '<div/>' } },
            ],
        })
        const push = vi.spyOn(router, 'push')

        const wrapper = mount(HorizontalRecipeWindow, {
            props: { mode: 'new' },
            global: {
                plugins: [pinia, i18n, router],
                stubs: { RecipeCard: { template: '<div class="stub-card"/>' } },
            },
        })
        await flushPromises()
        return { wrapper, push }
    }

    it('filters "More" by created-in-last-7-days via the snake_case key SearchPage hydrates', async () => {
        const { wrapper, push } = await mountNew()

        await wrapper.find('h4').trigger('click')

        const expectedDate = DateTime.now().minus({ days: 7 }).toISODate()
        expect(push).toHaveBeenCalledWith({
            name: 'SearchPage',
            query: { ordering: '-created_at', createdon_gte: expectedDate },
        })
    })

    it('does not emit the dropped camelCase keys or a 14-day window', async () => {
        const { wrapper, push } = await mountNew()

        await wrapper.find('h4').trigger('click')

        const query = (push.mock.calls[0][0] as { query: Record<string, unknown> }).query
        expect(query).not.toHaveProperty('createdonGte')
        expect(query).not.toHaveProperty('sortOrder')
        expect(query.createdon_gte).not.toBe(DateTime.now().minus({ days: 14 }).toISODate())
    })
})
