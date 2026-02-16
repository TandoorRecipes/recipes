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

                <div class="text-overline px-4 pt-2">{{ $t('Display') }}</div>
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

                <v-divider class="my-2" />

                <div class="text-overline px-4">{{ $t('Subtitle') }}</div>
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

                <v-divider class="my-2" />

                <div class="text-overline px-4">{{ $t('SwipeActions') }}</div>
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

                <template v-if="swipeEnabled">
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
import {computed, ref, PropType} from 'vue'
import {useDisplay} from 'vuetify'
import {useI18n} from 'vue-i18n'
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
    statsAvailable: {type: Boolean, default: false},
    showStats: {type: Boolean, default: false},
    hasMobileList: {type: Boolean, default: false},
    mobileSubtitleKeys: {type: Array as PropType<string[]>, default: () => []},
    setMobileSubtitleKeys: {type: Function as PropType<(keys: string[]) => void>, default: () => () => {}},
    swipeEnabled: {type: Boolean, default: false},
    setSwipeEnabled: {type: Function as PropType<(val: boolean) => void>, default: () => () => {}},
    swipeLeftKeys: {type: Array as PropType<string[]>, default: () => []},
    setSwipeLeftKeys: {type: Function as PropType<(val: string[]) => void>, default: () => () => {}},
    swipeRightKeys: {type: Array as PropType<string[]>, default: () => []},
    setSwipeRightKeys: {type: Function as PropType<(val: string[]) => void>, default: () => () => {}},
    showMobileHeaders: {type: Boolean, default: false},
})

const emit = defineEmits(['update:currentTab', 'update:showColumnHeaders', 'update:treeEnabled', 'update:showStats', 'update:showMobileHeaders'])

const maxQuickActions = computed(() => mobile.value ? 2 : 4)
const selectedCount = computed(() => props.quickActionKeys.length)

function isSelected(key: string) {
    return props.quickActionKeys.includes(key)
}

function toggleQuickAction(key: string) {
    const keys = [...props.quickActionKeys]
    const idx = keys.indexOf(key)
    if (idx >= 0) {
        keys.splice(idx, 1)
    } else if (keys.length < maxQuickActions.value) {
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
