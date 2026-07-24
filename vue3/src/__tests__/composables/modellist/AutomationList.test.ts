/**
 * Regression coverage for AutomationList config.
 *
 * AutomationList.ts is a list-model definition (not a lifecycle composable),
 * so tests assert on the exported ListModel shape rather than setup/teardown.
 * Pattern mirrors FoodList.test.ts / KeywordList.test.ts / RecipeList.test.ts.
 */
import {describe, it, expect, vi} from 'vitest'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({t: (key: string) => key}),
}))

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class {},
}))

import {
    AUTOMATION_FILTER_DEFS,
    AUTOMATION_ACTION_DEFS,
    AUTOMATION_SORT_OPTIONS,
    AUTOMATION_STAT_DEFS,
    AUTOMATION_LIST_SETTINGS,
} from '@/composables/modellist/AutomationList'

describe('AutomationList config', () => {
    describe('AUTOMATION_FILTER_DEFS', () => {
        it('all entries have required shape', () => {
            for (const def of AUTOMATION_FILTER_DEFS) {
                expect(def).toHaveProperty('key')
                expect(def).toHaveProperty('labelKey')
                expect(def).toHaveProperty('type')
            }
        })

        it('includes type and disabled filters', () => {
            const keys = AUTOMATION_FILTER_DEFS.map(d => d.key)
            expect(keys).toContain('type')
            expect(keys).toContain('disabled')
        })

        it('type filter is a select with non-empty options', () => {
            const typeFilter = AUTOMATION_FILTER_DEFS.find(d => d.key === 'type')!
            expect(typeFilter.type).toBe('select')
            expect(typeFilter.options?.length).toBeGreaterThan(0)
            for (const opt of typeFilter.options ?? []) {
                expect(opt).toHaveProperty('value')
                expect(opt).toHaveProperty('labelKey')
            }
        })

        it('keys use camelCase (no underscores)', () => {
            for (const def of AUTOMATION_FILTER_DEFS) {
                expect(def.key, `${def.key} must be camelCase`).not.toMatch(/_/)
            }
        })
    })

    describe('AUTOMATION_ACTION_DEFS', () => {
        it('toggle actions have toggleField', () => {
            const toggles = AUTOMATION_ACTION_DEFS.filter(a => a.isToggle)
            for (const action of toggles) {
                expect(action.toggleField).toBeTruthy()
            }
        })

        it('includes toggle-disabled, edit, delete', () => {
            const keys = AUTOMATION_ACTION_DEFS.map(a => a.key)
            expect(keys).toContain('toggle-disabled')
            expect(keys).toContain('edit')
            expect(keys).toContain('delete')
        })

        it('delete action is flagged isDanger', () => {
            const del = AUTOMATION_ACTION_DEFS.find(a => a.key === 'delete')!
            expect(del.isDanger).toBe(true)
        })

        it('route-navigating actions provide routeName + routeParams', () => {
            for (const action of AUTOMATION_ACTION_DEFS) {
                if (action.routeName) {
                    expect(typeof action.routeParams).toBe('function')
                }
            }
        })
    })

    describe('AUTOMATION_SORT_OPTIONS', () => {
        it('all entries have key + labelKey', () => {
            for (const opt of AUTOMATION_SORT_OPTIONS) {
                expect(opt.key).toBeTruthy()
                expect(opt.labelKey).toBeTruthy()
            }
        })
    })

    describe('AUTOMATION_STAT_DEFS', () => {
        it('includes enabled and disabled stats', () => {
            const keys = AUTOMATION_STAT_DEFS.map(s => s.key)
            expect(keys).toContain('enabled')
            expect(keys).toContain('disabled')
        })

        // NOTE: per-type automation stat chips were intentionally dropped
        // (clutter — type is already a filter); statDefs.test.ts guards their
        // absence. The old "per-type stat keys" test here was resurrected by
        // photo-enhancements' squashed rebuild snapshot and has been removed.
    })

    describe('AUTOMATION_LIST_SETTINGS', () => {
        it('sets settingsKey to "automation"', () => {
            expect(AUTOMATION_LIST_SETTINGS.settingsKey).toBe('automation')
        })

        it('enables statsFooter and mobileList and settingsPanel', () => {
            expect(AUTOMATION_LIST_SETTINGS.statsFooter).toBe(true)
            expect(AUTOMATION_LIST_SETTINGS.mobileList).toBe(true)
            expect(AUTOMATION_LIST_SETTINGS.settingsPanel).toBe(true)
        })

        it('showStats default is true', () => {
            expect(AUTOMATION_LIST_SETTINGS.defaults?.showStats).toBe(true)
        })
    })
})
