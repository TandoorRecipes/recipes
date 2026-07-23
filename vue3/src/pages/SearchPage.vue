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
                            <v-btn v-if="!editMode" variant="text" size="small" prepend-icon="fa-solid fa-upload"
                                   :disabled="selectedCustomFilter == null"
                                   @click="loadSelectedCustomFilter()" class="text-none">
                                {{ $t('Load') }}
                            </v-btn>
                            <v-btn variant="text" size="small" prepend-icon="$save"
                                   @click="saveCustomFilter()" class="text-none">
                                {{ $t('Save') }}
                            </v-btn>
                            <v-btn v-if="selectedCustomFilter != null && !editMode" icon variant="text" size="small"
                                   :aria-label="$t('Edit')" @click="editMode = true">
                                <v-icon icon="$edit" />
                                <v-tooltip activator="parent" location="top">{{ $t('Edit') }}</v-tooltip>
                            </v-btn>
                            <v-btn v-if="editMode" variant="text" size="small" @click="cancelEdit()" class="text-none">
                                {{ $t('Cancel') }}
                            </v-btn>
                            <v-btn v-if="editMode" variant="text" size="small" color="delete" prepend-icon="$delete"
                                   @click="deleteCustomFilter()" class="text-none ms-2">
                                {{ $t('Delete') }}
                            </v-btn>
                        </template>
                    </template>
                    <template #search-append-inner v-if="!selectMode && (inlineGroups.length > 0 || savedSearchInline)">
                        <v-btn
                            :icon="filtersCollapsed ? 'fa-solid fa-caret-down' : 'fa-solid fa-caret-up'"
                            color="primary"
                            variant="flat"
                            size="small"
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

                    <v-row v-if="inlineGroups.length > 0" density="compact" class="mt-2">
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

        <v-row v-if="showStats" class="mt-1">
            <v-col>
                <ModelListStatsFooter
                    :page-count="recipes.length"
                    :item-count="tableItemCount"
                    :stats="stats"
                    :stat-defs="RECIPE_STAT_DEFS"
                    :loading="statsLoading"
                    @apply-filter="applyStatFilter"
                />
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
                <div v-if="!savedSearchInline" class="px-4 py-2">
                    <model-select model="CustomFilter" v-model="selectedCustomFilter" density="compact" />
                    <div class="d-flex ga-1 mt-1">
                        <v-btn v-if="!editMode" variant="text" size="small" prepend-icon="fa-solid fa-upload"
                               :disabled="selectedCustomFilter == null"
                               @click="loadSelectedCustomFilter()" class="text-none">
                            {{ $t('Load') }}
                        </v-btn>
                        <v-btn variant="text" size="small" prepend-icon="$save"
                               @click="saveCustomFilter()" class="text-none">
                            {{ $t('Save') }}
                        </v-btn>
                        <v-btn v-if="selectedCustomFilter != null && !editMode" icon variant="text" size="small"
                               :aria-label="$t('Edit')" @click="editMode = true">
                            <v-icon icon="$edit" />
                            <v-tooltip activator="parent" location="top">{{ $t('Edit') }}</v-tooltip>
                        </v-btn>
                        <v-btn v-if="editMode" variant="text" size="small" @click="cancelEdit()" class="text-none">
                            {{ $t('Cancel') }}
                        </v-btn>
                        <v-btn v-if="editMode" variant="text" size="small" color="delete" prepend-icon="$delete"
                               @click="deleteCustomFilter()" class="text-none ms-2">
                            {{ $t('Delete') }}
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

                <div class="px-4 py-1">
                    <v-switch
                        :model-value="showStats"
                        @update:model-value="useUserPreferenceStore().deviceSettings.search_showStats = $event === true"
                        :label="$t('ShowStatsFooter')"
                        color="primary"
                        hide-details
                        density="compact"
                    />
                </div>

                <div class="d-flex align-center px-4 py-1 ga-1">
                    <span class="text-body-2 flex-grow-1">{{ $t('View') }}</span>
                    <v-btn-toggle density="compact" mandatory color="primary"
                        :model-value="useUserPreferenceStore().deviceSettings.search_viewMode"
                        @update:model-value="useUserPreferenceStore().deviceSettings.search_viewMode = $event">
                        <v-btn value="table" size="x-small">{{ $t('Table') }}</v-btn>
                        <v-btn value="grid" size="x-small">{{ $t('Cards') }}</v-btn>
                    </v-btn-toggle>
                </div>

                <div class="d-flex align-center px-4 py-1 ga-1">
                    <span class="text-body-2 flex-grow-1">{{ $t('SavedSearch') }}</span>
                    <v-btn-toggle density="compact" mandatory color="primary" :model-value="savedSearchInline ? 'page' : 'panel'" @update:model-value="savedSearchInline = $event === 'page'">
                        <v-btn value="page" size="x-small">{{ $t('Page') }}</v-btn>
                        <v-btn value="panel" size="x-small">{{ $t('Panel') }}</v-btn>
                    </v-btn-toggle>
                </div>
                <v-divider class="my-2" />

                <ClosableHelpAlert class="mx-4 mt-1 mb-2" :title="$t('FilterPlacementTitle')" :text="$t('FilterPlacementHelp')" />

                <template v-for="[group, defs] in configurableFiltersByGroup" :key="group">
                    <CollapsibleSection :label="$t(group)">
                        <div v-for="def in defs" :key="def.key" class="d-flex align-center px-4 py-1 ga-1">
                            <span class="text-body-2 flex-grow-1">{{ $t(def.labelKey) }}</span>
                            <!-- Page and Panel are independent placements (both/either/neither),
                                 so a multiple v-btn-toggle driven by model-value — matching the
                                 View / Saved Search toggles above — stays compact and highlights
                                 the active placements. -->
                            <v-btn-toggle
                                multiple density="compact" color="primary"
                                :model-value="placementValue(def.key)"
                                @update:model-value="(v) => setPlacement(def.key, v as string[])">
                                <v-btn :data-test="'placement-page-' + def.key" value="page" size="x-small">{{ $t('Page') }}</v-btn>
                                <v-btn :data-test="'placement-panel-' + def.key" value="panel" size="x-small">{{ $t('Panel') }}</v-btn>
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
                    <v-checkbox v-if="ordering" v-model="includeSort" :label="$t('IncludeSortOrder')" hide-details density="compact" />
                </v-card-text>
                <v-card-actions>
                    <v-btn prepend-icon="$create" color="create" @click="createCustomFilter()">{{ $t('Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <action-confirm-dialog ref="confirmDialogRef" />

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
import {ErrorMessageType, PreparedMessage, useMessageStore} from '@/stores/MessageStore'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

import {useUrlFilters} from '@/composables/useUrlFilters'
import {RECIPE_FILTER_DEFS, RECIPE_SORT_DEFS} from '@/composables/modellist/RecipeList'
import type {FilterDef, FilterValue, StatDef} from '@/composables/modellist/types'
import {buildSearchBlob, parseSearchBlob, type FilterBlob} from '@/utils/savedSearchBlob'

function isoDaysAgo(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().slice(0, 10)
}

// Keys match the TypeScript RecipeStats interface (what RecipeStatsFromJSON
// produces), not the backend JSON — snake_case keys like `makenow_ready`
// silently resolve to 0 because the client has already renamed them.
// `filter` (where defined) turns the chip into a "jump to this filter" shortcut
// that matches the stat's own definition — makenow_ready uses the makenow
// tristate, new uses createdon_gte = 7 days ago, etc.
const RECIPE_STAT_DEFS: StatDef[] = [
    {key: 'makenowReady', labelKey: 'MakenowReady', icon: 'fa-solid fa-utensils', color: 'success', filter: () => ({makenow: '1'})},
    {key: '_new',         labelKey: 'New',          icon: 'fa-solid fa-star',          color: 'info',    filter: () => ({createdon: {gte: isoDaysAgo(7)}})},
    {key: 'unrated',      labelKey: 'Unrated',      icon: 'fa-solid fa-star-half-stroke', color: 'warning', filter: () => ({unrated: '1'})},
    {key: 'neverCooked',  labelKey: 'NeverCooked',  icon: 'fa-regular fa-clock',       color: 'warning', filter: () => ({timescooked: {lte: 0}})},
    {key: '_private',     labelKey: 'Private',      icon: 'fa-solid fa-user-lock',     color: 'info'},
]
import {useModelListSettings} from '@/composables/modellist/useModelListSettings'
import {useFilterPlacement} from '@/composables/useFilterPlacement'
import RecipeTagFilterGroup from '@/components/search/RecipeTagFilterGroup.vue'
import InlineFilterCard from '@/components/search/InlineFilterCard.vue'

import ModelListToolbar from '@/components/model_list/ListToolbar.vue'
import ModelListFilterChips from '@/components/model_list/ModelListFilterChips.vue'
import ModelListStatsFooter from '@/components/model_list/ModelListStatsFooter.vue'
import FilterPanel from '@/components/model_list/FilterPanel.vue'
import TabbedDrawer from '@/components/common/TabbedDrawer.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import SelectionBar from '@/components/common/SelectionBar.vue'
import ModelSelect from '@/components/inputs/ModelSelect.vue'
import ClosableHelpAlert from '@/components/display/ClosableHelpAlert.vue'
import RecipeContextMenu from '@/components/inputs/RecipeContextMenu.vue'
import KeywordsBar from '@/components/display/KeywordsBar.vue'
import VClosableCardTitle from '@/components/dialogs/VClosableCardTitle.vue'
import ActionConfirmDialog from '@/components/dialogs/ActionConfirmDialog.vue'
import RecipeCard from '@/components/display/RecipeCard.vue'
import RandomIcon from '@/components/display/RandomIcon.vue'
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
const {isInlineSelected, toggleInline, isDrawerSelected, toggleDrawer, configurableFiltersByGroup: makeConfigurable} = useFilterPlacement()
const configurableFiltersByGroup = makeConfigurable(groupedFilterDefs)

// Placement toggle <-> v-btn-toggle model bridge: the group's selected values
// (['page','panel'] subset) mirror the inline/drawer flags; applying a change
// toggles whichever flag differs.
function placementValue(key: string): string[] {
    const v: string[] = []
    if (isInlineSelected(key)) v.push('page')
    if (isDrawerSelected(key)) v.push('panel')
    return v
}
function setPlacement(key: string, val: string[]) {
    if (val.includes('page') !== isInlineSelected(key)) toggleInline(key)
    if (val.includes('panel') !== isDrawerSelected(key)) toggleDrawer(key)
}

const drawerTabs = computed(() => [
    {key: 'filters', label: t('Filters'), icon: 'fa-solid fa-filter'},
    {key: 'settings', label: t('Settings'), icon: 'fa-solid fa-sliders'},
])

// ─── Saved search placement ─────────────────────────────────────────────
const savedSearchInline = computed({
    get: () => useUserPreferenceStore().deviceSettings.search_savedSearchInline ?? true,
    set: (val: boolean) => { useUserPreferenceStore().deviceSettings.search_savedSearchInline = val },
})

// ─── Saved-search edit mode ─────────────────────────────────────────────
// When editing a loaded saved search, reveal ALL non-hidden filter fields so the
// user can see/change every field it uses — regardless of their per-filter
// placement config (they may have hidden fields from both page and drawer). This
// is a reactive override inside the visibility computeds (no settings mutation):
// exiting edit mode reverts naturally.
const editMode = ref(false)
const confirmDialogRef = ref<InstanceType<typeof ActionConfirmDialog> | null>(null)

// ─── Drawer filter visibility (search-specific) ────────────────────────
// Drawer filters are driven by useFilterPlacement (isDrawerSelected) so what
// renders always matches the Panel toggles — including an explicitly emptied
// list. Ungrouped filters (no group) are not placement-configurable and always
// show. In edit mode, placement is overridden to show all non-hidden defs.
const drawerFilterDefs = computed(() => {
    const filtered = new Map<string, FilterDef[]>()
    for (const [group, defs] of groupedFilterDefs.value) {
        const visible = defs.filter(d => !d.hidden && (editMode.value || !group || isDrawerSelected(d.key)))
        if (visible.length > 0) filtered.set(group, visible)
    }
    return filtered
})

// ─── Inline filter visibility (per-filter granularity) ──────────────────
// Driven by useFilterPlacement (isInlineSelected) so what renders on the page
// matches the Page toggles, including an explicitly emptied list. In edit mode,
// show all non-hidden defs (the `!d.hidden` guard keeps the hidden `unrated` /
// tag-select variant keys out of the inline area).
const inlineGroups = computed(() => {
    const result: [string, FilterDef[]][] = []
    for (const [group, defs] of groupedFilterDefs.value) {
        if (!group) continue
        const visible = defs.filter(d => editMode.value ? !d.hidden : isInlineSelected(d.key))
        if (visible.length > 0) result.push([group, visible])
    }
    return result
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

const selectedCustomFilter = ref<CustomFilter | null>(null)
const filterSnapshot = ref('')
const dialog = ref(false)
const newFilterName = ref('')
// Whether the saved search stores its sort order. Stateful (not just a save-time
// arg) so the no-arg filtersToJson() reflects it — sort changes then register in
// savedFilterModified. ON when a loaded filter carries sort_order or the "Include
// sort order" checkbox is ticked.
const includeSort = ref(false)
// `search` keys not recognized by the serde (legacy/removed/foreign), preserved
// verbatim across an edit so nothing is silently dropped.
const unknownStash = ref<Record<string, unknown>>({})

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
defineExpose({openSettingsPanel, settingsActiveTab, settingsPanelOpen, onTableUpdate, filterParams, pageSize, applyStatFilter, inlineGroups, drawerFilterDefs, editMode, selectedCustomFilter, saveCustomFilter, cancelEdit, deleteCustomFilter, confirmDialogRef})

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

function filtersToJson(): FilterBlob {
    return buildSearchBlob({
        defs: RECIPE_FILTER_DEFS,
        getFilter,
        query: query.value,
        ordering: ordering.value,
        includeSort: includeSort.value,
        stash: unknownStash.value,
    })
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
    query.value = typeof blob.query === 'string' ? blob.query : ''
    const {applies, ordering: ord, hasSort, stash} = parseSearchBlob({defs: RECIPE_FILTER_DEFS, blob})
    for (const a of applies) setFilter(a.key, a.value)
    // Restore the stored sort (and track that this filter carries one). A filter
    // without a sort_order leaves the current ordering untouched (sort is optional).
    includeSort.value = hasSort
    if (hasSort && ord != null) ordering.value = ord
    unknownStash.value = stash
    snapshotFilters()
    startReQueryWatcher()
    searchRecipes({page: 1})
}

async function saveCustomFilter() {
    const api = new ApiApi()
    if (selectedCustomFilter.value != null) {
        loading.value = true
        selectedCustomFilter.value.search = filtersToJson() as any
        try {
            const r = await api.apiCustomFilterUpdate({id: selectedCustomFilter.value.id!, customFilter: selectedCustomFilter.value})
            selectedCustomFilter.value = r
            snapshotFilters()
            editMode.value = false
        } catch (err) {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        } finally {
            loading.value = false
        }
    } else {
        newFilterName.value = ''
        includeSort.value = false  // opt-in per save; checkbox shown only when a sort is active
        dialog.value = true
    }
}

/** Exit edit mode without persisting — no changes to anything. */
function cancelEdit() { editMode.value = false }

/** Delete the loaded saved search (with confirmation), then clear + exit edit mode. */
async function deleteCustomFilter() {
    if (!selectedCustomFilter.value) return
    const confirmed = await confirmDialogRef.value?.open({
        title: t('Delete'),
        message: t('delete_confirmation', {source: selectedCustomFilter.value.name}),
        confirmLabel: t('Delete'),
        confirmColor: 'delete',
        confirmIcon: '$delete',
    })
    if (!confirmed) return
    const id = selectedCustomFilter.value.id!
    loading.value = true
    try {
        await new ApiApi().apiCustomFilterDestroy({id})
        selectedCustomFilter.value = null
        editMode.value = false
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    } finally {
        loading.value = false
    }
}

// Deselecting the saved search while editing must not strand the user in edit
// mode with the pencil (v-if selectedCustomFilter) gone.
watch(selectedCustomFilter, (v) => { if (!v) editMode.value = false })

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

/* ─── Stats footer ──────────────────────────────────────────────────── */

const showStats = computed(() => !!useUserPreferenceStore().deviceSettings.search_showStats)
const stats = ref<Record<string, number>>({})
const statsLoading = ref(false)

function loadStats() {
    if (!showStats.value) return
    statsLoading.value = true
    new ApiApi().apiRecipeStatsRetrieve()
        .then((r: any) => { stats.value = r as Record<string, number> })
        .catch(() => { /* non-critical; leave prior stats in place */ })
        .finally(() => { statsLoading.value = false })
}

watch(showStats, (on) => { if (on) loadStats() })

// Apply filters emitted by a stat-chip click. Replace semantics: the chip
// represents a global stat over the whole visible set, so the drill-down
// should yield exactly that population — any existing filters are cleared
// first. Users can then layer additional filters on top manually.
function applyStatFilter(filter: Record<string, FilterValue>) {
    clearAllFilters()
    for (const [k, v] of Object.entries(filter)) {
        setFilter(k, v)
    }
}

/* ─── Lifecycle ─────────────────────────────────────────────────────── */

onMounted(async () => {
    // Deep-link from the database page's Edit action: preload the saved search and
    // open it in edit mode. loadSelectedCustomFilter() starts the watcher + searches.
    const editFilterId = Number(route.query.editFilter)
    if (editFilterId) {
        try {
            selectedCustomFilter.value = await new ApiApi().apiCustomFilterRetrieve({id: editFilterId})
            loadSelectedCustomFilter()
            editMode.value = true
            loadStats()
            return
        } catch {
            // Filter not found (e.g. deleted) — fall through to a normal search.
        }
    }
    searchRecipes({page: page.value})
    startReQueryWatcher()
    loadStats()
})
</script>
