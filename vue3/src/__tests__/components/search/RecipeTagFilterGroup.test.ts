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

const KEYS = ['keywords', 'keywordsAnd', 'keywordsOrNot', 'keywordsAndNot'] as const

function mountWidget(initialState: Partial<Record<string, string>> = {}) {
    const state = ref<Record<string, string | undefined>>({...initialState})
    const getFilter = (key: string) => state.value[key]
    const setFilter = vi.fn((key: string, value: any) => {
        if (value === undefined || value === null) {
            delete state.value[key]
        } else if (Array.isArray(value)) {
            if (value.length === 0) delete state.value[key]
            else state.value[key] = value.map(String).join(',')
        } else {
            state.value[key] = String(value)
        }
    })
    const clearFilter = vi.fn((key: string) => { delete state.value[key] })

    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: { Keywords: 'Keywords', With: 'With', Without: 'Without', any: 'any', all: 'all' }},
        missingWarn: false, fallbackWarn: false,
    })

    const wrapper = mount(RecipeTagFilterGroup, {
        props: {
            label: 'Keywords',
            modelName: 'Keyword',
            keys: [...KEYS],
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
    it('renders two ModelSelect instances by default (with-any + without-any)', () => {
        const {wrapper} = mountWidget()
        expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(2)
    })

    it('shows + button to expand all-mode rows', () => {
        const {wrapper} = mountWidget()
        expect(wrapper.find('.fa-plus').exists()).toBe(true)
    })

    it('binds with-any values to first select', () => {
        const {wrapper} = mountWidget({keywords: '1,2,3'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([1, 2, 3])
    })

    it('binds without-any values to second select', () => {
        const {wrapper} = mountWidget({keywordsOrNot: '4,5'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[1].props('modelValue')).toEqual([4, 5])
    })

    it('supports with and without simultaneously', () => {
        const {wrapper} = mountWidget({keywords: '1,2', keywordsOrNot: '3,4'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([1, 2])
        expect(selects[1].props('modelValue')).toEqual([3, 4])
    })

    it('auto-expands all-mode rows when all-variant data exists on mount', () => {
        const {wrapper} = mountWidget({keywords: '1', keywordsAnd: '5,6'})
        expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(4)
    })

    it('shows all four rows when expanded', () => {
        const {wrapper} = mountWidget({keywordsAnd: '1', keywordsAndNot: '2'})
        expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(4)
    })

    it('writing to with-any calls setFilter on keys[0]', async () => {
        const {wrapper, setFilter} = mountWidget()
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[0].vm.$emit('update:modelValue', [7, 8])
        expect(setFilter).toHaveBeenCalledWith('keywords', [7, 8])
    })

    it('writing to without-any calls setFilter on keys[2]', async () => {
        const {wrapper, setFilter} = mountWidget()
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[1].vm.$emit('update:modelValue', [9, 10])
        expect(setFilter).toHaveBeenCalledWith('keywordsOrNot', [9, 10])
    })

    it('collapsing clears all-mode keys', async () => {
        const {wrapper, clearFilter} = mountWidget({keywordsAnd: '1', keywordsAndNot: '2'})
        const minusBtn = wrapper.find('.fa-minus')
        await minusBtn.trigger('click')
        expect(clearFilter).toHaveBeenCalledWith('keywordsAnd')
        expect(clearFilter).toHaveBeenCalledWith('keywordsAndNot')
    })

    it('clearing a select removes the key', async () => {
        const {wrapper, state} = mountWidget({keywords: '1,2'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[0].vm.$emit('update:modelValue', [])
        expect(state.value.keywords).toBeUndefined()
    })

    it('badge shows total count across all groups', () => {
        const {wrapper} = mountWidget({keywords: '1,2', keywordsOrNot: '3'})
        const badge = wrapper.find('.v-badge')
        expect(badge.text()).toContain('3')
    })
})
