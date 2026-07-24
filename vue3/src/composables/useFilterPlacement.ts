import {computed, type ComputedRef} from 'vue'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {FilterDef} from './modellist/types'

// Default placement — MUST match SearchPage's DEFAULT_INLINE / DEFAULT_DRAWER
// (what the page renders when the saved list is empty). Kept here so the
// placement toggles fall back to the same set the page actually uses.
export const DEFAULT_INLINE_FILTERS = ['_keywordsGroup', '_foodsGroup', '_booksGroup']
export const DEFAULT_DRAWER_FILTERS = ['_keywordsGroup', '_foodsGroup', '_booksGroup', 'ratingGte', 'unrated', 'servings', 'timescooked', 'makenow', 'cookedon', 'createdon', 'totalTime', 'createdby', 'internal']

export function useFilterPlacement() {
    const deviceSettings = useUserPreferenceStore().deviceSettings

    // When the saved list is empty, fall back to the defaults so the toggles
    // reflect the placement the page actually renders (SearchPage applies the
    // same fallback) instead of showing every filter as "not set".
    // Fall back to the defaults only when the setting was never saved — an
    // explicitly emptied list (user turned every placement off) must be honoured,
    // otherwise emptying it silently resurrects the defaults.
    function effectiveInline(): string[] {
        const raw = deviceSettings.search_inlineFilters
        return raw == null ? DEFAULT_INLINE_FILTERS : raw
    }
    function effectiveDrawer(): string[] {
        const raw = deviceSettings.search_drawerFilters
        return raw == null ? DEFAULT_DRAWER_FILTERS : raw
    }

    function isInlineSelected(key: string) {
        return effectiveInline().includes(key)
    }
    function toggleInline(key: string) {
        // Seed from the effective set so toggling one filter out of the default
        // state doesn't drop all the other defaults.
        const current = [...effectiveInline()]
        const idx = current.indexOf(key)
        if (idx >= 0) current.splice(idx, 1)
        else current.push(key)
        deviceSettings.search_inlineFilters = current
    }
    function isDrawerSelected(key: string) {
        return effectiveDrawer().includes(key)
    }
    function toggleDrawer(key: string) {
        const current = [...effectiveDrawer()]
        const idx = current.indexOf(key)
        if (idx >= 0) current.splice(idx, 1)
        else current.push(key)
        deviceSettings.search_drawerFilters = current
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

    return {isInlineSelected, toggleInline, isDrawerSelected, toggleDrawer, configurableFiltersByGroup}
}
