/**
 * Generic interfaces for enhanced model list capabilities.
 * When a Model provides these optional config fields, ModelListPage
 * activates enhanced rendering (configurable columns, filters, actions, settings).
 */
import type ActionConfirmDialog from '@/components/dialogs/ActionConfirmDialog.vue'
import type {EditorSupportedModels} from '@/types/Models'
type ActionConfirmDialogInstance = InstanceType<typeof ActionConfirmDialog>

/**
 * Base interface for items displayed in a model list.
 * All API model objects have at least id and name.
 */
export interface ModelItem {
    id: number
    name: string
    [key: string]: any
}

/**
 * Column display types for enhanced table rendering.
 * Used by ModelListColumnCell to determine how to render a cell.
 */
export type ColumnType = 'text' | 'number' | 'boolean-indicator' | 'status-chip' | 'color-chip' | 'label-chip' | 'action-menu'

/**
 * Filter control types for the filter panel.
 */
export type FilterType = 'tristate' | 'model-select' | 'number'

/**
 * Filter definition for a model list.
 * Each filter maps to a backend query parameter.
 */
export type FilterDef = {
    /** Unique key, matches the backend query parameter name */
    key: string,
    /** Localization key for the filter label */
    labelKey: string,
    /** Type of filter control to render */
    type: FilterType,
    /** Icon to display next to the filter (FontAwesome class) */
    icon?: string,
    /** For model-select type: the model name to use for lookup */
    modelName?: EditorSupportedModels,
    /** Group key for organizing filters in the panel */
    group?: string,
    /** Default value for number-type filters (used as placeholder and initial value) */
    defaultValue?: string,
    /** Suffix text for number-type filters (e.g., "days") — localization key */
    suffixKey?: string,
}

/**
 * Action definition for a model list.
 * Defines what actions are available in the context menu and as quick actions.
 */
export type ActionDef = {
    /** Unique key for this action */
    key: string,
    /** Localization key for the action label */
    labelKey: string,
    /** Icon to display (FontAwesome class) */
    icon: string,
    /** Whether this is a toggle action (shows active/inactive state) */
    isToggle?: boolean,
    /** For toggle actions: the data field to check for active state */
    toggleField?: string,
    /** Color when action is active (Vuetify color) */
    activeColor?: string,
    /** Color when action is inactive (Vuetify color) */
    inactiveColor?: string,
    /** Group key for organizing actions in the menu */
    group?: string,
    /** Whether this action requires confirmation before executing */
    requiresConfirmation?: boolean,
    /** Whether this is a destructive/danger action (renders in red) */
    isDanger?: boolean,
    /** Route name to navigate to (instead of API action) */
    routeName?: string,
    /** Route params builder for navigation actions */
    routeParams?: (item: ModelItem, modelName: string) => Record<string, any>,
    /** Query params builder for route navigation */
    routeQuery?: (item: ModelItem) => Record<string, any>,
    /** Custom async handler for non-standard actions (e.g., shopping toggle endpoint) */
    handler?: (item: ModelItem, genericModel: any) => Promise<void>,
    /** Custom predicate for toggle state (overrides default !!item[toggleField] check) */
    isActive?: (item: ModelItem) => boolean,
    /** Custom color resolver for actions with more than 2 states (overrides activeColor/inactiveColor) */
    colorResolver?: (item: ModelItem) => string | undefined,
    /** Per-item visibility predicate — when provided, action only shows for items where this returns true */
    visible?: (item: ModelItem) => boolean,
    /** When true, the list reloads after a successful non-toggle handler execution */
    reloadAfterAction?: boolean,
    /** Custom confirmation handler — returns true to proceed, false to cancel.
     *  When provided, overrides the default confirmation dialog for this action.
     *  Receives the confirm dialog ref and translation function for custom UI. */
    confirmationHandler?: (item: ModelItem, confirmDialog: ActionConfirmDialogInstance, t: (key: string, params?: Record<string, any>) => string) => Promise<boolean>,
    /** Confirmation handler for toggle activation (OFF → ON).
     *  Called before the handler when toggling a toggle action from inactive to active. */
    activationConfirmationHandler?: (item: ModelItem, confirmDialog: ActionConfirmDialogInstance, t: (key: string, params?: Record<string, any>) => string) => Promise<boolean>,
}

/**
 * Batch action definition for model list selection bar.
 * Data-only — no component references. The page manages which dialog to open.
 */
export type BatchAction = {
    /** Unique key used by handleBatchAction to open the correct dialog */
    key: string,
    /** Localization key for the action label */
    labelKey: string,
    /** Icon (FontAwesome class) */
    icon: string,
}

/**
 * Header action for the model list page header bar.
 * Button type: data-only, rendered as a v-btn with handler or route.
 * Widget type: self-contained component rendered via <component :is>.
 */
export type HeaderAction =
    | { type: 'button', key: string, labelKey: string, icon: string, color?: string, size?: string,
        routeName?: string, routeParams?: Record<string, any>,
        handler?: () => Promise<void> | void }
    | { type: 'widget', component: ReturnType<typeof import('vue').defineAsyncComponent> }

/**
 * Settings configuration for an enhanced model list.
 * Controls which features are available and their defaults.
 */
export type SettingsDefaults = {
    quickActions?: string[],
    showStats?: boolean,
    showMobileHeaders?: boolean,
}

export type ListSettings = {
    /** Prefix for device settings keys (e.g., 'food' → 'food_hiddenColumns') */
    settingsKey: string,
    /** Whether the settings panel is available */
    settingsPanel: boolean,
    /** Whether tree view is available (requires model.isTree) */
    treeEnabled?: boolean,
    /** Whether a stats footer is available */
    statsFooter?: boolean,
    /** Whether a mobile-specific list layout is available */
    mobileList?: boolean,
    /** Per-model default values for device settings */
    defaults?: SettingsDefaults,
}

/**
 * Stat definition for a model list stats footer.
 * Each stat maps to a key in the API response's stats object.
 */
export type StatDef = {
    /** Unique key, matches the API stats response key */
    key: string,
    /** Localization key for the display label */
    labelKey: string,
    /** Icon to display (FontAwesome class) */
    icon: string,
    /** Vuetify color for the chip */
    color: string,
}

/**
 * Sort option definition for a model list.
 * Each option maps to a backend `ordering` query parameter value.
 */
export type SortDef = {
    /** Value sent as the `ordering` query param (e.g. 'name', '-name') */
    key: string,
    /** Localization key for the display label */
    labelKey: string,
    /** Icon (FontAwesome class), optional */
    icon?: string,
    /** When true, selecting this sort starts descending (e.g. highest count first) */
    defaultDescending?: boolean,
}

/** Extract the ancestor path from an item's fullName (everything before the last " > "). */
export function getAncestorPath(item: ModelItem): string | null {
    const fn = item.fullName
    if (!fn) return null
    const lastSep = fn.lastIndexOf(' > ')
    return lastSep > 0 ? fn.substring(0, lastSep) : null
}
