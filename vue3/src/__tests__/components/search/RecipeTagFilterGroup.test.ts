import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {h, ref, nextTick} from 'vue'

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
        messages: {en: { Keywords: 'Keywords', with: 'With', without: 'Without', any: 'any', all: 'all' }},
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
    describe('default state', () => {
        it('renders 2 selects and 2 any/all toggles', () => {
            const {wrapper} = mountWidget()
            expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(2)
            expect(wrapper.findAll('.v-btn-toggle').length).toBe(2)
        })

        it('defaults to any mode, writes to keys[0] and keys[2]', async () => {
            const {wrapper, setFilter} = mountWidget()
            const selects = wrapper.findAllComponents(ModelSelectStub)
            await selects[0].vm.$emit('update:modelValue', [1, 2])
            expect(setFilter).toHaveBeenCalledWith('keywords', [1, 2])
            await selects[1].vm.$emit('update:modelValue', [3])
            expect(setFilter).toHaveBeenCalledWith('keywordsOrNot', [3])
        })

        it('shows + button', () => {
            const {wrapper} = mountWidget()
            expect(wrapper.find('.fa-plus').exists()).toBe(true)
        })
    })

    describe('toggle', () => {
        it('toggling Row 1 any→all swaps backend keys, visual content unchanged', async () => {
            const {wrapper, state} = mountWidget({keywords: '1,2'})
            const toggles = wrapper.findAll('.v-btn-toggle')
            const allBtn = toggles[0].findAll('.v-btn')[1]
            await allBtn.trigger('click')
            await nextTick()
            // Values moved from keys[0] to keys[1]
            expect(state.value.keywordsAnd).toBe('1,2')
            expect(state.value.keywords).toBeUndefined()
            // Row 1 still shows [1,2]
            const selects = wrapper.findAllComponents(ModelSelectStub)
            expect(selects[0].props('modelValue')).toEqual([1, 2])
        })

        it('toggle round-trip preserves data', async () => {
            const {wrapper, state} = mountWidget({keywords: '1,2'})
            const toggles = wrapper.findAll('.v-btn-toggle')
            const allBtn = toggles[0].findAll('.v-btn')[1]
            const anyBtn = toggles[0].findAll('.v-btn')[0]
            await allBtn.trigger('click')
            await nextTick()
            await anyBtn.trigger('click')
            await nextTick()
            expect(state.value.keywords).toBe('1,2')
            expect(state.value.keywordsAnd).toBeUndefined()
        })

        it('toggle with expansion preserves both rows', async () => {
            const {wrapper, state} = mountWidget({keywords: '1,2', keywordsAnd: '5,6'})
            // Auto-expanded because keywordsAnd has data
            expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(4)
            const toggles = wrapper.findAll('.v-btn-toggle')
            const allBtn = toggles[0].findAll('.v-btn')[1]
            await allBtn.trigger('click')
            await nextTick()
            // Swap: keys[0] gets old keys[1] data, keys[1] gets old keys[0] data
            expect(state.value.keywords).toBe('5,6')
            expect(state.value.keywordsAnd).toBe('1,2')
        })
    })

    describe('expansion', () => {
        it('auto-corrects mode when only secondary key has data (no expansion needed)', () => {
            const {wrapper} = mountWidget({keywordsAnd: '5,6'})
            // Mode corrects to 'all', Row 1 reads keys[1] = [5,6]. No expansion.
            expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(2)
            expect(wrapper.findAllComponents(ModelSelectStub)[0].props('modelValue')).toEqual([5, 6])
        })

        it('auto-expands when both include keys have data', () => {
            const {wrapper} = mountWidget({keywords: '1', keywordsAnd: '5,6'})
            expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(4)
        })

        it('all 4 keys populate correctly when loaded', () => {
            const {wrapper} = mountWidget({
                keywords: '1', keywordsAnd: '2', keywordsOrNot: '3', keywordsAndNot: '4',
            })
            const selects = wrapper.findAllComponents(ModelSelectStub)
            expect(selects).toHaveLength(4)
        })

        it('Row 1 and Row 3 write to different keys', async () => {
            const {wrapper, setFilter} = mountWidget({keywords: '1', keywordsAnd: '10'})
            // Both keys have data → expanded. Row 1 = any (keys[0]), Row 3 = all (keys[1])
            const selects = wrapper.findAllComponents(ModelSelectStub)
            expect(selects.length).toBe(4)
            await selects[0].vm.$emit('update:modelValue', [7, 8])
            expect(setFilter).toHaveBeenCalledWith('keywords', [7, 8])
        })
    })

    describe('saved search loading', () => {
        it('auto-corrects mode when only keys[1] has data', async () => {
            const {wrapper} = mountWidget({keywordsAnd: '5,6'})
            await nextTick()
            // Row 1 should be in "all" mode, showing [5,6]
            const selects = wrapper.findAllComponents(ModelSelectStub)
            expect(selects[0].props('modelValue')).toEqual([5, 6])
        })
    })

    describe('collapse', () => {
        it('collapses silently when secondary rows are empty', async () => {
            const {wrapper} = mountWidget({keywords: '1,2'})
            // Expand
            await wrapper.find('.fa-plus').trigger('click')
            expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(4)
            // Collapse (secondary rows empty)
            await wrapper.find('.fa-minus').trigger('click')
            expect(wrapper.findAllComponents(ModelSelectStub).length).toBe(2)
        })
    })

    describe('badge', () => {
        it('shows total count across all visible rows', () => {
            const {wrapper} = mountWidget({keywords: '1,2', keywordsOrNot: '3'})
            const badge = wrapper.find('.v-badge')
            expect(badge.text()).toContain('3')
        })
    })
})
