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
            else state.value[key] = value.map(String).join(',')
        } else {
            state.value[key] = String(value)
        }
    })
    const clearFilter = vi.fn((key: string) => { delete state.value[key] })

    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {
            Keywords: 'Keywords',
            With: 'With', Without: 'Without',
            any: 'any', all: 'all',
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
    it('renders two ModelSelect instances (With and Without)', () => {
        const {wrapper} = mountWidget()
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects.length).toBe(2)
    })

    it('renders With and Without labels', () => {
        const {wrapper} = mountWidget()
        const text = wrapper.text().toLowerCase()
        expect(text).toContain('with')
        expect(text).toContain('without')
    })

    it('renders any/all toggles for both groups', () => {
        const {wrapper} = mountWidget()
        const toggles = wrapper.findAll('.v-btn-toggle')
        expect(toggles.length).toBe(2)
    })

    it('binds "With" values to first ModelSelect', () => {
        const {wrapper} = mountWidget({keywords: '1,2,3'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([1, 2, 3])
    })

    it('binds "Without" values to second ModelSelect', () => {
        const {wrapper} = mountWidget({keywordsOrNot: '4,5'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[1].props('modelValue')).toEqual([4, 5])
    })

    it('supports both With and Without simultaneously', () => {
        const {wrapper} = mountWidget({keywords: '1,2', keywordsOrNot: '3,4'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([1, 2])
        expect(selects[1].props('modelValue')).toEqual([3, 4])
    })

    it('writing to "With" calls setFilter on the include key', async () => {
        const {wrapper, setFilter} = mountWidget()
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[0].vm.$emit('update:modelValue', [7, 8])
        expect(setFilter).toHaveBeenCalledWith('keywords', [7, 8])
    })

    it('writing to "Without" calls setFilter on the exclude key', async () => {
        const {wrapper, setFilter} = mountWidget()
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[1].vm.$emit('update:modelValue', [9, 10])
        expect(setFilter).toHaveBeenCalledWith('keywordsOrNot', [9, 10])
    })

    it('toggling include mode to "all" switches from keys[0] to keys[1]', async () => {
        const {wrapper, state} = mountWidget({keywords: '1,2'})
        const toggles = wrapper.findAll('.v-btn-toggle')
        const allBtn = toggles[0].findAll('.v-btn')[1]
        await allBtn.trigger('click')
        expect(state.value.keywords).toBeUndefined()
        expect(state.value.keywordsAnd).toBe('1,2')
    })

    it('toggling exclude mode to "all" switches from keys[2] to keys[3]', async () => {
        const {wrapper, state} = mountWidget({keywordsOrNot: '3,4'})
        const toggles = wrapper.findAll('.v-btn-toggle')
        const allBtn = toggles[1].findAll('.v-btn')[1]
        await allBtn.trigger('click')
        expect(state.value.keywordsOrNot).toBeUndefined()
        expect(state.value.keywordsAndNot).toBe('3,4')
    })

    it('clearing include select removes the active include key', async () => {
        const {wrapper, state} = mountWidget({keywords: '1,2'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[0].vm.$emit('update:modelValue', [])
        expect(state.value.keywords).toBeUndefined()
    })

    it('clearing exclude select removes the active exclude key', async () => {
        const {wrapper, state} = mountWidget({keywordsOrNot: '3,4'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[1].vm.$emit('update:modelValue', [])
        expect(state.value.keywordsOrNot).toBeUndefined()
    })

    it('loads with correct toggle state when "all" variant has values', () => {
        const {wrapper} = mountWidget({keywordsAnd: '5,6'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([5, 6])
    })
})
