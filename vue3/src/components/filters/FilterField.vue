<template>
    <template v-if="def.hidden" />
    <TriStateToggle
        v-else-if="def.type === 'tristate'"
        :icon="def.icon"
        :label="$t(def.labelKey)"
        :model-value="getFilter(def.key)"
        @update:model-value="setFilter(def.key, $event)"
    />
    <div v-else-if="def.type === 'model-select' && def.modelName" :class="wrapClass" @click.stop>
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
    <div v-else-if="def.type === 'rating-unrated'" :class="[wrapClass, 'd-flex align-center ga-2']">
        <v-icon v-if="def.icon" size="small" :icon="def.icon" class="text-medium-emphasis" />
        <!-- "0 / Unrated" position: folds the standalone unrated toggle into the
             rating control. Selecting it sets unrated and clears any star value;
             selecting a star clears unrated (the two are mutually exclusive). -->
        <v-btn
            class="unrated-toggle"
            :variant="isUnrated ? 'flat' : 'tonal'"
            :color="isUnrated ? 'warning' : undefined"
            size="small" density="comfortable" min-width="0"
            @click="toggleUnrated"
        >
            0
            <v-tooltip activator="parent" location="top">{{ $t('Unrated') }}</v-tooltip>
        </v-btn>
        <v-rating
            :model-value="unratedRatingValue"
            @update:model-value="onSelectStar"
            half-increments
            clearable
            hover
            density="comfortable"
        />
        <v-btn
            v-if="hasRatingFilter"
            class="rating-clear"
            icon="$close" variant="plain" size="x-small" density="compact"
            @click="clearRatingAndUnrated"
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
    /** When the field renders inside a temporary drawer, avoid teleporting
     *  the dropdown to document.body so clicks on options don't register as
     *  outside-drawer and dismiss the panel (E-2). */
    inDrawer?: boolean
}>(), {
    compact: false,
    inDrawer: false,
})

const wrapClass = computed(() => props.compact ? 'mt-1' : 'px-4 py-1')

// ─── rating-unrated: unified "0 / Unrated" + 1–5 star control ────────────
const isUnrated = computed(() => !!(props.def.unratedKey && props.getFilter(props.def.unratedKey)))

// Star value shown by v-rating. When unrated is active the stars read 0 so the
// "0 / Unrated" position is the only thing highlighted.
const unratedRatingValue = computed(() => {
    if (isUnrated.value) return 0
    const v = props.getFilter(props.def.key)
    return v ? Number(v) : 0
})

const hasRatingFilter = computed(() => isUnrated.value || !!props.getFilter(props.def.key))

function toggleUnrated() {
    const k = props.def.unratedKey
    if (!k) return
    if (isUnrated.value) {
        props.clearFilter(k)            // toggle off → no rating filter
    } else {
        props.setFilter(k, '1')         // 0 stars === unrated (rating IS NULL)
        props.clearFilter(props.def.key) // mutually exclusive with a star floor
    }
}

function onSelectStar(value: number) {
    if (value > 0) {
        props.setFilter(props.def.key, String(value))
        if (props.def.unratedKey) props.clearFilter(props.def.unratedKey)
    } else {
        props.clearFilter(props.def.key)
    }
}

function clearRatingAndUnrated() {
    props.clearFilter(props.def.key)
    if (props.def.unratedKey) props.clearFilter(props.def.unratedKey)
}
</script>
