<template>
    <v-card class="pa-2">
        <span class="text-subtitle-2">{{ $t(group) }}</span>
        <template v-for="def in visibleDefs" :key="def.key">
            <div v-if="def.type === 'rating'" class="mt-1">
                <div class="d-flex align-center ga-2">
                    <v-icon size="small" icon="fa-solid fa-greater-than-equal" class="text-medium-emphasis" />
                    <v-rating
                        :model-value="parseRangePart(def.key, 'gte') ? Number(parseRangePart(def.key, 'gte')) : 0"
                        @update:model-value="setRangePart(def.key, 'gte', $event > 0 ? String($event) : null)"
                        half-increments clearable hover density="comfortable"
                    />
                </div>
                <div class="d-flex align-center ga-2 mt-1">
                    <v-icon size="small" icon="fa-solid fa-less-than-equal" class="text-medium-emphasis" />
                    <v-rating
                        :model-value="parseRangePart(def.key, 'lte') ? Number(parseRangePart(def.key, 'lte')) : 0"
                        @update:model-value="setRangePart(def.key, 'lte', $event > 0 ? String($event) : null)"
                        half-increments clearable hover density="comfortable"
                    />
                </div>
            </div>
            <div v-else-if="def.type === 'toggle'" class="mt-1">
                <v-switch
                    :label="$t(def.labelKey)"
                    :model-value="getFilter(def.key) === '1'"
                    @update:model-value="setFilter(def.key, $event ? '1' : undefined)"
                    color="primary" density="compact" hide-details
                />
            </div>
            <div v-else-if="def.type === 'tristate'" class="d-flex align-center mt-1">
                <span class="text-body-2 flex-grow-1">{{ $t(def.labelKey) }}</span>
                <v-btn-toggle
                    :model-value="getFilter(def.key) ?? 'any'"
                    @update:model-value="setFilter(def.key, $event === 'any' ? undefined : $event)"
                    mandatory density="compact"
                >
                    <v-btn value="any" size="x-small">{{ $t('Any') }}</v-btn>
                    <v-btn value="1" size="x-small">{{ $t('Yes') }}</v-btn>
                    <v-btn value="0" size="x-small">{{ $t('No') }}</v-btn>
                </v-btn-toggle>
            </div>
            <div v-else-if="def.type === 'number-range'" class="d-flex align-center ga-2 mt-1">
                <v-text-field
                    type="number" :label="$t(def.labelKey) + ' ≥'"
                    :model-value="parseRangePart(def.key, 'gte')"
                    @update:model-value="setRangePart(def.key, 'gte', $event)"
                    variant="outlined" density="compact" hide-details clearable persistent-placeholder placeholder=" "
                    class="flex-grow-1"
                />
                <v-text-field
                    type="number" :label="$t(def.labelKey) + ' ≤'"
                    :model-value="parseRangePart(def.key, 'lte')"
                    @update:model-value="setRangePart(def.key, 'lte', $event)"
                    variant="outlined" density="compact" hide-details clearable persistent-placeholder placeholder=" "
                    class="flex-grow-1"
                />
            </div>
            <div v-else-if="def.type === 'date-range'" class="d-flex align-center ga-2 mt-1">
                <v-text-field
                    type="date" :label="$t(def.labelKey) + ' ≥'"
                    :model-value="parseRangePart(def.key, 'gte')"
                    @update:model-value="setRangePart(def.key, 'gte', $event)"
                    variant="outlined" density="compact" hide-details clearable
                    class="flex-grow-1"
                />
                <v-text-field
                    type="date" :label="$t(def.labelKey) + ' ≤'"
                    :model-value="parseRangePart(def.key, 'lte')"
                    @update:model-value="setRangePart(def.key, 'lte', $event)"
                    variant="outlined" density="compact" hide-details clearable
                    class="flex-grow-1"
                />
            </div>
        </template>
    </v-card>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {FilterDef, FilterValue, RangeValue} from '@/composables/modellist/types'

const props = defineProps<{
    group: string
    defs: FilterDef[]
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
}>()

const visibleDefs = computed(() => props.defs.filter(d => !d.hidden))

function parseRangePart(key: string, side: 'gte' | 'lte'): string {
    const raw = props.getFilter(key)
    if (!raw) return ''
    const sepIdx = raw.indexOf('~')
    if (sepIdx < 0) return ''
    return side === 'gte' ? raw.slice(0, sepIdx) : raw.slice(sepIdx + 1)
}

function setRangePart(key: string, side: 'gte' | 'lte', value: string | null | undefined): void {
    const next: RangeValue = {
        gte: side === 'gte' ? (value || null) : (parseRangePart(key, 'gte') || null),
        lte: side === 'lte' ? (value || null) : (parseRangePart(key, 'lte') || null),
    }
    props.setFilter(key, next)
}
</script>
