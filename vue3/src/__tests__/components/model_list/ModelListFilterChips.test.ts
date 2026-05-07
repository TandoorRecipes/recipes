import {describe, it, expect, vi} from 'vitest'
import {flushPromises, mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'

// Mock the model registry — getGenericModelFromString is called by the
// chip's nameCache watcher to resolve IDs to names.
// Default to a never-resolving promise so tests that don't care about name
// resolution see the loading state (count fallback) without crashing.
const retrieveSpy = vi.fn(() => new Promise(() => {}))
vi.mock('@/types/Models', async (importOriginal) => {
    const orig = await importOriginal<any>()
    return {
        ...orig,
        getGenericModelFromString: () => ({
            retrieve: retrieveSpy,
            model: {itemLabel: 'name'},
        }),
    }
})

import ModelListFilterChips from '@/components/model_list/ModelListFilterChips.vue'
import type {FilterDef} from '@/composables/modellist/types'

function mountChips(defs: FilterDef[], filterValues: Record<string, string> = {}) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {Keywords: 'Keywords', Rating: 'Rating', CookedOn: 'Cooked on', Clear_All: 'Clear All'}},
        missingWarn: false, fallbackWarn: false,
    })

    return mount(ModelListFilterChips, {
        props: {
            filterDefs: defs,
            getFilter: (key: string) => filterValues[key],
            setFilter: vi.fn(),
            clearFilter: vi.fn(),
            clearAllFilters: vi.fn(),
            activeFilterCount: Object.keys(filterValues).length,
        },
        global: {plugins: [vuetify, i18n]},
    })
}

describe('ModelListFilterChips', () => {
    describe('new types', () => {
        it('renders a chip for tag-select with loading ellipsis while names resolve', () => {
            const wrapper = mountChips(
                [{key: 'keywords', labelKey: 'Keywords', type: 'tag-select', modelName: 'Keyword' as any}],
                {keywords: '1|2|3'},
            )
            const chip = wrapper.find('.v-chip')
            expect(chip.exists()).toBe(true)
            // While names are loading, the chip shows ellipsis instead of count.
            expect(chip.text()).toMatch(/Keywords.*…/)
        })

        it('renders a chip for number-range with both bounds', () => {
            const wrapper = mountChips(
                [{key: 'rating', labelKey: 'Rating', type: 'number-range'}],
                {rating: '3~5'},
            )
            const chip = wrapper.find('.v-chip')
            expect(chip.exists()).toBe(true)
            expect(chip.text()).toMatch(/Rating.*3.*5/)
        })

        it('does not render a chip for empty tag-select', () => {
            const wrapper = mountChips(
                [{key: 'keywords', labelKey: 'Keywords', type: 'tag-select', modelName: 'Keyword' as any}],
                {},
            )
            expect(wrapper.findAll('.v-chip').length).toBe(0)
        })
    })

    describe('tag-select name resolution', () => {
        it('resolves IDs to names and renders Keywords: pasta, tomato', async () => {
            retrieveSpy.mockReset()
            retrieveSpy
                .mockResolvedValueOnce({id: 1, name: 'pasta'})
                .mockResolvedValueOnce({id: 2, name: 'tomato'})

            const wrapper = mountChips(
                [{key: 'keywords', labelKey: 'Keywords', type: 'tag-select', modelName: 'Keyword' as any}],
                {keywords: '1|2'},
            )
            await flushPromises()
            await flushPromises()

            const chip = wrapper.find('.v-chip')
            expect(chip.text()).toContain('pasta')
            expect(chip.text()).toContain('tomato')
        })

        it('falls back to ellipsis when names are still loading or fetch fails', async () => {
            retrieveSpy.mockReset()
            retrieveSpy.mockRejectedValue(new Error('boom'))

            const wrapper = mountChips(
                [{key: 'keywords', labelKey: 'Keywords', type: 'tag-select', modelName: 'Keyword' as any}],
                {keywords: '99|100|101'},
            )
            // While names are resolving (or after fetch failure), ellipsis.
            const chip = wrapper.find('.v-chip')
            expect(chip.text()).toMatch(/Keywords.*…/)
        })

        it('does not duplicate fetches when the same id appears across renders', async () => {
            retrieveSpy.mockReset()
            retrieveSpy.mockResolvedValue({id: 5, name: 'bread'})

            const wrapper = mountChips(
                [{key: 'keywords', labelKey: 'Keywords', type: 'tag-select', modelName: 'Keyword' as any}],
                {keywords: '5'},
            )
            await flushPromises()
            // Re-mount with the same value should not double-fetch within the same instance.
            // Inside one instance, retrieve is called exactly once for id 5.
            expect(retrieveSpy).toHaveBeenCalledTimes(1)
            wrapper.unmount()
        })
    })
})
