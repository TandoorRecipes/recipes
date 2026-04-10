<template>
    <v-container>
        <v-row v-if="selectedItems.length > 0">
            <v-col>
                <v-card>
                    <v-card-text class="d-flex align-center pt-2 pb-2 ga-2">
                        <span class="text-subtitle-2">{{ selectedItems.length }} {{ $t('Selected') }}</span>
                        <v-spacer />
                        <v-btn variant="text" prepend-icon="$edit" @click="batchEditDialog = true">{{ $t('BatchEdit') }}</v-btn>
                        <v-btn variant="text" prepend-icon="$delete" @click="batchDeleteDialog = true">{{ $t('Delete_All') }}</v-btn>
                        <v-btn icon="$close" variant="text" @click="selectedItems = []" />
                    </v-card-text>
                </v-card>
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
                    <template #below-search>
                        <model-select model="CustomFilter" v-model="selectedCustomFilter" density="compact" class="mt-1">
                            <template #append>
                                <v-btn variant="text" size="small" prepend-icon="fa-solid fa-upload"
                                       :disabled="selectedCustomFilter == null"
                                       @click="loadSelectedCustomFilter()" class="text-none ms-1">
                                    {{ $t('Load') }}
                                </v-btn>
                                <v-btn variant="text" size="small" prepend-icon="$save"
                                       @click="saveCustomFilter()" class="text-none ms-1">
                                    {{ $t('Save') }}
                                </v-btn>
                            </template>
                        </model-select>
                        <closable-help-alert
                            v-if="savedFilterModified"
                            :text="$t('saved_filter_override_hint')"
                            class="mt-1"
                        />
                    </template>
                </ModelListToolbar>

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

                <v-row dense class="mt-2">
                    <v-col cols="12" md="4">
                        <RecipeTagFilterGroup
                            :label="$t('Keywords')"
                            model-name="Keyword"
                            :keys="['keywords', 'keywordsAnd', 'keywordsOrNot', 'keywordsAndNot']"
                            :get-filter="getFilter"
                            :set-filter="setFilter"
                            :clear-filter="clearFilter"
                        />
                    </v-col>
                    <v-col cols="12" md="4">
                        <RecipeTagFilterGroup
                            :label="$t('Foods')"
                            model-name="Food"
                            :keys="['foods', 'foodsAnd', 'foodsOrNot', 'foodsAndNot']"
                            :get-filter="getFilter"
                            :set-filter="setFilter"
                            :clear-filter="clearFilter"
                        />
                    </v-col>
                    <v-col cols="12" md="4">
                        <RecipeTagFilterGroup
                            :label="$t('Books')"
                            model-name="RecipeBook"
                            :keys="['books', 'booksAnd', 'booksOrNot', 'booksAndNot']"
                            :get-filter="getFilter"
                            :set-filter="setFilter"
                            :clear-filter="clearFilter"
                        />
                    </v-col>
                </v-row>
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
                            <v-avatar :image="item.image" size="x-large" class="mt-1 mb-1" v-if="item.image" />
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
                    <recipe-card :recipe="r" />
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

        <ModelListSettingsPanel
            v-model="settingsPanelOpen"
            v-model:active-tab="settingsActiveTab"
            :model="recipeSettingsModel"
            :grouped-filter-defs="groupedFilterDefs"
            :get-filter="getFilter"
            :set-filter="setFilter"
            :clear-all-filters="clearAllFilters"
            :active-filter-count="activeFilterCount"
        />

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

        <batch-delete-dialog :items="selectedItems" model="Recipe" v-model="batchDeleteDialog" activator="model" @change="searchRecipes({page: 1})" />
        <batch-edit-recipe-dialog :items="selectedItems" v-model="batchEditDialog" activator="model" @change="searchRecipes({page})" />
    </v-container>
</template>

<script setup lang="ts">
import {computed, onMounted, provide, ref, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useRouteQuery} from '@vueuse/router'
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'

import {ApiApi, type ApiRecipeListRequest, type CustomFilter, type RecipeOverview} from '@/openapi'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

import {useUrlFilters} from '@/composables/useUrlFilters'
import {RECIPE_FILTER_DEFS, RECIPE_SORT_DEFS} from '@/composables/modellist/RecipeList'
import {useModelListSettings, MODEL_LIST_SETTINGS_KEY} from '@/composables/modellist/useModelListSettings'
import RecipeTagFilterGroup from '@/components/search/RecipeTagFilterGroup.vue'

