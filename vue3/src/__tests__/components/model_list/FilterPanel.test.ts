import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createI18n} from 'vue-i18n'
import {h} from 'vue'
import FilterPanel from '@/components/model_list/FilterPanel.vue'
import type {FilterDef} from '@/composables/modellist/types'

const ModelSelectStub = {
    name: 'ModelSelect',
    props: ['model', 'modelValue', 'mode', 'appendToBody'],
    emits: ['update:modelValue'],
    render(ctx: any) { return h('div', {class: 'model-select-stub', 'data-append-to-body': String(ctx.appendToBody)}) },
}

const TriStateToggleStub = {
    name: 'TriStateToggle',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    render() { return h('div', {class: 'tristate-stub'}) },
}

function mountPanel(defs: FilterDef[], filterValues: Record<string, string> = {}, extraProps: Record<string, any> = {}) {
    const vuetify = createVuetify({components, directives})
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})

    const grouped = new Map<string, FilterDef[]>()
    grouped.set('', defs)

    return mount(FilterPanel, {
        props: {
            groupedFilterDefs: grouped,
            getFilter: (key: string) => filterValues[key],
            setFilter: vi.fn(),
            clearAllFilters: vi.fn(),
            activeFilterCount: Object.keys(filterValues).length,
            ...extraProps,
        },
        global: {
            plugins: [vuetify, i18n],
            stubs: {
                ModelSelect: ModelSelectStub,
                TriStateToggle: TriStateToggleStub,
                CollapsibleSection: {template: '<div><slot /></div>'},
            },
        },
    })
}

describe('FilterPanel', () => {
    describe('existing types still render', () => {
        it('renders tristate via TriStateToggle', () => {
            const wrapper = mountPanel([{key: 'on_hand', labelKey: 'OnHand', type: 'tristate'}])
            expect(wrapper.find('.tristate-stub').exists()).toBe(true)
        })

        it('renders model-select via ModelSelect', () => {
            const wrapper = mountPanel([
                {key: 'created_by', labelKey: 'CreatedBy', type: 'model-select', modelName: 'User' as any},
            ])
            expect(wrapper.find('.model-select-stub').exists()).toBe(true)
        })
    })

    describe('new types', () => {
        it('renders number-range as two number inputs', () => {
            const wrapper = mountPanel(
                [{key: 'rating', labelKey: 'Rating', type: 'number-range'}],
                {rating: '3~5'},
            )
            const numberInputs = wrapper.findAll('input[type="number"]')
            expect(numberInputs.length).toBe(2)
        })

        it('renders date-range as two date inputs', () => {
            const wrapper = mountPanel(
                [{key: 'cookedon', labelKey: 'CookedOn', type: 'date-range'}],
                {cookedon: '2025-01-01~2025-12-31'},
            )
            const dateInputs = wrapper.findAll('input[type="date"]')
            expect(dateInputs.length).toBe(2)
        })
    })

    // E-2: opening a filter dropdown rendered inside a temporary drawer must
    // not cause the drawer to dismiss. The fix keeps the multiselect dropdown
    // inside the drawer's DOM instead of teleporting to document.body.
    describe('inDrawer prop (E-2)', () => {
        it('model-select dropdowns are body-teleported when outside a drawer', () => {
            const wrapper = mountPanel([
                {key: 'created_by', labelKey: 'CreatedBy', type: 'model-select', modelName: 'User' as any},
            ])
            expect(wrapper.find('.model-select-stub').attributes('data-append-to-body')).toBe('true')
        })

        it('model-select dropdowns stay inline when rendered inside a drawer', () => {
            const wrapper = mountPanel(
                [{key: 'created_by', labelKey: 'CreatedBy', type: 'model-select', modelName: 'User' as any}],
                {},
                {inDrawer: true},
            )
            expect(wrapper.find('.model-select-stub').attributes('data-append-to-body')).toBe('false')
        })

        it('tag-select dropdowns stay inline when rendered inside a drawer', () => {
            const wrapper = mountPanel(
                [{key: 'keywords_or', labelKey: 'Keywords', type: 'tag-select' as any, modelName: 'Keyword' as any}],
                {},
                {inDrawer: true},
            )
            expect(wrapper.find('.model-select-stub').attributes('data-append-to-body')).toBe('false')
        })

        it('tag-group (RecipeTagFilterGroup) dropdowns stay inline when rendered inside a drawer', () => {
            const wrapper = mountPanel(
                [{
                    key: 'keywords', labelKey: 'Keywords', type: 'tag-group' as any,
                    modelName: 'Keyword' as any,
                    variantKeys: ['keywords', 'keywordsAnd', 'keywordsOrNot', 'keywordsAndNot'] as any,
                }],
                {},
                {inDrawer: true},
            )
            const stubs = wrapper.findAll('.model-select-stub')
            expect(stubs.length).toBeGreaterThan(0)
            for (const s of stubs) {
                expect(s.attributes('data-append-to-body')).toBe('false')
            }
        })
    })
})
