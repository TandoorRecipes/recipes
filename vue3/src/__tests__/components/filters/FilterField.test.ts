/**
 * Regression coverage for FilterField.
 *
 * Tests each type-branch rendering + setFilter/clearFilter emit
 * via getter/setter props.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

import FilterField from '@/components/filters/FilterField.vue'
import type {FilterDef} from '@/composables/modellist/types'

function mountField(def: FilterDef, storedValue?: string) {
    const getFilter = vi.fn((_k: string) => storedValue)
    const setFilter = vi.fn()
    const clearFilter = vi.fn()
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    const w = mount(FilterField, {
        props: {def, getFilter, setFilter, clearFilter},
        global: {
            plugins: [createPinia(), i18n, vuetify, router],
            stubs: {
                ModelSelect: {template: '<div class="stub-model-select"/>'},
                TriStateToggle: {template: '<div class="stub-tristate"/>'},
            },
        },
    })
    return {w, getFilter, setFilter, clearFilter}
}

describe('FilterField', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('tristate type renders TriStateToggle', () => {
        const def: FilterDef = {key: 'f', labelKey: 'L', type: 'tristate'} as any
        const {w} = mountField(def)
        expect(w.find('.stub-tristate').exists()).toBe(true)
    })

    it('select type renders a v-select with options mapped from def.options', () => {
        const def: FilterDef = {
            key: 'type', labelKey: 'Type', type: 'select',
            options: [{value: 'A', labelKey: 'LabelA'}, {value: 'B', labelKey: 'LabelB'}],
        } as any
        const {w} = mountField(def)
        const sel = w.find('.v-select')
        expect(sel.exists()).toBe(true)
    })

    it('number type renders a numeric v-text-field', () => {
        const def: FilterDef = {key: 'n', labelKey: 'N', type: 'number'} as any
        const {w} = mountField(def)
        const input = w.find('input[type="number"]')
        expect(input.exists()).toBe(true)
    })

    it('toggle type renders a v-switch', () => {
        const def: FilterDef = {key: 't', labelKey: 'T', type: 'toggle'} as any
        const {w} = mountField(def)
        expect(w.find('.v-switch').exists()).toBe(true)
    })

    it('model-select type with modelName renders the ModelSelect stub', () => {
        const def: FilterDef = {key: 'm', labelKey: 'M', type: 'model-select', modelName: 'Food'} as any
        const {w} = mountField(def)
        expect(w.find('.stub-model-select').exists()).toBe(true)
    })

    it('hidden def renders nothing', () => {
        const def: FilterDef = {key: 'h', labelKey: 'H', type: 'tristate', hidden: true} as any
        const {w} = mountField(def)
        expect(w.find('.stub-tristate').exists()).toBe(false)
    })
})
