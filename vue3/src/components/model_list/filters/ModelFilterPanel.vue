<template>
    <div v-if="groupedFilterDefs.size > 0">
        <div v-if="activeFilterCount > 0" class="d-flex justify-end px-4 pt-2">
            <v-btn variant="text" density="compact" size="small" @click="clearAllFilters">
                {{ $t('Clear') }}
            </v-btn>
        </div>

        <template v-for="[group, defs] of groupedFilterDefs" :key="group">
            <button v-if="group"
                class="text-overline px-4 pt-3 d-block w-100 text-start"
                style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                :aria-expanded="isGroupOpen(group)"
                @click="toggleGroup(group)"
            >
                {{ $t(group) }}
            </button>

            <v-expand-transition v-if="group">
                <div v-show="isGroupOpen(group)">
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
                </div>
            </v-expand-transition>

            <template v-if="!group">
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
        </template>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import type {ModelFilterDef} from '@/composables/modellist/types'
import TriStateFilter from './TriStateFilter.vue'
import ModelSelectFilter from './ModelSelectFilter.vue'

defineProps<{
    groupedFilterDefs: Map<string, ModelFilterDef[]>
    getFilter: (key: string) => string | undefined
    setFilter: (key: string, value: string | undefined) => void
    clearAllFilters: () => void
    activeFilterCount: number
}>()

const openGroups = ref<Record<string, boolean>>({})

function isGroupOpen(group: string): boolean {
    return openGroups.value[group] !== false
}

function toggleGroup(group: string) {
    openGroups.value[group] = !isGroupOpen(group)
}
</script>
