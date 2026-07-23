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

// A window with fewer recipes than the column count must NOT let a card stretch
// across the whole row (a single matching recipe used to span the full width).
// Cards may grow to fill a partial row but are capped at 2x their normal column
// width, so a lone card stays a sensible size instead of spanning everything.
describe('HorizontalRecipeWindow — cards pinned to one column width (no stretch, no wrap)', () => {
    beforeEach(() => {
        resetApiMock()
    })

    async function mountWith(results: Array<Record<string, unknown>>) {
        apiMock.apiRecipeList = vi.fn().mockResolvedValue({ count: results.length, results })
        const pinia = createPinia()
        const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
        const router: Router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', component: { template: '<div/>' } },
                { path: '/advanced-search', name: 'SearchPage', component: { template: '<div/>' } },
            ],
        })
        const wrapper = mount(HorizontalRecipeWindow, {
            props: { mode: 'random' },
            global: {
                plugins: [pinia, i18n, router],
                stubs: { RecipeCard: { template: '<div class="stub-card"/>' } },
            },
        })
        await flushPromises()
        return wrapper
    }

    it('pins a lone card to one column width (basis-0 fill, capped, no stretch)', async () => {
        const wrapper = await mountWith([{ id: 1, name: 'Only One' }])

        // The card columns are the innermost ones (pr-0 pl-0); the outer window
        // wrapper col also contains the stub as a descendant, so match by class.
        const cardCols = wrapper.findAll('.v-col.pr-0.pl-0')
        expect(cardCols.length).toBe(1)

        const style = cardCols[0].attributes('style') ?? ''
        // flex-basis MUST be 0 — a non-zero basis + inter-card gaps overflows and
        // wraps the last card; basis 0 distributes the row evenly (no wrap).
        expect(style).toMatch(/flex:\s*1 1 0/)
        // max-width caps each card at one column width: a positive % well under
        // 100% (so a lone card leaves trailing space instead of stretching). At the
        // test breakpoint (md, 4 cols) this is 25% — assert < 40 to exclude the old
        // 2x cap (50%) and full-row stretch.
        const maxW = Number(/max-width:\s*([\d.]+)%/.exec(style)?.[1])
        expect(maxW).toBeGreaterThan(0)
        expect(maxW).toBeLessThan(40)
    })
})
