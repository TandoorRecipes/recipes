import {computed, nextTick, onBeforeMount, reactive, ref, type ComputedRef, type Ref, watch} from 'vue'
import type {GenericModel} from '@/types/Models'

/**
 * Resolves id-arrays into objects so @vueform/multiselect can render tag labels.
 * Transparently switches Multiselect to object-mode; the parent still sees id-arrays.
 */
export function useMultiselectHydration(
    modelValue: Ref<any>,
    modelClass: Ref<GenericModel>,
    mode: () => string,
    object: () => boolean,
    itemValue: ComputedRef<string>,
    itemLabel: ComputedRef<string>,
    multiselectRef: Ref<any>,
) {
    const needsHydration = computed(() =>
        (mode() === 'multiple' || mode() === 'tags') && !object(),
    )
    const effectiveObject = computed(() => needsHydration.value ? true : object())

    const cache = reactive(new Map<string | number, any>())
    const inFlight = new Set<string | number>()
    const version = ref(0)

    const multiselectModel = computed({
        get: () => {
            void version.value
            if (!needsHydration.value) return modelValue.value
            const v = modelValue.value
            if (!Array.isArray(v)) return v
            return v.map((id: any) => {
                const cached = cache.get(id)
                if (cached) return cached
                return {[itemValue.value]: id, [itemLabel.value]: String(id)}
            })
        },
        set: (v: any) => {
            if (!needsHydration.value) {
                modelValue.value = v
                return
            }
            if (Array.isArray(v)) {
                modelValue.value = v.map((o: any) => (o && typeof o === 'object') ? o[itemValue.value] : o)
            } else {
                modelValue.value = v
            }
        },
    })

    async function hydrate() {
        if (!needsHydration.value) return
        const v = modelValue.value
        if (!Array.isArray(v) || v.length === 0) return

        const toFetch = v.filter((id: any) => id != null && !cache.has(id) && !inFlight.has(id))
        if (toFetch.length === 0) return

        for (const id of toFetch) inFlight.add(id)

        await Promise.all(toFetch.map(async (id: any) => {
            try {
                const obj = await modelClass.value.retrieve(Number(id))
                if (obj) cache.set(id, obj)
            } catch { /* skip failed ids */ } finally {
                inFlight.delete(id)
            }
        }))

        version.value++
        await nextTick()
        try { (multiselectRef.value as any)?.refreshOptions?.() } catch { /* not attached */ }
    }

    /** Merge hydrated objects into search results so selected ids always have labels in the dropdown. */
    function mergeIntoResults(results: any[]): any[] {
        if (cache.size === 0) return results
        const key = itemValue.value
        const seen = new Set(results.map((o: any) => o[key]))
        for (const obj of cache.values()) {
            if (!seen.has(obj[key])) results.push(obj)
        }
        return results
    }

    watch(() => modelValue.value, () => { void hydrate() }, {deep: true})

    return { multiselectModel, effectiveObject, version, hydrate, mergeIntoResults }
}
