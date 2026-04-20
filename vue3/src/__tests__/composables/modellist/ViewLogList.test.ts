import {describe, it, expect} from 'vitest'

import {
    VIEWLOG_LIST_SETTINGS,
    VIEWLOG_SORT_OPTIONS,
} from '@/composables/modellist/ViewLogList'

describe('ViewLogList config', () => {
    it('list settings target the viewLog namespace without stats', () => {
        expect(VIEWLOG_LIST_SETTINGS.settingsKey).toBe('viewLog')
        expect(VIEWLOG_LIST_SETTINGS.statsFooter).toBeFalsy()
        expect(VIEWLOG_LIST_SETTINGS.treeEnabled).toBeFalsy()
    })

    it('sort options default newest-first on timestamp', () => {
        const created = VIEWLOG_SORT_OPTIONS.find(s => s.key === 'created_at')
        expect(created?.defaultDescending).toBe(true)
    })
})
