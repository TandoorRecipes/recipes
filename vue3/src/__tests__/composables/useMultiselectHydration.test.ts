/**
 * Regression coverage for useMultiselectHydration.
 *
 * Characterization tests for the id-array -> object hydration behavior,
 * cache-hit path, and the effectiveObject / multiselectModel get-set
 * contracts. Labeled regression coverage.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {computed, nextTick, ref} from 'vue'

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({push: vi.fn(), replace: vi.fn()}),
}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('vue-i18n', () => ({useI18n: () => ({t: (k: string) => k})}))

import {useMultiselectHydration} from '@/composables/useMultiselectHydration'

function makeFixture(opts: {
    modelValue: any
    mode: string
    object: boolean
    retrieve?: (id: number) => Promise<any>
    itemValue?: string
    itemLabel?: string
}) {
    const modelValue = ref(opts.modelValue)
    const retrieve = opts.retrieve ?? vi.fn(async (id: number) => ({id, name: `Obj${id}`}))
    const modelClass = ref({retrieve} as any)
    const itemValue = computed(() => opts.itemValue ?? 'id')
    const itemLabel = computed(() => opts.itemLabel ?? 'name')
    const refreshOptions = vi.fn()
    const multiselectRef = ref({refreshOptions})

    const h = useMultiselectHydration(
        modelValue,
        modelClass,
        () => opts.mode,
        () => opts.object,
        itemValue,
        itemLabel,
        multiselectRef,
    )
    return {modelValue, modelClass, retrieve, refreshOptions, ...h}
}

describe('useMultiselectHydration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('needsHydration / effectiveObject', () => {
        it('needs hydration when mode is multiple/tags AND object=false', () => {
            const {effectiveObject} = makeFixture({modelValue: [1], mode: 'multiple', object: false})
            expect(effectiveObject.value).toBe(true)  // forced to object mode
        })

        it('does NOT hydrate when object is already true', () => {
            const {effectiveObject} = makeFixture({modelValue: [1], mode: 'tags', object: true})
            expect(effectiveObject.value).toBe(true)  // caller already in object mode
        })

        it('does NOT hydrate in single-select mode', () => {
            const {effectiveObject} = makeFixture({modelValue: 1, mode: 'single', object: false})
            expect(effectiveObject.value).toBe(false)  // caller's own object setting wins
        })
    })

    describe('multiselectModel.get (id-array → placeholder objects)', () => {
        it('returns placeholder objects with id as label when cache is empty', () => {
            const {multiselectModel} = makeFixture({
                modelValue: [42, 7],
                mode: 'multiple',
                object: false,
            })
            expect(multiselectModel.value).toEqual([
                {id: 42, name: '42'},
                {id: 7, name: '7'},
            ])
        })

        it('returns cached objects with real labels after hydrate()', async () => {
            const {multiselectModel, hydrate} = makeFixture({
                modelValue: [1, 2],
                mode: 'tags',
                object: false,
            })
            await hydrate()
            await nextTick()
            expect(multiselectModel.value).toEqual([
                {id: 1, name: 'Obj1'},
                {id: 2, name: 'Obj2'},
            ])
        })

        it('passes modelValue through untouched when hydration not needed', () => {
            const passThrough = [{id: 1, name: 'Real'}]
            const {multiselectModel} = makeFixture({
                modelValue: passThrough,
                mode: 'multiple',
                object: true,  // already in object mode
            })
            expect(multiselectModel.value).toStrictEqual(passThrough)
        })
    })

    describe('multiselectModel.set (object-array → id-array)', () => {
        it('writes id-array back to modelValue when hydrating', () => {
            const {modelValue, multiselectModel} = makeFixture({
                modelValue: [],
                mode: 'multiple',
                object: false,
            })
            multiselectModel.value = [{id: 10, name: 'Ten'}, {id: 20, name: 'Twenty'}]
            expect(modelValue.value).toEqual([10, 20])
        })

        it('passes value through when hydration is disabled', () => {
            const {modelValue, multiselectModel} = makeFixture({
                modelValue: [],
                mode: 'tags',
                object: true,  // caller handles objects itself
            })
            const payload = [{id: 1}, {id: 2}]
            multiselectModel.value = payload
            expect(modelValue.value).toStrictEqual(payload)
        })
    })

    describe('hydrate()', () => {
        it('fetches uncached ids and populates the cache', async () => {
            const retrieve = vi.fn(async (id: number) => ({id, name: `X${id}`}))
            const {hydrate, retrieve: r} = makeFixture({
                modelValue: [1, 2, 3],
                mode: 'multiple',
                object: false,
                retrieve,
            })
            await hydrate()
            expect(r).toHaveBeenCalledTimes(3)
        })

        it('cache hit: a second hydrate() with same ids does NOT refetch', async () => {
            const retrieve = vi.fn(async (id: number) => ({id, name: `X${id}`}))
            const f = makeFixture({
                modelValue: [1, 2],
                mode: 'multiple',
                object: false,
                retrieve,
            })
            await f.hydrate()
            expect(f.retrieve).toHaveBeenCalledTimes(2)
            await f.hydrate()  // same ids, already cached
            expect(f.retrieve).toHaveBeenCalledTimes(2)  // no additional fetches
        })

        it('in-flight dedup: parallel hydrate() calls for the same id fetch once', async () => {
            let resolveFetch: (v: any) => void
            const pending = new Promise<any>((res) => { resolveFetch = res })
            const retrieve = vi.fn(async (id: number) => {
                await pending
                return {id, name: `X${id}`}
            })
            const f = makeFixture({
                modelValue: [1],
                mode: 'multiple',
                object: false,
                retrieve,
            })
            const p1 = f.hydrate()
            const p2 = f.hydrate()
            resolveFetch!(undefined)
            await Promise.all([p1, p2])
            expect(f.retrieve).toHaveBeenCalledTimes(1)
        })

        it('skips hydration entirely when modelValue is empty', async () => {
            const f = makeFixture({modelValue: [], mode: 'multiple', object: false})
            await f.hydrate()
            expect(f.retrieve).not.toHaveBeenCalled()
        })

        it('skips failed retrievals without throwing (still fetches other ids)', async () => {
            const retrieve = vi.fn(async (id: number) => {
                if (id === 2) throw new Error('not found')
                return {id, name: `X${id}`}
            })
            const f = makeFixture({
                modelValue: [1, 2, 3],
                mode: 'multiple',
                object: false,
                retrieve,
            })
            await expect(f.hydrate()).resolves.toBeUndefined()
            expect(f.retrieve).toHaveBeenCalledTimes(3)
        })

        it('calls multiselectRef.refreshOptions after hydrate', async () => {
            const f = makeFixture({modelValue: [1], mode: 'multiple', object: false})
            await f.hydrate()
            await nextTick()
            expect(f.refreshOptions).toHaveBeenCalled()
        })
    })

    describe('mergeIntoResults', () => {
        it('appends cached objects not already present in results', async () => {
            const f = makeFixture({modelValue: [1, 2], mode: 'multiple', object: false})
            await f.hydrate()
            const results = [{id: 99, name: 'Search'}]
            const merged = f.mergeIntoResults(results)
            expect(merged.map((r: any) => r.id).sort()).toEqual([1, 2, 99])
        })

        it('does NOT duplicate objects already in results', async () => {
            const f = makeFixture({modelValue: [1], mode: 'multiple', object: false})
            await f.hydrate()
            const results = [{id: 1, name: 'Obj1'}]
            const merged = f.mergeIntoResults(results)
            expect(merged).toHaveLength(1)
        })

        it('returns results untouched when cache is empty', () => {
            const f = makeFixture({modelValue: [], mode: 'multiple', object: false})
            const results = [{id: 99, name: 'X'}]
            expect(f.mergeIntoResults(results)).toBe(results)
        })
    })
})
