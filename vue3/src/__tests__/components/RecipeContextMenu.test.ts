import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, type PiniaPlugin } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import { makeRecipeOverview, makeUserPreference, makeSpace } from '../factories'
import { apiMock, resetApiMock } from '../api-mock'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/openapi')>()),
    ApiApi: class { constructor() { return apiMock } },
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

import RecipeContextMenu from '@/components/inputs/RecipeContextMenu.vue'

function mountMenu(deviceOverrides: Record<string, any> = {}, props: Record<string, any> = {}) {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = makeUserPreference() as any
            store.activeSpace = makeSpace() as any
            if (Object.keys(deviceOverrides).length > 0) {
                Object.assign(store.deviceSettings, deviceOverrides)
            }
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({
        legacy: false, locale: 'en',
        messages: { en: {
            Edit: 'Edit', Add_to_Plan: 'Add to Plan', Add_to_Shopping: 'Add to Shopping',
            Add_to_Book: 'Add to Book', Log_Cooking: 'Log Cooking', Edit_Photo: 'Edit Photo',
            Property_Editor: 'Property Editor', Share: 'Share', Export: 'Export',
            Duplicate: 'Duplicate', Print: 'Print', Delete: 'Delete', Copy: 'Copy',
        }},
        missingWarn: false, fallbackWarn: false,
    })
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'StartPage', component: { template: '<div/>' } },
            { path: '/recipe/:id', name: 'RecipeViewPage', component: { template: '<div/>' } },
            { path: '/edit/:model/:id?', name: 'ModelEditPage', component: { template: '<div/>' } },
            { path: '/delete/:model/:id', name: 'ModelDeletePage', component: { template: '<div/>' } },
            { path: '/property-editor', name: 'PropertyEditorPage', component: { template: '<div/>' } },
        ],
    })

    return mount(RecipeContextMenu, {
        props: { recipe: makeRecipeOverview(), ...props },
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                ModelEditDialog: { template: '<div class="stub-model-edit-dialog"/>' },
                RecipeShareDialog: { template: '<div class="stub-share-dialog"/>' },
                AddToShoppingDialog: { template: '<div class="stub-add-shopping"/>' },
                AddToBookDialog: { template: '<div class="stub-add-book-dialog"/>' },
                LogCookingDialog: { template: '<div class="stub-log-cooking-dialog"/>' },
                DeleteConfirmDialog: { template: '<div class="stub-delete-confirm"/>' },
            },
        },
    })
}

describe('RecipeContextMenu', () => {
    beforeEach(() => {
        resetApiMock()
    })

    describe('visibility config', () => {
        it('shows default menu items', () => {
            const w = mountMenu()
            const text = w.text()
            expect(text).toContain('Edit')
            expect(text).toContain('Add to Plan')
            expect(text).toContain('Add to Shopping')
            expect(text).toContain('Property Editor')
            expect(text).toContain('Share')
            expect(text).toContain('Duplicate')
            expect(text).toContain('Print')
        })

        it('hides new items by default', () => {
            const w = mountMenu()
            const text = w.text()
            expect(text).not.toContain('Add to Book')
            expect(text).not.toContain('Log Cooking')
            expect(text).not.toContain('Edit Photo')
            expect(text).not.toContain('Export')
            expect(text).not.toContain('Delete')
        })

        it('hides items removed from card_visibleMenuItems', () => {
            const w = mountMenu({
                card_visibleMenuItems: ['edit', 'print'],
            })
            const text = w.text()
            expect(text).toContain('Edit')
            expect(text).toContain('Print')
            expect(text).not.toContain('Add to Plan')
            expect(text).not.toContain('Share')
            expect(text).not.toContain('Duplicate')
        })

        it('shows new items when added to card_visibleMenuItems', () => {
            const w = mountMenu({
                card_visibleMenuItems: ['edit', 'book', 'cooklog', 'photo', 'export', 'delete'],
            })
            const text = w.text()
            expect(text).toContain('Add to Book')
            expect(text).toContain('Log Cooking')
            expect(text).toContain('Edit Photo')
            expect(text).toContain('Export')
            expect(text).toContain('Delete')
        })
    })

    describe('context gating', () => {
        it('hides card-only items when context is view', () => {
            const w = mountMenu({
                card_visibleMenuItems: ['edit', 'book', 'cooklog', 'photo'],
            }, { context: 'view' })
            const text = w.text()
            expect(text).toContain('Edit')
            expect(text).toContain('Add to Book')
            expect(text).not.toContain('Log Cooking')
            expect(text).not.toContain('Edit Photo')
        })

        it('shows card-only items when context is card', () => {
            const w = mountMenu({
                card_visibleMenuItems: ['edit', 'cooklog', 'photo'],
            }, { context: 'card' })
            const text = w.text()
            expect(text).toContain('Log Cooking')
            expect(text).toContain('Edit Photo')
        })
    })
})
