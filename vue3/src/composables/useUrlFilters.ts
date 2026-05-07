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

    // 2-hour expiry for hydrated filters: the user expects yesterday's search
    // to be gone when they come back. Anything older — or anything in the
    // pre-TTL bare-object format — is silently discarded on read.
    const TTL_MS = 2 * 60 * 60 * 1000

    function loadFromStorage(): Record<string, string> | null {
        const key = storageKey()
        if (!key || typeof window === 'undefined') return null
        try {
            const raw = window.sessionStorage.getItem(key)
            if (!raw) return null
            const parsed = JSON.parse(raw)
            // Envelope shape: { filters: {...}, ts: <ms> }. Anything else
            // (including the pre-TTL bare format) is treated as expired.
            if (!parsed || typeof parsed !== 'object'
                || typeof parsed.ts !== 'number'
                || !parsed.filters || typeof parsed.filters !== 'object'
                || Date.now() - parsed.ts > TTL_MS) {
                window.sessionStorage.removeItem(key)
                return null
            }
            return parsed.filters as Record<string, string>
        } catch { return null }
    }

    function saveToStorage(): void {
        const key = storageKey()
        if (!key || typeof window === 'undefined') return
        try {
            if (state.size === 0) {
                window.sessionStorage.removeItem(key)
            } else {
                const filters: Record<string, string> = {}
                for (const [k, v] of state) filters[k] = v
                window.sessionStorage.setItem(key, JSON.stringify({filters, ts: Date.now()}))
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
                continue
            }
            // Back-compat: before the multi-param refactor the UI (and any
            // bookmarks) shipped date/number ranges as separate snake_case
            // params, e.g. ?createdon_gte=2026-04-16&createdon_lte=2026-04-20.
            // Accept that shape too for range-type defs so deep-links don't
            // silently lose filters after the upgrade.
            if (def.type === 'date-range' || def.type === 'number-range') {
                const gte = route.query[`${def.key}_gte`]
                const lte = route.query[`${def.key}_lte`]
                const gteStr = gte != null && gte !== '' ? String(gte) : ''
                const lteStr = lte != null && lte !== '' ? String(lte) : ''
                if (gteStr || lteStr) {
                    state.set(def.key, `${gteStr}~${lteStr}`)
                    matchedAny = true
                }
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
                // Defer the URL flush until vue-router has committed the initial
                // navigation; otherwise the router.replace fires mid-transition
                // during setup and the URL update is silently dropped, leaving
                // state hydrated but the address bar empty.
                if (state.size > 0) router.isReady().then(scheduleFlush)
            }
        }
    }

    initFromRoute()

    watch(() => route.query, () => {
        if (!flushScheduled) initFromRoute()
    })

    // Re-init when filter defs become available. ModelListPage passes a
    // computed that depends on `genericModel` set in onBeforeMount, so at
    // the time `useUrlFilters` runs, `filterDefs.value` is still `[]` and
    // `initFromRoute` sees no known keys. Re-run once defs arrive so URL
    // params like ?expiringSoon=3 actually populate state.
    watch(() => filterDefs.value.length, (len, prev) => {
        if (prev === 0 && len > 0) initFromRoute()
    })

    const defsByKey = computed(() => {
        const map = new Map<string, FilterDef>()
        for (const def of filterDefs.value) map.set(def.key, def)
        return map
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

    const filterParams = computed<Record<string, string | number | Date | (string | number)[]>>(() => {
        if (state.size === 0) return {}
        const params: Record<string, string | number | Date | (string | number)[]> = {}
        for (const [key, val] of state) {
            const def = defsByKey.value.get(key)
            if (def?.type === 'select') {
                params[key] = [val]
            } else if (def?.type === 'tag-select') {
                const items = val.split(',').filter(s => s.length > 0)
                if (items.length === 0) continue
                const nums = items.map(s => Number(s))
                params[key] = nums.every(n => !isNaN(n)) ? nums : items
            } else if (def?.type === 'number-range' || def?.type === 'date-range') {
                const sepIdx = val.indexOf('~')
                if (sepIdx < 0) continue
                const gteRaw = val.slice(0, sepIdx)
                const lteRaw = val.slice(sepIdx + 1)
                const isNumber = def.type === 'number-range'
                const isDate = def.type === 'date-range'
                // The generated OpenAPI client types date-range params as Date
                // and serializes via .toISOString() — emitting a plain string
                // here throws at request time. Coerce to Date (invalid dates
                // drop through).
                if (gteRaw.length > 0) {
                    const v: number | Date | string = isNumber ? Number(gteRaw) : (isDate ? new Date(gteRaw) : gteRaw)
                    const invalid = isNumber ? isNaN(v as number) : (isDate && isNaN((v as Date).getTime()))
                    if (!invalid) params[`${key}Gte`] = v
                }
                if (lteRaw.length > 0) {
                    const v: number | Date | string = isNumber ? Number(lteRaw) : (isDate ? new Date(lteRaw) : lteRaw)
                    const invalid = isNumber ? isNaN(v as number) : (isDate && isNaN((v as Date).getTime()))
                    if (!invalid) params[`${key}Lte`] = v
                }
            } else if (def?.type === 'tristate' || def?.type === 'toggle' || def?.type === 'model-select' || def?.type === 'number' || def?.type === 'rating-half') {
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
