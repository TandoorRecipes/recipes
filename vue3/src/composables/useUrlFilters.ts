import {computed, type ComputedRef} from 'vue'
import {useRouteQuery} from '@vueuse/router'
import type {FilterDef} from './modellist/types'

/**
 * Generic composable for managing filter state via a single serialized URL param.
 *
 * Uses a compact (?paramName=key:val,key:val) format to avoid
 * multiple useRouteQuery() refs per component.
 */
export function useUrlFilters(
    filterDefs: ComputedRef<FilterDef[]>,
    paramName: string = 'filters'
) {
    const rawFilters = useRouteQuery<string>(paramName, '')

    const groupedFilterDefs = computed<Map<string, FilterDef[]>>(() => {
        const map = new Map<string, FilterDef[]>()
        for (const def of filterDefs.value) {
            const group = def.group ?? ''
            const existing = map.get(group) ?? []
            existing.push(def)
            map.set(group, existing)
        }
        return map
    })

    /** Parse "key:val,key:val" into a Map (values are URI-decoded to handle commas) */
    function parseFilters(str: string): Map<string, string> {
        if (!str) return new Map()
        const map = new Map<string, string>()
        for (const pair of str.split(',')) {
            const idx = pair.indexOf(':')
            if (idx > 0) {
                map.set(pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1)))
            }
        }
        return map
    }

    /** Serialize a Map back to "key:val,key:val" (values are URI-encoded to protect commas/colons) */
    function serializeFilters(map: Map<string, string>): string {
        const pairs: string[] = []
        for (const [k, v] of map) {
            pairs.push(`${k}:${encodeURIComponent(v)}`)
        }
        return pairs.join(',')
    }

    /** Single parsed computed to avoid redundant re-parsing across multiple consumers */
    const parsedFilters = computed(() => parseFilters(rawFilters.value))

    const activeFilterCount = computed<number>(() => parsedFilters.value.size)

    /** Convert snake_case to camelCase for OpenAPI client compatibility */
    function snakeToCamel(s: string): string {
        return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    }

    /** Convert filter values to API-ready types and camelCase keys for the OpenAPI client */
    const filterParams = computed<Record<string, string | number>>(() => {
        const map = parsedFilters.value
        if (map.size === 0) return {}
        const params: Record<string, string | number> = {}
        for (const [key, val] of map) {
            const def = filterDefs.value.find(d => d.key === key)
            const paramKey = snakeToCamel(key)
            if (def?.type === 'tristate' || def?.type === 'model-select' || def?.type === 'number') {
                const num = Number(val)
                if (!isNaN(num)) params[paramKey] = num
            } else {
                params[paramKey] = val
            }
        }
        return params
    })

    function getFilter(key: string): string | undefined {
        return parsedFilters.value.get(key)
    }

    function setFilter(key: string, value: string | undefined): void {
        const map = new Map(parsedFilters.value)
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
