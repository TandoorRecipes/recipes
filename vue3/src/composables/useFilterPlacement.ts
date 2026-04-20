import {computed, type ComputedRef} from 'vue'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {FilterDef} from './modellist/types'

/**
 * Manages per-filter inline (page) / drawer (panel) placement.
 * @param settingsKey — prefix for device-settings keys (e.g. 'search' → search_inlineFilters)
 * @param defaultInline — filter keys shown inline when user has never customized
 * @param defaultDrawer — filter keys shown in drawer when user has never customized.
 *        Pass empty array for "show all by default" (the common case for model list pages).
 */
export function useFilterPlacement(
    settingsKey: string,
    defaultInline: string[] = [],
    defaultDrawer: string[] = [],
) {
    const deviceSettings = useUserPreferenceStore().deviceSettings
    const inlineKey = `${settingsKey}_inlineFilters`
    const drawerKey = `${settingsKey}_drawerFilters`

    /** When defaultDrawer is empty, "never customized" means "show all". */
    const showAllDrawerByDefault = defaultDrawer.length === 0

    // ── Inline (Page) ──────────────────────────────────────────────────

    function isInlineSelected(key: string) {
        const stored = deviceSettings[inlineKey] as string[] | undefined
        return (stored ?? defaultInline).includes(key)
    }

    function toggleInline(key: string) {
        const current = [...((deviceSettings[inlineKey] as string[] | undefined) ?? defaultInline)]
        const idx = current.indexOf(key)
        if (idx >= 0) current.splice(idx, 1)
        else current.push(key)
        deviceSettings[inlineKey] = current
    }

    // ── Drawer (Panel) ─────────────────────────────────────────────────

    function isDrawerSelected(key: string) {
        const stored = deviceSettings[drawerKey] as string[] | undefined
        if (!stored && showAllDrawerByDefault) return true
        return (stored ?? defaultDrawer).includes(key)
    }

    /**
     * Toggle a key in/out of the drawer list.
     * @param key - the filter key to toggle
     * @param allKeys - all available filter keys (needed on first toggle when "show all" is default)
     */
    function toggleDrawer(key: string, allKeys?: string[]) {
        let stored = deviceSettings[drawerKey] as string[] | undefined
        // First toggle with "show all" default: initialize from all available keys
        if (!stored && showAllDrawerByDefault && allKeys) {
            stored = [...allKeys]
        }
        const current = [...(stored ?? defaultDrawer)]
        const idx = current.indexOf(key)
        if (idx >= 0) current.splice(idx, 1)
        else current.push(key)
        deviceSettings[drawerKey] = current
    }

    // ── Computed filter sets ───────────────────────────────────────────

    /**
     * Filter groupedFilterDefs to only include filters the user wants in the drawer.
     * If user has never customized, all non-hidden grouped filters are shown.
     */
    function filteredDrawerDefs(groupedFilterDefs: ComputedRef<Map<string, FilterDef[]>>) {
        return computed(() => {
            const stored = deviceSettings[drawerKey] as string[] | undefined
            if (!stored) return groupedFilterDefs.value  // never customized → show all

            const allowedKeys = new Set(stored)
            const filtered = new Map<string, FilterDef[]>()
            for (const [group, defs] of groupedFilterDefs.value) {
                const visible = defs.filter(d => !d.hidden && (!group || allowedKeys.has(d.key)))
                if (visible.length > 0) filtered.set(group, visible)
            }
            return filtered
        })
    }

    /**
     * Filter groupedFilterDefs to only include filters placed on the page (inline).
     */
    function filteredInlineDefs(groupedFilterDefs: ComputedRef<Map<string, FilterDef[]>>) {
        return computed(() => {
            const stored = deviceSettings[inlineKey] as string[] | undefined
            const keys = new Set(stored ?? defaultInline)
            const result: [string, FilterDef[]][] = []
            for (const [group, defs] of groupedFilterDefs.value) {
                if (!group) continue
                const visible = defs.filter(d => keys.has(d.key))
                if (visible.length > 0) result.push([group, visible])
            }
            return result
        })
    }

    function configurableFiltersByGroup(groupedFilterDefs: ComputedRef<Map<string, FilterDef[]>>) {
        return computed(() => {
            const result = new Map<string, FilterDef[]>()
            for (const [group, defs] of groupedFilterDefs.value) {
                if (!group) continue
                const visible = defs.filter(d => !d.hidden)
                if (visible.length > 0) result.set(group, visible)
            }
            return result
        })
    }

    return {isInlineSelected, toggleInline, isDrawerSelected, toggleDrawer,
            filteredDrawerDefs, filteredInlineDefs, configurableFiltersByGroup}
}
