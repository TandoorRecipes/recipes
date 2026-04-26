import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { makeRecipeOverview, makeUser, makeUserPreference, makeSpace } from '../factories'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/openapi')>()),
    ApiApi: class {},
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

import RecipeCard from '@/components/display/RecipeCard.vue'

function mountRecipeCard(props: Record<string, any> = {}, deviceOverrides: Record<string, any> = {}) {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            store.activeSpace = makeSpace() as any
            // Apply device settings overrides via the plugin
            if (Object.keys(deviceOverrides).length > 0) {
                Object.assign(store.deviceSettings, deviceOverrides)
            }
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: { en: { by: 'by', New: 'New' } },
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'StartPage', component: { template: '<div/>' } },
            { path: '/recipe/:id', name: 'RecipeViewPage', component: { template: '<div/>' } },
            { path: '/search', name: 'SearchPage', component: { template: '<div/>' } },
            { path: '/edit/:model/:id?', name: 'ModelEditPage', component: { template: '<div/>' } },
        ],
    })

    return mount(RecipeCard, {
        props: { recipe: makeRecipeOverview(), ...props },
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                RecipeContextMenu: { template: '<div class="stub-context-menu"/>' },
                RecipeImage: { template: '<div class="stub-recipe-image"><slot name="overlay"/></div>' },
                PrivateRecipeBadge: { template: '<div class="stub-private-badge"/>' },
                KeywordsBar: { template: '<div class="stub-keywords-bar"/>' },
            },
        },
    })
}

