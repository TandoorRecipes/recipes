import {describe, it, expect} from 'vitest'
import {RECIPE_FILTER_DEFS, RECIPE_SORT_DEFS} from '@/composables/modellist/RecipeList'
import type {FilterDef} from '@/composables/modellist/types'

const LEGACY_FILTER_IDS = [
    'keywords', 'keywordsAnd', 'keywordsOrNot', 'keywordsAndNot',
    'foods', 'foodsAnd', 'foodsOrNot', 'foodsAndNot',
    'books', 'booksAnd', 'booksOrNot', 'booksAndNot',
    'units', 'createdby', 'internal', 'makenow', 'includeChildren',
    'rating', 'ratingGte', 'ratingLte',
    'timescooked', 'timescookedGte', 'timescookedLte',
    'cookedonGte', 'cookedonLte',
    'viewedonGte', 'viewedonLte',
    'createdon', 'createdonGte', 'createdonLte',
    'updatedon', 'updatedonGte', 'updatedonLte',
] as const

const RANGE_EMITTED_IDS = new Set<string>([
    'ratingGte', 'ratingLte',
    'timescookedGte', 'timescookedLte',
    'cookedonGte', 'cookedonLte',
    'viewedonGte', 'viewedonLte',
    'createdonGte', 'createdonLte',
    'updatedonGte', 'updatedonLte',
])

const REMOVED_IDS = new Set<string>([
    'createdon', 'updatedon',
    'rating', 'timescooked',
    'includeChildren',
])

const LEGACY_SORT_FIELDS = [
    'random', 'score', 'name', 'lastcooked', 'rating',
    'times_cooked', 'created_at', 'lastviewed',
] as const

function emittedKeysFor(def: FilterDef): string[] {
    if (def.type === 'date-range' || def.type === 'number-range' || def.type === 'rating') {
        return [`${def.key}Gte`, `${def.key}Lte`]
    }
    return [def.key]
}

describe('RECIPE_FILTER_DEFS', () => {
    it('every legacy filter id has corresponding coverage', () => {
        const allKeys = new Set(RECIPE_FILTER_DEFS.flatMap(emittedKeysFor))
        const missing: string[] = []
        for (const legacyId of LEGACY_FILTER_IDS) {
            if (RANGE_EMITTED_IDS.has(legacyId)) continue
            if (REMOVED_IDS.has(legacyId)) continue
            if (!allKeys.has(legacyId)) {
                missing.push(legacyId)
            }
        }
        expect(missing).toEqual([])
    })

    it('has unique keys', () => {
        const keys = RECIPE_FILTER_DEFS.map(d => d.key)
        expect(new Set(keys).size).toBe(keys.length)
    })

    it('uses tag-select for the four keyword variants', () => {
        for (const key of ['keywords', 'keywordsAnd', 'keywordsOrNot', 'keywordsAndNot']) {
            const def = RECIPE_FILTER_DEFS.find(d => d.key === key)
            expect(def, `missing: ${key}`).toBeDefined()
            expect(def!.type).toBe('tag-select')
        }
    })

    it('uses tag-select for the four food variants', () => {
        for (const key of ['foods', 'foodsAnd', 'foodsOrNot', 'foodsAndNot']) {
            const def = RECIPE_FILTER_DEFS.find(d => d.key === key)
            expect(def, `missing: ${key}`).toBeDefined()
            expect(def!.type).toBe('tag-select')
        }
    })

    it('uses tag-select for the four book variants', () => {
        for (const key of ['books', 'booksAnd', 'booksOrNot', 'booksAndNot']) {
            const def = RECIPE_FILTER_DEFS.find(d => d.key === key)
            expect(def, `missing: ${key}`).toBeDefined()
            expect(def!.type).toBe('tag-select')
        }
    })

    it('groups filters into Rating / Cooking / Time / Recipe / Dates / Other', () => {
        const groups = new Set(
            RECIPE_FILTER_DEFS.map(d => d.group).filter((g): g is string => Boolean(g)),
        )
        expect(groups).toContain('Rating')
        expect(groups).toContain('Cooking')
        expect(groups).toContain('Time')
        expect(groups).toContain('Recipe')
        expect(groups).toContain('Dates')
        expect(groups).toContain('Other')
    })
})

describe('RECIPE_SORT_DEFS', () => {
    it('covers every legacy sort field', () => {
        const keys = new Set(RECIPE_SORT_DEFS.map(s => s.key))
        const missing = LEGACY_SORT_FIELDS.filter(v => !keys.has(v))
        expect(missing).toEqual([])
    })

    it('has unique keys', () => {
        const keys = RECIPE_SORT_DEFS.map(s => s.key)
        expect(new Set(keys).size).toBe(keys.length)
    })

    it('every entry has a labelKey', () => {
        for (const def of RECIPE_SORT_DEFS) {
            expect(def.labelKey).toBeTruthy()
        }
    })
})
