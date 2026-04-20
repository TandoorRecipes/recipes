import {describe, it, expect} from 'vitest'

import {
    USERFILE_ACTION_DEFS,
    USERFILE_LIST_SETTINGS,
    USERFILE_SORT_OPTIONS,
} from '@/composables/modellist/UserFileList'

describe('UserFileList config', () => {
    it('action defs include edit + delete navigation entries', () => {
        const keys = USERFILE_ACTION_DEFS.map(a => a.key)
        expect(keys).toContain('edit')
        expect(keys).toContain('delete')
    })

    it('list settings target the userFile namespace', () => {
        expect(USERFILE_LIST_SETTINGS.settingsKey).toBe('userFile')
        expect(USERFILE_LIST_SETTINGS.settingsPanel).toBe(true)
    })

    it('sort options include name and size', () => {
        const keys = USERFILE_SORT_OPTIONS.map(s => s.key)
        expect(keys).toContain('name')
        expect(keys).toContain('file_size_kb')
    })
})