import ModelListToolbar from '@/components/model_list/ModelListToolbar.vue'
import ModelListFilterChips from '@/components/model_list/ModelListFilterChips.vue'
import ModelListSettingsPanel from '@/components/model_list/ModelListSettingsPanel.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'
import ClosableHelpAlert from '@/components/display/ClosableHelpAlert.vue'
import RecipeContextMenu from '@/components/inputs/RecipeContextMenu.vue'
import KeywordsBar from '@/components/display/KeywordsBar.vue'
import VClosableCardTitle from '@/components/dialogs/VClosableCardTitle.vue'
import RecipeCard from '@/components/display/RecipeCard.vue'
import RandomIcon from '@/components/display/RandomIcon.vue'
import BatchDeleteDialog from '@/components/dialogs/BatchDeleteDialog.vue'
import BatchEditRecipeDialog from '@/components/dialogs/BatchEditRecipeDialog.vue'
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

// ─── ModelListSettingsPanel injection contract ──────────────────────────
// ModelListSettingsPanel reads device settings (column visibility, swipe,
// stats, etc.) via inject(MODEL_LIST_SETTINGS_KEY). ModelListPage provides
// this from useModelListSettings; SearchPage must do the same or the panel
// crashes when opened.
const settings = useModelListSettings(computed(() => 'search'))
provide(MODEL_LIST_SETTINGS_KEY, settings)

// ─── Local UI state ─────────────────────────────────────────────────────
const loading = ref(false)
const recipes = ref<RecipeOverview[]>([])
const tableItemCount = ref(0)
const selectedItems = ref<EditorSupportedTypes[]>([])
const selectMode = ref(false)

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
const batchDeleteDialog = ref(false)
const batchEditDialog = ref(false)

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

const recipeSettingsModel = computed(() => ({
    name: 'Recipe' as const,
    localizationKey: 'Recipe',
    icon: 'fa-solid fa-utensils',
    listSettings: {settingsKey: 'search', settingsPanel: true},
}))

function openSettingsPanel(tab: 'settings' | 'filters') {
    const viewMode = useUserPreferenceStore().deviceSettings.search_viewMode
    if (tab === 'settings' && viewMode === 'grid') {
        tab = 'filters'
    }
    settingsActiveTab.value = tab
    settingsPanelOpen.value = true
}

// Exposed for component tests — script setup doesn't auto-expose bindings.
defineExpose({openSettingsPanel, settingsActiveTab, settingsPanelOpen})

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
        // filterParams is Record<string, string | number | (string|number)[]>
        // FilterDef keys are camelCase OpenAPI client prop names.
        ...(filterParams.value as Partial<ApiRecipeListRequest>),
        page: page.value,
        pageSize: pageSize.value,
        ...(query.value ? {query: query.value} : {}),
        ...(ordering.value ? {sortOrder: ordering.value} : {}),
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
            if (err.name !== 'AbortError') {
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
    router.push({name: 'RecipeViewPage', params: {id: recipes.value[data.index].id}})
}

// Watcher attached in onMounted after first fetch to avoid double-fire on legacy URL migration.
let stopReQueryWatcher: (() => void) | null = null
function startReQueryWatcher() {
    if (stopReQueryWatcher) return
    stopReQueryWatcher = watch([filterParams, ordering, query, pageSize], () => {
        searchRecipes({page: 1})
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
            if (gte) out[`${prefix}_gte`] = def.type === 'number-range' ? Number(gte) : gte
            if (lte) out[`${prefix}_lte`] = def.type === 'number-range' ? Number(lte) : lte
        } else if (def.type === 'tristate') {
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
    for (const def of RECIPE_FILTER_DEFS) {
        if (def.type === 'date-range' || def.type === 'number-range') {
            const prefix = def.key
            const gte = params[`${prefix}_gte`] ?? params[`${def.key}_gte`]
            const lte = params[`${prefix}_lte`] ?? params[`${def.key}_lte`]
            if (gte != null || lte != null) setFilter(def.key, {gte: gte ?? null, lte: lte ?? null})
        } else if (def.type === 'tag-select') {
            const v = params[def.key]
            if (Array.isArray(v) && v.length > 0) setFilter(def.key, v.map(Number).filter(n => !isNaN(n)))
        } else if (def.type === 'tristate') {
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
const savedFilterModified = computed(() =>
    !!selectedCustomFilter.value && filterSnapshot.value && JSON.stringify(filtersToJson()) !== filterSnapshot.value,
)

function loadSelectedCustomFilter() {
    if (!selectedCustomFilter.value) return
    const raw = (selectedCustomFilter.value as any).search
    const blob: FilterBlob = typeof raw === 'string'
        ? (() => { try { const p = JSON.parse(raw); return p && typeof p === 'object' ? p : {} } catch { return {} } })()
        : (raw && typeof raw === 'object' ? raw : {})
    clearAllFilters()
    if (typeof blob.query === 'string') query.value = blob.query
    applyFilterBlob(blob)
    snapshotFilters()
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
