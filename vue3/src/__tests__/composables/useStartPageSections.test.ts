import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia, type PiniaPlugin } from 'pinia'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'
import { makeUserPreference } from '@/__tests__/factories'

vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error {
        response: any
        constructor(r: any) { super('ResponseError'); this.response = r }
    },
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
    createI18n: vi.fn(() => ({ install: vi.fn() })),
}))

vi.mock('vuetify', () => ({
    useTheme: () => ({ change: vi.fn() }),
    createVuetify: vi.fn(() => ({ install: vi.fn() })),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
        useTitle: () => ref(''),
    }
})

import { useStartPageSections, DEFAULT_SECTIONS } from '@/composables/useStartPageSections'
import { useUserPreferenceStore } from '@/stores/UserPreferenceStore'
import { useMessageStore } from '@/stores/MessageStore'

function setupComposable(initialSections?: any[], initialDefaultPage = 'HOME') {
    const prePopulate: PiniaPlugin = ({ store }) => {
        if (store.$id === 'user_preference_store') {
            store.userSettings = {
                ...makeUserPreference(),
                startPageSections: initialSections,
                defaultPage: initialDefaultPage,
            } as any
            store.initCompleted = true
            store.updateUserSettings = vi.fn().mockResolvedValue(undefined)
        }
    }
    const pinia = createPinia()
    pinia.use(prePopulate)
    setActivePinia(pinia)

    let composable: ReturnType<typeof useStartPageSections>
    const Wrapper = defineComponent({
        setup() {
            composable = useStartPageSections()
            return {}
        },
        template: '<div/>',
    })
    const wrapper = mount(Wrapper, { global: { plugins: [pinia] } })
    return { composable: composable!, wrapper, store: useUserPreferenceStore() }
}

