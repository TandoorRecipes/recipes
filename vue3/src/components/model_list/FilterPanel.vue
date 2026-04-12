<template>
    <div v-if="visibleGroupedDefs.size > 0">
        <div v-if="activeFilterCount > 0" class="d-flex justify-end px-4 pt-2">
            <v-btn variant="text" density="compact" size="small" @click="clearAllFilters">
                {{ $t('Clear') }}
            </v-btn>
        </div>

        <template v-for="[group, defs] of visibleGroupedDefs" :key="group">
            <component :is="group ? CollapsibleSection : 'div'" v-bind="group ? {label: $t(group)} : {}">
                <template v-for="def in defs" :key="def.key">
                    <RecipeTagFilterGroup
                        v-if="def.type === 'tag-group' && def.variantKeys && def.modelName"
                        :label="$t(def.labelKey)"
                        :model-name="def.modelName"
                        :keys="def.variantKeys"
                        :get-filter="getFilter"
                        :set-filter="setFilter"
                        :clear-filter="clearFilter"
                        :compact="false"
                        :show-toggles="def.showToggles !== false"
                        :expandable="def.expandable !== false"
                        :select-placeholder="def.selectPlaceholder"
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
                    <FilterField
                        v-else
                        :def="def"
                        :get-filter="getFilter"
                        :set-filter="setFilter"
                        :clear-filter="clearFilter"
                    />
                </template>
            </component>
        </template>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {FilterDef, FilterValue} from '@/composables/modellist/types'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'
import RecipeTagFilterGroup from '@/components/search/RecipeTagFilterGroup.vue'
import FilterField from '@/components/filters/FilterField.vue'

const props = defineProps<{
    groupedFilterDefs: Map<string, FilterDef[]>
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: FilterValue) => void
    clearFilter: (key: string) => void
    clearAllFilters: () => void
    activeFilterCount: number
}>()

const visibleGroupedDefs = computed(() => {
    const filtered = new Map<string, FilterDef[]>()
    for (const [group, defs] of props.groupedFilterDefs) {
        const visible = defs.filter(d => !d.hidden)
        if (visible.length > 0) filtered.set(group, visible)
    }
    return filtered
})

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
</script>
