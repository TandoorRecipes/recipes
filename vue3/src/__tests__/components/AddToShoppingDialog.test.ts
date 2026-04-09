import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeRecipe, makeStep, makeIngredient, makeFood, makeUnit, makeUserPreference } from '@/__tests__/factories'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

import AddToShoppingDialog from '@/components/dialogs/AddToShoppingDialog.vue'

describe('AddToShoppingDialog', () => {
    beforeEach(() => {
        resetApiMock()
        // AddToShoppingDialog calls apiRecipeRetrieve and apiRecipeRelatedList on mount
        apiMock.apiRecipeRetrieve = vi.fn()
        apiMock.apiRecipeRelatedList = vi.fn()
        apiMock.apiShoppingListRecipeCreate = vi.fn()
        apiMock.apiShoppingListEntryBulkCreate = vi.fn()
    })

    function mountDialog(recipe = makeRecipe({ id: 1, name: 'Cookies', servings: 4 })) {
        const prePopulate: PiniaPlugin = ({ store }) => {
            if (store.$id === 'user_preference_store') {
                store.userSettings = makeUserPreference() as any
            }
        }
        const pinia = createPinia()
        pinia.use(prePopulate)

        const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
        const vuetify = createVuetify()
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/', component: { template: '<div/>' } }],
        })

        return mount(AddToShoppingDialog, {
            props: { recipe },
            global: {
                plugins: [pinia, i18n, vuetify, router],
                stubs: {
                    ModelSelect: { template: '<div class="stub-model-select"/>' },
                    VClosableCardTitle: { template: '<div class="stub-title"/>' },
                },
            },
        })
    }

    it('mounts without error', async () => {
        const fullRecipe = makeRecipe({
            id: 1,
            steps: [makeStep({ ingredients: [makeIngredient()] })],
            servings: 4,
        })
        apiMock.apiRecipeRetrieve.mockResolvedValue(fullRecipe)
        apiMock.apiRecipeRelatedList.mockResolvedValue([])

        const wrapper = mountDialog()
        await flushPromises()

        expect(wrapper.exists()).toBe(true)
    })

    it('calls apiRecipeRetrieve on mount', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe({ id: 1 }))
        apiMock.apiRecipeRelatedList.mockResolvedValue([])

        mountDialog()
        await flushPromises()

        expect(apiMock.apiRecipeRetrieve).toHaveBeenCalledWith({ id: 1 })
    })

    it('calls apiRecipeRelatedList to load related recipes', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe({ id: 1 }))
        apiMock.apiRecipeRelatedList.mockResolvedValue([])

        mountDialog()
        await flushPromises()

        expect(apiMock.apiRecipeRelatedList).toHaveBeenCalledWith({ id: 1 })
    })

    it('builds dialog entries from recipe ingredients', async () => {
        const ingredient = makeIngredient({ food: makeFood({ name: 'Flour' }), amount: 2, unit: makeUnit({ name: 'cups' }) })
        const recipe = makeRecipe({
            id: 1,
            servings: 4,
            steps: [makeStep({ ingredients: [ingredient] })],
        })
        apiMock.apiRecipeRetrieve.mockResolvedValue(recipe)
        apiMock.apiRecipeRelatedList.mockResolvedValue([])

        const wrapper = mountDialog()
        await flushPromises()

        // The dialog should have processed ingredients into dialogRecipes
        expect(wrapper.html()).toContain('Flour')
    })
})
