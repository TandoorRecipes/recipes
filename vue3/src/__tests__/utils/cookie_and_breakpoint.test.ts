import { describe, it, expect } from 'vitest'
import { homePageCols } from '@/utils/breakpoint_utils'
import { getCookie } from '@/utils/cookie'

describe('breakpoint_utils', () => {
    describe('homePageCols', () => {
        it('returns 1 for xs', () => expect(homePageCols('xs')).toBe(1))
        it('returns 2 for sm', () => expect(homePageCols('sm')).toBe(2))
        it('returns 4 for md', () => expect(homePageCols('md')).toBe(4))
        it('returns 4 for lg', () => expect(homePageCols('lg')).toBe(4))
        it('returns 5 for xl', () => expect(homePageCols('xl')).toBe(5))
        it('returns 6 for xxl', () => expect(homePageCols('xxl')).toBe(6))
        it('returns 1 for unknown breakpoint', () => expect(homePageCols('unknown')).toBe(1))
    })
})

describe('cookie', () => {
    describe('getCookie', () => {
        it('returns null when no cookies exist', () => {
            Object.defineProperty(document, 'cookie', { value: '', writable: true, configurable: true })
            expect(getCookie('csrftoken')).toBeNull()
        })

        it('returns cookie value when it exists', () => {
            Object.defineProperty(document, 'cookie', { value: 'csrftoken=abc123; other=xyz', writable: true, configurable: true })
            expect(getCookie('csrftoken')).toBe('abc123')
        })

        it('returns null when cookie name not found', () => {
            Object.defineProperty(document, 'cookie', { value: 'other=xyz', writable: true, configurable: true })
            expect(getCookie('csrftoken')).toBeNull()
        })

        it('decodes URI-encoded values', () => {
            Object.defineProperty(document, 'cookie', { value: 'token=hello%20world', writable: true, configurable: true })
            expect(getCookie('token')).toBe('hello world')
        })
    })
})
