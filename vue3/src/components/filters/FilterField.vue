<template>
    <template v-if="def.hidden" />
    <TriStateToggle
        v-else-if="def.type === 'tristate'"
        :icon="def.icon"
        :label="$t(def.labelKey)"
        :model-value="getFilter(def.key)"
        @update:model-value="setFilter(def.key, $event)"
    />
    <div v-else-if="def.type === 'model-select' && def.modelName" :class="wrapClass">
        <span class="text-body-2 text-medium-emphasis">{{ $t(def.labelKey) }}</span>
        <ModelSelect
            :model="def.modelName"
            :model-value="getFilter(def.key) ? Number(getFilter(def.key)) : null"
            @update:model-value="setFilter(def.key, $event != null ? String($event) : undefined)"
            :object="false"
            density="compact"
            mode="single"
            :can-clear="true"
            :search-on-load="true"
            :append-to-body="true"
            :hide-details="true"
        />
    </div>
    <div v-else-if="def.type === 'select'" :class="[wrapClass, 'd-flex align-center']">
        <v-icon v-if="def.icon" :icon="def.icon" size="small" class="me-3 text-medium-emphasis" />
        <v-select
            :label="$t(def.labelKey)"
            :items="(def.options ?? []).map(o => ({value: o.value, title: $t(o.labelKey)}))"
            :model-value="getFilter(def.key) ?? null"
            @update:model-value="setFilter(def.key, $event != null ? String($event) : undefined)"
            density="compact"
            hide-details
            clearable
            class="flex-grow-1"
        />
    </div>
    <div v-else-if="def.type === 'number'" :class="[wrapClass, 'd-flex align-center']">
        <v-icon v-if="def.icon" :icon="def.icon" size="small" class="me-3 text-medium-emphasis" />
        <v-text-field
            type="number"
            :label="$t(def.labelKey)"
            :model-value="getFilter(def.key) ?? ''"
            @update:model-value="setFilter(def.key, $event != null && $event !== '' ? String($event) : undefined)"
            :placeholder="def.defaultValue"
            :suffix="def.suffixKey ? $t(def.suffixKey) : undefined"
            density="compact"
            hide-details
            clearable
            class="flex-grow-1"
        />
    </div>
    <div v-else-if="def.type === 'toggle'" :class="[wrapClass, 'd-flex align-center']">
        <v-switch
            :label="$t(def.labelKey)"
            :model-value="getFilter(def.key) === '1'"
            @update:model-value="setFilter(def.key, $event ? '1' : undefined)"
            color="primary"
            density="compact"
            hide-details
        />
    </div>
    <div v-else-if="def.type === 'rating-half'" :class="[wrapClass, 'd-flex align-center ga-2']">
        <v-icon v-if="def.icon" size="small" :icon="def.icon" class="text-medium-emphasis" />
        <v-rating
            :model-value="getFilter(def.key) ? Number(getFilter(def.key)) : 0"
            @update:model-value="setFilter(def.key, $event > 0 ? String($event) : undefined)"
            half-increments
            clearable
            hover
            density="comfortable"
        />
        <v-btn
            v-if="getFilter(def.key)"
            icon="$close" variant="plain" size="x-small" density="compact"
            @click="clearFilter(def.key)"
        />
    </div>
    <div v-else-if="def.type === 'number-range'" :class="[wrapClass, 'd-flex align-center ga-2']">
        <v-text-field
            type="number"
            :label="$t(def.labelKey) + ' ≥'"
            :model-value="parseRangePart(getFilter(def.key), 'gte')"
            @update:model-value="setFilter(def.key, buildRangeUpdate(getFilter(def.key), 'gte', $event))"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            persistent-placeholder
            placeholder=" "
            class="flex-grow-1"
        />
        <v-text-field
            type="number"
            :label="$t(def.labelKey) + ' ≤'"
            :model-value="parseRangePart(getFilter(def.key), 'lte')"
            @update:model-value="setFilter(def.key, buildRangeUpdate(getFilter(def.key), 'lte', $event))"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            persistent-placeholder
            placeholder=" "
            class="flex-grow-1"
        />
    </div>
    <div v-else-if="def.type === 'date-range'" :class="[wrapClass, 'd-flex align-center ga-2']">
        <v-text-field
            type="date"
            :label="$t(def.labelKey) + ' ≥'"
            :model-value="parseRangePart(getFilter(def.key), 'gte')"
            @update:model-value="setFilter(def.key, buildRangeUpdate(getFilter(def.key), 'gte', $event))"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="flex-grow-1"
        />
        <v-text-field
            type="date"
            :label="$t(def.labelKey) + ' ≤'"
            :model-value="parseRangePart(getFilter(def.key), 'lte')"
            @update:model-value="setFilter(def.key, buildRangeUpdate(getFilter(def.key), 'lte', $event))"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="flex-grow-1"
        />
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {FilterDef, FilterValue} from '@/composables/modellist/types'
import {parseRangePart, buildRangeUpdate} from '@/utils/filterRange'
import TriStateToggle from '@/components/common/TriStateToggle.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'

const props = withDefaults(defineProps<{
    def: FilterDef
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
    compact?: boolean
}>(), {
    compact: false,
})

const wrapClass = computed(() => props.compact ? 'mt-1' : 'px-4 py-1')
</script>
