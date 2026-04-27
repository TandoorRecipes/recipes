import { describe, it, expect } from 'vitest'
import {
    getNestedProperty,
    toNumberArray,
    stringToBool,
    boolOrUndefinedTransformer,
    numberOrUndefinedTransformer,
} from '@/utils/utils'

describe('getNestedProperty', () => {
    it('returns top-level property', () => {
        expect(getNestedProperty({ a: 1 }, 'a')).toBe(1)
    })

    it('returns nested property via dot notation', () => {
        expect(getNestedProperty({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
    })

    it('returns undefined for missing path', () => {
        expect(getNestedProperty({ a: 1 }, 'b')).toBeUndefined()
    })

    it('returns undefined for deep missing path', () => {
        expect(getNestedProperty({ a: { b: 1 } }, 'a.c.d')).toBeUndefined()
    })

    it('returns undefined when traversing through a primitive', () => {
        expect(getNestedProperty({ a: 'string' }, 'a.b')).toBeUndefined()
    })

    it('handles null object', () => {
        expect(getNestedProperty(null, 'a')).toBeUndefined()
    })
})

describe('toNumberArray', () => {
    it('converts a single string to a number array', () => {
        expect(toNumberArray('5')).toEqual([5])
    })

    it('converts an array of strings to numbers', () => {
        expect(toNumberArray(['1', '2', '3'])).toEqual([1, 2, 3])
    })

    it('handles NaN for non-numeric strings', () => {
        expect(toNumberArray('abc')).toEqual([NaN])
    })
})

describe('stringToBool', () => {
    it('converts "true" to true', () => {
        expect(stringToBool('true')).toBe(true)
    })

    it('converts "false" to false', () => {
        expect(stringToBool('false')).toBe(false)
    })

    it('returns undefined for other strings', () => {
        expect(stringToBool('yes')).toBeUndefined()
        expect(stringToBool('')).toBeUndefined()
    })
})

describe('boolOrUndefinedTransformer', () => {
    describe('get', () => {
        it('converts "true" string to true', () => {
            expect(boolOrUndefinedTransformer.get('true')).toBe(true)
        })

        it('converts "false" string to false', () => {
            expect(boolOrUndefinedTransformer.get('false')).toBe(false)
        })

        it('returns undefined for null', () => {
            expect(boolOrUndefinedTransformer.get(null)).toBeUndefined()
        })

        it('returns undefined for undefined', () => {
            expect(boolOrUndefinedTransformer.get(undefined)).toBeUndefined()
        })
    })

    describe('set', () => {
        it('converts true to "true"', () => {
            expect(boolOrUndefinedTransformer.set(true)).toBe('true')
        })

        it('converts false to "false"', () => {
            expect(boolOrUndefinedTransformer.set(false)).toBe('false')
        })

        it('returns undefined for null', () => {
            expect(boolOrUndefinedTransformer.set(null)).toBeUndefined()
        })
    })
})

describe('numberOrUndefinedTransformer', () => {
    describe('get', () => {
        it('converts numeric string to number', () => {
            expect(numberOrUndefinedTransformer.get('42')).toBe(42)
        })

        it('converts decimal string to number', () => {
            expect(numberOrUndefinedTransformer.get('3.14')).toBe(3.14)
        })

        it('returns undefined for null', () => {
            expect(numberOrUndefinedTransformer.get(null)).toBeUndefined()
        })
    })

    describe('set', () => {
        it('converts value to string', () => {
            expect(numberOrUndefinedTransformer.set('42')).toBe('42')
        })

        it('returns undefined for null', () => {
            expect(numberOrUndefinedTransformer.set(null)).toBeUndefined()
        })
    })
})
