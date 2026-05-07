import { computed, type Ref, type WritableComputedRef } from 'vue'

/**
 * Writable computed over an existing numeric `rating` ref that treats
 * `rating === 0` as "unrated only". Setting the computed to `true` writes 0
 * to the rating ref and clears the gte/lte refs. Setting to `undefined` / `false`
 * clears the rating ref only if it was exactly 0 (so it won't clobber an unrelated
 * numeric value mid-edit).
 *
 * Mutual exclusion with numeric rating filters is state-level: entering a
 * nonzero numeric value naturally flips the getter to `undefined` on next read,
 * so no watcher is needed.
 *
 * Rationale: `?rating=0` is the canonical backwards-compatible URL shape for
 * "unrated" (see backend `by_rating` in cookbook/managers.py). The UI toggle is
 * a derived view over the same state — not a parallel query parameter.
 */
export function useUnratedOnlyFilter(
    rating: Ref<number | undefined>,
    ratingGte: Ref<number | undefined>,
    ratingLte: Ref<number | undefined>,
): WritableComputedRef<boolean | undefined> {
    return computed({
        get: () => (rating.value === 0 ? true : undefined),
        set: (v) => {
            if (v === true) {
                rating.value = 0
                ratingGte.value = undefined
                ratingLte.value = undefined
            } else if (rating.value === 0) {
                rating.value = undefined
            }
        },
    })
}
