import {describe, it, expect} from 'vitest'
import type {FilterDef} from '@/composables/modellist/types'
import {
    recognizedSearchKeys,
    extractUnknownKeys,
    buildSearchBlob,
    parseSearchBlob,
} from '@/utils/savedSearchBlob'
import {RECIPE_FILTER_DEFS} from '@/composables/modellist/RecipeList'

// Minimal defs covering every serialized type. `getFilter` returns the SERIALIZED
// string form (arrays as "1,2", ranges as "5~10", toggles as "1"/"0").
const DEFS: FilterDef[] = [
    {key: 'keywords', labelKey: 'K', type: 'tag-select', hidden: true},
    {key: 'servings', labelKey: 'S', type: 'number-range', group: 'Recipe'},
    {key: 'cookedon', labelKey: 'C', type: 'date-range', group: 'Date'},
    {key: 'ratingGte', labelKey: 'R', type: 'rating-unrated', group: 'Rating'} as FilterDef,
    {key: 'unrated', labelKey: 'U', type: 'toggle', group: 'Rating', hidden: true},
    {key: 'hasPhoto', labelKey: 'P', type: 'tristate', group: 'Recipe'},
]

function mockGetFilter(state: Record<string, string>) {
    return (key: string) => state[key]
}

describe('recognizedSearchKeys', () => {
    it('includes static keys, all def keys, range _gte/_lte expansions, and back-compat aliases', () => {
        const keys = recognizedSearchKeys(DEFS)
        for (const k of ['query', 'version', 'sort_order', 'keywords', 'servings', 'hasPhoto',
            'servings_gte', 'servings_lte', 'cookedon_gte', 'cookedon_lte',
            'unrated_only', 'rating_gte', 'rating_lte']) {
            expect(keys.has(k), `missing ${k}`).toBe(true)
        }
    })

    it('recognizes real derived keys from RECIPE_FILTER_DEFS (servings_gte, rating_gte alias)', () => {
        const keys = recognizedSearchKeys(RECIPE_FILTER_DEFS)
        expect(keys.has('servings_gte')).toBe(true)
        expect(keys.has('rating_gte')).toBe(true)  // back-compat alias
    })
})

describe('extractUnknownKeys', () => {
    it('returns only keys the serde does not recognize (derived keys are NOT unknown)', () => {
        const recognized = recognizedSearchKeys(DEFS)
        const unknown = extractUnknownKeys({keywords: [1], servings_gte: 5, foo: 'x', version: '2'}, recognized)
        expect(unknown).toEqual({foo: 'x'})
    })
})

describe('buildSearchBlob', () => {
    it('serializes each filter type and stamps version', () => {
        const blob = buildSearchBlob({
            defs: DEFS, query: 'pasta', ordering: '', includeSort: false,
            getFilter: mockGetFilter({keywords: '1,2', servings: '5~10', hasPhoto: '1'}),
        })
        expect(blob).toMatchObject({query: 'pasta', keywords: [1, 2], servings_gte: 5, servings_lte: 10, hasPhoto: true, version: '2'})
        expect('sort_order' in blob).toBe(false)
    })

    it('emits sort_order only when includeSort is true AND ordering is non-empty', () => {
        const base = {defs: DEFS, getFilter: mockGetFilter({}), query: ''}
        expect(buildSearchBlob({...base, ordering: '-rating', includeSort: true}).sort_order).toBe('-rating')
        expect('sort_order' in buildSearchBlob({...base, ordering: '-rating', includeSort: false})).toBe(false)
        expect('sort_order' in buildSearchBlob({...base, ordering: '', includeSort: true})).toBe(false)
    })

    it('merges the unknown-key stash FIRST so live edits win on any overlap', () => {
        const blob = buildSearchBlob({
            defs: DEFS, query: '', ordering: '', includeSort: false,
            getFilter: mockGetFilter({keywords: '1,2'}),
            stash: {foo: 'legacy', keywords: [9]},  // keywords overlap: live state must win
        })
        expect(blob.foo).toBe('legacy')
        expect(blob.keywords).toEqual([1, 2])  // built (live) value, not the stash's [9]
    })
})

describe('parseSearchBlob', () => {
    it('produces setFilter payloads, restores ordering, flags hasSort, and stashes unknowns', () => {
        const {applies, ordering, hasSort, stash} = parseSearchBlob({
            defs: DEFS,
            blob: {keywords: [1, 2], servings_gte: 5, servings_lte: 10, sort_order: '-name', foo: 'x'},
        })
        expect(applies).toContainEqual({key: 'keywords', value: [1, 2]})
        expect(applies).toContainEqual({key: 'servings', value: {gte: 5, lte: 10}})
        expect(ordering).toBe('-name')
        expect(hasSort).toBe(true)
        expect(stash).toEqual({foo: 'x'})
    })

    it('maps back-compat rating_gte/lte aliases and does NOT stash them', () => {
        const {applies, stash} = parseSearchBlob({defs: DEFS, blob: {rating_gte: 3}})
        expect(applies).toContainEqual({key: 'ratingGte', value: '3'})
        expect(stash).toEqual({})  // rating_gte recognized, not foreign
    })
})

describe('adversarial round-trip', () => {
    it('a range edit persists and a foreign key is preserved (finding #1)', () => {
        // Old saved search: servings 5~10 + a legacy/foreign key.
        const old = {servings_gte: 5, servings_lte: 10, foo: 'legacy', version: '2'}
        const {stash} = parseSearchBlob({defs: DEFS, blob: old})
        // User edits servings to 7~12 in edit mode:
        const blob = buildSearchBlob({
            defs: DEFS, query: '', ordering: '', includeSort: false, stash,
            getFilter: mockGetFilter({servings: '7~12'}),
        })
        expect(blob.servings_gte).toBe(7)   // edited value, NOT reverted to 5
        expect(blob.servings_lte).toBe(12)
        expect(blob.foo).toBe('legacy')     // foreign key preserved
    })

    it('an old rating_gte blob does not resave to a polluted {ratingGte, rating_gte} pair (finding #1)', () => {
        const old = {rating_gte: 3, foo: 'x'}
        const {stash} = parseSearchBlob({defs: DEFS, blob: old})
        const blob = buildSearchBlob({
            defs: DEFS, query: '', ordering: '', includeSort: false, stash,
            getFilter: mockGetFilter({ratingGte: '3'}),  // applied via back-compat then edited
        })
        expect(blob.ratingGte).toBe(3)
        expect('rating_gte' in blob).toBe(false)  // alias not re-emitted
        expect(blob.foo).toBe('x')
    })

    it('changing sort produces a different blob so dirty-detection registers it (finding #2)', () => {
        const base = {defs: DEFS, getFilter: mockGetFilter({}), query: '', includeSort: true}
        const a = JSON.stringify(buildSearchBlob({...base, ordering: 'name'}))
        const b = JSON.stringify(buildSearchBlob({...base, ordering: '-name'}))
        expect(a).not.toBe(b)
    })
})
