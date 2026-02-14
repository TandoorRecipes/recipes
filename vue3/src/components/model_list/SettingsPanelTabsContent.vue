<template>
    <v-tabs-window :model-value="currentTab" @update:model-value="emit('update:currentTab', $event)">
        <v-tabs-window-item value="filters">
            <model-filter-panel
                :grouped-filter-defs="groupedFilterDefs"
                :get-filter="getFilter"
                :set-filter="setFilter"
                :clear-all-filters="clearAllFilters"
                :active-filter-count="activeFilterCount"
            />
        </v-tabs-window-item>

        <v-tabs-window-item value="settings">
            <div class="text-overline px-4 pt-3">{{ $t('Columns') }}</div>

            <div v-for="col in toggleableColumns" :key="col.key" class="d-flex align-center px-4 py-0">
                <v-checkbox
                    :model-value="isColumnVisible(col.key)"
                    @update:model-value="toggleColumn(col.key)"
                    :label="$t(col.title)"
                    hide-details
                    density="compact"
                    class="flex-grow-1"
                />
                <v-btn-toggle
                    v-if="col.hasDisplayMode"
                    :model-value="getDisplayMode(col.key)"
                    @update:model-value="(val: any) => setDisplayMode(col.key, val)"
                    mandatory
                    density="compact"
                    class="ms-2"
                >
                    <v-btn value="icon" size="x-small">
                        <v-icon size="small">fa-solid fa-icons</v-icon>
                    </v-btn>
                    <v-btn value="text" size="x-small">
                        <v-icon size="small">fa-solid fa-font</v-icon>
                    </v-btn>
                </v-btn-toggle>
            </div>

            <v-divider class="my-2" />

            <div class="text-overline px-4 pt-2">{{ $t('Table') }}</div>
            <div class="px-4 py-1">
                <v-switch
                    :model-value="showColumnHeaders"
                    @update:model-value="emit('update:showColumnHeaders', $event)"
                    :label="$t('ShowColumnHeaders')"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </div>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import {PropType} from 'vue'
import type {ModelTableHeaders} from '@/types/Models'
import type {ModelFilterDef} from '@/composables/modellist/types'
import ModelFilterPanel from '@/components/model_list/filters/ModelFilterPanel.vue'

defineProps({
    currentTab: {type: String, required: true},
    showColumnHeaders: {type: Boolean, required: true},
    toggleableColumns: {type: Array as PropType<ModelTableHeaders[]>, required: true},
    isColumnVisible: {type: Function as PropType<(key: string) => boolean>, required: true},
    toggleColumn: {type: Function as PropType<(key: string) => void>, required: true},
    getDisplayMode: {type: Function as PropType<(key: string) => 'icon' | 'text'>, required: true},
    setDisplayMode: {type: Function as PropType<(key: string, mode: 'icon' | 'text') => void>, required: true},
    groupedFilterDefs: {type: Object as PropType<Map<string, ModelFilterDef[]>>, default: () => new Map()},
    getFilter: {type: Function as PropType<(key: string) => string | undefined>, default: () => () => undefined},
    setFilter: {type: Function as PropType<(key: string, value: string | undefined) => void>, default: () => () => {}},
    clearAllFilters: {type: Function as PropType<() => void>, default: () => () => {}},
    activeFilterCount: {type: Number, default: 0},
})

const emit = defineEmits(['update:currentTab', 'update:showColumnHeaders'])
</script>
