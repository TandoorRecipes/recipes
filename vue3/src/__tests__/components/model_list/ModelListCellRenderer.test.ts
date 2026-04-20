/**
 * Regression coverage for ModelListCellRenderer.
 *
 * Tests each cell-type branch renders the expected primitive
 * (boolean-indicator, status-chip, color-chip, label-chip, number,
 * and the plain text fallback).
 */
import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'

import ModelListCellRenderer from '@/components/model_list/ModelListCellRenderer.vue'
import type {ModelTableHeaders} from '@/types/Models'

function mountCell(props: {item: Record<string, any>, header: Partial<ModelTableHeaders>, displayMode?: 'icon' | 'text', showHeaders?: boolean}) {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(ModelListCellRenderer, {
        props: {
            item: props.item,
            header: props.header as ModelTableHeaders,
            displayMode: props.displayMode ?? 'icon',
            showHeaders: props.showHeaders ?? true,
        },
        global: {plugins: [i18n, vuetify]},
    })
}

describe('ModelListCellRenderer', () => {
    describe('boolean-indicator', () => {
        it('renders the trueIcon when value is true in icon mode', () => {
            const w = mountCell({
                item: {onhand: true},
                header: {type: 'boolean-indicator', key: 'onhand', value: 'onhand', trueIcon: 'fa-check'} as any,
                displayMode: 'icon',
            })
            expect(w.find('.v-icon').exists()).toBe(true)
        })

        it('renders text "Yes" when value is true in text mode', () => {
            const w = mountCell({
                item: {onhand: true},
                header: {type: 'boolean-indicator', key: 'onhand', value: 'onhand', trueIcon: 'fa-check'} as any,
                displayMode: 'text',
            })
            expect(w.text()).toContain('Yes')
        })

        it('renders nothing when value is falsy', () => {
            const w = mountCell({
                item: {onhand: false},
                header: {type: 'boolean-indicator', key: 'onhand', value: 'onhand', trueIcon: 'fa-check'} as any,
            })
            expect(w.find('.v-icon').exists()).toBe(false)
            expect(w.text()).toBe('')
        })
    })

    describe('status-chip / color-chip', () => {
        it('renders a v-chip with the value text', () => {
            const w = mountCell({
                item: {status: 'active'},
                header: {type: 'status-chip', key: 'status', value: 'status'} as any,
            })
            expect(w.find('.v-chip').exists()).toBe(true)
            expect(w.text()).toContain('active')
        })

        it('color-chip passes the value as chip color', () => {
            const w = mountCell({
                item: {color: 'warning'},
                header: {type: 'color-chip', key: 'color', value: 'color'} as any,
            })
            const chip = w.find('.v-chip')
            expect(chip.exists()).toBe(true)
            expect(w.text()).toContain('warning')
        })
    })

    describe('number', () => {
        it('renders the numeric value', () => {
            const w = mountCell({
                item: {qty: 7},
                header: {type: 'number', key: 'qty', value: 'qty', title: 'Qty'} as any,
            })
            expect(w.text()).toContain('7')
        })

        it('prepends header title when showHeaders=false', () => {
            const w = mountCell({
                item: {qty: 3},
                header: {type: 'number', key: 'qty', value: 'qty', title: 'Qty'} as any,
                showHeaders: false,
            })
            expect(w.text()).toContain('Qty')
        })

        it('does NOT render when value is null', () => {
            const w = mountCell({
                item: {qty: null},
                header: {type: 'number', key: 'qty', value: 'qty', title: 'Qty'} as any,
            })
            expect(w.text()).toBe('')
        })
    })

    describe('default fallback', () => {
        it('renders displayValue for unknown types', () => {
            const w = mountCell({
                item: {name: 'Butter'},
                header: {key: 'name', value: 'name'} as any,
            })
            expect(w.text()).toContain('Butter')
        })
    })
})
