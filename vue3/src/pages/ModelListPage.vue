<template>
    <v-container v-if="genericModel.model">
        <v-row v-if="selectMode">
            <v-col>
                <SelectionBar
                    :selected-count="selectedItems.length"
                    @close="exitSelectMode"
                    @select-all="selectedItems = items.filter(i => !i._isLoadMore)"
                    @select-none="selectedItems = []"
                >
                    <template #actions>
                        <v-btn v-for="ba in genericModel.model.batchActions" :key="ba.key" variant="text" :prepend-icon="ba.icon" class="text-none" @click="handleBatchAction(ba.key)">
                            {{ $t(ba.labelKey) }}
                        </v-btn>
                        <v-btn variant="text" prepend-icon="fa-solid fa-arrows-to-dot" class="text-none" @click="batchMergeDialog = true" v-if="genericModel.model.isMerge">
                            {{ $t('Merge') }}
                        </v-btn>
                        <v-btn variant="text" prepend-icon="$delete" class="text-none" @click="batchDeleteDialog = true" v-if="!genericModel.model.disableDelete">
                            {{ $t('Delete_All') }}
                        </v-btn>
                    </template>
                    <template #actions-menu>
                        <v-list-item v-for="ba in genericModel.model.batchActions" :key="ba.key" :prepend-icon="ba.icon" @click="handleBatchAction(ba.key)">
                            {{ $t(ba.labelKey) }}
                        </v-list-item>
                        <v-list-item prepend-icon="fa-solid fa-arrows-to-dot" @click="batchMergeDialog = true" v-if="genericModel.model.isMerge">
                            {{ $t('Merge') }}
                        </v-list-item>
                        <v-list-item prepend-icon="$delete" @click="batchDeleteDialog = true" v-if="!genericModel.model.disableDelete">
                            {{ $t('Delete_All') }}
                        </v-list-item>
                    </template>
                </SelectionBar>
            </v-col>
        </v-row>

        <v-row v-else-if="!showDescription">
            <v-col>
                <v-card>
                    <v-card-text class="d-flex align-center pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                        <v-spacer />
                        <v-icon :icon="genericModel.model.icon" size="small" class="mr-2" />
                        <span class="text-subtitle-1 font-weight-medium">{{ $t(genericModel.model.localizationKey) }}</span>
                        <v-btn
                            v-if="genericModel.model.localizationKeyDescription"
                            icon="fa-solid fa-circle-info"
                            variant="plain"
                            size="small"
                            @click="showDescription = true"
                        />
                        <template v-for="ha in genericModel.model.headerActions" :key="ha.type === 'button' ? ha.key : 'widget'">
                            <v-btn v-if="ha.type === 'button'" :prepend-icon="ha.icon" :color="ha.color" :size="ha.size ?? 'small'"
                                   v-bind="ha.routeName ? {to: {name: ha.routeName, params: ha.routeParams}} : {}"
                                   @click="ha.handler && executeHeaderAction(ha.handler)">{{ $t(ha.labelKey) }}</v-btn>
                        </template>
                        <model-list-create-button :model="model" :disable-create="genericModel.model.disableCreate" compact @change="loadItems({page: page}); loadStats()" />
                    </v-card-text>
                    <template v-for="ha in genericModel.model.headerActions" :key="'cw-' + (ha.type === 'button' ? ha.key : 'widget')">
                        <component v-if="ha.type === 'widget'" :is="ha.component" />
                    </template>
                </v-card>
            </v-col>
        </v-row>

        <template v-else>
            <v-row>
                <v-col>
                    <v-card>
                        <v-card-text class="pt-2 pb-2">
                            <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row dense>
                <v-col>
                    <v-card :prepend-icon="genericModel.model.icon" :title="$t(genericModel.model.localizationKey)">
                        <template #subtitle v-if="genericModel.model.localizationKeyDescription">
                            <div class="text-wrap">
                                {{ $t(genericModel.model.localizationKeyDescription) }}
                            </div>
                        </template>
                        <template #append>
                            <v-btn
                                v-if="genericModel.model.localizationKeyDescription"
                                icon="fa-solid fa-chevron-up"
                                variant="plain"
                                size="small"
                                @click="showDescription = false"
                            />
                            <model-list-create-button :model="model" :disable-create="genericModel.model.disableCreate" @change="loadItems({page: page}); loadStats()" />
                        </template>

                        <template v-for="ha in genericModel.model.headerActions" :key="ha.type === 'button' ? ha.key : 'widget'">
                            <v-card-actions v-if="ha.type === 'button'">
                                <v-btn :prepend-icon="ha.icon" :color="ha.color"
                                       v-bind="ha.routeName ? {to: {name: ha.routeName, params: ha.routeParams}} : {}"
                                       @click="ha.handler && executeHeaderAction(ha.handler)">{{ $t(ha.labelKey) }}</v-btn>
                            </v-card-actions>
                            <component v-else-if="ha.type === 'widget'" :is="ha.component" />
                        </template>
                    </v-card>
                </v-col>
            </v-row>
        </template>
        <v-row>
            <v-col>
                <ModelListToolbar
                    v-if="!genericModel.model.disableSearch"
                    v-model:query="query"
                    v-model:ordering="ordering"
                    :sort-options="genericModel.model.sortDefs ?? []"
                    :has-filters="hasEnhancedList"
                    :active-filter-count="activeFilterCount"
                    :has-multi-select="!genericModel.model.disableDelete || genericModel.model.isMerge"
                    :select-mode="selectMode"
                    :show-reset="hasActiveSearchState"
                    @open-filters="openSettingsPanel('filters')"
                    @open-settings="openSettingsPanel('settings')"
                    @toggle-select="selectMode = !selectMode"
                    @reset="resetAll"
                />

                <ModelListFilterChips
                    v-if="hasEnhancedList && activeFilterCount > 0"
                    :filter-defs="filterDefs"
                    :get-filter="getFilter"
                    :set-filter="setFilter"
                    :clear-filter="clearFilter"
                    :clear-all-filters="clearAllFilters"
                    :active-filter-count="activeFilterCount"
                    @open-filters="openSettingsPanel('filters')"
                />

                <model-list-mobile-view
                    v-if="useMobileList"
                    class="mt-2"
                    :key="props.model + '-mobile'"
                    :items="items"
                    :items-length="itemCount"
                    :loading="loading"
                    :page="page"
                    :items-per-page="pageSize"
                    :select-mode="selectMode"
                    :selected-items="selectedItems"
                    :all-columns="allColumns"
                    :action-defs="actionDefs"
                    :grouped-action-defs="groupedActionDefs"
                    :get-toggle-state="getToggleState"
                    :tree-active="effectiveTreeActive"
                    :tree-suspended="treeActive && !effectiveTreeActive"
                    :expanded-ids="expandedIds"
                    :loading-ids="loadingIds"
                    :toggle-expand="toggleExpand"
                    :settings-key="modelSettingsKey"
                    :label-field="currentModel?.itemLabel"
                    @update:selected-items="selectedItems = $event"
                    @update:options="loadItems"
                    @action="handleActionWithConfirmation"
                    @load-more="loadMoreChildren"
                />
                <model-list-data-table
                    v-else
                    :key="props.model"
                    :class="['mt-2 bg-transparent', {'hide-table-headers': !showColumnHeaders}]"
                    :dynamic-slots="columnSlots"
                    v-model="selectedItems"
                    return-object
                    @update:options="loadItems"
                    :items="items"
                    :items-length="itemCount"
                    :loading="loading || anyItemLoading"
                    :search="query"
                    :headers="visibleHeaders"
                    :items-per-page-options="itemsPerPageOptions"
                    :show-select="selectMode"
                    :page="page"
                    :items-per-page="pageSize"
                    disable-sort
                >
                    <template v-slot:item.action="{ item }">
                        <template v-if="item._isLoadMore" />
                        <ActionMenu
                            v-else-if="currentModel?.actionDefs"
                            :item="item"
                            :action-defs="actionDefs"
                            :grouped-action-defs="groupedActionDefs"
                            :get-toggle-state="getToggleState"
                            :quick-action-keys="quickActionKeys"
                            @action="handleActionWithConfirmation"
                        />
                    </template>
                </model-list-data-table>

                <model-list-stats-footer
                    v-if="statsAvailable && showStats"
                    :page-count="rawItems.length"
                    :item-count="itemCount"
                    :stats="stats"
                    :stat-defs="currentModel?.statDefs ?? []"
                    :loading="statsLoading"
                />
            </v-col>
        </v-row>

        <model-list-settings-panel
            v-if="hasEnhancedList"
            v-model="settingsPanelOpen"
            v-model:active-tab="settingsActiveTab"
            :model="genericModel.model"
            :all-columns="allColumns"
            :is-column-visible="isColumnVisible"
            :toggle-column="toggleColumn"
            :get-display-mode="getDisplayMode"
            :set-display-mode="setDisplayMode"
            :grouped-filter-defs="groupedFilterDefs"
            :get-filter="getFilter"
            :set-filter="setFilter"
            :clear-all-filters="clearAllFilters"
            :active-filter-count="activeFilterCount"
            :action-defs="actionDefs"
        />

        <batch-delete-dialog :items="selectedItems" :model="props.model" v-model="batchDeleteDialog" activator="model"
                             @change="reloadAfterMutation(); exitSelectMode()"></batch-delete-dialog>

        <model-merge-dialog :model="model" :source="selectedItems" v-model="batchMergeDialog" activator="model"
                            @change="reloadAfterMutation(); exitSelectMode()"></model-merge-dialog>

        <model-merge-dialog :model="model" :source="singleMergeSource" v-model="singleMergeDialog" activator="model"
                            @change="reloadAfterMutation()"></model-merge-dialog>

        <batch-edit-food-dialog :items="(selectedItems as any)" v-model="batchEditDialog" v-if="model === 'Food'" activator="model"
                                @change="reloadAfterMutation(); exitSelectMode()"></batch-edit-food-dialog>

        <sync-dialog v-if="syncDialogItem" :sync="(syncDialogItem as any)" v-model="syncDialogOpen" activator="model" />

        <action-confirm-dialog ref="confirmDialogRef" />

    </v-container>
