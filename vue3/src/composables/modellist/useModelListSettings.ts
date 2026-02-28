import {computed, type ComputedRef, type InjectionKey, type WritableComputedRef} from 'vue'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {SettingsDefaults} from './types'

export type ModelListSettingsReturn = ReturnType<typeof useModelListSettings>
export const MODEL_LIST_SETTINGS_KEY: InjectionKey<ModelListSettingsReturn> = Symbol('modelListSettings')

/**
 * Provides typed, writable computed refs for all per-model device settings.
 * Eliminates duplicated getter/setter boilerplate across ModelListPage and ModelListSettingsPanel.
 */
export function useModelListSettings(settingsKey: ComputedRef<string>, modelDefaults?: ComputedRef<SettingsDefaults | undefined>) {
    const deviceSettings = useUserPreferenceStore().deviceSettings

    function setting<T>(suffix: string, defaultVal: T): WritableComputedRef<T> {
        return computed({
            get: () => {
                if (!settingsKey.value) return defaultVal
                return deviceSettings[`${settingsKey.value}_${suffix}`] ?? defaultVal
            },
            set: (val: T) => {
                if (!settingsKey.value) return
                deviceSettings[`${settingsKey.value}_${suffix}`] = val
            },
        })
    }

    /** Like setting(), but checks model-specific defaults before falling back to the global default. */
    function modelSetting<T>(suffix: string, defaultsKey: keyof SettingsDefaults, globalDefault: T): WritableComputedRef<T> {
        return computed({
            get: () => {
                if (!settingsKey.value) return globalDefault
                const stored = deviceSettings[`${settingsKey.value}_${suffix}`]
                if (stored != null) return stored as T
                return (modelDefaults?.value?.[defaultsKey] as T) ?? globalDefault
            },
            set: (val: T) => {
                if (!settingsKey.value) return
                deviceSettings[`${settingsKey.value}_${suffix}`] = val
            },
        })
    }

    return {
        isPinned: setting('settingsPinned', false),
        showStats: modelSetting('showStats', 'showStats', false),
        showColumnHeaders: setting('showColumnHeaders', true),
        treeEnabled: setting('treeView', false),
        quickActionKeys: modelSetting<string[]>('quickActions', 'quickActions', []),
        desktopSubtitleKeys: setting<string[]>('desktopSubtitle', []),
        mobileSubtitleKeys: setting<string[]>('mobileSubtitle', []),
        swipeEnabled: setting('swipeEnabled', false),
        swipeLeftKeys: setting<string[]>('swipeLeft', []),
        swipeRightKeys: setting<string[]>('swipeRight', []),
        showMobileHeaders: modelSetting('showMobileHeaders', 'showMobileHeaders', false),
    }
}
