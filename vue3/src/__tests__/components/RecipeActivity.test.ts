/**
 * Regression coverage for RecipeActivity (E-10).
 *
 * The "Create cook log" button writes a new CookLog; the backend then
 * recalculates the Recipe.rating aggregate. The component must emit
 * `cookLogSaved` after a successful create so RecipeView can refetch and
 * refresh the displayed rating without a full page reload.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createPinia, setActivePinia, type PiniaPlugin} from 'pinia'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'
import {ref} from 'vue'

import {apiMock, resetApiMock} from '@/__tests__/api-mock'
import {makeRecipe, makeUserPreference} from '@/__tests__/factories'

vi.mock('@vueuse/core', async (imp) => ({...(await imp<any>()), useStorage: (_k: string, d: any) => ref(d)}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('@/openapi', async (imp) => ({...(await imp<any>()), ApiApi: class { constructor() { return apiMock } }}))

import RecipeActivity from '@/components/display/RecipeActivity.vue'

function mountActivity() {
    const prePopulate: PiniaPlugin = ({store}) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = {
                ...makeUserPreference(),
                user: {id: 1, displayName: 'Test User'},
                comments: true,
            } as any
            store.activeSpace = {id: 1} as any
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(RecipeActivity, {
        props: {recipe: makeRecipe({id: 42}) as any, servings: 4},
        global: {
            plugins: [pinia, i18n, vuetify, router],
            stubs: {
                'model-edit-dialog': {template: '<div/>'},
                'v-date-input': {template: '<input type="date" />'},
            },
        },
    })
}

describe('RecipeActivity (E-10)', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
        apiMock.apiCookLogList.mockResolvedValue({results: [], next: null} as any)
    })

    it('emits cookLogSaved after a successful create', async () => {
        apiMock.apiCookLogCreate.mockResolvedValue({id: 1, rating: 5, createdBy: {id: 1, displayName: 'x'}})
        const w = mountActivity()
        await flushPromises()
        ;(w.vm as any).saveCookLog()
        await flushPromises()
        expect(w.emitted('cookLogSaved')).toBeTruthy()
        w.unmount()
    })
})