</template>

<script setup lang="ts">


import {computed, h, onBeforeMount, provide, ref, shallowRef, toRef, triggerRef, watch, type Ref} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import {EditorSupportedModels, GenericModel, getGenericModelFromString, Model, ModelTableHeaders} from "@/types/Models";
import {buildSubtitleText} from "@/utils/utils";

import {useRoute, useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ModelMergeDialog from "@/components/dialogs/ModelMergeDialog.vue";
import {VDataTableUpdateOptions} from "@/vuetify";
import SyncDialog from "@/components/dialogs/SyncDialog.vue";
import {useTitle} from "@vueuse/core";
import BatchDeleteDialog from "@/components/dialogs/BatchDeleteDialog.vue";
import {useRouteQuery} from "@vueuse/router";
import BatchEditFoodDialog from "@/components/dialogs/BatchEditFoodDialog.vue";
import {useModelListColumns} from "@/composables/modellist/useModelListColumns";
import {useUrlFilters} from "@/composables/useUrlFilters";
import ModelListCellRenderer from "@/components/model_list/ModelListCellRenderer.vue";
import ModelListDataTable from "@/components/model_list/ModelListDataTable.vue";
import ModelListSettingsPanel from "@/components/model_list/ModelListSettingsPanel.vue"
import ModelListToolbar from "@/components/model_list/ModelListToolbar.vue";
import ModelListCreateButton from "@/components/model_list/ModelListCreateButton.vue";
import ModelListFilterChips from "@/components/model_list/ModelListFilterChips.vue";
import SelectionBar from "@/components/common/SelectionBar.vue";
import ActionMenu from "@/components/common/ActionMenu.vue";
import ModelListMobileView from "@/components/model_list/ModelListMobileView.vue";
import ModelListStatsFooter from "@/components/model_list/ModelListStatsFooter.vue";
import {useModelListActions} from "@/composables/modellist/useModelListActions";
import {useModelListSettings, MODEL_LIST_SETTINGS_KEY} from "@/composables/modellist/useModelListSettings";
import {useModelListTree, CHILD_PAGE_SIZE} from "@/composables/modellist/useModelListTree";
import type {ModelItem} from "@/composables/modellist/types";
import {getAncestorPath} from "@/composables/modellist/types";
import ActionConfirmDialog from "@/components/dialogs/ActionConfirmDialog.vue";
import {useDisplay} from "vuetify";

const {t} = useI18n()
const router = useRouter()
const route = useRoute()
const title = useTitle()

const props = withDefaults(defineProps<{
    model?: EditorSupportedModels
}>(), {
    model: 'Food',
})

// table config
const itemsPerPageOptions = [
    {value: 10, title: '10'},
    {value: 25, title: '25'},
    {value: 50, title: '50'},
    {value: 100, title: '100'},
]

const query = useRouteQuery('query', "")
const page = useRouteQuery('page', 1, {transform: Number})
const pageSize = useRouteQuery('pageSize', useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, {transform: Number})
const ordering = useRouteQuery('ordering', '')

// Clear custom ordering when a search query is entered — relevance takes priority
watch(query, (q) => {
    if (q) ordering.value = ''
})

const selectedItems = ref<ModelItem[]>([])

const batchDeleteDialog = ref(false)
const batchMergeDialog = ref(false)
const batchEditDialog = ref(false)

function handleBatchAction(key: string) {
    switch (key) {
        case 'batchEdit': batchEditDialog.value = true; break
    }
}

// data
const loading = ref(false);
const statsLoading = ref(false);
const rawItems = shallowRef([] as Array<any>)
const itemCount = ref(0)
const stats = ref<Record<string, number>>({})

const genericModel = ref<GenericModel>({} as GenericModel)

// column system: reads model reactively, handles visibility + display modes for all models
const currentModel = computed(() => genericModel.value?.model)
const {visibleHeaders, enhancedColumns, allColumns, hasEnhancedList, isColumnVisible, toggleColumn, getDisplayMode, setDisplayMode} = useModelListColumns(currentModel, t)
const filterDefsFromModel = computed(() => currentModel.value?.filterDefs ?? [])
const {filterDefs, groupedFilterDefs, activeFilterCount, filterParams, getFilter, setFilter, clearFilter, clearAllFilters} = useUrlFilters(filterDefsFromModel)

// device settings + tree view
const {mobile} = useDisplay()
const modelSettingsKey = computed(() => currentModel.value?.listSettings?.settingsKey ?? '')
const modelDefaults = computed(() => currentModel.value?.listSettings?.defaults)
const settings = useModelListSettings(modelSettingsKey, modelDefaults)
const {isPinned, showStats, showColumnHeaders, quickActionKeys, desktopSubtitleKeys,
    mobileSubtitleKeys, swipeEnabled, swipeLeftKeys, swipeRightKeys,
    showMobileHeaders, treeEnabled} = settings
provide(MODEL_LIST_SETTINGS_KEY, settings)
const useMobileList = computed(() => mobile.value && hasEnhancedList.value && !!currentModel.value?.listSettings?.mobileList)
const statsAvailable = computed(() => !!currentModel.value?.listSettings?.statsFooter)
const fetchChildren = (parentId: number, page: number) =>
    genericModel.value.list({...filterParams.value, root: parentId, pageSize: CHILD_PAGE_SIZE, page} as any)
        .then((r: any) => ({results: r.results ?? [], hasMore: !!r.next}))
const {treeActive, expandedIds, loadingIds, toggleExpand, loadMoreChildren,
    buildFlatList, updateCachedChild, clearTreeState, setOnCollapse, renderTreeCell} =
    useModelListTree(currentModel, fetchChildren, treeEnabled)

/** Tree is suspended when search, filters, or non-default sorting are active.
 *  Name ascending is the default backend ordering, so it's compatible with tree mode. */
const effectiveTreeActive = computed(() =>
    treeActive.value
    && (!ordering.value || ordering.value === 'name')
    && !query.value
    && activeFilterCount.value === 0
)

const hasActiveSearchState = computed(() =>
    !!query.value || activeFilterCount.value > 0 || (!!ordering.value && ordering.value !== 'name')
)

function resetAll() {
    query.value = ''
    ordering.value = ''
    clearAllFilters()
}

// Always return a fresh array reference so that triggerRef(rawItems) propagates
// through Vue's computed Object.is() caching to downstream v-for consumers.
const items = computed(() => {
    const list = effectiveTreeActive.value ? buildFlatList(rawItems.value) : rawItems.value
    return list.slice()
})

const anyItemLoading = computed(() => loadingIds.value.size > 0)

// When children are collapsed, remove them from selection
setOnCollapse((removedIds) => {
    const removedSet = new Set(removedIds)
    selectedItems.value = selectedItems.value.filter(item => !removedSet.has(item.id))
})

const modelNameRef = toRef(props, 'model')
const singleMergeDialog = ref(false)
const singleMergeSource = ref<ModelItem[]>([])
const confirmDialogRef = ref<InstanceType<typeof ActionConfirmDialog> | null>(null)

const syncDialogItem = ref<ModelItem | null>(null)
const syncDialogOpen = ref(false)

function handleAction(key: string, item: ModelItem) {
    switch (key) {
        case 'merge':
            singleMergeSource.value = [item]
            singleMergeDialog.value = true
            break
        case 'sync-import':
            syncDialogItem.value = item
            syncDialogOpen.value = true
            break
    }
}

const {actionDefs, groupedActionDefs, executeAction, getToggleState} = useModelListActions(
    currentModel, genericModel as Ref<GenericModel>, modelNameRef, handleAction,
    (item: ModelItem, field: string) => {
        const idx = rawItems.value.findIndex(i => i.id === item.id)
        if (idx >= 0) {
            rawItems.value[idx] = {...rawItems.value[idx], [field]: item[field]}
            triggerRef(rawItems)
        } else {
            // Item is a tree child — update in the children cache
            updateCachedChild(item.id, field, item[field])
        }
    },
    () => reloadAfterMutation(),
)

/**
 * Intercepts actions that need confirmation before executing.
 * For toggle actions: confirms when toggling OFF (active → inactive).
 * For non-toggle actions: confirms unconditionally.
 */
async function handleActionWithConfirmation(key: string, item: ModelItem) {
    const action = actionDefs.value.find(a => a.key === key)
    if (!action) return

    if (action.requiresConfirmation) {
        if (action.isToggle && getToggleState(action, item)) {
            // Toggle is active → user wants to deactivate → confirm
            if (action.confirmationHandler && confirmDialogRef.value) {
                const confirmed = await action.confirmationHandler(item, confirmDialogRef.value, t)
                if (!confirmed) return
            }
        } else if (action.isToggle && !getToggleState(action, item)) {
            // Toggle is inactive → user wants to activate → activation confirm
            if (action.activationConfirmationHandler && confirmDialogRef.value) {
                const confirmed = await action.activationConfirmationHandler(item, confirmDialogRef.value, t)
                if (!confirmed) return
            }
        } else if (!action.isToggle) {
            // Non-toggle destructive action — custom handler or generic confirm
            if (action.confirmationHandler && confirmDialogRef.value) {
                const confirmed = await action.confirmationHandler(item, confirmDialogRef.value, t)
                if (!confirmed) return
            } else {
                const confirmed = await confirmDialogRef.value?.open({
                    title: t('Confirm'),
                    message: t('ConfirmAction', {action: t(action.labelKey), name: item.name}),
                    confirmLabel: t(action.labelKey),
                    confirmColor: action.isDanger ? 'error' : 'primary',
                    confirmIcon: action.icon,
                })
                if (!confirmed) return
            }
        }
    }
    executeAction(key, item)
}

const showDescription = computed({
    get: () => useUserPreferenceStore().deviceSettings.general_showModelListDescription,
    set: (val: boolean) => { useUserPreferenceStore().deviceSettings.general_showModelListDescription = val },
})
const settingsPanelOpen = ref(false)
const settingsActiveTab = ref('settings')
const selectMode = ref(false)

function exitSelectMode() {
    selectMode.value = false
}

watch(selectMode, (val) => {
    if (!val) selectedItems.value = []
})

function openSettingsPanel(tab: string) {
    settingsActiveTab.value = tab
    settingsPanelOpen.value = true
}

const desktopSubtitleColumns = computed(() =>
    desktopSubtitleKeys.value
        .map((key: string) => allColumns.value.find(c => c.key === key))
        .filter((c: ModelTableHeaders | undefined): c is ModelTableHeaders => !!c)
)

/** Render name cell content with optional subtitle */
function renderNameContent(item: ModelItem, col: ModelTableHeaders) {
    const renderer = h(ModelListCellRenderer, {
        item,
        header: col,
        displayMode: getDisplayMode(col.key),
        showHeaders: true,
    })
    const lines: ReturnType<typeof h>[] = [renderer]

    // Show ancestor path when tree mode is suspended by filters/search/sort
    if (treeActive.value && !effectiveTreeActive.value) {
        const path = getAncestorPath(item)
        if (path) {
            lines.push(h('span', {class: 'text-caption text-disabled text-truncate'}, path))
        }
    }

    const subtitle = buildSubtitleText(item, desktopSubtitleColumns.value, t)
    if (subtitle) {
        lines.push(h('span', {class: 'text-caption text-medium-emphasis text-truncate'}, subtitle))
    }

    if (lines.length === 1) return renderer
    return h('div', {class: 'd-flex flex-column'}, lines)
}

// Build dynamic cell slots for enhanced columns (programmatic — Vue 3 can't v-for on template slots)
const columnSlots = computed(() => {
    if (!hasEnhancedList.value) return {}
    const slots: Record<string, (...args: any[]) => any> = {}
    for (const col of enhancedColumns.value) {
        if (effectiveTreeActive.value && col.key === 'name') {
            slots[`item.${col.key}`] = ({item}: {item: ModelItem}) =>
                renderTreeCell(item, renderNameContent(item, col), mobile, t)
        } else if (col.key === 'name') {
            slots[`item.${col.key}`] = ({item}: {item: ModelItem}) => renderNameContent(item, col)
        } else {
            slots[`item.${col.key}`] = ({item}: {item: ModelItem}) => {
                if (item._isLoadMore) return null
                return h(ModelListCellRenderer, {
                    item,
                    header: col,
                    displayMode: getDisplayMode(col.key),
                    showHeaders: true,
                })
            }
        }
    }
    return slots
})

// when navigating to ModelListPage from ModelListPage with a different model lifecycle hooks are not called so watch for change here
watch(() => props.model, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        genericModel.value = getGenericModelFromString(props.model, t) || genericModel.value
        loadItems({page: 1})
    }
})

