<template>
    <div class="d-flex flex-wrap align-center ga-1 mt-1">
        <v-chip
            v-for="filter in activeFilters"
            :key="filter.key"
            closable
            close-icon="$close"
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
            v-if="activeFilterCount >= 2"
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
import type {FilterDef} from '@/composables/modellist/types'
import {getGenericModelFromString} from '@/types/Models'

const {t} = useI18n()

const props = defineProps<{
    filterDefs: FilterDef[]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: string | undefined) => void
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

/** Cache resolved names for model-select filters: "modelName:id" → display name */
const nameCache = shallowReactive(new Map<string, string>())
/** Track in-flight API requests to prevent duplicate fetches */
const inFlight = new Set<string>()

watch(activeFilters, (filters) => {
    const modelSelectFilters = filters.filter(f => f.def.type === 'model-select' && f.def.modelName)
    for (const f of modelSelectFilters) {
        const cacheKey = `${f.def.modelName}:${f.value}`
        if (nameCache.has(cacheKey) || inFlight.has(cacheKey)) continue
        const id = Number(f.value)
        if (Number.isNaN(id)) {
            nameCache.set(cacheKey, String(f.value))
            continue
        }
        nameCache.set(cacheKey, String(f.value))  // placeholder with ID prevents duplicate requests
        const gm = getGenericModelFromString(f.def.modelName!, t)
        if (!gm) continue
        inFlight.add(cacheKey)
        gm.retrieve(id).then((obj: any) => {
            const label = gm.model.itemLabel ?? 'name'
            nameCache.set(cacheKey, obj[label] ?? String(f.value))
        }).catch(() => {
            nameCache.set(cacheKey, String(f.value))
        }).finally(() => {
            inFlight.delete(cacheKey)
        })
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
    return t(def.labelKey)
}

function chipColor(def: FilterDef, value: string): string {
    if (def.type === 'tristate') {
        return value === '1' ? 'success' : 'error'
    }
    if (def.type === 'number') {
        return 'warning'
    }
    return 'primary'
}

function toggleFilter(def: FilterDef, value: string): void {
    if (def.type === 'tristate') {
        props.setFilter(def.key, value === '1' ? '0' : '1')
    } else {
        // model-select and number filters open the filter panel
        emit('open-filters')
    }
}
</script>
