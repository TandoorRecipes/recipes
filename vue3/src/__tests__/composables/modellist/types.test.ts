import { describe, it, expect } from 'vitest'
import { getAncestorPath } from '@/composables/modellist/types'

describe('getAncestorPath', () => {
    it('returns path before last separator', () => {
        expect(getAncestorPath({ fullName: 'Root > Parent > Child' } as any)).toBe('Root > Parent')
    })

    it('returns null when fullName is absent', () => {
        expect(getAncestorPath({} as any)).toBeNull()
    })

    it('returns null for root item with no separator', () => {
        expect(getAncestorPath({ fullName: 'RootItem' } as any)).toBeNull()
    })

    it('handles single separator', () => {
        expect(getAncestorPath({ fullName: 'Parent > Child' } as any)).toBe('Parent')
    })
})
