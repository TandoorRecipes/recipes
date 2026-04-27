import { describe, it, expect, beforeEach } from 'vitest'
import { useDjangoUrls } from '@/composables/useDjangoUrls'

describe('useDjangoUrls', () => {
    beforeEach(() => {
        // jsdom defaults baseURI to 'about:blank' — set a realistic one
        const base = document.createElement('base')
        base.href = 'http://localhost:8000/'
        document.head.appendChild(base)
    })

    describe('getDjangoUrl', () => {
        it('returns path with leading slash and trailing slash', () => {
            const { getDjangoUrl } = useDjangoUrls()
            expect(getDjangoUrl('api/recipe')).toBe('/api/recipe/')
        })

        it('strips duplicate leading slash', () => {
            const { getDjangoUrl } = useDjangoUrls()
            expect(getDjangoUrl('/api/recipe')).toBe('/api/recipe/')
        })

        it('does not double trailing slash', () => {
            const { getDjangoUrl } = useDjangoUrls()
            expect(getDjangoUrl('api/recipe/')).toBe('/api/recipe/')
        })

        it('respects appendSlash=false', () => {
            const { getDjangoUrl } = useDjangoUrls()
            expect(getDjangoUrl('api/recipe', false)).toBe('/api/recipe')
        })
    })

    describe('getFullUrl', () => {
        it('includes origin', () => {
            const { getFullUrl } = useDjangoUrls()
            const result = getFullUrl('api/recipe')
            expect(result).toContain('http://')
            expect(result).toContain('/api/recipe/')
        })
    })

    describe('basePath', () => {
        it('reflects the document base URI without trailing slash', () => {
            const { basePath } = useDjangoUrls()
            expect(basePath).toBe('')
        })
    })
})
