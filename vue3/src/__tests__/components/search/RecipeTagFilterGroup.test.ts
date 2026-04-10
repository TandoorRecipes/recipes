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
    it('renders one ModelSelect by default (include only)', () => {
        const {wrapper} = mountWidget()
        expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(1)
    })

    it('shows a + button to expand the exclude row', () => {
        const {wrapper} = mountWidget()
        expect(wrapper.find('.fa-plus').exists()).toBe(true)
    })

    it('binds include-any values', () => {
        const {wrapper} = mountWidget({keywords: '1,2,3'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([1, 2, 3])
    })

    it('auto-expands exclude row when exclude data exists on mount', () => {
        const {wrapper} = mountWidget({keywordsOrNot: '4,5'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects.length).toBe(2)
        expect(selects[1].props('modelValue')).toEqual([4, 5])
    })

    it('supports include and exclude simultaneously', () => {
        const {wrapper} = mountWidget({keywords: '1,2', keywordsOrNot: '3,4'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects.length).toBe(2)
        expect(selects[0].props('modelValue')).toEqual([1, 2])
        expect(selects[1].props('modelValue')).toEqual([3, 4])
    })

    it('writing to include calls setFilter on include-any key', async () => {
        const {wrapper, setFilter} = mountWidget()
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[0].vm.$emit('update:modelValue', [7, 8])
        expect(setFilter).toHaveBeenCalledWith('keywords', [7, 8])
    })

    it('writing to exclude calls setFilter on exclude-any key', async () => {
        const {wrapper, setFilter} = mountWidget({keywordsOrNot: '1'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[1].vm.$emit('update:modelValue', [9, 10])
        expect(setFilter).toHaveBeenCalledWith('keywordsOrNot', [9, 10])
    })

    it('toggling include mode to all moves values', async () => {
        const {wrapper, state} = mountWidget({keywords: '1,2'})
        const toggles = wrapper.findAll('.v-btn-toggle')
        const allBtn = toggles[0].findAll('.v-btn')[1]
        await allBtn.trigger('click')
        expect(state.value.keywords).toBeUndefined()
        expect(state.value.keywordsAnd).toBe('1,2')
    })

    it('clearing include removes the key', async () => {
        const {wrapper, state} = mountWidget({keywords: '1,2'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        await selects[0].vm.$emit('update:modelValue', [])
        expect(state.value.keywords).toBeUndefined()
    })

    it('collapsing exclude clears exclude keys', async () => {
        const {wrapper, state, clearFilter} = mountWidget({keywordsOrNot: '3,4'})
        const minusBtn = wrapper.find('.fa-minus')
        expect(minusBtn.exists()).toBe(true)
        await minusBtn.trigger('click')
        expect(clearFilter).toHaveBeenCalledWith('keywordsOrNot')
        expect(clearFilter).toHaveBeenCalledWith('keywordsAndNot')
    })

    it('loads include-all mode when keywordsAnd has data', () => {
        const {wrapper} = mountWidget({keywordsAnd: '5,6'})
        const selects = wrapper.findAllComponents(ModelSelectStub)
        expect(selects[0].props('modelValue')).toEqual([5, 6])
    })

    it('badge shows total count across include and exclude', () => {
        const {wrapper} = mountWidget({keywords: '1,2', keywordsOrNot: '3'})
        const badge = wrapper.find('.v-badge')
        expect(badge.text()).toContain('3')
    })
})
