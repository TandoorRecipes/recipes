/**
 * Resurrection-guard: the stat-def keys for Unit/Keyword/Automation lists must
 * resolve against the keys the generated *Stats client models emit (FromJSON
 * camelCases the backend snake_case fields). If a backend field is renamed or a
 * def key drifts, the footer chip silently shows nothing — this locks the
 * alignment. Also guards that Automation's per-type chips stay removed (there is
 * no backend for them).
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

import { UnitStatsFromJSON, KeywordStatsFromJSON, AutomationStatsFromJSON } from '@/openapi'
import { UNIT_STAT_DEFS } from '@/composables/modellist/UnitList'
import { KEYWORD_STAT_DEFS } from '@/composables/modellist/KeywordList'
import { AUTOMATION_STAT_DEFS } from '@/composables/modellist/AutomationList'

describe('modellist stat-def keys align with generated *Stats client models', () => {
    it('Unit stat defs resolve against UnitStats', () => {
        const stats = UnitStatsFromJSON({ with_recipe: 3, total: 5 }) as unknown as Record<string, number>
        for (const def of UNIT_STAT_DEFS) {
            expect(def.key in stats).toBe(true)
        }
    })

    it('Keyword stat defs resolve against KeywordStats', () => {
        const stats = KeywordStatsFromJSON({ with_recipe: 3, with_children: 1, total: 5 }) as unknown as Record<string, number>
        for (const def of KEYWORD_STAT_DEFS) {
            expect(def.key in stats).toBe(true)
        }
    })

    it('Automation stat defs resolve against AutomationStats and drop per-type chips', () => {
        const stats = AutomationStatsFromJSON({ enabled: 2, disabled: 1, total: 3 }) as unknown as Record<string, number>
        for (const def of AUTOMATION_STAT_DEFS) {
            expect(def.key in stats).toBe(true)
        }
        // per-type chips had no backend and were removed — only enabled/disabled remain
        expect(AUTOMATION_STAT_DEFS.map(d => d.key)).toEqual(['enabled', 'disabled'])
    })
})
