<template>
    <div v-if="groupedFilterDefs.size > 0">
        <div v-if="activeFilterCount > 0" class="d-flex justify-end px-4 pt-2">
            <v-btn variant="text" density="compact" size="small" @click="clearAllFilters">
                {{ $t('Clear') }}
            </v-btn>
        </div>

        <template v-for="[group, defs] of groupedFilterDefs" :key="group">
            <CollapsibleSection v-if="group" :label="$t(group)">
                <template v-for="def in defs" :key="def.key">
                    <TriStateToggle
                        v-if="def.type === 'tristate'"
                        :icon="def.icon"
                        :label="$t(def.labelKey)"
                        :model-value="getFilter(def.key)"
                        @update:model-value="setFilter(def.key, $event)"
                    />
                    <ModelSelectFilter
                        v-else-if="def.type === 'model-select'"
                        :filter-def="def"
                        :model-value="getFilter(def.key)"
                        @update:model-value="setFilter(def.key, $event)"
                    />
                </template>
            </CollapsibleSection>

            <template v-if="!group">
                <template v-for="def in defs" :key="def.key">
                    <TriStateToggle
                        v-if="def.type === 'tristate'"
                        :icon="def.icon"
                        :label="$t(def.labelKey)"
                        :model-value="getFilter(def.key)"
                        @update:model-value="setFilter(def.key, $event)"
                    />
                    <ModelSelectFilter
                        v-else-if="def.type === 'model-select'"
                        :filter-def="def"
                        :model-value="getFilter(def.key)"
                        @update:model-value="setFilter(def.key, $event)"
                    />
                </template>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import type {FilterDef} from '@/composables/modellist/types'
import TriStateToggle from '@/components/common/TriStateToggle.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ModelSelectFilter from './ModelSelectFilter.vue'

defineProps<{
    groupedFilterDefs: Map<string, FilterDef[]>
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: string | undefined) => void
    clearAllFilters: () => void
    activeFilterCount: number
}>()
</script>
