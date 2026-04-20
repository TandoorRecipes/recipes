import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('vuetify', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vuetify')>()),
    useTheme: () => ({ change: vi.fn() }),
}))

vi.mock('vuetify/components', () => ({
    VDivider: { name: 'VDivider' },
    VListItem: { name: 'VListItem' },
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

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
    ResponseError: class extends Error {},
}))

import { useNavigation } from '@/composables/useNavigation'
import { useUserPreferenceStore } from '@/stores/UserPreferenceStore'
import { makeSpace, makeUser } from '@/__tests__/factories'

describe('useNavigation', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('getNavigationDrawer', () => {
        it('returns default navigation items', () => {
            const { getNavigationDrawer } = useNavigation()
            const nav = getNavigationDrawer()

            expect(nav.length).toBeGreaterThanOrEqual(8)
            expect(nav[0].title).toBe('Home')
            expect(nav[0].to).toEqual({ name: 'StartPage', params: {} })
        })

        it('includes standard pages', () => {
            const { getNavigationDrawer } = useNavigation()
            const nav = getNavigationDrawer()
            const titles = nav.map(n => n.title)

            expect(titles).toContain('Home')
            expect(titles).toContain('Search')
            expect(titles).toContain('Meal_Plan')
            expect(titles).toContain('Shopping')
            expect(titles).toContain('Import')
            expect(titles).toContain('Pantry')
            expect(titles).toContain('Books')
            expect(titles).toContain('Database')
        })
    })

    describe('getBottomNavigation', () => {
        it('returns bottom nav items including settings', () => {
            const { getBottomNavigation } = useNavigation()
            const nav = getBottomNavigation()

            expect(nav.length).toBeGreaterThanOrEqual(6)
            expect(nav.map(n => n.title)).toContain('Settings')
        })
    })

    describe('getUserNavigation', () => {
        it('includes settings and help', () => {
            const store = useUserPreferenceStore()
            store.userSettings = { user: makeUser() } as any

            const { getUserNavigation } = useNavigation()
            const nav = getUserNavigation()
            const titles = nav.map((n: any) => n.title).filter(Boolean)

            expect(titles).toContain('Settings')
            expect(titles).toContain('Help')
            expect(titles).toContain('Logout')
        })

        it('shows admin link only for superusers', () => {
            const store = useUserPreferenceStore()
            const { getUserNavigation } = useNavigation()

            store.userSettings = { user: makeUser({ isSuperuser: true }) } as any
            expect(getUserNavigation().map((n: any) => n.title).filter(Boolean)).toContain('Admin')

            store.userSettings = { user: makeUser({ isSuperuser: false }) } as any
            expect(getUserNavigation().map((n: any) => n.title).filter(Boolean)).not.toContain('Admin')
        })

        it('shows space switcher when multiple spaces exist', () => {
            const store = useUserPreferenceStore()
            store.userSettings = { user: makeUser() } as any
            store.spaces = [
                makeSpace({ id: 1, name: 'Home' }),
                makeSpace({ id: 2, name: 'Work' }),
            ]
            store.activeSpace = makeSpace({ id: 1 })

            const { getUserNavigation } = useNavigation()
            const nav = getUserNavigation()
            const titles = nav.map((n: any) => n.title).filter(Boolean)

            expect(titles).toContain('Home')
            expect(titles).toContain('Work')
        })
    })
})