describe('RecipeCard display settings', () => {
    describe('rating display', () => {
        it('shows rating when card_showRating is true and recipe has rating', () => {
            const recipe = makeRecipeOverview({ rating: 3.5 })
            const w = mountRecipeCard({ recipe }, { card_showRating: true })
            expect(w.find('.recipe-card-rating').exists()).toBe(true)
        })

        it('hides rating when card_showRating is false', () => {
            const recipe = makeRecipeOverview({ rating: 3.5 })
            const w = mountRecipeCard({ recipe }, { card_showRating: false })
            expect(w.find('.recipe-card-rating').exists()).toBe(false)
        })

        it('hides rating when recipe has no rating even if setting is on', () => {
            const recipe = makeRecipeOverview({ rating: null })
            const w = mountRecipeCard({ recipe }, { card_showRating: true })
            expect(w.find('.recipe-card-rating').exists()).toBe(false)
        })
    })

    describe('author display', () => {
        it('shows author when card_showAuthor is true', () => {
            const recipe = makeRecipeOverview({ createdBy: makeUser({ displayName: 'Chef Test' }) })
            const w = mountRecipeCard({ recipe }, { card_showAuthor: true })
            expect(w.find('.recipe-card-author').exists()).toBe(true)
            expect(w.text()).toContain('Chef Test')
        })

        it('hides author when card_showAuthor is false', () => {
            const recipe = makeRecipeOverview({ createdBy: makeUser({ displayName: 'Chef Test' }) })
            const w = mountRecipeCard({ recipe }, { card_showAuthor: false })
            expect(w.find('.recipe-card-author').exists()).toBe(false)
        })
    })

    describe('last cooked display', () => {
        it('shows last cooked when card_showLastCooked is true and recipe has lastCooked', () => {
            const recipe = makeRecipeOverview({ lastCooked: new Date('2026-04-10') })
            const w = mountRecipeCard({ recipe }, { card_showLastCooked: true })
            expect(w.find('.recipe-card-last-cooked').exists()).toBe(true)
        })

        it('hides last cooked when card_showLastCooked is false', () => {
            const recipe = makeRecipeOverview({ lastCooked: new Date('2026-04-10') })
            const w = mountRecipeCard({ recipe }, { card_showLastCooked: false })
            expect(w.find('.recipe-card-last-cooked').exists()).toBe(false)
        })

        it('hides last cooked when recipe has no lastCooked even if setting is on', () => {
            const recipe = makeRecipeOverview({ lastCooked: null })
            const w = mountRecipeCard({ recipe }, { card_showLastCooked: true })
            expect(w.find('.recipe-card-last-cooked').exists()).toBe(false)
        })
    })

    describe('new badge display', () => {
        it('shows new badge when card_showNewBadge is true and recipe is new', () => {
            const recipe = makeRecipeOverview({ _new: true })
            const w = mountRecipeCard({ recipe }, { card_showNewBadge: true })
            expect(w.find('.recipe-card-new-badge').exists()).toBe(true)
        })

        it('hides new badge when card_showNewBadge is false', () => {
            const recipe = makeRecipeOverview({ _new: true })
            const w = mountRecipeCard({ recipe }, { card_showNewBadge: false })
            expect(w.find('.recipe-card-new-badge').exists()).toBe(false)
        })
    })

    describe('photo refresh after context-menu edit', () => {
        // Regression: editing a photo via the recipe context menu refreshes
        // the dialog but didn't propagate the new recipe back to the card,
        // so the thumbnail stayed stale until manual page refresh. The
        // RecipeContextMenu already emits update:recipe after the dialog
        // closes; the card must listen and re-bind RecipeImage.

        function mountForRefreshTest(originalRecipe: any, opts: {imageStub?: boolean} = {}) {
            const ContextMenuStub = {
                props: ['recipe'],
                emits: ['update:recipe'],
                template: '<div class="stub-context-menu"></div>',
            }
            const RecipeImageStub = {
                props: ['recipe'],
                template: '<div class="stub-recipe-image" :data-image="recipe?.image"><slot name="overlay"/></div>',
            }
            const prePopulate: PiniaPlugin = ({ store }) => {
                if (store.$id === 'user_preference_store') {
                    store.userSettings = makeUserPreference() as any
                    store.activeSpace = makeSpace() as any
                }
            }
            const pinia = createPinia()
            pinia.use(prePopulate)
            const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
            const router = createRouter({history: createMemoryHistory(), routes: [
                {path: '/', name: 'StartPage', component: {template: '<div/>'}},
                {path: '/recipe/:id', name: 'RecipeViewPage', component: {template: '<div/>'}},
            ]})
            return mount(RecipeCard, {
                props: {recipe: originalRecipe, showMenu: true},
                global: {
                    plugins: [pinia, i18n, router],
                    stubs: {
                        RecipeContextMenu: ContextMenuStub,
                        RecipeImage: opts.imageStub === false
                            ? {template: '<div class="stub-recipe-image"><slot name="overlay"/></div>'}
                            : RecipeImageStub,
                        PrivateRecipeBadge: {template: '<div/>'},
                        KeywordsBar: {template: '<div/>'},
                    },
                },
            })
        }

        it('rebinds RecipeImage to the new recipe when context menu emits update:recipe', async () => {
            const original = makeRecipeOverview({ id: 7, image: '/media/old.jpg' })
            const updated = { ...original, image: '/media/new.jpg' }
            const w = mountForRefreshTest(original)

            expect(w.find('.stub-recipe-image').attributes('data-image')).toBe('/media/old.jpg')
            // Programmatically emit from the stubbed context menu
            const ctx = w.findComponent({name: 'RecipeContextMenu'})
            // RecipeContextMenu is stubbed; locate by its rendered class
            const ctxStub = w.find('.stub-context-menu')
            expect(ctxStub.exists()).toBe(true)
            ;(ctxStub as any).element.__vueParentComponent.emit('update:recipe', updated)
            await w.vm.$nextTick()
            expect(w.find('.stub-recipe-image').attributes('data-image')).toBe('/media/new.jpg')
        })

        it('forwards update:recipe to its parent so list owners can keep their data fresh', async () => {
            const original = makeRecipeOverview({ id: 7, image: '/media/old.jpg' })
            const updated = { ...original, image: '/media/new.jpg' }
            const w = mountForRefreshTest(original, {imageStub: false})

            const ctxStub = w.find('.stub-context-menu')
            ;(ctxStub as any).element.__vueParentComponent.emit('update:recipe', updated)
            await w.vm.$nextTick()
            const emitted = w.emitted('update:recipe')
            expect(emitted).toBeTruthy()
            expect(emitted![0][0]).toMatchObject({id: 7, image: '/media/new.jpg'})
        })
    })
})
