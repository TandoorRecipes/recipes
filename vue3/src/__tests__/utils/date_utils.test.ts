import { describe, it, expect } from 'vitest'
import { shiftDateRange, adjustDateRangeLength } from '@/utils/date_utils'

describe('shiftDateRange', () => {
    it('shifts dates forward by positive days', () => {
        const dates = [new Date('2026-03-01'), new Date('2026-03-02')]
        const result = shiftDateRange(dates, 3)

        expect(result[0]!.toISOString().slice(0, 10)).toBe('2026-03-04')
        expect(result[1]!.toISOString().slice(0, 10)).toBe('2026-03-05')
    })

    it('shifts dates backward by negative days', () => {
        const dates = [new Date('2026-03-10')]
        const result = shiftDateRange(dates, -5)

        expect(result[0]!.toISOString().slice(0, 10)).toBe('2026-03-05')
    })

    it('returns empty array for empty input', () => {
        expect(shiftDateRange([], 3)).toEqual([])
    })

    it('does not mutate original array', () => {
        const dates = [new Date('2026-03-01')]
        const original = dates[0]!.getTime()
        shiftDateRange(dates, 5)
        expect(dates[0]!.getTime()).toBe(original)
    })
})

describe('adjustDateRangeLength', () => {
    it('adds days to end of range', () => {
        const dates = [new Date('2026-03-01'), new Date('2026-03-02')]
        const result = adjustDateRangeLength(dates, 2)

        expect(result).toHaveLength(4)
        expect(result[2]!.toISOString().slice(0, 10)).toBe('2026-03-03')
        expect(result[3]!.toISOString().slice(0, 10)).toBe('2026-03-04')
    })

    it('removes days from end of range', () => {
        const dates = [
            new Date('2026-03-01'),
            new Date('2026-03-02'),
            new Date('2026-03-03'),
        ]
        const result = adjustDateRangeLength(dates, -1)

        expect(result).toHaveLength(2)
    })

    it('starts from today when adding days to empty range', () => {
        const today = new Date().toISOString().slice(0, 10)
        const result = adjustDateRangeLength([], 1)
        // empty branch only pushes today, does not enter the for loop
        expect(result).toHaveLength(1)
        expect(result[0]!.toISOString().slice(0, 10)).toBe(today)
    })

    it('preserves the last date even when negative modifier exceeds length', () => {
        // Upstream 7a46c3150 added a `length > 1` guard so the function never
        // removes the only remaining date. A single-element input with a
        // negative modifier should leave the array untouched.
        const dates = [new Date('2026-03-01')]
        const result = adjustDateRangeLength(dates, -5)

        expect(result).toHaveLength(1)
        expect(result[0]!.toISOString().slice(0, 10)).toBe('2026-03-01')
    })

    it('sorts dates before processing', () => {
        const dates = [new Date('2026-03-03'), new Date('2026-03-01')]
        const result = adjustDateRangeLength(dates, 1)

        // Should sort first, then add after last date (03-03)
        expect(result[result.length - 1]!.toISOString().slice(0, 10)).toBe('2026-03-04')
    })
})
