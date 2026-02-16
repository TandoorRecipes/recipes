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
            <template v-if="actionDefs.length > 0">
                <div class="text-overline px-4 pt-3">{{ $t('QuickActions') }}</div>
                <div class="text-caption px-4 text-medium-emphasis">{{ $t('QuickActionsDescription') }}</div>

                <div class="d-flex flex-wrap ga-2 px-4 py-2">
                    <v-chip
                        v-for="action in actionDefs"
                        :key="action.key"
                        :prepend-icon="isSelected(action.key) ? 'fa-solid fa-check' : action.icon"
                        :variant="isSelected(action.key) ? 'flat' : 'outlined'"
                        :color="isSelected(action.key) ? 'primary' : undefined"
                        :disabled="!isSelected(action.key) && selectedCount >= 4"
                        size="small"
                        label
                        @click="toggleQuickAction(action.key)"
                    >
                        {{ $t(action.labelKey) }}
                    </v-chip>
                </div>
                <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ selectedCount }}/4 {{ $t('Selected') }}</div>

                <v-divider class="my-2" />
            </template>

            <template v-if="!mobile">
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
            </template>

            <div class="px-4 py-1" v-if="treeAvailable">
                <v-switch
                    :model-value="treeEnabled"
                    @update:model-value="emit('update:treeEnabled', $event)"
                    :label="$t('TreeView')"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </div>

            <template v-if="hasMobileList && mobile">
                <v-divider class="my-2" />

                <div class="text-caption px-4 text-medium-emphasis">{{ $t('Subtitle') }}</div>
                <div class="d-flex flex-wrap ga-2 px-4 py-2">
                    <v-chip
                        v-for="col in toggleableColumns"
                        :key="'sub-' + col.key"
                        :prepend-icon="isMobileSubtitleSelected(col.key) ? 'fa-solid fa-check' : undefined"
                        :variant="isMobileSubtitleSelected(col.key) ? 'flat' : 'outlined'"
                        :color="isMobileSubtitleSelected(col.key) ? 'primary' : undefined"
                        size="small"
                        label
                        @click="toggleMobileSubtitle(col.key)"
                    >
                        {{ $t(col.title) }}
                    </v-chip>
                </div>
            </template>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import {useDisplay} from 'vuetify'
import type {ModelTableHeaders} from '@/types/Models'
import type {ModelActionDef, ModelFilterDef} from '@/composables/modellist/types'
import ModelFilterPanel from '@/components/model_list/filters/ModelFilterPanel.vue'

const {mobile} = useDisplay()

const props = defineProps({
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
    actionDefs: {type: Array as PropType<ModelActionDef[]>, default: () => []},
    quickActionKeys: {type: Array as PropType<string[]>, default: () => []},
    setQuickActionKeys: {type: Function as PropType<(keys: string[]) => void>, default: () => () => {}},
    treeAvailable: {type: Boolean, default: false},
    treeEnabled: {type: Boolean, default: false},
    hasMobileList: {type: Boolean, default: false},
    mobileSubtitleKeys: {type: Array as PropType<string[]>, default: () => []},
    setMobileSubtitleKeys: {type: Function as PropType<(keys: string[]) => void>, default: () => () => {}},
})

const emit = defineEmits(['update:currentTab', 'update:showColumnHeaders', 'update:treeEnabled'])

const selectedCount = computed(() => props.quickActionKeys.length)

function isSelected(key: string) {
    return props.quickActionKeys.includes(key)
}

function toggleQuickAction(key: string) {
    const keys = [...props.quickActionKeys]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else if (keys.length < 4) {
        keys.push(key)
    }
    props.setQuickActionKeys(keys.filter(k => !!k))
}

// Mobile settings
function isMobileSubtitleSelected(key: string) {
    return props.mobileSubtitleKeys.includes(key)
}

function toggleMobileSubtitle(key: string) {
    const keys = [...props.mobileSubtitleKeys]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else {
        keys.push(key)
    }
    props.setMobileSubtitleKeys(keys)
}

</script>
