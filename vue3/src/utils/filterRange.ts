import type {RangeValue} from '@/composables/modellist/types'

export function parseRangePart(raw: string | undefined, side: 'gte' | 'lte'): string {
    if (!raw) return ''
    const sepIdx = raw.indexOf('~')
    if (sepIdx < 0) return ''
    return side === 'gte' ? raw.slice(0, sepIdx) : raw.slice(sepIdx + 1)
}

export function buildRangeUpdate(raw: string | undefined, side: 'gte' | 'lte', value: string | null | undefined): RangeValue {
    return {
        gte: side === 'gte' ? (value || null) : (parseRangePart(raw, 'gte') || null),
        lte: side === 'lte' ? (value || null) : (parseRangePart(raw, 'lte') || null),
    }
}
