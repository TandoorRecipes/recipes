import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeRecipe, makeStep, makeIngredient, makeFood, makeUnit, makeKeyword, makeUserPreference, makeSpace } from '@/__tests__/factories'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useWakeLock: () => ({ request: vi.fn(), release: vi.fn() }),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

// Mock cookie for useFileApi
vi.mock('@/utils/cookie', () => ({
    getCookie: () => 'test-csrf-token',
}))

import RecipeView from '@/components/display/RecipeView.vue'

describe('RecipeView', () => {
    beforeEach(() => {
        resetApiMock()
    })

    function mountRecipeView(recipe = makeRecipe({
        id: 1,
        name: 'Test Recipe',
        servings: 4,
        steps: [makeStep({ ingredients: [makeIngredient()] })],
    })) {
        const prePopulate: PiniaPlugin = ({ store }) => {
            if (store.$id === 'user_preference_store') {
                store.userSettings = makeUserPreference() as any
                store.activeSpace = makeSpace() as any
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

        return mount(RecipeView, {
            props: { modelValue: recipe, servings: undefined },
            global: {
                plugins: [pinia, i18n, vuetify, router],
                stubs: {
                    StepsOverview: { template: '<div class="stub-steps-overview"/>' },
                    RecipeActivity: { template: '<div class="stub-recipe-activity"/>' },
                    RecipeContextMenu: { template: '<div class="stub-context-menu"/>' },
                    KeywordsBar: { template: '<div class="stub-keywords"/>' },
                    KeywordsComponent: { template: '<div class="stub-keywords"/>' },
                    RecipeImage: { template: '<div class="stub-recipe-image"/>' },
                    ExternalRecipeViewer: { template: '<div class="stub-external-viewer"/>' },
                    StepView: { template: '<div class="stub-step-view"/>' },
                    PropertyView: { template: '<div class="stub-property-view"/>' },
                    PrivateRecipeBadge: { template: '<div class="stub-private-badge"/>' },
                    ModelSelect: { template: '<div class="stub-model-select"/>' },
                    NumberScalerDialog: { template: '<div class="stub-number-scaler"/>' },
                    RecipeScalingDialog: { template: '<div class="stub-scaling-dialog"/>' },
                    AddToShoppingDialog: { template: '<div class="stub-add-to-shopping"/>' },
                    RecipeShareDialog: { template: '<div class="stub-share-dialog"/>' },
                    AiActionButton: { template: '<div class="stub-ai-button"/>' },
                },
            },
        })
    }

    it('mounts without error', async () => {
        const wrapper = mountRecipeView()
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('displays recipe name', async () => {
        const wrapper = mountRecipeView()
        await flushPromises()
        expect(wrapper.text()).toContain('Test Recipe')
    })

    it('displays recipe description when present', async () => {
        const recipe = makeRecipe({ name: 'Cookies', description: 'Delicious homemade cookies' })
        const wrapper = mountRecipeView(recipe)
        await flushPromises()
        expect(wrapper.text()).toContain('Delicious homemade cookies')
    })

    it('displays working and waiting time', async () => {
        const recipe = makeRecipe({ workingTime: 30, waitingTime: 60 })
        const wrapper = mountRecipeView(recipe)
        await flushPromises()
        expect(wrapper.text()).toContain('30')
        expect(wrapper.text()).toContain('60')
    })

    it('renders step views for each step', async () => {
        const recipe = makeRecipe({
            steps: [makeStep({ id: 1 }), makeStep({ id: 2 })],
        })
        const wrapper = mountRecipeView(recipe)
        await flushPromises()
        expect(wrapper.findAll('.stub-step-view').length).toBe(2)
    })

    it('renders keywords when present', async () => {
        const recipe = makeRecipe({
            keywords: [makeKeyword({ name: 'Italian' })],
        })
        const wrapper = mountRecipeView(recipe)
        await flushPromises()
        expect(wrapper.find('.stub-keywords').exists()).toBe(true)
    })
})
