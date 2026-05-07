<template>
    <div>
        <v-progress-linear v-if="loading || childrenLoading" indeterminate color="primary" />

        <div v-if="showSwipeHint" class="d-flex align-center px-3 py-1 text-caption text-medium-emphasis">
            <v-icon icon="fa-solid fa-hand-pointer" size="x-small" class="mr-2" />
            <span class="flex-grow-1">{{ $t('SwipeHint') }}</span>
            <v-btn
                icon="fa-solid fa-xmark"
                variant="plain"
                size="x-small"
                density="compact"
                :aria-label="$t('Dismiss')"
                @click="dismissSwipeHint"
            />
        </div>

        <v-list v-if="items.length > 0" class="mobile-list bg-transparent" density="compact">
            <v-list-item
                v-if="showMobileHeaders"
                class="mobile-list-header"
                density="compact"
            >
                <template #prepend>
                    <v-checkbox-btn
                        v-if="selectMode"
                        :model-value="allSelected"
                        :indeterminate="someSelected && !allSelected"
                        density="compact"
                        class="mr-1"
                        :aria-label="$t('Select_All')"
                        @update:model-value="toggleSelectAll"
                    />
                </template>
                <v-list-item-title class="text-caption text-medium-emphasis font-weight-medium">
                    {{ $t('Name') }}
                </v-list-item-title>
            </v-list-item>

            <template
                v-for="item in items"
                :key="item.id"
            >
            <!-- Load More sentinel row -->
            <v-list-item
                v-if="item._isLoadMore"
                density="compact"
                class="d-flex justify-center"
                :style="{ paddingLeft: ((item._depth ?? 0) * 20 + 16) + 'px' }"
            >
                <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    class="text-none text-caption"
                    :loading="loadingIds?.has(item._parentId)"
                    @click="$emit('load-more', item._parentId)"
                >
                    <v-icon icon="fa-solid fa-ellipsis" size="x-small" class="mr-1" />
                    {{ $t('Load_More') }}
                </v-btn>
            </v-list-item>

            <div
                v-else
                class="mobile-list-item"
            >
                <!-- Swipe action buttons (left side = revealed by swiping right) -->
                <div
                    v-if="swipeActive && resolvedRightActions.length > 0"
                    class="swipe-actions swipe-actions-left"
                    :style="swipe.getSwipeDirection(item.id) === 'right'
                        ? { backgroundColor: getActionBg(resolvedRightActions[0], item) }
                        : undefined"
                >
                    <button
                        v-for="(action, idx) in resolvedRightActions"
                        v-show="idx === 0 || !swipe.isExpanded(item.id)"
                        :key="'sr-' + action.key"
                        class="swipe-action-btn"
                        :class="{
                            'swipe-action-armed': idx === 0 && swipe.isArmed(item.id),
                        }"
                        :style="{ backgroundColor: getActionBg(action, item), minWidth: SLOT_WIDTH + 'px' }"
                        tabindex="-1"
                        aria-hidden="true"
                        data-swipe-action
                        @touchend="onActionClick($event, action.key, item)"
                        @click.prevent
                    >
                        <v-icon :icon="action.icon" size="small" color="white" />
                        <span class="swipe-action-label">{{ $t(action.labelKey) }}</span>
                    </button>
                </div>

                <!-- Swipe action buttons (right side = revealed by swiping left) -->
                <div
                    v-if="swipeActive && resolvedLeftActions.length > 0"
                    class="swipe-actions swipe-actions-right"
                    :style="swipe.getSwipeDirection(item.id) === 'left'
                        ? { backgroundColor: getActionBg(resolvedLeftActions[resolvedLeftActions.length - 1], item) }
                        : undefined"
                >
                    <button
                        v-for="(action, idx) in resolvedLeftActions"
                        v-show="idx === resolvedLeftActions.length - 1 || !swipe.isExpanded(item.id)"
                        :key="'sl-' + action.key"
                        class="swipe-action-btn"
                        :class="{
                            'swipe-action-armed': idx === resolvedLeftActions.length - 1 && swipe.isArmed(item.id),
                        }"
                        :style="{ backgroundColor: getActionBg(action, item), minWidth: SLOT_WIDTH + 'px' }"
                        tabindex="-1"
                        aria-hidden="true"
                        data-swipe-action
                        @touchend="onActionClick($event, action.key, item)"
                        @click.prevent
                    >
                        <v-icon :icon="action.icon" size="small" color="white" />
                        <span class="swipe-action-label">{{ $t(action.labelKey) }}</span>
                    </button>
                </div>

                <!-- Swipeable content layer -->
                <div
                    class="mobile-list-content"
                    :class="{ 'no-transition': swipe.isSwiping(item.id) }"
                    :style="{ transform: swipeActive ? swipe.getSwipeTransform(item.id) : undefined }"
                    @touchstart.passive="swipeActive && swipe.onTouchStart($event, item.id)"
                    @touchmove.passive="swipeActive && swipe.onTouchMove($event, item.id)"
                    @touchend.passive="swipeActive && swipe.onTouchEnd($event, item.id)"
                >
                    <v-list-item density="compact">
                        <template #prepend>
                            <div class="d-flex align-center" :style="treeActive ? { paddingLeft: ((item._depth ?? 0) * 20) + 'px' } : undefined">
                                <v-checkbox-btn
                                    v-if="selectMode"
                                    :model-value="isSelected(item)"
                                    density="compact"
                                    class="mr-1"
                                    @update:model-value="toggleSelection(item)"
                                />
                                <template v-if="treeActive">
                                    <v-btn
                                        v-if="(item.numchild ?? 0) > 0"
                                        icon
                                        variant="plain"
                                        size="x-small"
                                        class="tree-chevron-spacer"
                                        :aria-label="$t('Toggle')"
                                        :aria-expanded="expandedIds.has(item.id)"
                                        @click.stop="toggleExpand(item.id)"
                                    >
                                        <v-icon
                                            size="small"
                                            :icon="expandedIds.has(item.id) ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'"
                                        />
                                    </v-btn>
                                    <span v-else-if="(item._depth ?? 0) > 0" class="tree-chevron-spacer" />
                                </template>
                            </div>
                        </template>

                        <v-list-item-title>{{ item[props.labelField ?? 'name'] }}</v-list-item-title>

                        <v-list-item-subtitle v-if="ancestorPathMap?.get(item.id)" class="text-disabled">
                            {{ ancestorPathMap.get(item.id) }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-if="subtitleMap.has(item.id)">
                            {{ subtitleMap.get(item.id) }}
                        </v-list-item-subtitle>

                        <template #append>
                            <ActionMenu
                                :item="item"
                                :action-defs="actionDefs"
                                :grouped-action-defs="groupedActionDefs"
                                :get-toggle-state="getToggleState"
                                :quick-action-keys="quickActionKeys.slice(0, 3)"
                                @action="(key: string, actionItem: any) => $emit('action', key, actionItem)"
                            />
                        </template>
                    </v-list-item>
                </div>
            </div>
            </template>
        </v-list>

        <v-card v-else-if="!loading" variant="flat" class="text-center pa-8 text-medium-emphasis">
            {{ $t('No_Results') }}
        </v-card>

        <div v-if="itemsLength > 0" class="v-data-table-footer" style="background: transparent;">
            <div class="v-data-table-footer__items-per-page">
                <span>{{ $t('Items_per_page') }}</span>
                <v-select
                    :model-value="itemsPerPage"
                    :items="[10, 25, 50, 100]"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @update:model-value="onPageSizeChange"
                />
            </div>
            <div class="v-data-table-footer__info">
                {{ rangeText }}
            </div>
            <div class="v-data-table-footer__pagination">
                <v-pagination
                    :model-value="page"
                    :length="totalPages"
                    density="comfortable"
                    rounded
                    show-first-last-page
                    :total-visible="0"
                    variant="plain"
                    @update:model-value="onPageChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, inject, onMounted, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ActionDef, ModelItem} from '@/composables/modellist/types'
import {getAncestorPath} from '@/composables/modellist/types'
import type {ModelTableHeaders} from '@/types/Models'
import {buildSubtitleText} from '@/utils/utils'
import {useSwipeGesture, SLOT_WIDTH} from '@/composables/useSwipeGesture'
import {useTouchDetect} from '@/composables/useTouchDetect'
import {MODEL_LIST_SETTINGS_KEY} from '@/composables/modellist/useModelListSettings'
import ActionMenu from "@/components/common/ActionMenu.vue"

const {t} = useI18n()

const props = withDefaults(defineProps<{
    items: ModelItem[],
    itemsLength: number,
    loading: boolean,
    page: number,
    itemsPerPage: number,
    selectMode: boolean,
    selectedItems: ModelItem[],
    allColumns: ModelTableHeaders[],
    actionDefs: ActionDef[],
    groupedActionDefs: Map<string, ActionDef[]>,
    getToggleState: (action: ActionDef, item: ModelItem) => boolean,
    treeActive: boolean,
    treeSuspended: boolean,
    expandedIds: Set<number>,
    loadingIds: Set<number>,
    toggleExpand: (id: number) => void,
    settingsKey: string,
    labelField?: string,
}>(), {
    labelField: 'name',
})

const {quickActionKeys, mobileSubtitleKeys, swipeEnabled, swipeLeftKeys, swipeRightKeys, showMobileHeaders} = inject(MODEL_LIST_SETTINGS_KEY)!

const emit = defineEmits<{
    'update:selectedItems': [items: ModelItem[]],
    'update:options': [options: { page: number, itemsPerPage: number }],
    action: [key: string, item: ModelItem],
    'load-more': [parentId: number],
}>()

/** Resolve action keys to action defs, filtering out missing/invisible */
const resolvedLeftActions = computed(() =>
    swipeLeftKeys.value
        .map(key => props.actionDefs.find(a => a.key === key))
        .filter((a): a is ActionDef => !!a)
)

const resolvedRightActions = computed(() =>
    swipeRightKeys.value
        .map(key => props.actionDefs.find(a => a.key === key))
        .filter((a): a is ActionDef => !!a)
)

const leftSlotCount = computed(() => resolvedLeftActions.value.length)
const rightSlotCount = computed(() => resolvedRightActions.value.length)

const {hasTouchInput} = useTouchDetect()

/** Swipe is active only on touch devices, when enabled, not in select mode, and actions are configured */
const swipeActive = computed(() =>
    hasTouchInput.value && swipeEnabled.value && !props.selectMode && (leftSlotCount.value > 0 || rightSlotCount.value > 0)
)

const enabledRef = computed(() => swipeActive.value)

function handleFullSwipe(id: number, direction: 'left' | 'right') {
    const item = props.items.find(i => i.id === id)
    if (!item) return
    // Outermost action: last in the array for swipe-left, first for swipe-right
    const action = direction === 'left'
        ? resolvedLeftActions.value[resolvedLeftActions.value.length - 1]
        : resolvedRightActions.value[0]
    if (action) emit('action', action.key, item)
}

const swipe = useSwipeGesture(enabledRef, leftSlotCount, rightSlotCount, handleFullSwipe)

/** Reset swipe state when item set changes (pagination, filters), not on in-place property mutations */
const itemIdKey = computed(() => props.items.map(i => i.id).join(','))
watch(itemIdKey, () => swipe.resetAll())

/** Swipe hint banner */
const hintStorageKey = computed(() => `${props.settingsKey}_swipeHintDismissed`)
const hintDismissed = ref(false)

onMounted(() => {
    hintDismissed.value = localStorage.getItem(hintStorageKey.value) === 'true'
})

const showSwipeHint = computed(() =>
    swipeActive.value && !hintDismissed.value
)

function dismissSwipeHint() {
    hintDismissed.value = true
    localStorage.setItem(hintStorageKey.value, 'true')
}

/** Get background color for a swipe action button */
function getActionBg(action: ActionDef, item: ModelItem): string {
    if (action.isDanger) return 'rgb(var(--v-theme-error))'
    if (action.isToggle) {
        const active = action.isActive ? action.isActive(item) : props.getToggleState(action, item)
        if (active) return 'rgb(var(--v-theme-success))'
    }
    if (action.colorResolver) {
        const color = action.colorResolver(item)
        if (color) return `rgb(var(--v-theme-${color}))`
    }
    if (action.routeName) return 'rgb(var(--v-theme-info))'
    return 'rgb(var(--v-theme-primary))'
}

const lastActionTimes = new Map<string, number>()
function onActionClick(e: Event, key: string, item: ModelItem) {
    e.preventDefault()
    const actionItemKey = `${key}-${item.id}`
    const now = Date.now()
    if (now - (lastActionTimes.get(actionItemKey) ?? 0) < 400) return
    lastActionTimes.set(actionItemKey, now)
    if (lastActionTimes.size > 50) {
        for (const [k, ts] of lastActionTimes) {
            if (now - ts > 10_000) lastActionTimes.delete(k)
        }
    }
    swipe.resetSwipe(item.id)
    emit('action', key, item)
}

const totalPages = computed(() =>
    props.itemsPerPage > 0 ? Math.ceil(props.itemsLength / props.itemsPerPage) : 1
)

const childrenLoading = computed(() => props.items.some(item => item._isLoading))


const rangeText = computed(() => {
    if (props.itemsLength === 0) return `0 / 0`
    const start = (props.page - 1) * props.itemsPerPage + 1
    const end = Math.min(props.page * props.itemsPerPage, props.itemsLength)
    return `${start}-${end} / ${props.itemsLength}`
})

function onPageSizeChange(size: number) {
    emit('update:options', {page: 1, itemsPerPage: size})
}

// Select-all header logic — compare by ID to handle cross-page selections
// Filter out sentinel rows (Load More) which have string IDs and no real data
const realItems = computed(() => props.items.filter(i => !i._isLoadMore))

const selectedIdSet = computed(() => new Set(props.selectedItems.map(s => s.id)))
const allSelected = computed(() => {
    if (realItems.value.length === 0) return false
    return realItems.value.every(item => selectedIdSet.value.has(item.id))
})
const someSelected = computed(() => realItems.value.some(item => selectedIdSet.value.has(item.id)))

function toggleSelectAll(val: boolean | null) {
    const pageIds = new Set(realItems.value.map(i => i.id))
    if (val) {
        // Merge current page into existing selections
        const kept = props.selectedItems.filter(s => !pageIds.has(s.id))
        emit('update:selectedItems', [...kept, ...realItems.value])
    } else {
        // Remove only current page from selections
        emit('update:selectedItems', props.selectedItems.filter(s => !pageIds.has(s.id)))
    }
}

/** Columns selected for subtitle display (use allColumns so hidden columns still work as subtitles) */
const subtitleColumns = computed(() =>
    mobileSubtitleKeys.value
        .map(key => props.allColumns.find(c => c.key === key))
        .filter((c): c is ModelTableHeaders => !!c)
)

function isSelected(item: ModelItem): boolean {
    return selectedIdSet.value.has(item.id)
}

function toggleSelection(item: ModelItem) {
    const current = [...props.selectedItems]
    const idx = current.findIndex(s => s.id === item.id)
    if (idx >= 0) {
        current.splice(idx, 1)
    } else {
        current.push(item)
    }
    emit('update:selectedItems', current)
}


/** Cache ancestor paths — avoids double getAncestorPath call per item in template */
const ancestorPathMap = computed(() => {
    if (!props.treeSuspended) return null
    const map = new Map<number, string>()
    for (const item of props.items) {
        if (item._isLoadMore) continue
        const path = getAncestorPath(item)
        if (path) map.set(item.id, path)
    }
    return map
})

/** Build subtitle map — computed once per render, not twice per item */
const subtitleMap = computed(() => {
    const cols = subtitleColumns.value
    const map = new Map<number, string>()
    for (const item of props.items) {
        if (item._isLoadMore) continue
        const text = buildSubtitleText(item, cols, t)
        if (text) map.set(item.id, text)
    }
    return map
})

function onPageChange(newPage: number) {
    emit('update:options', {page: newPage, itemsPerPage: props.itemsPerPage})
}

onMounted(() => {
    emit('update:options', {page: props.page, itemsPerPage: props.itemsPerPage})
})
</script>

<style scoped>
.tree-chevron-spacer {
    width: 28px;
    min-width: 28px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

.mobile-list-item {
    position: relative;
    overflow: hidden;
    touch-action: pan-y;
    background-image: linear-gradient(rgba(var(--v-theme-on-surface), 0.12), rgba(var(--v-theme-on-surface), 0.12));
    background-size: 100% 1px;
    background-repeat: no-repeat;
    background-position: bottom;
}

.mobile-list-content {
    position: relative;
    z-index: 1;
    background: rgb(var(--v-theme-background));
    transition: transform 0.2s ease;
}

.mobile-list-content.no-transition {
    transition: none;
}

.swipe-actions {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: stretch;
}

.swipe-actions-left {
    left: 0;
    right: 0;
}

.swipe-actions-right {
    left: 0;
    right: 0;
    justify-content: flex-end;
}

.swipe-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: none;
    cursor: pointer;
    padding: 0 4px;
    flex-shrink: 0;
}

.swipe-action-label {
    font-size: 10px;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1;
}

.swipe-action-armed .v-icon {
    transition: transform 0.15s ease;
    transform: scale(1.4);
}

.swipe-action-armed {
    filter: brightness(1.2);
}

.mobile-list-header {
    background: rgba(var(--v-theme-on-surface), 0.03);
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    min-height: 36px;
}
</style>
