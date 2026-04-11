import {computed, type ComputedRef} from 'vue'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import type {FilterDef} from './modellist/types'

export function useFilterPlacement() {
    const deviceSettings = useUserPreferenceStore().deviceSettings

    function isInlineSelected(key: string) {
        return (deviceSettings.search_inlineFilters ?? []).includes(key)
    }
    function toggleInline(key: string) {
        const current = [...(deviceSettings.search_inlineFilters ?? [])]
        const idx = current.indexOf(key)
        if (idx >= 0) current.splice(idx, 1)
        else current.push(key)
        deviceSettings.search_inlineFilters = current
    }
    function isDrawerSelected(key: string) {
        return (deviceSettings.search_drawerFilters ?? []).includes(key)
    }
    function toggleDrawer(key: string) {
        const current = [...(deviceSettings.search_drawerFilters ?? [])]
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