describe('useStartPageSections', () => {
    beforeEach(() => {
        resetApiMock()
        apiMock.apiKeywordRetrieve = vi.fn().mockResolvedValue({ id: 1, name: 'kw' })
        apiMock.apiFoodRetrieve = vi.fn().mockResolvedValue({ id: 1, name: 'food' })
        apiMock.apiRecipeBookRetrieve = vi.fn().mockResolvedValue({ id: 1, name: 'book' })
        apiMock.apiCustomFilterRetrieve = vi.fn().mockResolvedValue({ id: 1, name: 'cf' })
    })

    describe('loadFromStore', () => {
        it('falls back to default sections + meal_plan when store sections is empty', () => {
            const { composable } = setupComposable([])
            composable.loadFromStore()

            expect(composable.localSections.value).toHaveLength(DEFAULT_SECTIONS.length)
            expect(composable.showMealPlan.value).toBe(true)
        })

        it('falls back to defaults when store sections is undefined', () => {
            const { composable } = setupComposable(undefined)
            composable.loadFromStore()

            expect(composable.localSections.value).toHaveLength(DEFAULT_SECTIONS.length)
            expect(composable.showMealPlan.value).toBe(true)
        })

        it('separates meal_plan from recipe sections', () => {
            const { composable } = setupComposable([
                { mode: 'meal_plan', enabled: true },
                { mode: 'recent', enabled: true, min_recipes: 5 },
                { mode: 'random', enabled: true, min_recipes: 0 },
            ])
            composable.loadFromStore()

            expect(composable.showMealPlan.value).toBe(true)
            expect(composable.localSections.value).toHaveLength(2)
            expect(composable.localSections.value.every(s => s.mode !== 'meal_plan')).toBe(true)
        })

        it('disables meal_plan toggle when meal_plan section absent', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
            ])
            composable.loadFromStore()

            expect(composable.showMealPlan.value).toBe(false)
        })

        it('reads defaultPage from store', () => {
            const { composable } = setupComposable([], 'PLAN')
            composable.loadFromStore()

            expect(composable.defaultPage.value).toBe('PLAN')
        })

        it('falls back to HOME when defaultPage missing', () => {
            const { composable, store } = setupComposable([])
            ;(store.userSettings as any).defaultPage = ''
            composable.loadFromStore()

            expect(composable.defaultPage.value).toBe('HOME')
        })

        it('assigns unique _key per section', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
                { mode: 'recent', enabled: true, min_recipes: 10 },
                { mode: 'recent', enabled: true, min_recipes: 15 },
            ])
            composable.loadFromStore()

            const keys = composable.localSections.value.map(s => s._key)
            expect(new Set(keys).size).toBe(3)
        })
    })

    describe('addSection', () => {
        it('appends a section with the chosen mode and resets newMode', () => {
            const { composable } = setupComposable([])
            composable.loadFromStore()
            const lengthBefore = composable.localSections.value.length

            composable.newMode.value = 'rating'
            composable.addSection()

            expect(composable.localSections.value).toHaveLength(lengthBefore + 1)
            expect(composable.localSections.value.at(-1)?.mode).toBe('rating')
            expect(composable.newMode.value).toBeNull()
        })

        it('does nothing when newMode is null', () => {
            const { composable } = setupComposable([])
            composable.loadFromStore()
            const lengthBefore = composable.localSections.value.length

            composable.newMode.value = null
            composable.addSection()

            expect(composable.localSections.value).toHaveLength(lengthBefore)
        })

        it('default-initializes new section as enabled with min_recipes 0', () => {
            const { composable } = setupComposable([])
            composable.newMode.value = 'random'
            composable.addSection()

            const last = composable.localSections.value.at(-1)!
            expect(last.enabled).toBe(true)
            expect(last.min_recipes).toBe(0)
        })
    })

    describe('removeSection / doRemoveSection', () => {
        it('removeSection opens the confirmation dialog with the section name', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
            ])
            composable.loadFromStore()
            const target = composable.localSections.value[0]

            composable.removeSection(target._key)

            expect(composable.confirmDelete.value).toBe(true)
            // useI18n is mocked to identity, so labels surface as keys
            expect(composable.deleteSectionName.value).toBe('Recently_Viewed')
            expect(composable.localSections.value).toHaveLength(1)
        })

        it('removeSection on unknown key is a no-op', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
            ])
            composable.loadFromStore()

            composable.removeSection('nonexistent-key')

            expect(composable.confirmDelete.value).toBe(false)
            expect(composable.localSections.value).toHaveLength(1)
        })

        it('doRemoveSection splices the targeted section', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
                { mode: 'random', enabled: true, min_recipes: 10 },
            ])
            composable.loadFromStore()
            const target = composable.localSections.value[0]
            composable.removeSection(target._key)

            composable.doRemoveSection()

            expect(composable.localSections.value).toHaveLength(1)
            expect(composable.localSections.value[0].mode).toBe('random')
        })

        it('doRemoveSection without prior removeSection is a no-op', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
            ])
            composable.loadFromStore()

            composable.doRemoveSection()

            expect(composable.localSections.value).toHaveLength(1)
        })

        it('cancelDelete clears confirmation state and deleteSectionKey', () => {
            const { composable } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 5 },
            ])
            composable.loadFromStore()
            const target = composable.localSections.value[0]
            composable.removeSection(target._key)
            expect(composable.confirmDelete.value).toBe(true)

            composable.cancelDelete()

            expect(composable.confirmDelete.value).toBe(false)
            // Calling doRemoveSection now should be a no-op (key was cleared).
            composable.doRemoveSection()
            expect(composable.localSections.value).toHaveLength(1)
        })
    })

    describe('resetToDefaults', () => {
        it('replaces localSections with DEFAULT_SECTIONS and enables meal_plan', () => {
            const { composable } = setupComposable([
                { mode: 'random', enabled: true, min_recipes: 0 },
            ])
            composable.loadFromStore()
            composable.showMealPlan.value = false

            composable.resetToDefaults()

            expect(composable.localSections.value).toHaveLength(DEFAULT_SECTIONS.length)
            expect(composable.showMealPlan.value).toBe(true)
            const modes = composable.localSections.value.map(s => s.mode)
            expect(modes).toEqual(DEFAULT_SECTIONS.map(s => s.mode))
        })
    })

    describe('save', () => {
        it('puts meal_plan first when toggle is on', async () => {
            const { composable, store } = setupComposable([
                { mode: 'meal_plan', enabled: true },
                { mode: 'recent', enabled: true, min_recipes: 10 },
            ])
            composable.loadFromStore()

            await composable.save()

            expect(store.updateUserSettings).toHaveBeenCalled()
            const out = store.userSettings.startPageSections as any[]
            expect(out[0].mode).toBe('meal_plan')
            expect(out[1].mode).toBe('recent')
        })

        it('excludes meal_plan when toggle is off', async () => {
            const { composable, store } = setupComposable([
                { mode: 'recent', enabled: true, min_recipes: 10 },
            ])
            composable.loadFromStore()
            composable.showMealPlan.value = false

            await composable.save()

            const out = store.userSettings.startPageSections as any[]
            expect(out.every((s: any) => s.mode !== 'meal_plan')).toBe(true)
        })

        it('preserves filter_id from a loaded section before user interaction', async () => {
            const { composable, store } = setupComposable([
                { mode: 'keyword', enabled: true, min_recipes: 10, filter_id: 42 },
            ])
            composable.loadFromStore()

            await composable.save()

            const kw = (store.userSettings.startPageSections as any[]).find((s: any) => s.mode === 'keyword')
            expect(kw.filter_id).toBe(42)
        })

        it('clears filter_id when user resolved _filterObj is null', async () => {
            const { composable, store } = setupComposable([
                { mode: 'keyword', enabled: true, min_recipes: 10, filter_id: 42 },
            ])
            composable.loadFromStore()
            // simulate user clearing the ModelSelect: _filterObj becomes null AND filter_id is synced to undefined
            // (mirrors what @update:model-value="section.filter_id = $event?.id" does in the template)
            composable.localSections.value[0]._filterObj = null
            composable.localSections.value[0].filter_id = undefined

            await composable.save()

            const kw = (store.userSettings.startPageSections as any[]).find((s: any) => s.mode === 'keyword')
            expect(kw.filter_id).toBeUndefined()
        })

        it('writes defaultPage to store on save', async () => {
            const { composable, store } = setupComposable([])
            composable.loadFromStore()
            composable.defaultPage.value = 'BOOKS'

            await composable.save()

            expect(store.userSettings.defaultPage).toBe('BOOKS')
        })

        it('reports an error message when updateUserSettings rejects', async () => {
            const { composable, store } = setupComposable([])
            composable.loadFromStore()
            ;(store.updateUserSettings as any).mockRejectedValueOnce(new Error('boom'))
            const messageStore = useMessageStore()
            const addErrorSpy = vi.spyOn(messageStore, 'addError')

            await composable.save()
            await flushPromises()

            expect(store.updateUserSettings).toHaveBeenCalled()
            expect(addErrorSpy).toHaveBeenCalled()
        })
    })

    describe('availableModes / defaultPageOptions', () => {
        it('availableModes contains all 9 modes', () => {
            const { composable } = setupComposable([])
            expect(composable.availableModes.value).toHaveLength(9)
        })

        it('defaultPageOptions contains all 5 pages', () => {
            const { composable } = setupComposable([])
            expect(composable.defaultPageOptions.value).toHaveLength(5)
            expect(composable.defaultPageOptions.value.map(o => o.page)).toEqual(['HOME', 'SEARCH', 'PLAN', 'BOOKS', 'SHOPPING'])
        })
    })
})
