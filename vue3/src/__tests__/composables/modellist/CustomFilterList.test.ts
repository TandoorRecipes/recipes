import {describe, it, expect} from 'vitest'

import {
    CUSTOMFILTER_FILTER_DEFS,
    CUSTOMFILTER_ACTION_DEFS,
    CUSTOMFILTER_LIST_SETTINGS,
    CUSTOMFILTER_SORT_OPTIONS,
} from '@/composables/modellist/CustomFilterList'

describe('CustomFilterList config', () => {
    it('type filter enumerates the backend model choices', () => {
        const typeFilter = CUSTOMFILTER_FILTER_DEFS.find(d => d.key === 'type')
        expect(typeFilter?.type).toBe('select')
        const values = typeFilter?.options?.map(o => o.value) ?? []
        expect(values).toEqual(expect.arrayContaining(['RECIPE', 'FOOD', 'KEYWORD']))
    })

    it('action defs include edit + delete navigation entries', () => {
        const keys = CUSTOMFILTER_ACTION_DEFS.map(a => a.key)
        expect(keys).toContain('edit')
        expect(keys).toContain('delete')
    })

    it('list settings target the customFilter namespace', () => {
        expect(CUSTOMFILTER_LIST_SETTINGS.settingsKey).toBe('customFilter')
    })

    it('sort options default newest-first on timestamp', () => {
        const created = CUSTOMFILTER_SORT_OPTIONS.find(s => s.key === 'created_at')
        expect(created?.defaultDescending).toBe(true)
    })
})
