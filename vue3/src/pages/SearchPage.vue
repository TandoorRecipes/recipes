<template>
    <v-container>
        <v-row v-if="selectMode">
            <v-col>
                <SelectionBar
                    :selected-count="selectedItems.length"
                    @close="selectedItems = []; selectMode = false"
                    @select-all="selectedItems = recipes.map(r => r as any)"
                    @select-none="selectedItems = []"
                >
                    <template #actions>
                        <v-btn variant="text" prepend-icon="$edit" disabled class="text-none">
                            {{ $t('BatchEdit') }}
                            <v-tooltip activator="parent" location="bottom">{{ $t('ComingSoon') }}</v-tooltip>
                        </v-btn>
                        <v-btn variant="text" prepend-icon="$delete" disabled class="text-none">
                            {{ $t('Delete_All') }}
                            <v-tooltip activator="parent" location="bottom">{{ $t('ComingSoon') }}</v-tooltip>
                        </v-btn>
                    </template>
                    <template #actions-menu>
                        <v-list-item prepend-icon="$edit" disabled>{{ $t('BatchEdit') }}</v-list-item>
                        <v-list-item prepend-icon="$delete" disabled>{{ $t('Delete_All') }}</v-list-item>
                    </template>
                </SelectionBar>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <ModelListToolbar
                    v-model:query="query"
                    v-model:ordering="ordering"
                    :sort-options="RECIPE_SORT_DEFS"
                    :has-filters="true"
                    :active-filter-count="activeFilterCount"
                    :has-multi-select="true"
                    :select-mode="selectMode"
                    :show-reset="hasActiveSearchState"
                    @open-filters="openSettingsPanel('filters')"
                    @open-settings="openSettingsPanel('settings')"
                    @toggle-select="selectMode = !selectMode"
                    @reset="resetAll"
                >
                    <template #below-search v-if="savedSearchInline && !selectMode">
                        <model-select v-show="!filtersCollapsed" model="CustomFilter" v-model="selectedCustomFilter" density="compact" class="mt-1" />
                    </template>
                    <template #below-search-actions v-if="savedSearchInline && !selectMode">
                        <template v-if="!filtersCollapsed">
                            <v-btn variant="text" size="small" prepend-icon="fa-solid fa-upload"
                                   :disabled="selectedCustomFilter == null"
                                   @click="loadSelectedCustomFilter()" class="text-none">
                                {{ $t('Load') }}
                            </v-btn>
                            <v-btn variant="text" size="small" prepend-icon="$save"
                                   @click="saveCustomFilter()" class="text-none">
                                {{ $t('Save') }}
                            </v-btn>
                        </template>
                    </template>
                    <template #search-append-inner v-if="!selectMode && (inlineGroups.length > 0 || savedSearchInline)">
                        <v-btn
                            :icon="filtersCollapsed ? 'fa-solid fa-caret-down' : 'fa-solid fa-caret-up'"
                            color="primary"
                            variant="flat"
                            rounded="0"
                            style="height: 40px; min-width: 36px; padding: 0;"
                            @click.stop="filtersCollapsed = !filtersCollapsed"
                        />
                    </template>
                </ModelListToolbar>

                <v-expand-transition>
                <div v-show="!filtersCollapsed && !selectMode">
                    <closable-help-alert
                        v-if="savedFilterModified"
                        :text="$t('saved_filter_override_hint')"
                        class="mt-1"
                    />

                    <ModelListFilterChips
                        v-if="activeFilterCount > 0"
                        :filter-defs="filterDefs"
                        :get-filter="getFilter"
                        :set-filter="setFilter"
                        :clear-filter="clearFilter"
                        :clear-all-filters="clearAllFilters"
                        :active-filter-count="activeFilterCount"
                        @open-filters="openSettingsPanel('filters')"
                    />

                    <v-row v-if="inlineGroups.length > 0" dense class="mt-2">
                        <template v-for="[group, defs] in inlineGroups" :key="group">
                            <template v-for="def in defs" :key="def.key">
                                <v-col v-if="def.type === 'tag-group' && def.variantKeys && def.modelName" cols="12" md="4">
                                    <RecipeTagFilterGroup
                                        :label="$t(def.labelKey)"
                                        :model-name="def.modelName"
                                        :keys="def.variantKeys"
                                        :get-filter="getFilter"
                                        :set-filter="setFilter"
                                        :clear-filter="clearFilter"
                                        :show-toggles="def.showToggles !== false"
                                        :expandable="def.expandable !== false"
                                        :select-placeholder="def.selectPlaceholder ? $t(def.selectPlaceholder) : undefined"
                                    />
                                </v-col>
                            </template>
                            <v-col v-if="!defs.some(d => d.type === 'tag-group')" cols="12" md="4">
                                <InlineFilterCard
                                    :group="group"
                                    :defs="defs"
                                    :get-filter="getFilter"
                                    :set-filter="setFilter"
                                    :clear-filter="clearFilter"
                                />
                            </v-col>
                        </template>
                    </v-row>
                </div>
                </v-expand-transition>
            </v-col>
        </v-row>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-2" />

        <v-row v-if="recipes.length > 0 && useUserPreferenceStore().deviceSettings.search_viewMode == 'table'">
            <v-col>
                <v-card>
                    <v-data-table-server
                        v-model="selectedItems"
                        return-object
                        @update:options="onTableUpdate"
                        :loading="loading"
                        :items="recipes"
                        :headers="tableHeaders"
                        :page="page"
                        :items-per-page="pageSize"
                        :items-length="tableItemCount"
                        :items-per-page-options="[10, 25, 50, 100]"
                        @click:row="handleRowClick"
                        disable-sort
                        :show-select="selectMode"
                    >
                        <template #item.image="{item}">
                            <v-avatar size="x-large" class="mt-1 mb-1" v-if="item.image">
                                <div class="crop-avatar" :style="cropPreviewStyle(item.image, item.imageCropData, true)" />
                            </v-avatar>
                            <v-avatar color="primary" variant="tonal" size="x-large" class="mt-1 mb-1" v-else>
                                <random-icon />
                            </v-avatar>
                        </template>
                        <template #item.keywords="{item}">
                            <keywords-bar :keywords="item.keywords" />
                        </template>
                        <template #item.action="{item}">
                            <recipe-context-menu :recipe="item" />
                        </template>
                    </v-data-table-server>
                </v-card>
            </v-col>
        </v-row>

        <template v-if="recipes.length > 0 && useUserPreferenceStore().deviceSettings.search_viewMode == 'grid'">
            <v-row>
                <v-col cols="6" md="4" v-for="r in recipes" :key="r.id" class="pa-0">
                    <div class="position-relative">
                        <v-checkbox-btn
                            v-if="selectMode"
                            :model-value="selectedItems.some(s => s.id === r.id)"
                            @update:model-value="toggleGridSelect(r, $event)"
                            class="position-absolute"
                            style="top: 4px; left: 4px; z-index: 1;"
                            color="primary"
                        />
                        <recipe-card :recipe="r" />
                    </div>
                </v-col>
            </v-row>
        </template>

        <v-row v-if="recipes.length === 0 && !loading">
            <v-col cols="12" md="6" offset-md="3">
                <v-card class="pa-6 text-center" variant="outlined">
                    <v-icon size="64" color="grey" icon="fa-solid fa-utensils" class="mb-3" />
                    <div class="text-h6 mb-2">{{ $t('NoRecipesMatch') }}</div>
                    <div class="text-body-2 text-medium-emphasis mb-4">{{ $t('NoRecipesMatchHint') }}</div>
                    <v-btn
                        data-test="empty-state-reset"
                        color="primary"
                        variant="tonal"
                        prepend-icon="$reset"
                        @click="resetAll"
                    >
                        {{ $t('Reset') }}
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" md="6" offset-md="3" class="text-center">
                <v-pagination
                    v-if="ordering !== 'random' && tableItemCount > 0"
                    v-model="page"
                    :length="Math.ceil(tableItemCount / pageSize)"
                    @update:model-value="searchRecipes({page})"
                    class="ms-2 me-2"
                    size="small"
                />
                <v-btn
                    v-if="ordering === 'random'"
                    size="x-large"
                    rounded="xl"
                    prepend-icon="fa-solid fa-dice"
                    variant="tonal"
                    @click="searchRecipes({page: 1})"
                >
                    {{ $t('Shuffle') }}
                </v-btn>
            </v-col>
        </v-row>

        <TabbedDrawer
            v-model="settingsPanelOpen"
            v-model:active-tab="settingsActiveTab"
            v-model:pinned="settings.isPinned.value"
            :tabs="drawerTabs"
        >
            <template #filters>
                <div v-if="savedSearchInPanel" class="px-4 py-2">
                    <model-select model="CustomFilter" v-model="selectedCustomFilter" density="compact" />
                    <div class="d-flex ga-1 mt-1">
                        <v-btn variant="text" size="small" prepend-icon="fa-solid fa-upload"
                               :disabled="selectedCustomFilter == null"
                               @click="loadSelectedCustomFilter()" class="text-none">
                            {{ $t('Load') }}
                        </v-btn>
                        <v-btn variant="text" size="small" prepend-icon="$save"
                               @click="saveCustomFilter()" class="text-none">
                            {{ $t('Save') }}
                        </v-btn>
                    </div>
                    <v-divider class="mt-2" />
                </div>
                <FilterPanel
                    :grouped-filter-defs="drawerFilterDefs"
                    :get-filter="getFilter"
                    :set-filter="setFilter"
                    :clear-filter="clearFilter"
                    :clear-all-filters="clearAllFilters"
                    :active-filter-count="activeFilterCount"
                    :in-drawer="true"
                />
            </template>

            <template #settings>
                <div class="px-4 py-1">
                    <v-switch
                        v-model="settings.includeChildren.value"
                        :label="$t('IncludeChildren')"
                        color="primary"
                        hide-details
                        density="compact"
                    />
                </div>

                <div class="d-flex align-center px-4 py-1 ga-1">
                    <span class="text-body-2 flex-grow-1">{{ $t('SavedSearch') }}</span>
                    <v-btn-toggle density="compact" multiple>
                        <v-btn
                            size="x-small"
                            :active="savedSearchInline"
                            @click="savedSearchInline = !savedSearchInline"
                        >{{ $t('Page') }}</v-btn>
                        <v-btn
                            size="x-small"
                            :active="savedSearchInPanel"
                            @click="savedSearchInPanel = !savedSearchInPanel"
                        >{{ $t('Panel') }}</v-btn>
                    </v-btn-toggle>
                </div>
                <v-divider class="my-2" />

                <template v-for="[group, defs] in configurableFiltersByGroup" :key="group">
                    <CollapsibleSection :label="$t(group)">
                        <div v-for="def in defs" :key="def.key" class="d-flex align-center px-4 py-1 ga-1">
                            <span class="text-body-2 flex-grow-1">{{ $t(def.labelKey) }}</span>
                            <v-btn-toggle density="compact" multiple>
                                <v-btn
                                    size="x-small"
                                    :active="isInlineSelected(def.key)"
                                    @click="toggleInline(def.key)"
                                >{{ $t('Page') }}</v-btn>
                                <v-btn
                                    size="x-small"
                                    :active="isDrawerSelected(def.key)"
                                    @click="toggleDrawer(def.key)"
                                >{{ $t('Panel') }}</v-btn>
                            </v-btn-toggle>
                        </div>
                    </CollapsibleSection>
                </template>

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
                <v-btn variant="flat" color="primary" @click="settingsPanelOpen = false">
                    {{ $t('Done') }}
                </v-btn>
            </template>
        </TabbedDrawer>

        <v-dialog v-model="dialog">
            <v-card>
                <v-closable-card-title :title="$t('SavedSearch')" v-model="dialog" />
                <v-card-text>
                    <v-text-field :label="$t('Name')" v-model="newFilterName" />
                </v-card-text>
                <v-card-actions>
                    <v-btn prepend-icon="$create" color="create" @click="createCustomFilter()">{{ $t('Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Batch action dialogs — coming soon. The selection bar UI is active
             but actions are disabled until the batch-actions feature branch lands. -->
    </v-container>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useRouteQuery} from '@vueuse/router'
import {useDebounceFn} from '@vueuse/core'
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'

import {ApiApi, type ApiRecipeListRequest, type CustomFilter, type RecipeOverview} from '@/openapi'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

import {useUrlFilters} from '@/composables/useUrlFilters'
import {RECIPE_FILTER_DEFS, RECIPE_SORT_DEFS} from '@/composables/modellist/RecipeList'
import type {FilterDef} from '@/composables/modellist/types'
import {useModelListSettings} from '@/composables/modellist/useModelListSettings'
import {useFilterPlacement} from '@/composables/useFilterPlacement'
import RecipeTagFilterGroup from '@/components/search/RecipeTagFilterGroup.vue'
import InlineFilterCard from '@/components/search/InlineFilterCard.vue'

import ModelListToolbar from '@/components/model_list/ListToolbar.vue'
import ModelListFilterChips from '@/components/model_list/ModelListFilterChips.vue'
import FilterPanel from '@/components/model_list/FilterPanel.vue'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import SelectionBar from '@/components/common/SelectionBar.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'
import ClosableHelpAlert from '@/components/display/ClosableHelpAlert.vue'
import RecipeContextMenu from '@/components/inputs/RecipeContextMenu.vue'
import KeywordsBar from '@/components/display/KeywordsBar.vue'
import VClosableCardTitle from '@/components/dialogs/VClosableCardTitle.vue'
import RecipeCard from '@/components/display/RecipeCard.vue'
import RandomIcon from '@/components/display/RandomIcon.vue'
import {cropPreviewStyle} from '@/utils/image_crop'
import type {EditorSupportedTypes} from '@/types/Models'
import type {VDataTableUpdateOptions} from '@/vuetify'

const {t} = useI18n()
const router = useRouter()
const route = useRoute()
const {mobile} = useDisplay()

// ─── Filter / sort / paging state (5 useRouteQuery slots total) ─────────
const urlFilters = useUrlFilters(computed(() => RECIPE_FILTER_DEFS))
const {filterDefs, groupedFilterDefs, filterParams, activeFilterCount, getFilter, setFilter, clearFilter, clearAllFilters} = urlFilters
const query = useRouteQuery('query', '')
const ordering = useRouteQuery('ordering', '')
const page = useRouteQuery('page', 1, {transform: Number})
const pageSize = useRouteQuery('pageSize', useUserPreferenceStore().deviceSettings.search_itemsPerPage, {transform: Number})

// ─── Settings (device-persisted) ──────────────────────────────────────
const settings = useModelListSettings(computed(() => 'search'))

const DEFAULT_INLINE = ['_keywordsGroup', '_foodsGroup', '_booksGroup']
const DEFAULT_DRAWER = ['_keywordsGroup', '_foodsGroup', '_booksGroup', '_unitsGroup',
    'ratingGte', 'ratingLte', 'unrated', 'servings', 'timescooked', 'hasPhoto', 'hasKeywords', 'makenow',
    'workingTime', 'waitingTime', 'totalTime', 'cookedon', 'createdon', 'updatedon', 'viewedon',
    'createdby', 'internal']

const {isInlineSelected, toggleInline, isDrawerSelected, toggleDrawer,
    filteredDrawerDefs, filteredInlineDefs, configurableFiltersByGroup: makeConfigurable} =
    useFilterPlacement('search', DEFAULT_INLINE, DEFAULT_DRAWER)

const configurableFiltersByGroup = makeConfigurable(groupedFilterDefs)
const drawerFilterDefs = filteredDrawerDefs(groupedFilterDefs)
const inlineGroups = filteredInlineDefs(groupedFilterDefs)

const drawerTabs = computed(() => [
    {key: 'filters', label: t('Filters'), icon: 'fa-solid fa-filter'},
    {key: 'settings', label: t('Settings'), icon: 'fa-solid fa-sliders'},
])

// ─── Saved search placement ─────────────────────────────────────────────
const savedSearchInline = computed({
    get: () => useUserPreferenceStore().deviceSettings.search_savedSearchInline ?? true,
    set: (val: boolean) => { useUserPreferenceStore().deviceSettings.search_savedSearchInline = val },
})
const savedSearchInPanel = computed({
    get: () => useUserPreferenceStore().deviceSettings.search_savedSearchInPanel ?? true,
    set: (val: boolean) => { useUserPreferenceStore().deviceSettings.search_savedSearchInPanel = val },
})

// ─── Local UI state ─────────────────────────────────────────────────────
const loading = ref(false)
const recipes = ref<RecipeOverview[]>([])
const tableItemCount = ref(0)
const selectedItems = ref<EditorSupportedTypes[]>([])
const selectMode = ref(false)

function toggleGridSelect(recipe: RecipeOverview, selected: boolean) {
    if (selected) {
        if (!selectedItems.value.some(s => s.id === recipe.id)) {
            selectedItems.value = [...selectedItems.value, recipe as unknown as EditorSupportedTypes]
        }
    } else {
        selectedItems.value = selectedItems.value.filter(s => s.id !== recipe.id)
    }
}

const filtersCollapsed = ref(true)
const settingsPanelOpen = ref(false)
const settingsActiveTab = ref<'settings' | 'filters'>('filters')

// Unrated-only toggle — writable computed over the shared `rating` slot.
// Setting it true writes rating=0 (the backend sentinel) and clears any
// rating_gte / rating_lte siblings.

const selectedCustomFilter = ref<CustomFilter | null>(null)
const filterSnapshot = ref('')
const dialog = ref(false)
const newFilterName = ref('')

// Batch action dialogs

// AbortController for in-flight searches
let abortController = new AbortController()

const tableHeaders = computed(() => {
    const headers: Array<Record<string, any>> = [
        {title: t('Image'), width: '1%', noBreak: true, key: 'image'},
        {title: t('Name'), key: 'name'},
    ]
    if (!mobile.value) {
        headers.push({title: t('Keywords'), key: 'keywords'})
    }
    headers.push({title: t('Actions'), key: 'action', width: '1%', noBreak: true, align: 'end'})
    return headers
})

const hasActiveSearchState = computed(() =>
    !!query.value || activeFilterCount.value > 0 || (!!ordering.value && ordering.value !== ''),
)


function openSettingsPanel(tab: 'settings' | 'filters') {
    settingsActiveTab.value = tab
    settingsPanelOpen.value = true
}

// Exposed for component tests — script setup doesn't auto-expose bindings.
defineExpose({openSettingsPanel, settingsActiveTab, settingsPanelOpen, onTableUpdate, filterParams, pageSize})

function resetAll() {
    query.value = ''
    ordering.value = ''
    clearAllFilters()
    selectedCustomFilter.value = null
    filterSnapshot.value = ''
}

/* ─── Search ────────────────────────────────────────────────────────── */

function buildSearchParams(): ApiRecipeListRequest {
    return {
        ...(filterParams.value as Partial<ApiRecipeListRequest>),
        page: page.value,
        pageSize: pageSize.value,
        ...(query.value ? {query: query.value} : {}),
        ...(ordering.value ? {sortOrder: ordering.value} : {}),
        includeChildren: useUserPreferenceStore().deviceSettings.search_includeChildren ?? true,
    }
}

function searchRecipes(opts?: {page?: number}) {
    if (opts?.page !== undefined) page.value = opts.page

    abortController.abort()
    abortController = new AbortController()

    loading.value = true
    selectedItems.value = []
    useUserPreferenceStore().deviceSettings.search_itemsPerPage = pageSize.value

    const api = new ApiApi()
    api.apiRecipeList(buildSearchParams(), {signal: abortController.signal})
        .then((r) => {
            recipes.value = r.results
            tableItemCount.value = r.count
        })
        .catch((err) => {
            if (err.name !== 'AbortError' && err?.cause?.name !== 'AbortError') {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            }
        })
        .finally(() => {
            loading.value = false
            window.scrollTo({top: 0, behavior: 'smooth'})
        })
}

function onTableUpdate(opts: VDataTableUpdateOptions) {
    if (opts.itemsPerPage != null && opts.itemsPerPage !== pageSize.value) {
        pageSize.value = opts.itemsPerPage
    }
    if (opts.page !== page.value) {
        page.value = opts.page
    }
    searchRecipes()
}

function handleRowClick(_event: PointerEvent, data: any) {
    router.push({name: 'RecipeViewPage', params: {id: data.item.id}})
}

// Watcher attached in onMounted after first fetch to avoid double-fire on legacy URL migration.
const debouncedSearch = useDebounceFn(() => searchRecipes({page: 1}), 300)
let stopReQueryWatcher: (() => void) | null = null
function startReQueryWatcher() {
    if (stopReQueryWatcher) return
    stopReQueryWatcher = watch([filterParams, ordering, query, pageSize], () => {
        debouncedSearch()
    })
}

/* ─── Saved CustomFilter ─────────────────────────────────────────────── */

type FilterBlob = { query?: string, version?: '2', [k: string]: unknown }

function filtersToJson(): FilterBlob {
    const out: FilterBlob = {}
    if (query.value) out.query = query.value
    for (const def of RECIPE_FILTER_DEFS) {
        const raw = getFilter(def.key)
        if (raw === undefined || raw === '') continue
        if (def.type === 'tag-select') {
            const items = raw.split(',').filter(s => s.length > 0).map(Number).filter(n => !isNaN(n))
            if (items.length > 0) out[def.key] = items
        } else if (def.type === 'date-range' || def.type === 'number-range') {
            const sep = raw.indexOf('~')
            if (sep < 0) continue
            const prefix = def.key
            const gte = raw.slice(0, sep), lte = raw.slice(sep + 1)
            const isNum = def.type === 'number-range'
            if (gte) out[`${prefix}_gte`] = isNum ? Number(gte) : gte
            if (lte) out[`${prefix}_lte`] = isNum ? Number(lte) : lte
        } else if (def.type === 'rating-half') {
            const n = Number(raw); if (!isNaN(n)) out[def.key] = n
        } else if (def.type === 'tristate' || def.type === 'toggle') {
            out[def.key] = raw === '1'
        } else if (def.type === 'number') {
            const n = Number(raw); if (!isNaN(n)) out[def.key] = n
        } else {
            out[def.key] = raw
        }
    }
    out.version = '2'
    return out
}

function applyFilterBlob(params: FilterBlob) {
    if (params.unrated_only === true) {
        setFilter('unrated', '1')
    }
    // Backward compat: old saved searches stored rating as rating_gte/rating_lte
    if (params.rating_gte != null) setFilter('ratingGte', String(params.rating_gte))
    if (params.rating_lte != null) setFilter('ratingLte', String(params.rating_lte))
    for (const def of RECIPE_FILTER_DEFS) {
        if (def.type === 'date-range' || def.type === 'number-range') {
            const prefix = def.key
            const gte = params[`${prefix}_gte`] ?? params[`${def.key}_gte`]
            const lte = params[`${prefix}_lte`] ?? params[`${def.key}_lte`]
            if (gte != null || lte != null) setFilter(def.key, {gte: gte ?? null, lte: lte ?? null})
        } else if (def.type === 'rating-half') {
            const v = params[def.key]
            if (v != null && v !== '') setFilter(def.key, String(v))
        } else if (def.type === 'tag-select') {
            const v = params[def.key]
            if (Array.isArray(v) && v.length > 0) setFilter(def.key, v.map(Number).filter(n => !isNaN(n)))
        } else if (def.type === 'tristate' || def.type === 'toggle') {
            const v = params[def.key]
            if (v === true || v === 'true' || v === 1 || v === '1') setFilter(def.key, '1')
            else if (v === false || v === 'false' || v === 0 || v === '0') setFilter(def.key, '0')
        } else {
            const v = params[def.key]
            if (v != null && v !== '') setFilter(def.key, String(v))
        }
    }
}

function snapshotFilters() { filterSnapshot.value = JSON.stringify(filtersToJson()) }
const savedFilterModified = computed(() => {
    if (!selectedCustomFilter.value || !filterSnapshot.value) return false
    return JSON.stringify(filtersToJson()) !== filterSnapshot.value
})

function loadSelectedCustomFilter() {
    if (!selectedCustomFilter.value) return
    const raw = (selectedCustomFilter.value as any).search
    const blob: FilterBlob = typeof raw === 'string'
        ? (() => { try { const p = JSON.parse(raw); return p && typeof p === 'object' ? p : {} } catch { return {} } })()
        : (raw && typeof raw === 'object' ? raw : {})
    // Suppress the re-query watcher during bulk state changes to avoid
    // intermediate searches with partial/empty filters.
    if (stopReQueryWatcher) { stopReQueryWatcher(); stopReQueryWatcher = null }
    clearAllFilters()
    if (typeof blob.query === 'string') query.value = blob.query
    else query.value = ''
    applyFilterBlob(blob)
    snapshotFilters()
    startReQueryWatcher()
    searchRecipes({page: 1})
}

function saveCustomFilter() {
    const api = new ApiApi()
    if (selectedCustomFilter.value != null) {
        loading.value = true
        selectedCustomFilter.value.search = filtersToJson() as any
        api.apiCustomFilterUpdate({id: selectedCustomFilter.value.id!, customFilter: selectedCustomFilter.value})
            .then((r) => { selectedCustomFilter.value = r; snapshotFilters() })
            .catch(err => useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err))
            .finally(() => { loading.value = false })
    } else {
        newFilterName.value = ''
        dialog.value = true
    }
}

function createCustomFilter() {
    const api = new ApiApi()
    dialog.value = false
    loading.value = true
    api.apiCustomFilterCreate({
        customFilter: {name: newFilterName.value, type: 'RECIPE', search: filtersToJson()} as any,
    })
        .then((r) => { selectedCustomFilter.value = r; snapshotFilters() })
        .catch(err => useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err))
        .finally(() => { loading.value = false })
}

/* ─── Lifecycle ─────────────────────────────────────────────────────── */

onMounted(() => {
    searchRecipes({page: page.value})
    startReQueryWatcher()
})
</script>

<style scoped>
.crop-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
}
</style>
