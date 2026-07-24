import type {FilterDef, FilterValue} from '@/composables/modellist/types'

/**
 * The serialized shape of a CustomFilter's `search` field (v2). Holds `query`,
 * per-filter keys (arrays / `_gte`/`_lte` / bools / scalars), an optional
 * `sort_order`, `version`, and any preserved-verbatim unknown keys.
 */
export type FilterBlob = {query?: string, version?: '2', sort_order?: string, [k: string]: unknown}

// Aliases that parseSearchBlob reads for backward compatibility with v1 blobs but
// that buildSearchBlob never re-emits (it emits the canonical `ratingGte`/`unrated`).
// They must count as "recognized" so they aren't treated as unknown foreign keys.
const BACKCOMPAT_ALIASES = ['unrated_only', 'rating_gte', 'rating_lte'] as const

/**
 * Every blob key the serde understands: static keys, each def key, the `_gte`/`_lte`
 * expansions of range defs, and the back-compat aliases. Keys OUTSIDE this set are
 * "unknown" (legacy/removed/foreign) and get preserved verbatim through an edit.
 */
export function recognizedSearchKeys(defs: FilterDef[]): Set<string> {
    const keys = new Set<string>(['query', 'version', 'sort_order', ...BACKCOMPAT_ALIASES])
    for (const def of defs) {
        keys.add(def.key)
        if (def.type === 'date-range' || def.type === 'number-range') {
            keys.add(`${def.key}_gte`)
            keys.add(`${def.key}_lte`)
        }
    }
    return keys
}

/** Keys present in the blob that the serde doesn't recognize — preserved verbatim. */
export function extractUnknownKeys(blob: Record<string, unknown>, recognized: Set<string>): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(blob)) {
        if (!recognized.has(k)) out[k] = blob[k]
    }
    return out
}

/**
 * Serialize the live filter state into a search blob. `getFilter` returns the
 * serialized string form for a key. `stash` (unknown keys from the loaded blob) is
 * merged FIRST so freshly-built (edited) keys always win on any overlap.
 */
export function buildSearchBlob(opts: {
    defs: FilterDef[],
    getFilter: (key: string) => string | undefined,
    query: string,
    ordering: string,
    includeSort: boolean,
    stash?: Record<string, unknown>,
}): FilterBlob {
    const built: FilterBlob = {}
    if (opts.query) built.query = opts.query
    for (const def of opts.defs) {
        const raw = opts.getFilter(def.key)
        if (raw === undefined || raw === '') continue
        if (def.type === 'tag-select') {
            const items = raw.split(',').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
            if (items.length > 0) built[def.key] = items
        } else if (def.type === 'date-range' || def.type === 'number-range') {
            const sep = raw.indexOf('~')
            if (sep < 0) continue
            const gte = raw.slice(0, sep), lte = raw.slice(sep + 1)
            const isNum = def.type === 'number-range'
            if (gte) built[`${def.key}_gte`] = isNum ? Number(gte) : gte
            if (lte) built[`${def.key}_lte`] = isNum ? Number(lte) : lte
        } else if (def.type === 'rating-half' || def.type === 'rating-unrated') {
            const n = Number(raw); if (!isNaN(n)) built[def.key] = n
        } else if (def.type === 'tristate' || def.type === 'toggle') {
            built[def.key] = raw === '1'
        } else if (def.type === 'number') {
            const n = Number(raw); if (!isNaN(n)) built[def.key] = n
        } else {
            built[def.key] = raw
        }
    }
    built.version = '2'
    if (opts.includeSort && opts.ordering) built.sort_order = opts.ordering
    return {...(opts.stash ?? {}), ...built}
}

/**
 * Parse a search blob into: the list of setFilter payloads to apply, the sort order
 * to restore (or null), whether the blob carried a sort, and the unknown-key stash.
 */
export function parseSearchBlob(opts: {defs: FilterDef[], blob: FilterBlob}): {
    applies: Array<{key: string, value: FilterValue}>,
    ordering: string | null,
    hasSort: boolean,
    stash: Record<string, unknown>,
} {
    const {defs, blob} = opts
    const applies: Array<{key: string, value: FilterValue}> = []
    // Backward compat with v1 blobs.
    if (blob.unrated_only === true) applies.push({key: 'unrated', value: '1'})
    if (blob.rating_gte != null) applies.push({key: 'ratingGte', value: String(blob.rating_gte)})
    if (blob.rating_lte != null) applies.push({key: 'ratingLte', value: String(blob.rating_lte)})
    for (const def of defs) {
        if (def.type === 'date-range' || def.type === 'number-range') {
            const gte = blob[`${def.key}_gte`]
            const lte = blob[`${def.key}_lte`]
            if (gte != null || lte != null) {
                applies.push({key: def.key, value: {gte: (gte ?? null) as any, lte: (lte ?? null) as any}})
            }
        } else if (def.type === 'rating-half' || def.type === 'rating-unrated') {
            const v = blob[def.key]
            if (v != null && v !== '') applies.push({key: def.key, value: String(v)})
        } else if (def.type === 'tag-select') {
            const v = blob[def.key]
            if (Array.isArray(v) && v.length > 0) applies.push({key: def.key, value: v.map(Number).filter(n => !isNaN(n))})
        } else if (def.type === 'tristate' || def.type === 'toggle') {
            const v = blob[def.key]
            if (v === true || v === 'true' || v === 1 || v === '1') applies.push({key: def.key, value: '1'})
            else if (v === false || v === 'false' || v === 0 || v === '0') applies.push({key: def.key, value: '0'})
        } else {
            const v = blob[def.key]
            if (v != null && v !== '') applies.push({key: def.key, value: String(v)})
        }
    }
    const hasSort = typeof blob.sort_order === 'string' && blob.sort_order !== ''
    const ordering = hasSort ? (blob.sort_order as string) : null
    const stash = extractUnknownKeys(blob, recognizedSearchKeys(defs))
    return {applies, ordering, hasSort, stash}
}
