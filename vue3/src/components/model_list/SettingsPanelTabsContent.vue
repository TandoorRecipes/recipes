<template>
    <v-tabs-window :model-value="currentTab" @update:model-value="emit('update:currentTab', $event)">
        <v-tabs-window-item value="filters">
            <div class="pa-4 text-body-2 text-medium-emphasis">
                {{ $t('No filters available yet.') }}
            </div>
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

defineProps({
    currentTab: {type: String, required: true},
    showColumnHeaders: {type: Boolean, required: true},
    toggleableColumns: {type: Array as PropType<ModelTableHeaders[]>, required: true},
    isColumnVisible: {type: Function as PropType<(key: string) => boolean>, required: true},
    toggleColumn: {type: Function as PropType<(key: string) => void>, required: true},
    getDisplayMode: {type: Function as PropType<(key: string) => 'icon' | 'text'>, required: true},
    setDisplayMode: {type: Function as PropType<(key: string, mode: 'icon' | 'text') => void>, required: true},
})

const emit = defineEmits(['update:currentTab', 'update:showColumnHeaders'])
</script>
