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
                RecipeImage: { template: '<div class="stub-recipe-image"/>' },
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
})
