<template>
    <TabbedDrawer
        v-model="isOpen"
        v-model:active-tab="currentTab"
        v-model:pinned="isPinned"
        :tabs="drawerTabs"
    >
        <template #filters>
            <ModelFilterPanel
                :grouped-filter-defs="groupedFilterDefs"
                :get-filter="getFilter"
                :set-filter="setFilter"
                :clear-filter="clearFilter"
                :clear-all-filters="clearAllFilters"
                :active-filter-count="activeFilterCount"
            />
        </template>

        <template #settings>
            <!-- Quick Actions -->
            <template v-if="actionDefs.length > 0">
                <CollapsibleSection :label="$t('QuickActions')">
                    <div class="text-caption px-4 text-medium-emphasis">{{ t('QuickActionsDescription_N', { n: maxQuickActions }) }}</div>
                    <div class="d-flex flex-wrap ga-2 px-4 py-2">
                        <v-chip
                            v-for="action in actionDefs"
                            :key="action.key"
                            :prepend-icon="isQuickActionSelected(action.key) ? 'fa-solid fa-check' : action.icon"
                            :variant="isQuickActionSelected(action.key) ? 'flat' : 'outlined'"
                            :color="isQuickActionSelected(action.key) ? 'primary' : undefined"
                            :disabled="!isQuickActionSelected(action.key) && quickActionSelectedCount >= maxQuickActions"
                            size="small"
                            label
                            @click="toggleQuickAction(action.key)"
                        >
                            {{ $t(action.labelKey) }}
                        </v-chip>
                    </div>
                    <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ quickActionSelectedCount }}/{{ maxQuickActions }} {{ $t('Selected') }}</div>
                </CollapsibleSection>
                <v-divider class="my-2" />
            </template>

            <!-- Desktop: Columns/Subtitle/Table (only for pages with columns) -->
            <template v-if="!mobile && toggleableColumns.length > 0">
                <CollapsibleSection :label="$t('Columns')">
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
                </CollapsibleSection>
                <v-divider class="my-2" />

                <CollapsibleSection :label="$t('Subtitle')">
                    <div class="text-caption px-4 text-medium-emphasis">{{ $t('Subtitle_Description') }}</div>
                    <div class="d-flex flex-wrap ga-2 px-4 py-2">
                        <v-chip
                            v-for="col in toggleableColumns"
                            :key="'dsub-' + col.key"
                            :prepend-icon="isDesktopSubtitleSelected(col.key) ? 'fa-solid fa-check' : undefined"
                            :variant="isDesktopSubtitleSelected(col.key) ? 'flat' : 'outlined'"
                            :color="isDesktopSubtitleSelected(col.key) ? 'primary' : undefined"
                            :disabled="!isDesktopSubtitleSelected(col.key) && desktopSubtitleKeys.length >= 2"
                            size="small"
                            label
                            @click="toggleDesktopSubtitle(col.key)"
                        >
                            {{ $t(col.title) }}
                        </v-chip>
                    </div>
                    <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ desktopSubtitleKeys.length }}/2 {{ $t('Selected') }}</div>
                </CollapsibleSection>
                <v-divider class="my-2" />

                <CollapsibleSection v-if="allColumns.length > 0" :label="$t('Table')">
                    <div class="px-4 py-1">
                        <v-switch
                            v-model="showColumnHeaders"
                            :label="$t('ShowColumnHeaders')"
                            color="primary"
                            hide-details
                            density="compact"
                        />
                    </div>
                </CollapsibleSection>
                <v-divider class="my-2" />
            </template>

            <!-- Filter visibility (grouped by filter section) -->
            <template v-if="configurableFiltersByGroup.size > 0">
                <template v-for="[group, defs] in configurableFiltersByGroup" :key="group">
                    <CollapsibleSection :label="$t(group)">
                        <div v-for="def in defs" :key="def.key" class="d-flex align-center px-4 py-0">
                            <span class="text-body-2 flex-grow-1">{{ $t(def.labelKey) }}</span>
                            <v-checkbox
                                :model-value="isInlineSelected(def.key)"
                                @update:model-value="toggleInline(def.key)"
                                :disabled="!isInlineSelected(def.key) && inlineSelectedCount >= 6"
                                :label="$t('Inline')"
                                hide-details
                                density="compact"
                                class="flex-shrink-0"
                                style="max-width: 90px"
                            />
                            <v-checkbox
                                :model-value="isDrawerSelected(def.key)"
                                @update:model-value="toggleDrawer(def.key)"
                                :label="$t('Panel')"
                                hide-details
                                density="compact"
                                class="flex-shrink-0"
                                style="max-width: 80px"
                            />
                        </div>
                    </CollapsibleSection>
                </template>
                <v-divider class="my-2" />
            </template>

            <!-- Tree View (not collapsible) -->
            <div class="px-4 py-1" v-if="treeAvailable">
                <v-switch
                    v-model="treeEnabled"
                    :label="$t('TreeView')"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </div>

            <!-- Stats (not collapsible) -->
            <div class="px-4 py-1" v-if="statsAvailable">
                <v-switch
                    v-model="showStats"
                    :label="$t('ShowStats')"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </div>

            <!-- Mobile-specific settings -->
            <template v-if="hasMobileList && mobile">
                <v-divider class="my-2" />

                <!-- Mobile: Display -->
                <CollapsibleSection :label="$t('Display')">
                    <div class="px-4 py-1">
                        <v-switch
                            v-model="showMobileHeaders"
                            :label="$t('ShowColumnHeaders')"
                            color="primary"
                            hide-details
                            density="compact"
                        />
                    </div>
                </CollapsibleSection>

                <v-divider class="my-2" />

                <!-- Mobile: Subtitle -->
                <CollapsibleSection :label="$t('Subtitle')">
                    <div class="text-caption px-4 text-medium-emphasis">{{ $t('Subtitle_Description') }}</div>
                    <div class="d-flex flex-wrap ga-2 px-4 py-2">
                        <v-chip
                            v-for="col in toggleableColumns"
                            :key="'sub-' + col.key"
                            :prepend-icon="isMobileSubtitleSelected(col.key) ? 'fa-solid fa-check' : undefined"
                            :variant="isMobileSubtitleSelected(col.key) ? 'flat' : 'outlined'"
                            :color="isMobileSubtitleSelected(col.key) ? 'primary' : undefined"
                            :disabled="!isMobileSubtitleSelected(col.key) && mobileSubtitleKeys.length >= 2"
                            size="small"
                            label
                            @click="toggleMobileSubtitle(col.key)"
                        >
                            {{ $t(col.title) }}
                        </v-chip>
                    </div>
                    <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ mobileSubtitleKeys.length }}/2 {{ $t('Selected') }}</div>
                </CollapsibleSection>

                <!-- Mobile: Swipe (touch only) -->
                <template v-if="hasTouchInput">
                    <v-divider class="my-2" />

                    <CollapsibleSection :label="$t('SwipeActions')">
                        <div class="px-4 py-1">
                            <v-switch
                                v-model="swipeEnabled"
                                :label="$t('EnableSwipe')"
                                color="primary"
                                hide-details
                                density="compact"
                            />
                        </div>
                        <v-expand-transition>
                            <div v-show="swipeEnabled">
                                <div class="d-flex px-4 py-2 ga-2">
                                    <!-- Swipe right (left-side actions) -->
                                    <div class="flex-grow-1">
                                        <div class="text-caption text-success mb-1">{{ $t('SwipeRight') }} &rarr;</div>
                                        <div
                                            v-for="(key, idx) in swipeRightKeys"
                                            :key="'swr-' + idx"
                                            class="d-flex align-center mb-1"
                                        >
                                            <v-icon :icon="getActionIcon(key)" size="x-small" class="mr-1" />
                                            <span class="text-caption flex-grow-1">{{ getActionLabel(key) }}</span>
                                            <v-btn
                                                icon="fa-solid fa-xmark"
                                                variant="plain"
                                                size="x-small"
                                                density="compact"
                                                @click="removeSwipeAction('right', idx)"
                                            />
                                        </div>
                                        <v-btn
                                            v-if="swipeRightKeys.length < 2"
                                            variant="tonal"
                                            size="small"
                                            block
                                            prepend-icon="fa-solid fa-plus"
                                            @click="openSwipePicker('right')"
                                        >
                                            {{ $t('Add') }}
                                        </v-btn>
                                    </div>

                                    <v-divider vertical />

                                    <!-- Swipe left (right-side actions) -->
                                    <div class="flex-grow-1">
                                        <div class="text-caption text-error mb-1">&larr; {{ $t('SwipeLeft') }}</div>
                                        <div
                                            v-for="(key, idx) in swipeLeftKeys"
                                            :key="'swl-' + idx"
                                            class="d-flex align-center mb-1"
                                        >
                                            <v-icon :icon="getActionIcon(key)" size="x-small" class="mr-1" />
                                            <span class="text-caption flex-grow-1">{{ getActionLabel(key) }}</span>
                                            <v-btn
                                                icon="fa-solid fa-xmark"
                                                variant="plain"
                                                size="x-small"
                                                density="compact"
                                                @click="removeSwipeAction('left', idx)"
                                            />
                                        </div>
                                        <v-btn
                                            v-if="swipeLeftKeys.length < 2"
                                            variant="tonal"
                                            size="small"
                                            block
                                            prepend-icon="fa-solid fa-plus"
                                            @click="openSwipePicker('left')"
                                        >
                                            {{ $t('Add') }}
                                        </v-btn>
                                    </div>
                                </div>
                            </div>
                        </v-expand-transition>
                    </CollapsibleSection>
                </template>
            </template>

            <!-- Swipe action picker dialog -->
            <v-dialog v-model="swipePickerOpen" max-width="320">
                <v-card>
                    <v-card-title class="text-subtitle-1">{{ $t('SelectAction') }}</v-card-title>
                    <v-list density="compact">
                        <v-list-item
                            v-for="action in availableSwipeActions"
                            :key="action.key"
                            :prepend-icon="action.icon"
                            @click="addSwipeAction(action.key)"
                        >
                            <v-list-item-title>{{ $t(action.labelKey) }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-dialog>
        </template>

        <template #footer="{ activeTab }">
            <v-btn
                v-show="activeTab === 'filters'"
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
        </template>
    </TabbedDrawer>
</template>

<script setup lang="ts">
import {computed, inject, ref} from 'vue'
import {useDisplay} from 'vuetify'
import {useI18n} from 'vue-i18n'
import type {Model, ModelTableHeaders} from '@/types/Models'
import type {ActionDef, FilterDef, FilterValue} from '@/composables/modellist/types'
import {MODEL_LIST_SETTINGS_KEY} from '@/composables/modellist/useModelListSettings'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {useTouchDetect} from '@/composables/useTouchDetect'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ModelFilterPanel from '@/components/model_list/ModelFilterPanel.vue'

const {t} = useI18n()
const {mobile} = useDisplay()
const {hasTouchInput} = useTouchDetect()

const props = withDefaults(defineProps<{
    modelValue: boolean
    activeTab?: string
    model: Model
    /** Column-related props are optional so pages that don't surface column
     *  visibility (e.g. SearchPage, which is a one-off page rather than a
     *  generic model list) can mount the panel without passing identity stubs. */
    allColumns?: ModelTableHeaders[]
    isColumnVisible?: (key: string) => boolean
    toggleColumn?: (key: string) => void
    getDisplayMode?: (key: string) => 'icon' | 'text'
    setDisplayMode?: (key: string, mode: 'icon' | 'text') => void
    groupedFilterDefs?: Map<string, FilterDef[]>
    getFilter?: (key: string) => string | undefined
    setFilter?: (key: string, value: FilterValue) => void
    clearFilter?: (key: string) => void
    clearAllFilters?: () => void
    activeFilterCount?: number
    actionDefs?: ActionDef[]
}>(), {
    activeTab: 'settings',
    allColumns: () => [],
    isColumnVisible: () => () => true,
    toggleColumn: () => () => {},
    getDisplayMode: () => () => 'text',
    setDisplayMode: () => () => {},
    groupedFilterDefs: () => new Map(),
    getFilter: () => () => undefined,
    setFilter: () => () => {},
    clearFilter: () => () => {},
    clearAllFilters: () => () => {},
    activeFilterCount: 0,
    actionDefs: () => [],
})

const emit = defineEmits<{
    'update:modelValue': [val: boolean]
    'update:activeTab': [val: string]
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

const currentTab = computed({
    get: () => props.activeTab,
    set: (val: string) => emit('update:activeTab', val),
})

// Drawer tab definitions
const drawerTabs = computed(() => [
    {key: 'filters', label: t('Filters'), icon: 'fa-solid fa-filter'},
    {key: 'settings', label: t('Settings'), icon: 'fa-solid fa-sliders'},
])

// Settings from parent via provide/inject (single instance shared across page, mobile view, settings panel)
const {isPinned, showStats, showColumnHeaders, treeEnabled, quickActionKeys,
    desktopSubtitleKeys, mobileSubtitleKeys, swipeEnabled, swipeLeftKeys,
    swipeRightKeys, showMobileHeaders} = inject(MODEL_LIST_SETTINGS_KEY)!

// Computed model flags
const treeAvailable = computed(() => !!props.model.isTree && !!props.model.listSettings?.treeEnabled)
const statsAvailable = computed(() => !!props.model.listSettings?.statsFooter)
const hasMobileList = computed(() => !!props.model.listSettings?.mobileList)
const toggleableColumns = computed(() => props.allColumns.filter(c => c.key !== 'name'))

// Quick action management
const maxQuickActions = computed(() => mobile.value ? 3 : 4)
const effectiveQuickActionKeys = computed(() => quickActionKeys.value.slice(0, maxQuickActions.value))
const quickActionSelectedCount = computed(() => effectiveQuickActionKeys.value.length)

function isQuickActionSelected(key: string) {
    return effectiveQuickActionKeys.value.includes(key)
}

function toggleQuickAction(key: string) {
    const keys = [...effectiveQuickActionKeys.value]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else if (keys.length < maxQuickActions.value) {
        keys.push(key)
    }
    quickActionKeys.value = keys.filter(k => !!k)
}

// Desktop subtitle management
function isDesktopSubtitleSelected(key: string) {
    return desktopSubtitleKeys.value.includes(key)
}

function toggleDesktopSubtitle(key: string) {
    const keys = [...desktopSubtitleKeys.value]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else if (keys.length < 2) {
        keys.push(key)
    }
    desktopSubtitleKeys.value = keys
}

// Mobile subtitle management
function isMobileSubtitleSelected(key: string) {
    return mobileSubtitleKeys.value.includes(key)
}

function toggleMobileSubtitle(key: string) {
    const keys = [...mobileSubtitleKeys.value]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else if (keys.length < 2) {
        keys.push(key)
    }
    mobileSubtitleKeys.value = keys
}

// Page Layout — per-filter inline/drawer visibility
const deviceSettings = useUserPreferenceStore().deviceSettings

const configurableFiltersByGroup = computed(() => {
    const result = new Map<string, FilterDef[]>()
    for (const [group, defs] of props.groupedFilterDefs) {
        if (!group) continue
        const visible = defs.filter(d => !d.hidden)
        if (visible.length > 0) result.set(group, visible)
    }
    return result
})

function isInlineSelected(key: string) {
    return (deviceSettings.search_inlineFilters ?? []).includes(key)
}
const inlineSelectedCount = computed(() => (deviceSettings.search_inlineFilters ?? []).length)

function toggleInline(key: string) {
    const current = [...(deviceSettings.search_inlineFilters ?? [])]
    const idx = current.indexOf(key)
    if (idx >= 0) current.splice(idx, 1)
    else if (current.length < 6) current.push(key)
    deviceSettings.search_inlineFilters = current
}

function isDrawerSelected(key: string) {
    return (deviceSettings.search_drawerFilters ?? []).includes(key)
}

function toggleDrawer(key: string) {
    const current = [...(deviceSettings.search_drawerFilters ?? [])]
    const idx = current.indexOf(key)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(key)
    deviceSettings.search_drawerFilters = current
}

// Swipe action management
const swipePickerOpen = ref(false)
const swipePickerSide = ref<'left' | 'right'>('left')

function getActionIcon(key: string): string {
    return props.actionDefs.find(a => a.key === key)?.icon ?? ''
}

function getActionLabel(key: string): string {
    const action = props.actionDefs.find(a => a.key === key)
    return action ? t(action.labelKey) : key
}

const availableSwipeActions = computed(() => {
    const assigned = new Set([...swipeLeftKeys.value, ...swipeRightKeys.value])
    return props.actionDefs.filter(a => !assigned.has(a.key))
})

function openSwipePicker(side: 'left' | 'right') {
    swipePickerSide.value = side
    swipePickerOpen.value = true
}

function addSwipeAction(key: string) {
    if (swipePickerSide.value === 'left') {
        swipeLeftKeys.value = [...swipeLeftKeys.value, key]
    } else {
        swipeRightKeys.value = [...swipeRightKeys.value, key]
    }
    swipePickerOpen.value = false
}

function removeSwipeAction(side: 'left' | 'right', idx: number) {
    if (side === 'left') {
        const keys = [...swipeLeftKeys.value]
        keys.splice(idx, 1)
        swipeLeftKeys.value = keys
    } else {
        const keys = [...swipeRightKeys.value]
        keys.splice(idx, 1)
        swipeRightKeys.value = keys
    }
}
</script>
