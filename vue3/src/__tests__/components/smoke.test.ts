/**
 * Smoke tests for all components at 0% coverage.
 * Each test verifies the component mounts without throwing.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import {
    makeRecipe, makeRecipeOverview, makeFood, makeStep, makeIngredient,
    makeUnit, makeKeyword, makeCookLog, makeUserPreference, makeSpace,
    makeSync, makeSyncLog, makeShareLink, makeUserSpace,
} from '@/__tests__/factories'
import type { Component } from 'vue'

vi.mock('@/openapi', () => ({
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
            model: {
                name: 'Food',
                localizationKey: 'Food',
                isMerge: true,
                disableCreate: false,
                editorComponent: { template: '<div/>' },
            },
            list: vi.fn().mockResolvedValue({ results: [], count: 0 }),
            retrieve: vi.fn().mockResolvedValue(makeFood()),
            getLabel: (obj: any) => obj?.name ?? '',
            getTableHeaders: () => [],
        }),
    }
})

// Import all components under test
import BtnCopy from '@/components/buttons/BtnCopy.vue'
import PluralName from '@/components/display/PluralName.vue'
import PrivateRecipeBadge from '@/components/display/PrivateRecipeBadge.vue'
import RecipeImage from '@/components/display/RecipeImage.vue'
import KeywordsBar from '@/components/display/KeywordsBar.vue'
import ScalableNumber from '@/components/display/ScalableNumber.vue'
import Timer from '@/components/display/Timer.vue'
import StepView from '@/components/display/StepView.vue'
import BookEntryCard from '@/components/display/BookEntryCard.vue'
import ExternalRecipeViewer from '@/components/display/ExternalRecipeViewer.vue'
import VClosableCardTitle from '@/components/dialogs/VClosableCardTitle.vue'
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog.vue'
import ModelEditDialog from '@/components/dialogs/ModelEditDialog.vue'
import RecipeShareDialog from '@/components/dialogs/RecipeShareDialog.vue'
import SyncDialog from '@/components/dialogs/SyncDialog.vue'
import NumberScalerDialog from '@/components/inputs/NumberScalerDialog.vue'
import BatchEditFoodDialog from '@/components/dialogs/BatchEditFoodDialog.vue'
import BatchEditUserSpaceDialog from '@/components/dialogs/BatchEditUserSpaceDialog.vue'
import RecipeActivity from '@/components/display/RecipeActivity.vue'
import ImportTandoorDialog from '@/components/dialogs/ImportTandoorDialog.vue'
import RecipeContextMenu from '@/components/inputs/RecipeContextMenu.vue'

function createTestApp() {
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
            { path: '/delete/:model/:id', name: 'ModelDeletePage', component: { template: '<div/>' } },
        ],
    })

    return { pinia, i18n, vuetify, router }
}

function smokeMount(component: Component, props: Record<string, any> = {}, extraStubs: Record<string, any> = {}) {
    const { pinia, i18n, vuetify, router } = createTestApp()
    return mount(component, {
        props,
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                ModelSelect: { template: '<div class="stub-model-select"/>' },
                ModelSelectVuetify: { template: '<div class="stub-model-select-vuetify"/>' },
                VClosableCardTitle: { template: '<div class="stub-closable-title"/>' },
                Multiselect: { template: '<div class="stub-multiselect"/>' },
                RecipeContextMenu: { template: '<div class="stub-context-menu"/>' },
                RecipeImage: { template: '<div class="stub-recipe-image"/>' },
                IngredientsTable: { template: '<div class="stub-ingredients-table"/>' },
                IngredientsTableRow: { template: '<div class="stub-ingredients-row"/>' },
                Instructions: { template: '<div class="stub-instructions"/>' },
                StepsOverview: { template: '<div class="stub-steps-overview"/>' },
                AddToShoppingDialog: { template: '<div class="stub-add-shopping"/>' },
                RecipeShareDialog: { template: '<div class="stub-share-dialog"/>' },
                ...extraStubs,
            },
        },
    })
}

describe('Component smoke tests', () => {
    beforeEach(() => {
        resetApiMock()
        // Set base URI for useDjangoUrls
        if (!document.querySelector('base')) {
            const base = document.createElement('base')
            base.href = 'http://localhost:8000/'
            document.head.appendChild(base)
        }
        // Provide safe defaults for common API calls
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe())
        apiMock.apiRecipeList.mockResolvedValue({ results: [], count: 0 })
        apiMock.apiFoodUpdate.mockResolvedValue({})
    })

    // Display components
    it('BtnCopy mounts', () => {
        const w = smokeMount(BtnCopy, { text: 'copy me' })
        expect(w.exists()).toBe(true)
    })

    it('PluralName mounts', () => {
        const w = smokeMount(PluralName, { name: 'Apple', pluralName: 'Apples', amount: 2 })
        expect(w.exists()).toBe(true)
    })

    it('PrivateRecipeBadge mounts', () => {
        const w = smokeMount(PrivateRecipeBadge, { recipe: makeRecipeOverview({ internal: false }) })
        expect(w.exists()).toBe(true)
    })

    it('RecipeImage mounts', () => {
        const w = smokeMount(RecipeImage, { recipe: makeRecipeOverview() })
        expect(w.exists()).toBe(true)
    })

    it('KeywordsBar mounts', () => {
        const w = smokeMount(KeywordsBar, { recipe: makeRecipeOverview() })
        expect(w.exists()).toBe(true)
    })

    it('ScalableNumber mounts', () => {
        const w = smokeMount(ScalableNumber, { number: 2.5, factor: 1 })
        expect(w.exists()).toBe(true)
    })

    it('Timer mounts', () => {
        const w = smokeMount(Timer, { seconds: 300 })
        expect(w.exists()).toBe(true)
    })

    it('StepView mounts', () => {
        const step = makeStep({ instruction: 'Mix well', ingredients: [makeIngredient()] })
        const w = smokeMount(StepView, {
            modelValue: step,
            ingredientFactor: 1,
        })
        expect(w.exists()).toBe(true)
    })

    it('BookEntryCard mounts', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe({ id: 1 }))
        const w = smokeMount(BookEntryCard, { recipeOverview: makeRecipeOverview() })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('ExternalRecipeViewer mounts', async () => {
        const w = smokeMount(ExternalRecipeViewer, { recipe: makeRecipe({ sourceUrl: 'https://example.com' }) })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    // Dialog components
    it('VClosableCardTitle mounts', () => {
        const { pinia, i18n, vuetify, router } = createTestApp()
        const w = mount(VClosableCardTitle, {
            props: { title: 'Test Title' },
            global: { plugins: [pinia, i18n, vuetify, router] },
        })
        expect(w.exists()).toBe(true)
    })

    it('DeleteConfirmDialog mounts', () => {
        const w = smokeMount(DeleteConfirmDialog, { objectName: 'Butter', modelName: 'Food' })
        expect(w.exists()).toBe(true)
    })

    it('ModelEditDialog mounts', () => {
        const w = smokeMount(ModelEditDialog, { model: 'Food' })
        expect(w.exists()).toBe(true)
    })

    it('RecipeShareDialog mounts', async () => {
        apiMock.apiShareLinkList = vi.fn().mockResolvedValue([])
        const w = smokeMount(RecipeShareDialog, { recipe: makeRecipeOverview() })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('SyncDialog mounts', async () => {
        apiMock.apiSyncLogList = vi.fn().mockResolvedValue({ results: [], count: 0 })
        apiMock.apiSyncSyncCreate = vi.fn().mockResolvedValue({})
        const w = smokeMount(SyncDialog, { sync: makeSync() })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('NumberScalerDialog mounts', () => {
        const w = smokeMount(NumberScalerDialog, { modelValue: 4, label: 'Servings' })
        expect(w.exists()).toBe(true)
    })

    it('BatchEditFoodDialog mounts', () => {
        const w = smokeMount(BatchEditFoodDialog, {
            modelValue: false,
            items: [makeFood()],
            activator: 'model',
        })
        expect(w.exists()).toBe(true)
    })

    it('BatchEditUserSpaceDialog mounts', () => {
        const w = smokeMount(BatchEditUserSpaceDialog, {
            modelValue: false,
            items: [makeUserSpace()],
            activator: 'model',
        })
        expect(w.exists()).toBe(true)
    })

    it('RecipeActivity mounts', async () => {
        apiMock.apiCookLogList = vi.fn().mockResolvedValue({ results: [], count: 0 })
        apiMock.apiViewLogList = vi.fn().mockResolvedValue({ results: [], count: 0 })
        const w = smokeMount(RecipeActivity, { recipe: makeRecipe(), servings: 4 })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })

    it('ImportTandoorDialog mounts', () => {
        const w = smokeMount(ImportTandoorDialog)
        expect(w.exists()).toBe(true)
    })

    it('RecipeContextMenu mounts', async () => {
        apiMock.apiRecipeRetrieve.mockResolvedValue(makeRecipe())
        const w = smokeMount(RecipeContextMenu, { recipe: makeRecipeOverview(), servings: 4 })
        await flushPromises()
        expect(w.exists()).toBe(true)
    })
})
