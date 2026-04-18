import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('vuetify', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vuetify')>()),
    useTheme: () => ({ change: vi.fn() }),
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn() }),
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

import { useModelListSettings } from '@/composables/modellist/useModelListSettings'
import { useUserPreferenceStore } from '@/stores/UserPreferenceStore'

describe('useModelListSettings', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        // Explicitly clear any leaked device-setting keys from prior tests —
        // the store's deviceSettings object persists across setActivePinia
        // calls in the same module process.
        const store = useUserPreferenceStore()
        for (const k of Object.keys(store.deviceSettings)) {
            if (k.startsWith('food_') || k.startsWith('unit_')) {
                delete store.deviceSettings[k]
            }
        }
    })

    it('setting getter returns stored value', () => {
        const store = useUserPreferenceStore()
        store.deviceSettings['food_settingsPinned'] = true

        const settings = useModelListSettings(computed(() => 'food'))
        expect(settings.isPinned.value).toBe(true)
    })

    it('setting getter returns default when missing', () => {
        const settings = useModelListSettings(computed(() => 'food'))
        expect(settings.isPinned.value).toBe(false)
    })

    it('setting setter writes prefixed key', () => {
        const store = useUserPreferenceStore()
        const settings = useModelListSettings(computed(() => 'food'))
        settings.isPinned.value = true
        expect(store.deviceSettings['food_settingsPinned']).toBe(true)
    })

    it('setting returns default when settingsKey is empty', () => {
        const settings = useModelListSettings(computed(() => ''))
        expect(settings.isPinned.value).toBe(false)
    })

    it('modelSetting priority: stored > modelDefault > globalDefault', () => {
        const store = useUserPreferenceStore()
        const modelDefaults = computed(() => ({ showStats: true }))
        const settings = useModelListSettings(computed(() => 'food'), modelDefaults as any)

        // No stored value → uses model default
        expect(settings.showStats.value).toBe(true)

        // Stored value takes precedence
        store.deviceSettings['food_showStats'] = false
        expect(settings.showStats.value).toBe(false)
    })

    it('modelSetting falls back to globalDefault when no model default', () => {
        const settings = useModelListSettings(computed(() => 'unit'))
        // showStats default is false, no model defaults provided
        expect(settings.showStats.value).toBe(false)
    })

    it('setting setter is a no-op when settingsKey is empty', () => {
        const store = useUserPreferenceStore()
        const settings = useModelListSettings(computed(() => ''))
        settings.isPinned.value = true
        // Nothing persisted — and writing through the setter does not throw
        expect(Object.keys(store.deviceSettings).filter(k => k.includes('settingsPinned'))).toHaveLength(0)
    })

    it('each exported setting reads/writes its own prefixed key without collision', () => {
        const store = useUserPreferenceStore()
        const settings = useModelListSettings(computed(() => 'food'))
        settings.isPinned.value = true
        settings.showColumnHeaders.value = false
        settings.treeEnabled.value = true
        settings.swipeEnabled.value = true
        settings.desktopSubtitleKeys.value = ['name', 'stock']
        settings.mobileSubtitleKeys.value = ['name']
        settings.includeChildren.value = false

        expect(store.deviceSettings.food_settingsPinned).toBe(true)
        expect(store.deviceSettings.food_showColumnHeaders).toBe(false)
        expect(store.deviceSettings.food_treeView).toBe(true)
        expect(store.deviceSettings.food_swipeEnabled).toBe(true)
        expect(store.deviceSettings.food_desktopSubtitle).toEqual(['name', 'stock'])
        expect(store.deviceSettings.food_mobileSubtitle).toEqual(['name'])
        expect(store.deviceSettings.food_includeChildren).toBe(false)
    })

    it('settingsKey prefix is actually used — different keys do not cross-contaminate', () => {
        const store = useUserPreferenceStore()
        const foodSettings = useModelListSettings(computed(() => 'food'))
        const unitSettings = useModelListSettings(computed(() => 'unit'))
        foodSettings.isPinned.value = true
        unitSettings.isPinned.value = false
        expect(store.deviceSettings.food_settingsPinned).toBe(true)
        expect(store.deviceSettings.unit_settingsPinned).toBe(false)
        // And each sees its own value, not the other's
        expect(foodSettings.isPinned.value).toBe(true)
        expect(unitSettings.isPinned.value).toBe(false)
    })

    it('includeChildren defaults to true (backward compat with recipe-search)', () => {
        const settings = useModelListSettings(computed(() => 'food'))
        expect(settings.includeChildren.value).toBe(true)
    })

    it('modelSetting treats null stored values as "no user value" and falls through', () => {
        const store = useUserPreferenceStore()
        // Explicit null acts as the "sentinel" for unset (per the composable's != null check)
        store.deviceSettings['food_showStats'] = null
        const modelDefaults = computed(() => ({ showStats: true }))
        const settings = useModelListSettings(computed(() => 'food'), modelDefaults as any)
        expect(settings.showStats.value).toBe(true)
    })
})
