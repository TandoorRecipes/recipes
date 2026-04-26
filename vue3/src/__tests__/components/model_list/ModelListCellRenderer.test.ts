/**
 * Coverage for ModelListCellRenderer.
 *
 * Two test groups in one file:
 *   - Cell-type branches (boolean-indicator, status-chip, color-chip, number, fallback) — D-4 regression batch.
 *   - filterLink router-link rendering on the number type — Phase 2 / item 12.
 *
 * The global Vuetify in vitest.setup.ts ships theme/icons but tree-shakes
 * components, so this file mounts a per-test Vuetify with the full
 * components+directives bundle so `.v-chip` / `.v-icon` selectors resolve.
 * The router is mounted per-test only when the test exercises a
 * router-link (filterLink branch).
 */
import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createRouter, createMemoryHistory, RouterLink} from 'vue-router'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'

import ModelListCellRenderer from '@/components/model_list/ModelListCellRenderer.vue'
import type {ModelTableHeaders} from '@/types/Models'

function makeRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: '/', name: 'StartPage', component: {template: '<div />'}},
            {path: '/search', name: 'SearchPage', component: {template: '<div />'}},
        ],
    })
}

function mountCell(props: {
    item: Record<string, any>,
    header: Partial<ModelTableHeaders>,
    displayMode?: 'icon' | 'text',
    showHeaders?: boolean,
    withRouter?: boolean,
}) {
    const i18n = createI18n({
        legacy: false,
        locale: 'en',
        messages: {en: {Recipes: 'Recipes', Children: 'Children'}},
        missingWarn: false,
        fallbackWarn: false,
    })
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    // Vuetify's VChip / VBtn use vue-router's useLink internally for the
    // optional chip-as-link case; missing router → "Cannot read properties
    // of undefined (reading 'resolve')". Include a no-op router for every
    // mount even when the test doesn't exercise router-link directly.
    const plugins: any[] = [i18n, vuetify, makeRouter()]
    return mount(ModelListCellRenderer, {
        props: {
            item: props.item,
            header: props.header as ModelTableHeaders,
            displayMode: props.displayMode ?? 'icon',
            showHeaders: props.showHeaders ?? true,
        },
        global: {plugins, components: {RouterLink}},
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

    describe('number column with filterLink', () => {
        const filterLinkHeader: Partial<ModelTableHeaders> = {
            title: 'Recipes',
            key: 'numrecipe',
            type: 'number',
            align: 'end',
            emphasizeNonZero: true,
            filterLink: {route: 'SearchPage', param: 'foods'},
        }

        it('renders a router-link when value > 0 and filterLink is set', () => {
            const w = mountCell({item: {id: 42, numrecipe: 5}, header: filterLinkHeader, withRouter: true})
            const link = w.findComponent(RouterLink)
            expect(link.exists()).toBe(true)
            expect(link.props('to')).toEqual({name: 'SearchPage', query: {foods: 42}})
            expect(w.text()).toContain('5')
        })

        it('renders plain (non-link) text when value is 0 even with filterLink set', () => {
            const w = mountCell({item: {id: 42, numrecipe: 0}, header: filterLinkHeader, withRouter: true})
            expect(w.findComponent(RouterLink).exists()).toBe(false)
            expect(w.text()).toContain('0')
        })

        it('renders plain text when value > 0 but filterLink is NOT set', () => {
            const plainHeader: Partial<ModelTableHeaders> = {
                title: 'Recipes',
                key: 'numrecipe',
                type: 'number',
                align: 'end',
            }
            const w = mountCell({item: {id: 42, numrecipe: 5}, header: plainHeader, withRouter: true})
            expect(w.findComponent(RouterLink).exists()).toBe(false)
            expect(w.text()).toContain('5')
        })

        it('renders nothing visible when value is null', () => {
            const w = mountCell({item: {id: 42, numrecipe: null}, header: filterLinkHeader, withRouter: true})
            expect(w.findComponent(RouterLink).exists()).toBe(false)
            expect(w.text().trim()).toBe('')
        })
    })
})
