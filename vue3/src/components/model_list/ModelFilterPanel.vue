<template>
    <div v-if="groupedFilterDefs.size > 0">
        <div v-if="activeFilterCount > 0" class="d-flex justify-end px-4 pt-2">
            <v-btn variant="text" density="compact" size="small" @click="clearAllFilters">
                {{ $t('Clear') }}
            </v-btn>
        </div>

        <template v-for="[group, defs] of groupedFilterDefs" :key="group">
            <component :is="group ? CollapsibleSection : 'div'" v-bind="group ? {label: $t(group)} : {}">
                <template v-for="def in defs" :key="def.key">
                    <template v-if="def.hidden" />
                    <TriStateToggle
                        v-else-if="def.type === 'tristate'"
                        :icon="def.icon"
                        :label="$t(def.labelKey)"
                        :model-value="getFilter(def.key)"
                        @update:model-value="setFilter(def.key, $event)"
                    />
                    <div v-else-if="def.type === 'model-select'" class="px-4 py-1">
                        <span class="text-body-2 text-medium-emphasis">{{ $t(def.labelKey) }}</span>
                        <div v-if="def.modelName">
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
                    </div>
                    <RecipeTagFilterGroup
                        v-else-if="def.type === 'tag-group' && def.variantKeys && def.modelName"
                        :label="$t(def.labelKey)"
                        :model-name="def.modelName"
                        :keys="def.variantKeys"
                        :get-filter="getFilter"
                        :set-filter="setFilter"
                        :clear-filter="clearFilter"
                        :compact="false"
                        :show-toggles="def.showToggles !== false"
                        class="mx-2 my-1"
                    />
                    <div v-else-if="def.type === 'tag-select' && def.modelName" class="px-4 py-1">
                        <span class="text-body-2 text-medium-emphasis">{{ $t(def.labelKey) }}</span>
                        <ModelSelect
                            :model="def.modelName"
                            :model-value="parseTagSelect(def.key)"
                            @update:model-value="onTagSelectUpdate(def.key, $event)"
                            :object="false"
                            mode="tags"
                            density="compact"
                            :can-clear="true"
                            :search-on-load="false"
                            :append-to-body="true"
                            :hide-details="true"
                        />
                    </div>
                    <div v-else-if="def.type === 'select'" class="d-flex align-center px-4 py-1">
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
                    <div v-else-if="def.type === 'number'" class="d-flex align-center px-4 py-1">
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
                    <div v-else-if="def.type === 'toggle'" class="d-flex align-center px-4 py-1">
                        <v-switch
                            :label="$t(def.labelKey)"
                            :model-value="getFilter(def.key) === '1'"
                            @update:model-value="setFilter(def.key, $event ? '1' : undefined)"
                            color="primary"
                            density="compact"
                            hide-details
                        />
                    </div>
                    <div v-else-if="def.type === 'rating'" class="px-4 py-1">
                        <div class="d-flex align-center ga-2">
                            <span class="text-subtitle-2 font-weight-bold" style="min-width: 20px">
                                ≥
                                <v-tooltip activator="parent" location="start" :open-delay="400">{{ $t('Minimum') }}</v-tooltip>
                            </span>
                            <v-rating
                                :model-value="parseRangePart(def.key, 'gte') ? Number(parseRangePart(def.key, 'gte')) : 0"
                                @update:model-value="setRangePart(def.key, 'gte', $event > 0 ? String($event) : null)"
                                half-increments
                                clearable
                                hover
                                density="comfortable"
                            />
                        </div>
                        <div class="d-flex align-center ga-2 mt-1">
                            <span class="text-subtitle-2 font-weight-bold" style="min-width: 20px">
                                ≤
                                <v-tooltip activator="parent" location="start" :open-delay="400">{{ $t('Maximum') }}</v-tooltip>
                            </span>
                            <v-rating
                                :model-value="parseRangePart(def.key, 'lte') ? Number(parseRangePart(def.key, 'lte')) : 0"
                                @update:model-value="setRangePart(def.key, 'lte', $event > 0 ? String($event) : null)"
                                half-increments
                                clearable
                                hover
                                density="comfortable"
                            />
                        </div>
                    </div>
                    <div v-else-if="def.type === 'number-range'" class="d-flex align-center px-4 py-1 ga-2">
                        <v-text-field
                            type="number"
                            :label="$t(def.labelKey) + ' ≥'"
                            :model-value="parseRangePart(def.key, 'gte')"
                            @update:model-value="setRangePart(def.key, 'gte', $event)"
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
                            :model-value="parseRangePart(def.key, 'lte')"
                            @update:model-value="setRangePart(def.key, 'lte', $event)"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            persistent-placeholder
                            placeholder=" "
                            class="flex-grow-1"
                        />
                    </div>
                    <div v-else-if="def.type === 'date-range'" class="d-flex align-center px-4 py-1 ga-2">
                        <v-text-field
                            type="date"
                            :label="$t(def.labelKey) + ' ≥'"
                            :model-value="parseRangePart(def.key, 'gte')"
                            @update:model-value="setRangePart(def.key, 'gte', $event)"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            class="flex-grow-1"
                        />
                        <v-text-field
                            type="date"
                            :label="$t(def.labelKey) + ' ≤'"
                            :model-value="parseRangePart(def.key, 'lte')"
                            @update:model-value="setRangePart(def.key, 'lte', $event)"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            class="flex-grow-1"
                        />
                    </div>
                </template>
            </component>
        </template>
    </div>
</template>

<script setup lang="ts">
import type {FilterDef, FilterValue, RangeValue} from '@/composables/modellist/types'
import TriStateToggle from '@/components/common/TriStateToggle.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'
import RecipeTagFilterGroup from '@/components/search/RecipeTagFilterGroup.vue'

const props = defineProps<{
    groupedFilterDefs: Map<string, FilterDef[]>
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
    clearAllFilters: () => void
    activeFilterCount: number
}>()

function parseTagSelect(key: string): number[] {
    const raw = props.getFilter(key)
    if (!raw) return []
    return raw.split(',').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
}

function onTagSelectUpdate(key: string, value: unknown): void {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
        props.setFilter(key, undefined)
        return
    }
    if (Array.isArray(value)) {
        props.setFilter(key, value.map(v => Number(v)).filter(n => !isNaN(n)))
    }
}

/** Read one side of a range filter as a string for input binding. */
function parseRangePart(key: string, side: 'gte' | 'lte'): string {
    const raw = props.getFilter(key)
    if (!raw) return ''
    const sepIdx = raw.indexOf('~')
    if (sepIdx < 0) return ''
    return side === 'gte' ? raw.slice(0, sepIdx) : raw.slice(sepIdx + 1)
}

/** Update one side of a range filter, preserving the other side. */
function setRangePart(key: string, side: 'gte' | 'lte', value: string | null | undefined): void {
    const next: RangeValue = {
        gte: side === 'gte' ? (value || null) : (parseRangePart(key, 'gte') || null),
        lte: side === 'lte' ? (value || null) : (parseRangePart(key, 'lte') || null),
    }
    props.setFilter(key, next)
}

</script>
