/**
 * Regression coverage for IngredientContextMenu.
 *
 * Smoke + a11y: mounts with an ingredient prop, and the activator
 * v-btn has the i18n-translated aria-label per MEMORY's a11y fix
 * (M-UX-2 replaced a hardcoded English "Ingredient actions" string).
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

import IngredientContextMenu from '@/components/inputs/IngredientContextMenu.vue'

const INGREDIENT: any = {
    id: 1,
    amount: 1,
    food: {id: 1, name: 'Butter', onhand: false, onhandUsers: [], substitute: [], substituteChildren: false, substituteSiblings: false, ignoreShopping: false},
    unit: {id: 1, name: 'tbsp'},
    note: '',
    no_amount: false,
    order: 0,
    original_text: 'Butter',
    always_use_plural_unit: false,
    always_use_plural_food: false,
}

function mountMenu(ingredient: any = INGREDIENT) {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            store.activeSpace = {id: 1} as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {IngredientActions: 'Ingredient actions'}},
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(IngredientContextMenu, {
        props: {ingredient},
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                ActionConfirmDialog: {template: '<div class="stub-action-confirm"/>'},
                InventoryQuickAddDialog: {template: '<div class="stub-inventory-quickadd"/>'},
                NumberScalerDialog: {template: '<div class="stub-scaler"/>'},
            },
        },
    })
}

describe('IngredientContextMenu', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    it('mounts without error', () => {
        const w = mountMenu()
        expect(w.exists()).toBe(true)
    })

    it('activator button has the translated aria-label (regression for M-UX-2)', () => {
        const w = mountMenu()
        const btn = w.find('.v-btn')
        expect(btn.exists()).toBe(true)
        expect(btn.attributes('aria-label')).toBe('Ingredient actions')
    })

    it('mounts cleanly when the food is already on-hand', () => {
        const w = mountMenu({...INGREDIENT, food: {...INGREDIENT.food, onhand: true}})
        expect(w.exists()).toBe(true)
    })
})