watch([ordering, filterParams, treeActive], () => {
    clearTreeState()
    loadItems({page: 1})
})
// Mobile v-list doesn't emit update:options on search change like v-data-table does,
// so watch query explicitly to trigger reload on mobile
watch(query, () => {
    if (useMobileList.value) loadItems({page: 1})
})

/**
 * select model class before mount because template renders (and requests item load) before onMounted is called
 */
watch(showStats, (val) => {
    if (val && statsAvailable.value && Object.keys(stats.value).length === 0) loadStats()
})

onBeforeMount(() => {
    genericModel.value = getGenericModelFromString(props.model, t) || getGenericModelFromString('Food', t) as GenericModel

    title.value = t(genericModel.value.model.localizationKey)
    loadStats()
})

/**
 * load items from API whenever the table calls for it
 * parameters defined by vuetify
 * @param options
 */
/** Reload after a mutation (delete, merge, edit) — clears tree cache so re-expand shows fresh data */
function reloadAfterMutation() {
    clearTreeState()
    loadItems({page: page.value, itemsPerPage: pageSize.value, search: query.value})
    loadStats()
}

function loadItems(options: VDataTableUpdateOptions) {
    loading.value = true
    selectedItems.value = []

    const pageChanged = options.page !== page.value
    page.value = options.page
    if (pageChanged) {
        window.scrollTo({top: 0, behavior: 'smooth'})
    }
    if (options.itemsPerPage != null) {
        pageSize.value = options.itemsPerPage
        useUserPreferenceStore().deviceSettings.general_tableItemsPerPage = options.itemsPerPage
    }

    // Don't send ordering when search query is active (relevance ordering takes
    // priority) or when tree mode is active (hierarchy ordering must be preserved)
    const effectiveOrdering = (!query.value && !effectiveTreeActive.value)
        ? (ordering.value || undefined)
        : undefined

    const listParams = {
        ...filterParams.value,
        ...(effectiveTreeActive.value ? {root: 0} : {}),
        query: query.value,
        page: options.page,
        pageSize: pageSize.value,
        ordering: effectiveOrdering,
    }
    genericModel.value.list(listParams).then((r: any) => {
        rawItems.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function loadStats() {
    if (!showStats.value || !statsAvailable.value) return
    statsLoading.value = true
    genericModel.value.stats()
        .then((r: Record<string, number>) => { stats.value = r })
        .catch((err: any) => { useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err) })
        .finally(() => { statsLoading.value = false })
}

async function executeHeaderAction(handler: () => Promise<void> | void) {
    try {
        await handler()
        reloadAfterMutation()
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }
}

</script>

<style scoped>
:deep(.hide-table-headers thead) {
    display: none;
}
:deep(.bg-transparent .v-table__wrapper > table) {
    background: transparent;
}
:deep(.bg-transparent .v-table__wrapper td) {
    border-bottom: none !important;
}
:deep(.bg-transparent .v-table__wrapper tbody tr) {
    background-image: linear-gradient(rgba(var(--v-theme-on-surface), 0.12), rgba(var(--v-theme-on-surface), 0.12));
    background-size: 100% 1px;
    background-repeat: no-repeat;
    background-position: bottom;
}
:deep(.bg-transparent .v-data-table-footer) {
    background: transparent;
}
:deep(.bg-transparent > .v-divider) {
    border-color: rgba(var(--v-theme-on-surface), 0.08);
}
:deep(.tree-chevron-expanded) {
    transform: rotate(90deg);
}
.tree-expand-btn i {
    transition: transform 0.2s;
    font-size: 12px;
}
</style>
