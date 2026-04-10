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

    function storageKey(): string | null {
        const path = route.path
        return path ? `url_filters:${path}` : null
    }

    function loadFromStorage(): Record<string, string> | null {
        const key = storageKey()
        if (!key || typeof window === 'undefined') return null
        try {
            const raw = window.sessionStorage.getItem(key)
            return raw ? JSON.parse(raw) : null
        } catch { return null }
    }

    function saveToStorage(): void {
        const key = storageKey()
        if (!key || typeof window === 'undefined') return
        try {
            if (state.size === 0) {
                window.sessionStorage.removeItem(key)
            } else {
                const obj: Record<string, string> = {}
                for (const [k, v] of state) obj[k] = v
                window.sessionStorage.setItem(key, JSON.stringify(obj))
            }
        } catch { /* storage unavailable */ }
    }

    function initFromRoute() {
        state.clear()
        let matchedAny = false
        for (const def of filterDefs.value) {
            const val = route.query[def.key]
            if (val != null && val !== '') {
                state.set(def.key, String(val))
                matchedAny = true
            }
        }
        // When the URL has no filter params but sessionStorage does,
        // hydrate from storage so menu-nav back to the page restores the last
        // filter set. URL always wins if it carries any filter key.
        if (!matchedAny) {
            const persisted = loadFromStorage()
            if (persisted) {
                for (const def of filterDefs.value) {
                    const v = persisted[def.key]
                    if (v != null && v !== '') state.set(def.key, String(v))
                }
                if (state.size > 0) scheduleFlush()
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
            } else if (def?.type === 'tag-select') {
                const items = val.split(',').filter(s => s.length > 0)
                if (items.length === 0) continue
                const nums = items.map(s => Number(s))
                params[key] = nums.every(n => !isNaN(n)) ? nums : items
            } else if (def?.type === 'number-range' || def?.type === 'date-range' || def?.type === 'rating') {
                const sepIdx = val.indexOf('~')
                if (sepIdx < 0) continue
                const gteRaw = val.slice(0, sepIdx)
                const lteRaw = val.slice(sepIdx + 1)
                const isNumber = def.type === 'number-range' || def.type === 'rating'
                if (gteRaw.length > 0) {
                    const v = isNumber ? Number(gteRaw) : gteRaw
                    if (!isNumber || !isNaN(v as number)) params[`${key}Gte`] = v
                }
                if (lteRaw.length > 0) {
                    const v = isNumber ? Number(lteRaw) : lteRaw
                    if (!isNumber || !isNaN(v as number)) params[`${key}Lte`] = v
                }
            } else if (def?.type === 'tristate' || def?.type === 'toggle' || def?.type === 'model-select' || def?.type === 'number') {
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
            saveToStorage()
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
