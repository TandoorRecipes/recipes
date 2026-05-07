/**
 * Regression coverage for IngredientsTable inline onhand / substitute
 * rendering.
 *
 * The inline yellow "substitute available" icon + names block must be
 * gated on the food itself NOT being onhand (bug: names used to appear
 * alongside the green onhand icon). Names source is food.availableSubstitutes
 * (the onhand subset), not the full substitute M2M list.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'
import {ref} from 'vue'

import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeUserPreference} from '@/__tests__/factories'

vi.mock('vue-router', async (imp) => ({...(await imp<any>()), useRoute: () => ({query: {}})}))
vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

import IngredientsTable from '@/components/display/IngredientsTable.vue'

function makeIngredient(overrides: any = {}): any {
    return {
        id: 1,
        amount: 1,
        food: {id: 1, name: 'Butter', foodOnhand: false, substitute: [], availableSubstitutes: [], substituteOnhand: false, ...overrides.food},
        unit: {id: 1, name: 'tbsp'},
        note: '',
        noAmount: false,
        order: 0,
        originalText: 'Butter',
        alwaysUsePluralUnit: false,
        alwaysUsePluralFood: false,
        checked: false,
        isHeader: false,
        ...overrides,
    }
}

function mountTable(ingredients: any[], context: 'overview' | 'step' = 'overview') {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            // Force inline status on so the block renders
            store.deviceSettings.recipe_overviewInlineStatus = true
            store.deviceSettings.recipe_stepInlineStatus = true
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({
        components: vuetifyComponents, directives: vuetifyDirectives,
        display: {mobileBreakpoint: 0}, // desktop — inline status gated on !mobile
    })
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(IngredientsTable, {
        props: {modelValue: ingredients, ingredientFactor: 1, showCheckbox: false, showActions: false, context},
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                IngredientContextMenu: {template: '<div class="stub-ctxmenu"/>'},
            },
        },
    })
}

describe('IngredientsTable inline onhand / substitute', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    it('renders green onhand icon and no substitute names when food is onhand', () => {
        const ing = makeIngredient({food: {foodOnhand: true, availableSubstitutes: [{id: 2, name: 'Margarine'}], substituteOnhand: true}})
        const w = mountTable([ing])
        const html = w.html()
        // Green onhand clipboard-check is present
        expect(html).toContain('fa-clipboard-check')
        // Substitute names must NOT appear when the food itself is onhand
        expect(html).not.toContain('Margarine')
    })

    it('renders yellow substitute icon and available-substitute names when food is not onhand', () => {
        const ing = makeIngredient({food: {
            foodOnhand: false,
            substitute: [{id: 2, name: 'Margarine'}, {id: 3, name: 'Ghee'}],
            availableSubstitutes: [{id: 2, name: 'Margarine'}],
            substituteOnhand: true,
        }})
        const w = mountTable([ing])
        const html = w.html()
        expect(html).toContain('fa-right-left')
        // Names list is the onhand subset (Margarine only), not the full substitute M2M (which also contains Ghee)
        expect(html).toContain('Margarine')
        expect(html).not.toContain('Ghee')
    })

    it('renders no icons and no names when nothing is onhand and no available substitute', () => {
        const ing = makeIngredient({food: {foodOnhand: false, availableSubstitutes: [], substituteOnhand: false, substitute: [{id: 2, name: 'Margarine'}]}})
        const w = mountTable([ing])
        const html = w.html()
        expect(html).not.toContain('fa-clipboard-check')
        expect(html).not.toContain('fa-right-left')
        expect(html).not.toContain('Margarine')
    })

    it('substitute names use availableSubstitutes not substitute when the lists differ', () => {
        const ing = makeIngredient({food: {
            foodOnhand: false,
            substitute: [{id: 99, name: 'FullListName'}],
            availableSubstitutes: [{id: 2, name: 'OnhandName'}],
            substituteOnhand: true,
        }})
        const w = mountTable([ing])
        const html = w.html()
        expect(html).toContain('OnhandName')
        expect(html).not.toContain('FullListName')
    })

    // Inline text shows ONE random available substitute, not a list. Keeps
    // the row short regardless of how many onhand substitutes exist. The
    // aria-label on the yellow icon still lists all for screen readers.
    it('inline substitute text renders exactly one name from availableSubstitutes', () => {
        const ing = makeIngredient({food: {
            foodOnhand: false,
            availableSubstitutes: [
                {id: 2, name: 'Alpha'},
                {id: 3, name: 'Beta'},
                {id: 4, name: 'Gamma'},
            ],
            substituteOnhand: true,
        }})
        const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5) // → index floor(0.5*3) = 1 → Beta
        try {
            const w = mountTable([ing])
            const visible = w.find('.text-caption.text-medium-emphasis').text()
            expect(visible).toContain('Beta')
            expect(visible).not.toContain('Alpha')
            expect(visible).not.toContain('Gamma')
            expect(visible).not.toContain(',')
        } finally {
            mathSpy.mockRestore()
        }
    })

    it('inline substitute text with a single availableSubstitute renders that one name', () => {
        const ing = makeIngredient({food: {
            foodOnhand: false,
            availableSubstitutes: [{id: 2, name: 'Solo'}],
            substituteOnhand: true,
        }})
        const w = mountTable([ing])
        expect(w.html()).toContain('Solo')
    })
})

describe('IngredientsTable note truncation', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    function mountWithTruncate(ingredients: any[], truncateLen: number) {
        const prePopulate: PiniaPlugin = ({store}) => {
            if (store.$id === 'user_preference_store') {
                store.userSettings = makeUserPreference() as any
                store.deviceSettings.recipe_overviewInlineStatus = true
                store.deviceSettings.recipe_stepInlineStatus = true
                store.deviceSettings.recipe_overviewNotesDisplay = 'truncate'
                store.deviceSettings.recipe_stepNotesDisplay = 'truncate'
                store.deviceSettings.recipe_notesTruncateLength = truncateLen
            }
        }
        const pinia = createPinia()
        pinia.use(prePopulate)
        const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
        const vuetify = createVuetify({
            components: vuetifyComponents, directives: vuetifyDirectives,
            display: {mobileBreakpoint: 0},
        })
        const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
        return mount(IngredientsTable, {
            props: {modelValue: ingredients, ingredientFactor: 1, showCheckbox: false, showActions: false, context: 'overview'},
            global: {
                plugins: [pinia, i18n, vuetify, router],
                stubs: {IngredientContextMenu: {template: '<div class="stub-ctxmenu"/>'}},
            },
        })
    }

    it('truncate length shrinks by inline substitute text length so the row stays within the user budget', () => {
        const note = 'abcdefghijklmnopqrstuvwxyz0123456789' // 36 chars
        const subName = 'XYZABC' // 6 chars
        const ing = makeIngredient({
            note,
            food: {
                foodOnhand: false,
                availableSubstitutes: [{id: 2, name: subName}],
                substituteOnhand: true,
            },
        })
        // Budget 25. Without substitute: truncate to 25 → 'abcdefghijklmnopqrstuvwxy...'.
        // With 6-char substitute + 3 framing chars (' (x)'), budget shrinks to
        // 25 - 9 = 16 → 'abcdefghijklmnop...'.
        const w = mountWithTruncate([ing], 25)
        const html = w.html()
        expect(html).toContain(subName) // substitute still rendered
        // The long-truncation prefix ('abcdefghijklmnopqrstuvwxy') MUST NOT appear
        expect(html).not.toContain('abcdefghijklmnopqrstuvwxy')
        // The short-truncation prefix ('abcdefghijklmnop') MUST appear
        expect(html).toContain('abcdefghijklmnop')
    })

    it('truncate length falls back to full user budget when no substitute is shown (food onhand)', () => {
        const note = 'abcdefghijklmnopqrstuvwxyz0123456789'
        const ing = makeIngredient({
            note,
            food: {
                foodOnhand: true, // onhand → no substitute text even if availableSubstitutes present
                availableSubstitutes: [{id: 2, name: 'XYZABC'}],
                substituteOnhand: true,
            },
        })
        const w = mountWithTruncate([ing], 25)
        const html = w.html()
        // Full 25-char budget used
        expect(html).toContain('abcdefghijklmnopqrstuvwxy')
    })
})
