import {describe, it, expect} from 'vitest'

import {
    COOKLOG_FILTER_DEFS,
    COOKLOG_ACTION_DEFS,
    COOKLOG_LIST_SETTINGS,
    COOKLOG_SORT_OPTIONS,
} from '@/composables/modellist/CookLogList'

describe('CookLogList config', () => {
    it('filter defs declare the backend-supported recipe filter', () => {
        const recipe = COOKLOG_FILTER_DEFS.find(d => d.key === 'recipe')
        expect(recipe).toBeDefined()
        expect(recipe?.type).toBe('model-select')
        expect(recipe?.modelName).toBe('Recipe')
    })

    it('action defs include edit + delete navigation entries', () => {
        const keys = COOKLOG_ACTION_DEFS.map(a => a.key)
        expect(keys).toContain('edit')
        expect(keys).toContain('delete')
        const del = COOKLOG_ACTION_DEFS.find(a => a.key === 'delete')
        expect(del?.isDanger).toBe(true)
    })

    it('list settings target the cookLog settings namespace', () => {
        expect(COOKLOG_LIST_SETTINGS.settingsKey).toBe('cookLog')
        expect(COOKLOG_LIST_SETTINGS.settingsPanel).toBe(true)
        expect(COOKLOG_LIST_SETTINGS.statsFooter).toBeFalsy()
    })

    it('sort options default newest-first on timestamp', () => {
        const created = COOKLOG_SORT_OPTIONS.find(s => s.key === 'created_at')
        expect(created?.defaultDescending).toBe(true)
    })
})
