import {computed, type ComputedRef, type WritableComputedRef} from 'vue'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

/**
 * Provides typed, writable computed refs for all per-model device settings.
 * Eliminates duplicated getter/setter boilerplate across ModelListPage and ModelListSettingsPanel.
 */
export function useModelListSettings(settingsKey: ComputedRef<string>) {
    const deviceSettings = useUserPreferenceStore().deviceSettings

    function setting<T>(suffix: string, defaultVal: T): WritableComputedRef<T> {
        return computed({
            get: () => {
                if (!settingsKey.value) return defaultVal
                return (deviceSettings as any)[`${settingsKey.value}_${suffix}`] ?? defaultVal
            },
            set: (val: T) => {
                if (!settingsKey.value) return
                ;(deviceSettings as any)[`${settingsKey.value}_${suffix}`] = val
            },
        })
    }

    return {
        isPinned: setting('settingsPinned', false),
        showStats: setting('showStats', false),
        showColumnHeaders: setting('showColumnHeaders', true),
        treeEnabled: setting('treeView', false),
        quickActionKeys: setting<string[]>('quickActions', []),
        desktopSubtitleKeys: setting<string[]>('desktopSubtitle', []),
        mobileSubtitleKeys: setting<string[]>('mobileSubtitle', []),
        swipeEnabled: setting('swipeEnabled', false),
        swipeLeftKeys: setting<string[]>('swipeLeft', []),
        swipeRightKeys: setting<string[]>('swipeRight', []),
        showMobileHeaders: setting('showMobileHeaders', false),
    }
}
