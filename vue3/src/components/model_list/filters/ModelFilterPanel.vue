<template>
    <div v-if="groupedFilterDefs.size > 0">
        <div v-if="activeFilterCount > 0" class="d-flex justify-end px-4 pt-2">
            <v-btn variant="text" density="compact" size="small" @click="clearAllFilters">
                {{ $t('Clear') }}
            </v-btn>
        </div>

        <template v-for="[group, defs] of groupedFilterDefs" :key="group">
            <div v-if="group" class="text-overline px-4 pt-3">{{ $t(group) }}</div>

            <template v-for="def in defs" :key="def.key">
                <tri-state-filter
                    v-if="def.type === 'tristate'"
                    :filter-def="def"
                    :model-value="getFilter(def.key)"
                    @update:model-value="setFilter(def.key, $event)"
                />
                <model-select-filter
                    v-else-if="def.type === 'model-select'"
                    :filter-def="def"
                    :model-value="getFilter(def.key)"
                    @update:model-value="setFilter(def.key, $event)"
                />
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import {type PropType} from 'vue'
import type {ModelFilterDef} from '@/composables/modellist/types'
import TriStateFilter from './TriStateFilter.vue'
import ModelSelectFilter from './ModelSelectFilter.vue'

defineProps({
    groupedFilterDefs: {type: Object as PropType<Map<string, ModelFilterDef[]>>, required: true},
    getFilter: {type: Function as PropType<(key: string) => string | undefined>, required: true},
    setFilter: {type: Function as PropType<(key: string, value: string | undefined) => void>, required: true},
    clearAllFilters: {type: Function as PropType<() => void>, required: true},
    activeFilterCount: {type: Number, required: true},
})
</script>
