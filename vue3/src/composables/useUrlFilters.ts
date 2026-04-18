import {computed, reactive, nextTick, watch, type ComputedRef} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import type {FilterDef, FilterValue, RangeValue} from './modellist/types'

export function useUrlFilters(
    filterDefs: ComputedRef<FilterDef[]>,
) {
    const route = useRoute()
    const router = useRouter()

    const state = reactive(new Map<string, string>())
    let flushScheduled = false

    function initFromRoute() {
        state.clear()
        for (const def of filterDefs.value) {
            const val = route.query[def.key]
            if (val != null && val !== '') {
                state.set(def.key, String(val))
            }
        }
    }

    initFromRoute()

    watch(() => route.query, () => {
        if (!flushScheduled) initFromRoute()
    })

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

    const activeFilterCount = computed<number>(() => state.size)

    const filterParams = computed<Record<string, string | number | (string | number)[]>>(() => {
        if (state.size === 0) return {}
        const params: Record<string, string | number | (string | number)[]> = {}
        for (const [key, val] of state) {
            const def = filterDefs.value.find(d => d.key === key)
            if (def?.type === 'select') {
                params[key] = [val]
            } else if (def?.type === 'tristate' || def?.type === 'model-select' || def?.type === 'number') {
                const num = Number(val)
                if (!isNaN(num)) params[key] = num
            } else {
                params[key] = val
            }
        }
        return params
    })

    function scheduleFlush() {
        if (flushScheduled) return
        flushScheduled = true
        nextTick(() => {
            const query: Record<string, string | string[]> = {}
            for (const [k, v] of Object.entries(route.query)) {
                if (!filterDefs.value.some(d => d.key === k)) {
                    query[k] = v as string | string[]
                }
            }
            for (const [k, v] of state) {
                query[k] = v
            }
            // Keep the guard set across the router update so the route.query
            // watcher skips the re-entry we just caused; clear it only once
            // navigation settles (finally so a cancelled nav still clears it).
            router.replace({query}).finally(() => {
                flushScheduled = false
            })
        })
    }

    function getFilter(key: string): string | undefined {
        return state.get(key)
    }

    function setFilter(key: string, value: FilterValue): void {
        const serialized = serializeFilterValue(value)
        if (serialized === undefined) {
            state.delete(key)
        } else {
            state.set(key, serialized)
        }
        scheduleFlush()
    }

    function serializeFilterValue(value: FilterValue): string | undefined {
        if (value === undefined || value === '') return undefined
        if (Array.isArray(value)) {
            if (value.length === 0) return undefined
            return value.map(v => String(v)).join(',')
        }
        if (typeof value === 'object') {
            const r = value as RangeValue
            const gte = r.gte === null || r.gte === undefined ? '' : String(r.gte)
            const lte = r.lte === null || r.lte === undefined ? '' : String(r.lte)
            if (gte === '' && lte === '') return undefined
            return `${gte}~${lte}`
        }
        return String(value)
    }

    function clearFilter(key: string): void {
        setFilter(key, undefined)
    }

    function clearAllFilters(): void {
        state.clear()
        scheduleFlush()
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
