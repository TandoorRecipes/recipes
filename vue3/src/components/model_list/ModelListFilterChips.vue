<template>
    <div class="d-flex flex-wrap align-center ga-1 mt-1">
        <v-chip
            v-for="filter in activeFilters"
            :key="filter.key"
            closable
            close-icon="$close"
            :close-label="$t('Remove') + ' ' + chipLabel(filter.def, filter.value)"
            size="small"
            variant="tonal"
            :color="chipColor(filter.def, filter.value)"
            :prepend-icon="filter.def.icon"
            @click="toggleFilter(filter.def, filter.value)"
            @click:close="clearFilter(filter.key)"
        >
            {{ chipLabel(filter.def, filter.value) }}
        </v-chip>
        <v-chip
            v-if="activeFilterCount >= 1"
            variant="text"
            size="small"
            @click="clearAllFilters()"
        >
            {{ $t('Clear_All') }}
        </v-chip>
    </div>
</template>

<script setup lang="ts">
import {computed, shallowReactive, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {FilterDef, FilterValue} from '@/composables/modellist/types'
import {getGenericModelFromString} from '@/types/Models'

const {t} = useI18n()

const props = defineProps<{
    filterDefs: FilterDef[]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
    clearAllFilters: () => void
    activeFilterCount: number
}>()

const emit = defineEmits<{
    'open-filters': []
}>()

const activeFilters = computed(() => {
    const result: {key: string, def: FilterDef, value: string}[] = []
    for (const def of props.filterDefs) {
        const value = props.getFilter(def.key)
        if (value !== undefined && value !== '') {
            result.push({key: def.key, def, value})
        }
    }
    return result
})

/** Cache resolved names for model-select / tag-select filter values: "modelName:id" → display name */
const nameCache = shallowReactive(new Map<string, string>())
/** Track in-flight API requests to prevent duplicate fetches */
const inFlight = new Set<string>()

/** Fetch a single id's display name through the generic model registry. */
function fetchName(modelName: string, idStr: string): void {
    const cacheKey = `${modelName}:${idStr}`
    if (nameCache.has(cacheKey) || inFlight.has(cacheKey)) return
    const id = Number(idStr)
    if (Number.isNaN(id)) {
        nameCache.set(cacheKey, idStr)
        return
    }
    nameCache.set(cacheKey, idStr)  // placeholder with ID prevents duplicate requests
    const gm = getGenericModelFromString(modelName as any, t)
    if (!gm) return
    inFlight.add(cacheKey)
    gm.retrieve(id).then((obj: any) => {
        const label = gm.model.itemLabel ?? 'name'
        nameCache.set(cacheKey, obj[label] ?? idStr)
    }).catch(() => {
        nameCache.set(cacheKey, idStr)
    }).finally(() => {
        inFlight.delete(cacheKey)
    })
}

watch(activeFilters, (filters) => {
    for (const f of filters) {
        if (!f.def.modelName) continue
        if (f.def.type === 'model-select') {
            fetchName(f.def.modelName, f.value)
        } else if (f.def.type === 'tag-select') {
            for (const id of f.value.split('|').filter(s => s.length > 0)) {
                fetchName(f.def.modelName, id)
            }
        }
    }
}, {immediate: true})

function chipLabel(def: FilterDef, value: string): string {
    if (def.type === 'tristate') {
        return t(def.labelKey)
    }
    if (def.type === 'model-select' && def.modelName) {
        const name = nameCache.get(`${def.modelName}:${value}`)
        return name ? `${t(def.labelKey)}: ${name}` : t(def.labelKey)
    }
    if (def.type === 'number') {
        const suffix = def.suffixKey ? ` ${t(def.suffixKey).toLowerCase()}` : ''
        return `${t(def.labelKey)}: ${value}${suffix}`
    }
    if (def.type === 'tag-select') {
        const items = value.split('|').filter(s => s.length > 0)
        if (items.length === 0) return t(def.labelKey)
        if (def.modelName) {
            const names = items.map(id => {
                const cached = nameCache.get(`${def.modelName}:${id}`)
                // While the fetch is in flight, the cache holds the raw id as a placeholder.
                // Treat any value matching the raw id as "still loading" and fall back to count.
                return cached && cached !== id ? cached : null
            })
            if (names.every(n => n !== null)) {
                return `${t(def.labelKey)}: ${names.join(', ')}`
            }
        }
        // Names are still loading — show ellipsis rather than a misleading count.
        // Once the name cache resolves, the chip re-renders with the names above.
        return `${t(def.labelKey)}: …`
    }
    if (def.type === 'number-range' || def.type === 'date-range') {
        const sepIdx = value.indexOf('~')
        const gte = sepIdx >= 0 ? value.slice(0, sepIdx) : ''
        const lte = sepIdx >= 0 ? value.slice(sepIdx + 1) : ''
        if (gte && lte) return `${t(def.labelKey)}: ${gte} → ${lte}`
        if (gte) return `${t(def.labelKey)}: ≥ ${gte}`
        if (lte) return `${t(def.labelKey)}: ≤ ${lte}`
        return t(def.labelKey)
    }
    return t(def.labelKey)
}

function chipColor(def: FilterDef, value: string): string {
    if (def.type === 'tristate') {
        return value === '1' ? 'success' : 'error'
    }
    if (def.type === 'number' || def.type === 'number-range' || def.type === 'date-range') {
        return 'warning'
    }
    return 'primary'
}

function toggleFilter(def: FilterDef, value: string): void {
    if (def.type === 'tristate') {
        props.setFilter(def.key, value === '1' ? '0' : '1')
    } else {
        // multi-value, range, model-select and number filters open the filter panel
        emit('open-filters')
    }
}
</script>
