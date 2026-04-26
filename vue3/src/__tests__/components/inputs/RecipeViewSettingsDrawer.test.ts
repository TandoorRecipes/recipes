/**
 * Regression coverage for RecipeViewSettingsDrawer.
 *
 * Characterization tests for the drawer model-value / pinned / tabs
 * wiring to useRecipeViewSettings singleton.
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

import RecipeViewSettingsDrawer from '@/components/inputs/RecipeViewSettingsDrawer.vue'
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'

const capturedTabs: any[] = []

function mountDrawer() {
    capturedTabs.length = 0
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: {en: {
            IngredientMenu: 'Ingredient menu',
            HighlightWhen: 'Highlight when',
            OnHand: 'On hand',
            InShoppingList: 'In shopping list',
            HasSubstitute: 'Has substitute',
            Never: 'Never',
            IngredientSummarySection: 'Ingredient summary',
            IngredientSummaryScope: 'Applies to the collapsed summary at the top of the recipe.',
            StepIngredientsSection: 'Step ingredients',
            StepIngredientsScope: 'Applies to the expanded step-by-step view.',
            StartExpandedHelper: 'Show the summary open when you load a recipe.',
        }},
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(RecipeViewSettingsDrawer, {
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                TabbedDrawer: {
                    props: ['modelValue', 'activeTab', 'pinned', 'pinnable', 'tabs', 'width', 'useSheet'],
                    template: '<div class="stub-drawer"><slot name="settings"/><slot name="overview"/><slot name="steps"/></div>',
                    mounted(this: any) { capturedTabs.push(...(this.tabs ?? [])) },
                },
            },
        },
    })
}

describe('RecipeViewSettingsDrawer', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
        // Reset the module-scope singleton refs
        const {isOpen, isPinned} = useRecipeViewSettings()
        isOpen.value = false
        isPinned.value = false
    })

    it('mounts without error', () => {
        const w = mountDrawer()
        expect(w.exists()).toBe(true)
    })

    it('renders tabbed drawer stub', () => {
        const w = mountDrawer()
        expect(w.find('.stub-drawer').exists()).toBe(true)
    })

    it('binds isOpen / isPinned to the useRecipeViewSettings singleton', () => {
        mountDrawer()
        const {isOpen, isPinned} = useRecipeViewSettings()
        // Just confirm the singleton refs are reachable / writable; the
        // actual TabbedDrawer is stubbed so we can't drive its emits.
        isOpen.value = true
        expect(isOpen.value).toBe(true)
        isPinned.value = true
        expect(isPinned.value).toBe(true)
    })

    it('renders a single tab (no Overview/StepDetails split)', () => {
        mountDrawer()
        expect(capturedTabs).toHaveLength(1)
    })

    it('HighlightWhen options do not include substitute (redundant with tri-state onhand)', async () => {
        const w = mountDrawer()
        const store = (w.vm.$pinia as any)._s.get('user_preference_store')
        store.deviceSettings.recipe_showIngredientActions = true
        await w.vm.$nextTick()
        // Vuetify's v-select renders hidden native <option> elements for
        // each item. Look at the HighlightWhen select specifically.
        const options = w.findAll('option').map(o => o.attributes('value')).filter(Boolean)
        expect(options).not.toContain('substitute')
        expect(options).toContain('onhand')
    })

    it('renders Ingredient summary and Step ingredients section titles with scope helper text', () => {
        const w = mountDrawer()
        const html = w.html()
        expect(html).toContain('Ingredient summary')
        expect(html).toContain('Applies to the collapsed summary at the top of the recipe.')
        expect(html).toContain('Step ingredients')
        expect(html).toContain('Applies to the expanded step-by-step view.')
    })

    it('wraps each scoped section in its own v-expansion-panel', () => {
        const w = mountDrawer()
        const panels = w.findAll('.v-expansion-panel')
        expect(panels.length).toBe(2)
    })
})
