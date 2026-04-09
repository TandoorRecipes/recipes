import { describe, it, expect } from 'vitest'
import { ref } from 'vue'

import { useUnratedOnlyFilter } from '@/composables/useUnratedOnlyFilter'

describe('useUnratedOnlyFilter', () => {
    describe('getter', () => {
        it('returns undefined when rating is undefined', () => {
            const rating = ref<number | undefined>(undefined)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)
            expect(model.value).toBeUndefined()
        })

        it('returns true when rating === 0', () => {
            const rating = ref<number | undefined>(0)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)
            expect(model.value).toBe(true)
        })

        it('returns undefined when rating is a nonzero number', () => {
            const rating = ref<number | undefined>(3)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)
            expect(model.value).toBeUndefined()
        })
    })

    describe('setter', () => {
        it('setting to true writes 0 to rating and clears gte/lte', () => {
            const rating = ref<number | undefined>(3)
            const gte = ref<number | undefined>(2)
            const lte = ref<number | undefined>(4)
            const model = useUnratedOnlyFilter(rating, gte, lte)

            model.value = true

            expect(rating.value).toBe(0)
            expect(gte.value).toBeUndefined()
            expect(lte.value).toBeUndefined()
        })

        it('setting to undefined clears rating when rating was 0', () => {
            const rating = ref<number | undefined>(0)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)

            model.value = undefined

            expect(rating.value).toBeUndefined()
        })

        it('setting to undefined does NOT clear rating when rating was nonzero', () => {
            const rating = ref<number | undefined>(4)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)

            model.value = undefined

            expect(rating.value).toBe(4)
        })
    })

    describe('mutual exclusion', () => {
        it('entering a nonzero numeric rating flips the computed to undefined on next read', () => {
            const rating = ref<number | undefined>(0)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)

            expect(model.value).toBe(true)

            // Simulate the user entering a numeric rating via the other filter
            rating.value = 3

            expect(model.value).toBeUndefined()
        })

        it('entering a gte value does not disturb the unrated toggle unless rating also changes', () => {
            // gte is independent — the toggle only derives from `rating`
            const rating = ref<number | undefined>(0)
            const gte = ref<number | undefined>(undefined)
            const lte = ref<number | undefined>(undefined)
            const model = useUnratedOnlyFilter(rating, gte, lte)

            gte.value = 3

            // Toggle still reads true because rating is still 0 — the setter is
            // what enforces mutex on toggle-on; nothing enforces mutex if the user
            // edits gte directly while unrated is on. This is acceptable because
            // the renderer shows only one of the filters active at a time.
            expect(model.value).toBe(true)
        })
    })
})
