import { describe, it, expect } from 'vitest'
import { frac } from '@/utils/number_utils'

describe('frac', () => {
    it('returns [0, 0, 1] for zero', () => {
        expect(frac(0, 16, false)).toEqual([0, 0, 1])
    })

    it('returns whole number as improper fraction', () => {
        expect(frac(3, 16, false)).toEqual([0, 3, 1])
    })

    it('returns whole number as mixed fraction', () => {
        expect(frac(3, 16, true)).toEqual([3, 0, 1])
    })

    it('converts 0.5 to 1/2', () => {
        expect(frac(0.5, 16, false)).toEqual([0, 1, 2])
    })

    it('converts 0.5 to 0 1/2 in mixed mode', () => {
        expect(frac(0.5, 16, true)).toEqual([0, 1, 2])
    })

    it('converts 1.5 to 3/2 in improper mode', () => {
        expect(frac(1.5, 16, false)).toEqual([0, 3, 2])
    })

    it('converts 1.5 to 1 1/2 in mixed mode', () => {
        expect(frac(1.5, 16, true)).toEqual([1, 1, 2])
    })

    it('converts 0.25 to 1/4', () => {
        expect(frac(0.25, 16, false)).toEqual([0, 1, 4])
    })

    it('converts 0.333... to 1/3 with max denominator 16', () => {
        expect(frac(1 / 3, 16, false)).toEqual([0, 1, 3])
    })

    it('converts 0.75 to 3/4', () => {
        expect(frac(0.75, 16, false)).toEqual([0, 3, 4])
    })

    it('converts 2.75 to 2 3/4 in mixed mode', () => {
        expect(frac(2.75, 16, true)).toEqual([2, 3, 4])
    })

    it('respects max denominator constraint', () => {
        const result = frac(1 / 7, 8, false)
        // With max denominator 8, 1/7 approximates to 1/7 or nearby
        expect(result[2]).toBeLessThanOrEqual(8)
    })

    it('handles 1/8', () => {
        expect(frac(0.125, 16, false)).toEqual([0, 1, 8])
    })

    it('handles 3/16', () => {
        expect(frac(3 / 16, 16, false)).toEqual([0, 3, 16])
    })
})
