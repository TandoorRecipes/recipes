/**
 * Edge case prop tests.
 *
 * Mounts components with makeMinimal*() and makeEdgeCase*() factory data
 * to catch missing null guards, empty array access, and undefined field crashes.
 *
 * If a component crashes with edge case data, the fix belongs in the component
 * (add a guard), NOT in the test (weaken the assertion).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import type { Component } from 'vue'

import {
    makeMinimalFood,
    makeEdgeCaseFood,
    makeMinimalRecipe,
    makeEdgeCaseRecipe,
    makeMinimalRecipeOverview,
    makeEdgeCaseRecipeOverview,
    makeMinimalShoppingListEntry,
    makeEdgeCaseShoppingListEntry,
    makeMinimalMealPlan,
    makeEdgeCaseMealPlan,
    makeMinimalStep,
    makeEdgeCaseStep,
    makeMinimalIngredient,
    makeEdgeCaseIngredient,
    makeMinimalSpace,
    makeMinimalUserPreference,
    makeMinimalRecipeBook,
    makeEdgeCaseRecipeBook,
    makeMinimalKeyword,
    makeEdgeCaseKeyword,
    makeMinimalUnit,
    makeEdgeCaseUnit,
    makeMinimalSupermarket,
    makeEdgeCaseSupermarket,
    makeMinimalCookLog,
    makeEdgeCaseCookLog,
    makeMinimalShoppingListRecipe,
    makeMinimalFoodShopping,
    makeEdgeCaseFoodShopping,
} from '@/__tests__/factories.generated'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useClipboard: () => ({ copy: vi.fn(), copied: ref(false) }),
        useWakeLock: () => ({ request: vi.fn(), release: vi.fn() }),
        useUrlSearchParams: () => ({}),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

vi.mock('@/utils/cookie', () => ({
    getCookie: () => 'test-csrf-token',
}))

vi.mock('@/types/Models', async () => {
    const actual = await vi.importActual<any>('@/types/Models')
    return {
        ...actual,
        getGenericModelFromString: () => ({
            model: { name: 'Food', localizationKey: 'Food', isMerge: true, disableCreate: false },
            list: vi.fn().mockResolvedValue({ results: [], count: 0 }),
            retrieve: vi.fn().mockResolvedValue(makeMinimalFood()),
            getLabel: (obj: any) => obj?.name ?? '',
            getTableHeaders: () => [],
        }),
    }
})

// Import components
import ShoppingLineItem from '@/components/display/ShoppingLineItem.vue'
import RecipeCard from '@/components/display/RecipeCard.vue'
import RecipeImage from '@/components/display/RecipeImage.vue'
import KeywordsBar from '@/components/display/KeywordsBar.vue'
import PrivateRecipeBadge from '@/components/display/PrivateRecipeBadge.vue'
import PluralName from '@/components/display/PluralName.vue'
import ScalableNumber from '@/components/display/ScalableNumber.vue'
import Timer from '@/components/display/Timer.vue'
import StepView from '@/components/display/StepView.vue'
import IngredientsTable from '@/components/display/IngredientsTable.vue'

function createTestApp() {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeMinimalUserPreference() as any
            store.activeSpace = makeMinimalSpace() as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)

    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'StartPage', component: { template: '<div/>' } },
            { path: '/recipe/:id', name: 'RecipeViewPage', component: { template: '<div/>' } },
            { path: '/edit/:model/:id?', name: 'ModelEditPage', component: { template: '<div/>' } },
        ],
    })

    return { pinia, i18n, vuetify, router }
}

function edgeMount(component: Component, props: Record<string, any> = {}) {
    const { pinia, i18n, vuetify, router } = createTestApp()
    return mount(component, {
        props,
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                ShoppingLineItemDialog: { template: '<div/>' },
                ShoppingListsBar: { template: '<div/>' },
                RecipeContextMenu: { template: '<div/>' },
                RecipeImage: { template: '<div/>' },
                IngredientsTableRow: { template: '<div/>' },
                Instructions: { template: '<div/>' },
                StepsOverview: { template: '<div/>' },
                KeywordsBar: { template: '<div/>' },
                KeywordsComponent: { template: '<div/>' },
                AddToShoppingDialog: { template: '<div/>' },
                RecipeShareDialog: { template: '<div/>' },
                NumberScalerDialog: { template: '<div/>' },
                PropertyView: { template: '<div/>' },
                ExternalRecipeViewer: { template: '<div/>' },
                RecipeActivity: { template: '<div/>' },
                PrivateRecipeBadge: { template: '<div/>' },
                ModelSelect: { template: '<div/>' },
                RecipeScalingDialog: { template: '<div/>' },
                AiActionButton: { template: '<div/>' },
            },
        },
    })
}

describe('Edge case props — minimal data', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeMinimalRecipe())
        if (!document.querySelector('base')) {
            const base = document.createElement('base')
            base.href = 'http://localhost:8000/'
            document.head.appendChild(base)
        }
    })

    it('ShoppingLineItem with minimal food entries', async () => {
        const food = makeMinimalFoodShopping()
        const w = edgeMount(ShoppingLineItem, {
            shoppingListFood: { food, entries: new Map() },
        })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('ShoppingLineItem with edge case food entries', async () => {
        const food = makeEdgeCaseFoodShopping()
        const entry = makeEdgeCaseShoppingListEntry()
        const entries = new Map([[1, entry]])
        const w = edgeMount(ShoppingLineItem, {
            shoppingListFood: { food, entries },
        })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('RecipeCard with minimal recipe', async () => {
        const w = edgeMount(RecipeCard, { recipe: makeMinimalRecipeOverview() })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('RecipeCard with edge case recipe', async () => {
        const w = edgeMount(RecipeCard, { recipe: makeEdgeCaseRecipeOverview() })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('RecipeImage with minimal recipe', () => {
        const w = edgeMount(RecipeImage, { recipe: makeMinimalRecipeOverview() })
        expect(w.exists()).toBe(true)
    })

    it('KeywordsBar with minimal recipe', () => {
        const w = edgeMount(KeywordsBar, { recipe: makeMinimalRecipeOverview() })
        expect(w.exists()).toBe(true)
    })

    it('PrivateRecipeBadge with minimal recipe', () => {
        const w = edgeMount(PrivateRecipeBadge, { recipe: makeMinimalRecipeOverview() })
        expect(w.exists()).toBe(true)
    })

    it('PluralName with edge case values', () => {
        const w = edgeMount(PluralName, { name: '', pluralName: null, amount: 0 })
        expect(w.exists()).toBe(true)
    })

    it('ScalableNumber with zero', () => {
        const w = edgeMount(ScalableNumber, { number: 0, factor: 0 })
        expect(w.exists()).toBe(true)
    })

    it('Timer with zero seconds', () => {
        const w = edgeMount(Timer, { seconds: 0 })
        expect(w.exists()).toBe(true)
    })

    it('StepView with minimal step', () => {
        const w = edgeMount(StepView, {
            modelValue: makeMinimalStep(),
            ingredientFactor: 1,
        })
        expect(w.exists()).toBe(true)
    })

    it('StepView with edge case step', () => {
        const w = edgeMount(StepView, {
            modelValue: makeEdgeCaseStep(),
            ingredientFactor: 0,
        })
        expect(w.exists()).toBe(true)
    })
})

describe('Edge case props — edge case data', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeEdgeCaseRecipe())
        if (!document.querySelector('base')) {
            const base = document.createElement('base')
            base.href = 'http://localhost:8000/'
            document.head.appendChild(base)
        }
    })

    it('RecipeImage with edge case recipe (null image)', () => {
        const w = edgeMount(RecipeImage, { recipe: makeEdgeCaseRecipeOverview() })
        expect(w.exists()).toBe(true)
    })

    it('KeywordsBar with edge case recipe (null keywords)', () => {
        const w = edgeMount(KeywordsBar, { recipe: makeEdgeCaseRecipeOverview() })
        expect(w.exists()).toBe(true)
    })
})
