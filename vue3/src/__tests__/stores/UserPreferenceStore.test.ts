import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { makeUserPreference, makeServerSettings, makeSpace, makeUserSpace } from '@/__tests__/factories'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

// All vi.mock calls must be at top level (hoisted by vitest)
vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('vuetify', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vuetify')>()),
    useTheme: () => ({ change: vi.fn() }),
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

import { useUserPreferenceStore } from '@/stores/UserPreferenceStore'

describe('UserPreferenceStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    describe('initial state', () => {
        it('starts unauthenticated', () => {
            const store = useUserPreferenceStore()
            expect(store.isAuthenticated).toBe(false)
        })

        it('starts with initCompleted false', () => {
            const store = useUserPreferenceStore()
            expect(store.initCompleted).toBe(false)
        })

        it('has default device settings', () => {
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.shopping_show_checked_entries).toBe(false)
            expect(store.deviceSettings.mealplan_displayPeriod).toBe('week')
            expect(store.deviceSettings.search_itemsPerPage).toBe(50)
        })
    })

    describe('resetDeviceSettings', () => {
        it('resets device settings to defaults', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.search_itemsPerPage = 100
            store.deviceSettings.shopping_show_checked_entries = true

            store.resetDeviceSettings()

            expect(store.deviceSettings.search_itemsPerPage).toBe(50)
            expect(store.deviceSettings.shopping_show_checked_entries).toBe(false)
        })
    })

    describe('migrateStaleDeviceSettings', () => {
        // HighlightWhen no longer offers 'substitute' — tri-state onhand
        // covers that signal. Existing users with stale localStorage values
        // must be coerced so the dropdown shows a valid option.
        it("coerces recipe_contextMenuColor 'substitute' to 'onhand'", async () => {
            const {migrateStaleDeviceSettings} = await import('@/stores/UserPreferenceStore')
            const s: any = {recipe_contextMenuColor: 'substitute'}
            migrateStaleDeviceSettings(s)
            expect(s.recipe_contextMenuColor).toBe('onhand')
        })

        it('leaves other values untouched (idempotency)', async () => {
            const {migrateStaleDeviceSettings} = await import('@/stores/UserPreferenceStore')
            for (const v of ['onhand', 'shopping', 'never']) {
                const s: any = {recipe_contextMenuColor: v}
                migrateStaleDeviceSettings(s)
                expect(s.recipe_contextMenuColor).toBe(v)
            }
        })
    })

    describe('loadUserSettings', () => {
        it('sets userSettings and isAuthenticated on success', async () => {
            const store = useUserPreferenceStore()
            const prefs = makeUserPreference()
            apiMock.apiUserPreferenceList.mockResolvedValue([prefs])
            apiMock.apiUnitList.mockResolvedValue({ results: [] })

            await store.loadUserSettings()

            expect(store.userSettings).toEqual(prefs)
            expect(store.isAuthenticated).toBe(true)
        })

        it('does not set isAuthenticated when response is empty', async () => {
            const store = useUserPreferenceStore()
            apiMock.apiUserPreferenceList.mockResolvedValue([])
            apiMock.apiUnitList.mockResolvedValue({ results: [] })

            await store.loadUserSettings()

            expect(store.isAuthenticated).toBe(false)
        })
    })

    describe('activeUserSpace', () => {
        it('returns matching userSpace or null', () => {
            const store = useUserPreferenceStore()
            const us = makeUserSpace({ id: 10, space: 5 })

            store.activeSpace = makeSpace({ id: 5, name: 'Space 5' })
            store.userSpaces = [makeUserSpace({ space: 1 }), us]
            expect(store.activeUserSpace).toEqual(us)

            store.activeSpace = makeSpace({ id: 999 })
            expect(store.activeUserSpace).toBeNull()
        })
    })

    describe('init', () => {
        it('calls all load functions and sets initCompleted', async () => {
            const store = useUserPreferenceStore()
            apiMock.apiUserPreferenceList.mockResolvedValue([makeUserPreference()])
            apiMock.apiServerSettingsCurrentRetrieve.mockResolvedValue(makeServerSettings())
            apiMock.apiSpaceCurrentRetrieve.mockResolvedValue(makeSpace())
            apiMock.apiUserSpaceAllPersonalList.mockResolvedValue([makeUserSpace()])
            apiMock.apiSpaceList.mockResolvedValue({ results: [makeSpace()] })
            apiMock.apiUnitList.mockResolvedValue({ results: [] })

            await store.init()

            expect(store.initCompleted).toBe(true)
            expect(apiMock.apiUserPreferenceList).toHaveBeenCalled()
            expect(apiMock.apiServerSettingsCurrentRetrieve).toHaveBeenCalled()
            expect(apiMock.apiSpaceCurrentRetrieve).toHaveBeenCalled()
        })
    })
})
