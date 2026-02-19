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
                <button class="text-overline px-4 pt-3 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('quickActions')"
                    aria-controls="quickActions-section-content"
                    @click="toggleSection('quickActions')">
                    {{ $t('QuickActions') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('quickActions')" id="quickActions-section-content">
                        <div class="text-caption px-4 text-medium-emphasis">{{ t('QuickActionsDescription_N', { n: maxQuickActions }) }}</div>
                        <div class="d-flex flex-wrap ga-2 px-4 py-2">
                            <v-chip
                                v-for="action in actionDefs"
                                :key="action.key"
                                :prepend-icon="isSelected(action.key) ? 'fa-solid fa-check' : action.icon"
                                :variant="isSelected(action.key) ? 'flat' : 'outlined'"
                                :color="isSelected(action.key) ? 'primary' : undefined"
                                :disabled="!isSelected(action.key) && selectedCount >= maxQuickActions"
                                size="small"
                                label
                                @click="toggleQuickAction(action.key)"
                            >
                                {{ $t(action.labelKey) }}
                            </v-chip>
                        </div>
                        <div class="text-caption px-4 pb-1 text-medium-emphasis">{{ selectedCount }}/{{ maxQuickActions }} {{ $t('Selected') }}</div>
                    </div>
                </v-expand-transition>

                <v-divider class="my-2" />
            </template>

            <template v-if="!mobile">
                <button class="text-overline px-4 pt-3 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('columns')"
                    aria-controls="columns-section-content"
                    @click="toggleSection('columns')">
                    {{ $t('Columns') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('columns')" id="columns-section-content">
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
                    </div>
                </v-expand-transition>

                <v-divider class="my-2" />

                <button class="text-overline px-4 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('subtitle')"
                    aria-controls="subtitle-section-content"
                    @click="toggleSection('subtitle')">
                    {{ $t('Subtitle') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('subtitle')" id="subtitle-section-content">
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
                    </div>
                </v-expand-transition>

                <v-divider class="my-2" />

                <button class="text-overline px-4 pt-2 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('table')"
                    aria-controls="table-section-content"
                    @click="toggleSection('table')">
                    {{ $t('Table') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('table')" id="table-section-content">
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
                    </div>
                </v-expand-transition>
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

            <div class="px-4 py-1" v-if="statsAvailable">
                <v-switch
                    :model-value="showStats"
                    @update:model-value="emit('update:showStats', $event)"
                    :label="$t('ShowStats')"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </div>

            <template v-if="hasMobileList && mobile">
                <v-divider class="my-2" />

                <button class="text-overline px-4 pt-2 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('display')"
                    aria-controls="display-section-content"
                    @click="toggleSection('display')">
                    {{ $t('Display') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('display')" id="display-section-content">
                        <div class="px-4 py-1">
                            <v-switch
                                :model-value="showMobileHeaders"
                                @update:model-value="emit('update:showMobileHeaders', $event)"
                                :label="$t('ShowColumnHeaders')"
                                color="primary"
                                hide-details
                                density="compact"
                            />
                        </div>
                    </div>
                </v-expand-transition>

                <v-divider class="my-2" />

                <button class="text-overline px-4 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('mobileSubtitle')"
                    aria-controls="mobileSubtitle-section-content"
                    @click="toggleSection('mobileSubtitle')">
                    {{ $t('Subtitle') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('mobileSubtitle')" id="mobileSubtitle-section-content">
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
                    </div>
                </v-expand-transition>

                <template v-if="hasTouchInput">
                <v-divider class="my-2" />

                <button class="text-overline px-4 d-block w-100 text-start"
                    style="cursor: pointer; user-select: none; appearance: none; border: none; background: none; padding-bottom: 0;"
                    :aria-expanded="isSectionOpen('swipe')"
                    aria-controls="swipe-section-content"
                    @click="toggleSection('swipe')">
                    {{ $t('SwipeActions') }}
                </button>
                <v-expand-transition>
                    <div v-show="isSectionOpen('swipe')" id="swipe-section-content">
                        <div class="px-4 py-1">
                            <v-switch
                                :model-value="swipeEnabled"
                                @update:model-value="setSwipeEnabled($event)"
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
                    </div>
                </v-expand-transition>
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
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useDisplay} from 'vuetify'
import {useI18n} from 'vue-i18n'
import type {ModelTableHeaders} from '@/types/Models'
import type {ModelActionDef, ModelFilterDef} from '@/composables/modellist/types'
import ModelFilterPanel from '@/components/model_list/filters/ModelFilterPanel.vue'

const {mobile} = useDisplay()

/** Detect touch-primary input device via CSS media query (W3C standard) */
const hasTouchInput = ref(false)
let touchMql: MediaQueryList | undefined
function onTouchChange(e: MediaQueryListEvent) { hasTouchInput.value = e.matches }
onMounted(() => {
    touchMql = window.matchMedia('(pointer: coarse)')
    hasTouchInput.value = touchMql.matches
    touchMql.addEventListener('change', onTouchChange)
})
onUnmounted(() => { touchMql?.removeEventListener('change', onTouchChange) })

const props = withDefaults(defineProps<{
    currentTab: string
    showColumnHeaders: boolean
    toggleableColumns: ModelTableHeaders[]
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
    quickActionKeys?: string[]
    setQuickActionKeys?: (keys: string[]) => void
    treeAvailable?: boolean
    treeEnabled?: boolean
    statsAvailable?: boolean
    showStats?: boolean
    desktopSubtitleKeys?: string[]
    setDesktopSubtitleKeys?: (keys: string[]) => void
    hasMobileList?: boolean
    mobileSubtitleKeys?: string[]
    setMobileSubtitleKeys?: (keys: string[]) => void
    swipeEnabled?: boolean
    setSwipeEnabled?: (val: boolean) => void
    swipeLeftKeys?: string[]
    setSwipeLeftKeys?: (val: string[]) => void
    swipeRightKeys?: string[]
    setSwipeRightKeys?: (val: string[]) => void
    showMobileHeaders?: boolean
}>(), {
    groupedFilterDefs: () => new Map(),
    getFilter: () => () => undefined,
    setFilter: () => () => {},
    clearAllFilters: () => () => {},
    activeFilterCount: 0,
    actionDefs: () => [],
    quickActionKeys: () => [],
    setQuickActionKeys: () => () => {},
    treeAvailable: false,
    treeEnabled: false,
    statsAvailable: false,
    showStats: false,
    desktopSubtitleKeys: () => [],
    setDesktopSubtitleKeys: () => () => {},
    hasMobileList: false,
    mobileSubtitleKeys: () => [],
    setMobileSubtitleKeys: () => () => {},
    swipeEnabled: false,
    setSwipeEnabled: () => () => {},
    swipeLeftKeys: () => [],
    setSwipeLeftKeys: () => () => {},
    swipeRightKeys: () => [],
    setSwipeRightKeys: () => () => {},
    showMobileHeaders: false,
})

const emit = defineEmits<{
    'update:currentTab': [val: string]
    'update:showColumnHeaders': [val: boolean]
    'update:treeEnabled': [val: boolean]
    'update:showStats': [val: boolean]
    'update:showMobileHeaders': [val: boolean]
}>()

// Collapsible section state (all default open)
const openSections = ref<Record<string, boolean>>({})

function isSectionOpen(key: string): boolean {
    return openSections.value[key] !== false
}

function toggleSection(key: string) {
    openSections.value[key] = !isSectionOpen(key)
}

const maxQuickActions = computed(() => mobile.value ? 2 : 4)
const effectiveQuickActionKeys = computed(() => props.quickActionKeys.slice(0, maxQuickActions.value))
const selectedCount = computed(() => effectiveQuickActionKeys.value.length)

function isSelected(key: string) {
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
    props.setQuickActionKeys(keys.filter(k => !!k))
}

// Desktop subtitle settings
function isDesktopSubtitleSelected(key: string) {
    return props.desktopSubtitleKeys.includes(key)
}

function toggleDesktopSubtitle(key: string) {
    const keys = [...props.desktopSubtitleKeys]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else if (keys.length < 2) {
        keys.push(key)
    }
    props.setDesktopSubtitleKeys(keys)
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
    } else if (keys.length < 2) {
        keys.push(key)
    }
    props.setMobileSubtitleKeys(keys)
}

// Swipe settings
const swipePickerOpen = ref(false)
const swipePickerSide = ref<'left' | 'right'>('left')

const {t} = useI18n()

function getActionIcon(key: string): string {
    return props.actionDefs.find(a => a.key === key)?.icon ?? ''
}

function getActionLabel(key: string): string {
    const action = props.actionDefs.find(a => a.key === key)
    return action ? t(action.labelKey) : key
}

/** Actions not already assigned to either side */
const availableSwipeActions = computed(() => {
    const assigned = new Set([...props.swipeLeftKeys, ...props.swipeRightKeys])
    return props.actionDefs.filter(a => !assigned.has(a.key))
})

function openSwipePicker(side: 'left' | 'right') {
    swipePickerSide.value = side
    swipePickerOpen.value = true
}

function addSwipeAction(key: string) {
    const side = swipePickerSide.value
    if (side === 'left') {
        props.setSwipeLeftKeys([...props.swipeLeftKeys, key])
    } else {
        props.setSwipeRightKeys([...props.swipeRightKeys, key])
    }
    swipePickerOpen.value = false
}

function removeSwipeAction(side: 'left' | 'right', idx: number) {
    if (side === 'left') {
        const keys = [...props.swipeLeftKeys]
        keys.splice(idx, 1)
        props.setSwipeLeftKeys(keys)
    } else {
        const keys = [...props.swipeRightKeys]
        keys.splice(idx, 1)
        props.setSwipeRightKeys(keys)
    }
}

</script>
