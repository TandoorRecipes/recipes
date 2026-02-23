import {computed, type ComputedRef} from 'vue'
import type {Model} from '@/types/Models'
import {useUrlFilters} from '@/composables/useUrlFilters'

/**
 * Model-list specific filter composable.
 * Thin wrapper around useUrlFilters that derives filterDefs from the Model config.
 */
export function useModelListFilters(model: ComputedRef<Model | undefined>) {
    const filterDefs = computed(() => model.value?.filterDefs ?? [])
    return useUrlFilters(filterDefs)
}
