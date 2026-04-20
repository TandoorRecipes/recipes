/**
 * ModelSelect tests focused on the id-array hydration path.
 *
 * When a parent passes `:model-value="[1, 2]"` with `mode="multiple"` and
 * `:object="false"`, ModelSelect must fetch the corresponding records via
 * `modelClass.retrieve(id)` so the underlying Multiselect can display tags
 * with resolved labels. Without hydration, tags render blank or missing.
 *
 * The UX expert's Phase 4 review found this as bug C3: legacy URLs with
 * active tag filters produced empty RecipeTagFilterGroup widgets.
 */
import {describe, it, expect, vi} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {nextTick} from 'vue'

const retrieveSpy = vi.fn()
const listSpy = vi.fn(() => Promise.resolve([]))

vi.mock('@/types/Models', async (importOriginal) => {
    const orig = await importOriginal<any>()
    return {
        ...orig,
        getGenericModelFromString: () => ({
            retrieve: retrieveSpy,
            list: listSpy,
            create: vi.fn(),
            model: {
                name: 'Keyword',
                localizationKey: 'Keyword',
                itemValue: 'id',
                itemLabel: 'name',
                isPaginated: false,
                disableRetrieve: false,
            },
        }),
    }
})

import ModelSelect from '@/components/inputs/ModelSelect.vue'

function mountSelect(props: Record<string, any> = {}) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {Keyword: 'Keyword', No_Results: 'No results'}},
        missingWarn: false, fallbackWarn: false,
    })
    return mount(ModelSelect, {
        props: {model: 'Keyword' as any, ...props},
        global: {plugins: [vuetify, i18n]},
    })
}

describe('ModelSelect — id-array hydration (mode=multiple, object=false)', () => {
    it('fetches each id via retrieve() on mount when mode=multiple + non-empty number[]', async () => {
        retrieveSpy.mockReset()
        retrieveSpy.mockImplementation((id: number) => Promise.resolve({id, name: `kw${id}`}))

        mountSelect({
            mode: 'multiple',
            object: false,
            modelValue: [1, 2, 3],
        })
        await flushPromises()

        expect(retrieveSpy).toHaveBeenCalledTimes(3)
        expect(retrieveSpy.mock.calls.map(c => c[0]).sort()).toEqual([1, 2, 3])
    })

    it('does NOT fetch when modelValue is an array of objects (object=true)', async () => {
        retrieveSpy.mockReset()
        retrieveSpy.mockImplementation((id: number) => Promise.resolve({id, name: `kw${id}`}))

        mountSelect({
            mode: 'multiple',
            object: true,
            modelValue: [{id: 1, name: 'kw1'}, {id: 2, name: 'kw2'}],
        })
        await flushPromises()

        expect(retrieveSpy).not.toHaveBeenCalled()
    })

    it('does NOT fetch when modelValue is empty', async () => {
        retrieveSpy.mockReset()

        mountSelect({
            mode: 'multiple',
            object: false,
            modelValue: [],
        })
        await flushPromises()

        expect(retrieveSpy).not.toHaveBeenCalled()
    })

    it('does NOT fetch on single-mode (non-multiple)', async () => {
        retrieveSpy.mockReset()

        mountSelect({
            mode: 'single',
            object: false,
            modelValue: 5,
        })
        await flushPromises()

        expect(retrieveSpy).not.toHaveBeenCalled()
    })

    it('caches per-id so re-rendering with the same ids does not re-fetch', async () => {
        retrieveSpy.mockReset()
        retrieveSpy.mockImplementation((id: number) => Promise.resolve({id, name: `kw${id}`}))

        const wrapper = mountSelect({
            mode: 'multiple',
            object: false,
            modelValue: [1, 2],
        })
        await flushPromises()
        expect(retrieveSpy).toHaveBeenCalledTimes(2)

        // Update props with overlapping + one new id — only id=3 should be fetched.
        await wrapper.setProps({modelValue: [1, 2, 3]})
        await flushPromises()
        expect(retrieveSpy).toHaveBeenCalledTimes(3)
    })

    it('handles retrieve() failure by silently skipping the id (no crash, no unhandled rejection)', async () => {
        retrieveSpy.mockReset()
        retrieveSpy.mockRejectedValue(new Error('boom'))

        const errors: any[] = []
        const origError = console.error
        console.error = (...args: any[]) => errors.push(args)
        try {
            mountSelect({
                mode: 'multiple',
                object: false,
                modelValue: [99],
            })
            await flushPromises()
            // No unhandled rejection should have surfaced as a console.error.
            const unhandled = errors.filter(e => String(e).includes('boom'))
            expect(unhandled.length).toBe(0)
        } finally {
            console.error = origError
        }
    })
})
