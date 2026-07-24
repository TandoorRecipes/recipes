/**
 * Regression coverage for ActionMenu.
 *
 * Tests the quick-actions rendering, resolveColor logic (isActive +
 * colorResolver + toggle state), action emit on click, and visibility
 * filtering.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'
import type {ActionDef, ModelItem} from '@/composables/modellist/types'

import ActionMenu from '@/components/common/ActionMenu.vue'

function mountMenu(props: {
    item?: ModelItem
    actionDefs?: ActionDef[]
    quickActionKeys?: string[]
    getToggleState?: (a: ActionDef, i: ModelItem) => boolean
}) {
    const item: ModelItem = props.item ?? ({id: 1, name: 'Item'} as any)
    const actionDefs = props.actionDefs ?? []
    const groupedActionDefs = new Map<string, ActionDef[]>()
    for (const def of actionDefs) {
        const g = def.group ?? ''
        if (!groupedActionDefs.has(g)) groupedActionDefs.set(g, [])
        groupedActionDefs.get(g)!.push(def)
    }

    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({
        components: vuetifyComponents,
        directives: vuetifyDirectives,
    })
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(ActionMenu, {
        props: {
            item,
            actionDefs,
            groupedActionDefs,
            getToggleState: props.getToggleState ?? (() => false),
            quickActionKeys: props.quickActionKeys ?? [],
        },
        global: {
            plugins: [createPinia(), i18n, vuetify, router],
        },
    })
}

describe('ActionMenu', () => {
    beforeEach(() => setActivePinia(createPinia()))

    describe('quick actions', () => {
        it('renders quick-action buttons for each key in quickActionKeys', () => {
            const actionDefs: ActionDef[] = [
                {key: 'edit', labelKey: 'Edit', icon: 'fa-pen'} as any,
                {key: 'delete', labelKey: 'Delete', icon: 'fa-trash', isDanger: true} as any,
                {key: 'pin', labelKey: 'Pin', icon: 'fa-pin'} as any,
            ]
            const w = mountMenu({actionDefs, quickActionKeys: ['edit', 'delete']})
            // 2 quick buttons + 1 menu button = 3
            expect(w.findAll('.v-btn').length).toBeGreaterThanOrEqual(3)
        })

        it('quick-action keys that are invisible via action.visible() are filtered out', () => {
            const actionDefs: ActionDef[] = [
                {
                    key: 'edit', labelKey: 'Edit', icon: 'fa-pen',
                    visible: () => false,
                } as any,
            ]
            const w = mountMenu({actionDefs, quickActionKeys: ['edit']})
            // Just the menu button — the quick button was hidden
            expect(w.findAll('.v-btn').length).toBe(1)
        })

        it('emits action with (key, item) when a quick-action button is clicked', async () => {
            const actionDefs: ActionDef[] = [
                {key: 'edit', labelKey: 'Edit', icon: 'fa-pen'} as any,
            ]
            const item: ModelItem = {id: 42, name: 'X'} as any
            const w = mountMenu({actionDefs, quickActionKeys: ['edit'], item})
            const btn = w.findAll('.v-btn')[0]
            await btn.trigger('click')
            expect(w.emitted('action')).toBeTruthy()
            expect(w.emitted('action')![0]).toEqual(['edit', item])
        })

        it('quick-action resolves color via action.colorResolver when provided', () => {
            const actionDefs: ActionDef[] = [
                {
                    key: 'edit', labelKey: 'Edit', icon: 'fa-pen',
                    colorResolver: (item: ModelItem) => (item as any).special ? 'success' : 'grey',
                } as any,
            ]
            const w1 = mountMenu({actionDefs, quickActionKeys: ['edit'], item: {id: 1, special: true} as any})
            const w2 = mountMenu({actionDefs, quickActionKeys: ['edit'], item: {id: 2, special: false} as any})
            expect(w1.html()).toContain('text-success')
            expect(w2.html()).toContain('text-grey')
        })

        it('quick-action resolves color from active/inactive for toggle actions', () => {
            const actionDefs: ActionDef[] = [
                {
                    key: 'pin', labelKey: 'Pin', icon: 'fa-pin',
                    isToggle: true, toggleField: 'pinned',
                    activeColor: 'warning', inactiveColor: 'grey',
                } as any,
            ]
            const getToggleState = (a: ActionDef, item: ModelItem) => !!(item as any).pinned
            const w = mountMenu({actionDefs, quickActionKeys: ['pin'], item: {id: 1, pinned: true} as any, getToggleState})
            expect(w.html()).toContain('text-warning')
        })
    })

    describe('full menu', () => {
        it('renders an always-visible $menu button even with no quick actions', () => {
            const w = mountMenu({actionDefs: [], quickActionKeys: []})
            expect(w.findAll('.v-btn').length).toBe(1)
        })
    })
})
