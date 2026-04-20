/**
 * Lightweight page mount helper.
 *
 * Pages depend on Vuetify, vue-router, vue-i18n, and Pinia.
 * This helper wires up the minimum to verify a page mounts without errors.
 *
 * Usage:
 *   const wrapper = mountPage(StartPage)
 *   await flushPromises()  // settle onMounted API calls
 */

import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Component } from 'vue'

const STUB_TEMPLATE = { template: '<div/>' }

/** Stub map for heavy child components — keeps page tests fast */
const DEFAULT_STUBS: Record<string, Component> = {
    // Display components
    RecipeView: { template: '<div class="stub-recipe-view"/>' },
    RecipeCard: { template: '<div class="stub-recipe-card"/>' },
    ShoppingListView: { template: '<div class="stub-shopping-list-view"/>' },
    MealPlanView: { template: '<div class="stub-meal-plan-view"/>' },
    HorizontalRecipeWindow: { template: '<div class="stub-horizontal-recipe-window"/>' },
    HorizontalRecipeScroller: { template: '<div class="stub-horizontal-recipe-scroller"/>' },
    HorizontalMealPlanWindow: { template: '<div class="stub-horizontal-meal-plan-window"/>' },
    BookEntryCard: { template: '<div class="stub-book-entry-card"/>' },
    RecipeBookCard: { template: '<div class="stub-recipe-book-card"/>' },
    ImportLogViewer: { template: '<div class="stub-import-log-viewer"/>' },
    ExternalRecipeViewer: { template: '<div class="stub-external-recipe-viewer"/>' },
    // Dialogs
    ModelEditDialog: { template: '<div class="stub-model-edit-dialog"/>' },
    ImportTandoorDialog: { template: '<div class="stub-import-dialog"/>' },
    DeleteConfirmDialog: { template: '<div class="stub-delete-confirm-dialog"/>' },
    BatchDeleteDialog: { template: '<div class="stub-batch-delete-dialog"/>' },
    BatchEditFoodDialog: { template: '<div class="stub-batch-edit-food-dialog"/>' },
    BatchEditRecipeDialog: { template: '<div class="stub-batch-edit-recipe-dialog"/>' },
    ModelMergeDialog: { template: '<div class="stub-model-merge-dialog"/>' },
    AddToShoppingDialog: { template: '<div class="stub-add-to-shopping-dialog"/>' },
    AutoPlanDialog: { template: '<div class="stub-auto-plan-dialog"/>' },
    RecipeShareDialog: { template: '<div class="stub-recipe-share-dialog"/>' },
    // Inputs
    ModelSelectVuetify: { template: '<div class="stub-model-select"/>' },
    StepEditor: { template: '<div class="stub-step-editor"/>' },
    PropertiesEditor: { template: '<div class="stub-properties-editor"/>' },
    GlobalSearchDialog: { template: '<div class="stub-global-search-dialog"/>' },
    // Settings
    OpenDataImportSettings: { template: '<div class="stub-open-data-import-settings"/>' },
    // Third-party
    Multiselect: { template: '<div class="stub-multiselect"/>' },
    SyncDialog: { template: '<div class="stub-sync-dialog"/>' },
    BatchEditUserSpaceDialog: { template: '<div class="stub-batch-edit-user-space-dialog"/>' },
    // Model list components (food-filters)
    ModelListToolbar: { template: '<div class="stub-model-list-toolbar"/>' },
    ModelListDataTable: { template: '<div class="stub-model-list-data-table"/>' },
    ModelListSettingsPanel: { template: '<div class="stub-model-list-settings-panel"/>' },
    ModelListCreateButton: { template: '<div class="stub-model-list-create-button"/>' },
    ModelListFilterChips: { template: '<div class="stub-model-list-filter-chips"/>' },
    ModelListCellRenderer: { template: '<div class="stub-model-list-cell-renderer"/>' },
    ModelListMobileView: { template: '<div class="stub-model-list-mobile-view"/>' },
    ModelListStatsFooter: { template: '<div class="stub-model-list-stats-footer"/>' },
    SelectionBar: { template: '<div class="stub-selection-bar"/>' },
    ActionMenu: { template: '<div class="stub-action-menu"/>' },
    ActionConfirmDialog: { template: '<div class="stub-action-confirm-dialog"/>' },
    InventoryQuickAddDialog: { template: '<div class="stub-inventory-quick-add-dialog"/>' },
}

export function mountPage(component: Component, options: ComponentMountingOptions<any> = {}) {
    const pinia = createPinia()
    const i18n = createI18n({
        legacy: false,
        locale: 'en',
        messages: { en: {} },
        missingWarn: false,
        fallbackWarn: false,
    })
    const vuetify = createVuetify()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'StartPage', component: STUB_TEMPLATE },
            { path: '/search', name: 'SearchPage', component: STUB_TEMPLATE },
            { path: '/recipe/:id', name: 'RecipeViewPage', component: STUB_TEMPLATE },
            { path: '/mealplan', name: 'MealPlanPage', component: STUB_TEMPLATE },
            { path: '/shopping', name: 'ShoppingListPage', component: STUB_TEMPLATE },
            { path: '/list/:model', name: 'ModelListPage', component: STUB_TEMPLATE },
            { path: '/edit/:model/:id?', name: 'ModelEditPage', component: STUB_TEMPLATE },
            { path: '/delete/:model/:id', name: 'ModelDeletePage', component: STUB_TEMPLATE },
            { path: '/import', name: 'RecipeImportPage', component: STUB_TEMPLATE },
            { path: '/books', name: 'BooksPage', component: STUB_TEMPLATE },
            { path: '/books/:id', name: 'BookViewPage', component: STUB_TEMPLATE },
            { path: '/pantry', name: 'PantryPage', component: STUB_TEMPLATE },
            { path: '/inventory', name: 'InventoryBookingPage', component: STUB_TEMPLATE },
            { path: '/ingredient-editor', name: 'IngredientEditorPage', component: STUB_TEMPLATE },
            { path: '/property-editor', name: 'PropertyEditorPage', component: STUB_TEMPLATE },
            { path: '/settings', name: 'SettingsPage', component: STUB_TEMPLATE },
            { path: '/help', name: 'HelpPage', component: STUB_TEMPLATE },
            { path: '/welcome', name: 'WelcomePage', component: STUB_TEMPLATE },
            { path: '/database', name: 'DatabasePage', component: STUB_TEMPLATE },
        ],
    })

    const { global: globalOverrides = {}, ...restOptions } = options
    const { stubs: extraStubs = {}, plugins: extraPlugins = [], ...restGlobal } = globalOverrides as any

    return mount(component, {
        global: {
            plugins: [pinia, i18n, vuetify, router, ...extraPlugins],
            stubs: { ...DEFAULT_STUBS, ...extraStubs },
            ...restGlobal,
        },
        ...restOptions,
    })
}
