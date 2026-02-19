<template>
    <v-navigation-drawer
        v-if="!mobile"
        v-model="isOpen"
        location="right"
        :width="320"
        :permanent="isPinned && isOpen"
        :temporary="!isPinned"
    >
        <v-toolbar density="compact" flat>
            <v-spacer />
            <v-btn
                :icon="isPinned ? 'fa-solid fa-thumbtack' : 'fa-solid fa-thumbtack fa-rotate-90'"
                variant="plain"
                size="small"
                :aria-label="isPinned ? $t('Unpin') : $t('Pin')"
                @click="isPinned = !isPinned"
            />
            <v-btn
                icon="fa-solid fa-times"
                variant="plain"
                size="small"
                :aria-label="$t('Close')"
                @click="isOpen = false"
            />
        </v-toolbar>

        <v-tabs v-model="currentTab" density="compact" grow>
            <v-tab value="filters">
                <v-icon start size="small">fa-solid fa-filter</v-icon>
                {{ $t('Filters') }}
            </v-tab>
            <v-tab value="settings">
                <v-icon start size="small">fa-solid fa-sliders</v-icon>
                {{ $t('Settings') }}
            </v-tab>
        </v-tabs>

        <v-divider />

        <settings-panel-tabs-content
            v-model:current-tab="currentTab"
            :toggleable-columns="toggleableColumns"
            :is-column-visible="isColumnVisible"
            :toggle-column="toggleColumn"
            :get-display-mode="getDisplayMode"
            :set-display-mode="setDisplayMode"
            v-model:show-column-headers="showColumnHeaders"
            :grouped-filter-defs="groupedFilterDefs"
            :get-filter="getFilter"
            :set-filter="setFilter"
            :clear-all-filters="clearAllFilters"
            :active-filter-count="activeFilterCount"
            :action-defs="actionDefs"
            :quick-action-keys="quickActionKeys"
            :set-quick-action-keys="setQuickActionKeys"
            :tree-available="treeAvailable"
            v-model:tree-enabled="treeEnabled"
            :stats-available="statsAvailable"
            v-model:show-stats="showStats"
            :desktop-subtitle-keys="desktopSubtitleKeys"
            :set-desktop-subtitle-keys="setDesktopSubtitleKeys"
        />
    </v-navigation-drawer>

    <v-bottom-sheet v-else v-model="isOpen" scrollable>
        <v-card :style="sheetDragStyle">
            <div
                role="presentation"
                :aria-label="$t('Drag')"
                style="display: flex; justify-content: center; padding: 12px 0 4px; cursor: grab; touch-action: none;"
                @touchstart.passive="onSheetDragStart"
                @touchmove="onSheetDragMove"
                @touchend.passive="onSheetDragEnd"
            >
                <div style="width: 40px; height: 4px; border-radius: 2px; background: rgba(var(--v-theme-on-surface), 0.3);" />
            </div>

            <v-card-title class="d-flex align-center pa-0">
                <v-tabs v-model="currentTab" density="compact" grow>
                    <v-tab value="filters">
                        <v-icon start size="small">fa-solid fa-filter</v-icon>
                        {{ $t('Filters') }}
                    </v-tab>
                    <v-tab value="settings">
                        <v-icon start size="small">fa-solid fa-sliders</v-icon>
                        {{ $t('Settings') }}
                    </v-tab>
                </v-tabs>
                <v-btn icon="fa-solid fa-times" variant="plain" size="small" :aria-label="$t('Close')" @click="isOpen = false" />
            </v-card-title>

            <v-divider />

            <v-card-text style="max-height: 60vh; overflow-y: auto;" class="pa-0">
                <settings-panel-tabs-content
                    v-model:current-tab="currentTab"
                    :toggleable-columns="toggleableColumns"
                    :is-column-visible="isColumnVisible"
                    :toggle-column="toggleColumn"
                    :get-display-mode="getDisplayMode"
                    :set-display-mode="setDisplayMode"
                    v-model:show-column-headers="showColumnHeaders"
                    :grouped-filter-defs="groupedFilterDefs"
                    :get-filter="getFilter"
                    :set-filter="setFilter"
                    :clear-all-filters="clearAllFilters"
                    :active-filter-count="activeFilterCount"
                    :action-defs="actionDefs"
                    :quick-action-keys="quickActionKeys"
                    :set-quick-action-keys="setQuickActionKeys"
                    :tree-available="treeAvailable"
                    v-model:tree-enabled="treeEnabled"
                    :stats-available="statsAvailable"
                    v-model:show-stats="showStats"
                    :has-mobile-list="hasMobileList"
                    :desktop-subtitle-keys="desktopSubtitleKeys"
                    :set-desktop-subtitle-keys="setDesktopSubtitleKeys"
                    :mobile-subtitle-keys="mobileSubtitleKeys"
                    :set-mobile-subtitle-keys="setMobileSubtitleKeys"
                    v-model:show-mobile-headers="showMobileHeaders"
                    :swipe-enabled="swipeEnabled"
                    :set-swipe-enabled="setSwipeEnabled"
                    :swipe-left-keys="swipeLeftKeys"
                    :set-swipe-left-keys="setSwipeLeftKeys"
                    :swipe-right-keys="swipeRightKeys"
                    :set-swipe-right-keys="setSwipeRightKeys"
                />
            </v-card-text>

            <v-divider />

            <v-card-actions>
                <v-btn
                    v-show="currentTab === 'filters'"
                    variant="text"
                    color="primary"
                    @click="clearAllFilters"
                >
                    {{ $t('Clear_All') }}
                </v-btn>
                <v-spacer />
                <v-btn variant="flat" color="primary" @click="isOpen = false">
                    {{ $t('Done') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify'
import type {Model, ModelTableHeaders} from '@/types/Models'
import type {ModelActionDef, ModelFilterDef} from '@/composables/modellist/types'
import {useModelListSettings} from '@/composables/modellist/useModelListSettings'
import SettingsPanelTabsContent from '@/components/model_list/SettingsPanelTabsContent.vue'

const props = withDefaults(defineProps<{
    modelValue: boolean
    activeTab?: string
    model: Model
    allColumns: ModelTableHeaders[]
    isColumnVisible: (key: string) => boolean
    toggleColumn: (key: string) => void
    getDisplayMode: (key: string) => 'icon' | 'text'
    setDisplayMode: (key: string, mode: 'icon' | 'text') => void
    groupedFilterDefs?: Map<string, ModelFilterDef[]>
    getFilter?: (key: string) => string | undefined
    setFilter?: (key: string, value: string | undefined) => void
    clearAllFilters?: () => void
    activeFilterCount?: number
    actionDefs?: ModelActionDef[]
}>(), {
    activeTab: 'settings',
    groupedFilterDefs: () => new Map(),
    getFilter: () => () => undefined,
    setFilter: () => () => {},
    clearAllFilters: () => () => {},
    activeFilterCount: 0,
    actionDefs: () => [],
})

const emit = defineEmits<{
    'update:modelValue': [val: boolean]
    'update:activeTab': [val: string]
}>()

const currentTab = computed({
    get: () => props.activeTab,
    set: (val: string) => emit('update:activeTab', val),
})

const {mobile} = useDisplay()

const settingsKey = computed(() => props.model.listSettings?.settingsKey ?? '')
const {isPinned, showStats, showColumnHeaders, treeEnabled, quickActionKeys,
    desktopSubtitleKeys, mobileSubtitleKeys, swipeEnabled, swipeLeftKeys,
    swipeRightKeys, showMobileHeaders} = useModelListSettings(settingsKey)

const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

const treeAvailable = computed(() =>
    !!props.model.isTree && !!props.model.listSettings?.treeEnabled
)

const toggleableColumns = computed(() => {
    return props.allColumns.filter(c => c.key !== 'name')
})

function setQuickActionKeys(val: string[]) {
    quickActionKeys.value = val
}

const statsAvailable = computed(() => !!props.model.listSettings?.statsFooter)
const hasMobileList = computed(() => !!props.model.listSettings?.mobileList)

function setMobileSubtitleKeys(val: string[]) {
    mobileSubtitleKeys.value = val
}

function setDesktopSubtitleKeys(val: string[]) {
    desktopSubtitleKeys.value = val
}

function setSwipeEnabled(val: boolean) {
    swipeEnabled.value = val
}

function setSwipeLeftKeys(val: string[]) {
    swipeLeftKeys.value = val
}

function setSwipeRightKeys(val: string[]) {
    swipeRightKeys.value = val
}

// Bottom sheet drag-to-dismiss
const dragStartY = ref(0)
const dragOffset = ref(0)
const isDragging = ref(false)

const sheetDragStyle = computed(() => {
    if (dragOffset.value <= 0) return undefined
    return {
        transform: `translateY(${dragOffset.value}px)`,
        transition: isDragging.value ? 'none' : 'transform 0.2s ease',
    }
})

function onSheetDragStart(e: TouchEvent) {
    dragStartY.value = e.touches[0].clientY
    dragOffset.value = 0
    isDragging.value = true
}

function onSheetDragMove(e: TouchEvent) {
    if (!isDragging.value) return
    const dy = e.touches[0].clientY - dragStartY.value
    dragOffset.value = Math.max(0, dy)
}

function onSheetDragEnd() {
    if (dragOffset.value > 100) {
        isOpen.value = false
    }
    dragOffset.value = 0
    isDragging.value = false
}
</script>
