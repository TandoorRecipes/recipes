/**
 * StepsOverview: the structured step overview should skip steps that have no
 * ingredients (instruction-only steps), while preserving the real step numbers
 * and still showing steps that carry a sub-recipe.
 */
import {describe, it, expect, beforeEach} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'

import {makeUserPreference} from '@/__tests__/factories'
import StepsOverview from '@/components/display/StepsOverview.vue'

function mountOverview(steps: any[]) {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            store.deviceSettings.recipe_overviewExpanded = true // open the panel so its content renders
        }
    }
    const pinia = createPinia(); pinia.use(prePopulate)
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [
        {path: '/', component: {template: '<div/>'}},
        {path: '/recipe/:id', name: 'RecipeViewPage', component: {template: '<div/>'}},
    ]})
    return mount(StepsOverview, {
        props: {steps, ingredientFactor: 1},
        global: {plugins: [pinia, i18n, vuetify, router], stubs: {IngredientsTable: true}},
    })
}

const withFood = (id: number, name: string) => ({
    id, name, showAsHeader: true,
    ingredients: [{id: id * 10, food: {id, name: 'food'}, isHeader: false}],
})

describe('StepsOverview hides empty steps', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('skips steps with no ingredients but keeps the real step numbers', () => {
        const steps = [
            withFood(1, 'Marinade'),                                   // step 1 — shown
            {id: 2, name: 'Instructions', showAsHeader: true, ingredients: []}, // step 2 — hidden
            withFood(3, 'Sauce'),                                      // step 3 — shown
        ]
        const html = mountOverview(steps).html()
        expect(html).toContain('1. Marinade')
        expect(html).not.toContain('Instructions')
        expect(html).toContain('3. Sauce') // numbering preserved (not renumbered to 2)
    })

    it('keeps a step that has no own ingredients but carries a sub-recipe', () => {
        const steps = [
            {id: 1, name: 'Sub step', showAsHeader: true, ingredients: [],
             stepRecipe: 9, stepRecipeData: {id: 9, name: 'Base recipe', steps: []}},
        ]
        const html = mountOverview(steps).html()
        expect(html).toContain('1. Sub step')
    })

    it('drops a header-only step that has no real ingredients', () => {
        const steps = [
            {id: 1, name: 'Just a header', showAsHeader: true,
             ingredients: [{id: 11, isHeader: true}]}, // header pseudo-ingredient, no food
        ]
        expect(mountOverview(steps).html()).not.toContain('Just a header')
    })
})
