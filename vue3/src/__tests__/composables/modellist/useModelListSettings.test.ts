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
})
