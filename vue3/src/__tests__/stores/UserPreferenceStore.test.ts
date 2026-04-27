import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { makeUserPreference, makeServerSettings, makeSpace, makeUserSpace } from '@/__tests__/factories'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

// All vi.mock calls must be at top level (hoisted by vitest)
vi.mock('@/openapi', () => ({
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('vuetify', () => ({
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

    describe('loadServerSettings', () => {
        it('stores server settings from API', async () => {
            const store = useUserPreferenceStore()
            const settings = makeServerSettings({ version: '2.0.0' })
            apiMock.apiServerSettingsCurrentRetrieve.mockResolvedValue(settings)

            await store.loadServerSettings()

            expect(store.serverSettings.version).toBe('2.0.0')
        })
    })

    describe('activeUserSpace', () => {
        it('returns the userSpace matching activeSpace', () => {
            const store = useUserPreferenceStore()
            const us = makeUserSpace({ id: 10, space: 5 })

            store.activeSpace = makeSpace({ id: 5, name: 'Space 5' })
            store.userSpaces = [makeUserSpace({ space: 1 }), us]

            expect(store.activeUserSpace).toEqual(us)
        })

        it('returns null when no match', () => {
            const store = useUserPreferenceStore()
            store.activeSpace = makeSpace({ id: 999 })
            store.userSpaces = [makeUserSpace({ space: 1 })]

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
