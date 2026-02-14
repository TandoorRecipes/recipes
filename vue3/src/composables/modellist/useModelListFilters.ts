import {computed, type ComputedRef} from 'vue'
import {useRouteQuery} from '@vueuse/router'
import type {Model} from '@/types/Models'
import type {ModelFilterDef} from './types'

/**
 * Composable for managing filter state in ModelListPage.
 *
 * Uses a single serialized URL param (?filters=key:val,key:val) to avoid
 * multiple useRouteQuery() refs per component. Parse on read, serialize on write.
 */
export function useModelListFilters(model: ComputedRef<Model | undefined>) {
    const rawFilters = useRouteQuery('filters', '')

    const filterDefs = computed<ModelFilterDef[]>(() => model.value?.filterDefs ?? [])

    const groupedFilterDefs = computed<Map<string, ModelFilterDef[]>>(() => {
        const map = new Map<string, ModelFilterDef[]>()
        for (const def of filterDefs.value) {
            const group = def.group ?? ''
            const existing = map.get(group) ?? []
            existing.push(def)
            map.set(group, existing)
        }
        return map
    })

    /** Parse "key:val,key:val" into a Map */
    function parseFilters(): Map<string, string> {
        const str = rawFilters.value
        if (!str) return new Map()
        const map = new Map<string, string>()
        for (const pair of str.split(',')) {
            const idx = pair.indexOf(':')
            if (idx > 0) {
                map.set(pair.slice(0, idx), pair.slice(idx + 1))
            }
        }
        return map
    }

    /** Serialize a Map back to "key:val,key:val" */
    function serializeFilters(map: Map<string, string>): string {
        const pairs: string[] = []
        for (const [k, v] of map) {
            pairs.push(`${k}:${v}`)
        }
        return pairs.join(',')
    }

    const activeFilterCount = computed<number>(() => parseFilters().size)

    /** Convert filter values to API-ready types (string → number for tristate and model-select) */
    const filterParams = computed<Record<string, string | number>>(() => {
        const map = parseFilters()
        if (map.size === 0) return {}
        const params: Record<string, string | number> = {}
        for (const [key, val] of map) {
            const def = filterDefs.value.find(d => d.key === key)
            if (def?.type === 'tristate' || def?.type === 'model-select') {
                params[key] = Number(val)
            } else {
                params[key] = val
            }
        }
        return params
    })

    function getFilter(key: string): string | undefined {
        return parseFilters().get(key)
    }

    function setFilter(key: string, value: string | undefined): void {
        const map = parseFilters()
        if (value === undefined || value === '') {
            map.delete(key)
        } else {
            map.set(key, value)
        }
        rawFilters.value = serializeFilters(map)
    }

    function clearFilter(key: string): void {
        setFilter(key, undefined)
    }

    function clearAllFilters(): void {
        rawFilters.value = ''
    }

    return {
        filterDefs,
        groupedFilterDefs,
        activeFilterCount,
        filterParams,
        getFilter,
        setFilter,
        clearFilter,
        clearAllFilters,
    }
}
