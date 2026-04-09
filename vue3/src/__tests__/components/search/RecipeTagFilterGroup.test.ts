import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {h, ref} from 'vue'

const ModelSelectStub = {
    name: 'ModelSelect',
    props: ['model', 'modelValue', 'mode'],
    emits: ['update:modelValue'],
    render() {
        return h('div', {class: 'model-select-stub', 'data-model-value': JSON.stringify(this.modelValue)})
    },
}

import RecipeTagFilterGroup from '@/components/search/RecipeTagFilterGroup.vue'

const VARIANT_KEYS = ['keywords', 'keywordsAnd', 'keywordsOrNot', 'keywordsAndNot'] as const

function mountWidget(initialState: Partial<Record<string, string>> = {}) {
    const state = ref<Record<string, string | undefined>>({...initialState})
    const getFilter = (key: string) => state.value[key]
    const setFilter = vi.fn((key: string, value: any) => {
        if (value === undefined || value === null) {
            delete state.value[key]
        } else if (Array.isArray(value)) {
            if (value.length === 0) delete state.value[key]
            else state.value[key] = value.map(String).join('|')
        } else {
            state.value[key] = String(value)
        }
    })
    const clearFilter = vi.fn((key: string) => { delete state.value[key] })

    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {
            Keywords: 'Keywords', any: 'any', all: 'all', exclude_any: 'exclude any', exclude_all: 'exclude all',
            tag_filter_has_any: 'Has any', tag_filter_has_all: 'Has all',
            tag_filter_has_none: 'Has none', tag_filter_missing_some: 'Missing some',
        }},
        missingWarn: false, fallbackWarn: false,
    })

    const wrapper = mount(RecipeTagFilterGroup, {
        props: {
            label: 'Keywords',
            modelName: 'Keyword',
            keys: [...VARIANT_KEYS],
            getFilter,
            setFilter,
            clearFilter,
        },
        global: {
            plugins: [vuetify, i18n],
            stubs: {ModelSelect: ModelSelectStub},
        },
    })

    return {wrapper, state, setFilter, clearFilter}
}

describe('RecipeTagFilterGroup', () => {
    it('renders 4 tabs with the new semantic labels', () => {
        const {wrapper} = mountWidget()
        const tabs = wrapper.findAll('.v-tab')
        expect(tabs.length).toBe(4)
        const labels = tabs.map(t => t.text().toLowerCase())
        expect(labels).toEqual(['has any', 'has all', 'has none', 'missing some'])
    })

    it('renders a single ModelSelect for the active variant', () => {
        const {wrapper} = mountWidget()
        expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(1)
    })

    it('binds the active variant to the ModelSelect modelValue', async () => {
        const {wrapper} = mountWidget({keywords: '1|2|3'})
        // First tab is `keywords` (OR), and the value is populated.
        const stub = wrapper.findComponent(ModelSelectStub)
        expect(stub.props('modelValue')).toEqual([1, 2, 3])
    })

    it('switches active tab to whichever variant is non-empty on mount', async () => {
        const {wrapper} = mountWidget({keywordsAnd: '5|6'})
        const stub = wrapper.findComponent(ModelSelectStub)
        expect(stub.props('modelValue')).toEqual([5, 6])
        // The keywordsAnd tab should be visually selected → "Has all".
        const activeTab = wrapper.find('.v-tab--selected')
        expect(activeTab.text().toLowerCase()).toContain('has all')
    })

    it('writing a new value via ModelSelect calls setFilter on the active variant key', async () => {
        const {wrapper, state, setFilter} = mountWidget()
        const stub = wrapper.findComponent(ModelSelectStub)
        await stub.vm.$emit('update:modelValue', [7, 8])
        expect(setFilter).toHaveBeenCalledWith('keywords', [7, 8])
        expect(state.value.keywords).toBe('7|8')
    })

    it('switching tabs MOVES the existing value to the new variant key', async () => {
        const {wrapper, state} = mountWidget({keywords: '1|2'})
        const tabs = wrapper.findAll('.v-tab')
        // Tab 1 = "all" (keywordsAnd)
        await tabs[1].trigger('click')
        // The OR slot should be cleared, AND should now hold the value
        expect(state.value.keywords).toBeUndefined()
        expect(state.value.keywordsAnd).toBe('1|2')
    })

    it('switching tabs to empty target with no current value is a no-op', async () => {
        const {wrapper, state, setFilter} = mountWidget()
        setFilter.mockClear()
        const tabs = wrapper.findAll('.v-tab')
        await tabs[2].trigger('click')
        // No value to move, so no setFilter should fire
        expect(setFilter).not.toHaveBeenCalled()
        expect(Object.keys(state.value).length).toBe(0)
    })

    it('clearing the ModelSelect to empty array removes the active variant', async () => {
        const {wrapper, state} = mountWidget({keywords: '1|2'})
        const stub = wrapper.findComponent(ModelSelectStub)
        await stub.vm.$emit('update:modelValue', [])
        expect(state.value.keywords).toBeUndefined()
    })
})
