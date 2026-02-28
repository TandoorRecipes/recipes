import {computed, type ComputedRef} from 'vue'
import type {Model, ModelTableHeaders} from '@/types/Models'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {DeviceSettings} from '@/types/settings'
import type {VDataTable} from 'vuetify/components'

type VDataTableProps = InstanceType<typeof VDataTable>['$props']

/**
 * Composable for managing column visibility and display modes in ModelListPage.
 *
 * For models with `listSettings`, provides user-controllable column visibility
 * and display mode switching. For models without `listSettings`, provides
 * basic header filtering (same as current getTableHeaders behavior).
 *
 * This is the single owner of header computation for ALL models —
 * replaces GenericModel.getTableHeaders() entirely.
 */
export function useModelListColumns(model: ComputedRef<Model | undefined>, t: (key: string) => string) {
    const deviceSettings = useUserPreferenceStore().deviceSettings

    const listSettings = computed(() => model.value?.listSettings)
    const settingsKey = computed(() => listSettings.value?.settingsKey)
    const headers = computed(() => model.value?.tableHeaders ?? [])

    /** Whether this model has enhanced list capabilities */
    const hasEnhancedList = computed(() => !!listSettings.value)

    /**
     * Resolve which columns are hidden.
     * null (sentinel) = use header-level `hidden` defaults
     * []             = user wants all columns visible
     * ['key', ...]   = user wants these specific columns hidden
     */
    const effectiveHidden = computed<string[]>(() => {
        if (!settingsKey.value) {
            // Non-enhanced model: use header-level hidden flags
            return headers.value.filter(h => h.hidden).map(h => h.key)
        }

        const storageKey = `${settingsKey.value}_hiddenColumns`
        const stored = deviceSettings[storageKey] as string[] | null

        if (stored === null) {
            // Sentinel: use header-level defaults
            return headers.value.filter(h => h.hidden).map(h => h.key)
        }
        return stored
    })

    /**
     * Vuetify-compatible headers for v-data-table-server.
     * Creates new objects to avoid mutating model definitions.
     */
    const visibleHeaders = computed<VDataTableProps['headers'][]>(() => {
        const hidden = effectiveHidden.value
        return headers.value
            .filter(h => !hidden.includes(h.key))
            .map(h => ({
                ...h,
                title: t(h.title),
            } as unknown as VDataTableProps['headers']))
    })

    /**
     * Visible non-action columns for cell rendering.
     * Only populated for enhanced models.
     */
    const enhancedColumns = computed<ModelTableHeaders[]>(() => {
        if (!hasEnhancedList.value) return []
        const hidden = effectiveHidden.value
        return headers.value.filter(h => !hidden.includes(h.key) && h.type !== 'action-menu')
    })

    /**
     * All columns (for settings UI in Phase 3).
     */
    const allColumns = computed<ModelTableHeaders[]>(() => {
        return headers.value.filter(h => h.type !== 'action-menu')
    })

    /** Check if a specific column is currently visible */
    function isColumnVisible(key: string): boolean {
        return !effectiveHidden.value.includes(key)
    }

    /**
     * Toggle visibility of a column.
     * If stored value is null (sentinel), initializes from defaults first.
     */
    function toggleColumn(key: string): void {
        if (!settingsKey.value) return

        const storageKey = `${settingsKey.value}_hiddenColumns`
        let current = deviceSettings[storageKey] as string[] | null

        // Initialize from defaults if still using sentinel
        if (current === null) {
            current = headers.value.filter(h => h.hidden).map(h => h.key)
        }

        if (current.includes(key)) {
            deviceSettings[storageKey] = current.filter(k => k !== key)
        } else {
            deviceSettings[storageKey] = [...current, key]
        }
    }

    /** Get the display mode for a column */
    function getDisplayMode(key: string): 'icon' | 'text' {
        if (!settingsKey.value) return 'icon'

        const modesKey = `${settingsKey.value}_columnDisplayModes`
        const modes = deviceSettings[modesKey] as Record<string, 'icon' | 'text'> | undefined

        if (modes && modes[key]) {
            return modes[key]
        }

        // Fall back to header definition, then 'icon'
        const header = headers.value.find(h => h.key === key)
        return header?.defaultDisplayMode ?? 'icon'
    }

    /** Set the display mode for a column */
    function setDisplayMode(key: string, mode: 'icon' | 'text'): void {
        if (!settingsKey.value) return

        const modesKey = `${settingsKey.value}_columnDisplayModes`
        const current = (deviceSettings[modesKey] as Record<string, 'icon' | 'text'>) ?? {}
        deviceSettings[modesKey] = {...current, [key]: mode}
    }

    return {
        visibleHeaders,
        enhancedColumns,
        allColumns,
        isColumnVisible,
        toggleColumn,
        getDisplayMode,
        setDisplayMode,
        hasEnhancedList,
    }
}
