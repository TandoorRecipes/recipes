/**
 * Food-specific configuration for the enhanced ModelListPage.
 * This is the single source of truth for all Food list behavior.
 */

import type {FilterDef, ActionDef, BatchAction, StatDef, ListSettings, SortDef, ModelItem} from './types'
import {useShoppingActions} from '@/composables/useShoppingActions'
import {useInventoryActions} from '@/composables/useInventoryActions'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'

/** The backend annotates shopping_status via Exists() → CharField, yielding "True"/"False" strings. */
function isOnShoppingList(item: ModelItem): boolean {
    const v = item.shopping
    return v === true || v === 'True' || v === 'true'
}

/** The backend annotates has_inventory_status via Exists() → CharField, yielding "True"/"False" strings. */
function isInInventory(item: ModelItem): boolean {
    const v = item.inInventory
    return v === true || v === 'True' || v === 'true'
}

/**
 * Filter definitions for the Food list.
 * Each maps to a query parameter on the /api/food/ endpoint.
 */
export const FOOD_FILTER_DEFS: FilterDef[] = [
    {key: 'onhand', labelKey: 'OnHand', type: 'tristate', icon: 'fa-solid fa-check-circle', group: 'Status'},
    {key: 'inShoppingList', labelKey: 'Shopping', type: 'tristate', icon: 'fa-solid fa-cart-shopping', group: 'Status'},
    {key: 'ignoreShopping', labelKey: 'IgnoreShopping', type: 'tristate', icon: 'fa-solid fa-ban', group: 'Status'},
    {key: 'hasSubstitute', labelKey: 'Substitute', type: 'tristate', icon: 'fa-solid fa-right-left', group: 'Attributes'},
    {key: 'hasChildren', labelKey: 'Children', type: 'tristate', icon: 'fa-solid fa-sitemap', group: 'Attributes'},
    {key: 'hasRecipe', labelKey: 'Recipe', type: 'tristate', icon: 'fa-solid fa-book', group: 'Attributes'},
    {key: 'usedInRecipes', labelKey: 'UsedInRecipes', type: 'tristate', icon: 'fa-solid fa-utensils', group: 'Attributes'},
    {key: 'supermarketCategory', labelKey: 'Category', type: 'model-select', icon: 'fa-solid fa-boxes-stacked', modelName: 'SupermarketCategory', group: 'Attributes'},
    {key: 'hasInventory', labelKey: 'InInventory', type: 'tristate', icon: 'fa-solid fa-warehouse', group: 'Inventory'},
    {key: 'inventoryLocation', labelKey: 'InventoryLocation', type: 'model-select', icon: 'fa-solid fa-location-dot', modelName: 'InventoryLocation', group: 'Inventory'},
    {key: 'expired', labelKey: 'Expired', type: 'tristate', icon: 'fa-solid fa-calendar-xmark', group: 'Inventory'},
    {key: 'expiringSoon', labelKey: 'ExpiringSoon', type: 'number', icon: 'fa-solid fa-clock', defaultValue: '3', suffixKey: 'Days', group: 'Inventory'},
]

/**
 * Action definitions for the Food list.
 * Grouped into status toggles and one-shot actions.
 */
export const FOOD_ACTION_DEFS: ActionDef[] = [
    // Status toggles
    {key: 'onhand', labelKey: 'OnHand', icon: 'fa-solid fa-clipboard-check', isToggle: true, toggleField: 'foodOnhand', activeColor: 'success', inactiveColor: '', group: 'Status',
        colorResolver: (item: ModelItem) => {
            if (item.foodOnhand) return 'success'
            if (item.substituteOnhand) return 'warning'
            return undefined
        },
    },
    {key: 'shopping', labelKey: 'Shopping', icon: 'fa-solid fa-cart-shopping', isToggle: true, toggleField: 'shopping', activeColor: 'success', inactiveColor: '', group: 'Status', requiresConfirmation: true,
        isActive: isOnShoppingList,
        colorResolver: (item: ModelItem) => isOnShoppingList(item) ? 'success' : undefined,
        handler: async (item) => {
            if (isOnShoppingList(item)) {
                // Removal is handled by confirmationHandler — this path shouldn't be reached
                item.shopping = 'False'
            } else {
                const {addToShopping} = useShoppingActions()
                await addToShopping({id: item.id, name: item.name})
                item.shopping = 'True'
            }
        },
        confirmationHandler: async (item, confirmDialog, t) => {
            const {removeFromShopping, checkShoppingStatus} = useShoppingActions()
            const removed = await removeFromShopping({id: item.id, name: item.name}, confirmDialog, t)
            if (removed) {
                item.shopping = (await checkShoppingStatus(item.id)) ? 'True' : 'False'
            }
            return removed
        },
    },
    {key: 'ignore', labelKey: 'IgnoreShopping', icon: 'fa-solid fa-ban', isToggle: true, toggleField: 'ignoreShopping', activeColor: 'error', inactiveColor: '', group: 'Status',
        colorResolver: (item: ModelItem) => item.ignoreShopping ? 'error' : undefined,
    },

    // Pantry toggle
    {key: 'pantry', labelKey: 'Pantry', icon: '$pantry', isToggle: true, toggleField: 'inInventory', activeColor: 'success', inactiveColor: '', group: 'Status', requiresConfirmation: true,
        isActive: isInInventory,
        colorResolver: (item: ModelItem) => {
            if (isInInventory(item)) return 'success'
            if (item.substituteInventory) return 'warning'
            return undefined
        },
        handler: async (item, _genericModel, context) => {
            const dialog = context?.extraDialogs?.inventoryQuickAdd
            const t = context?.t
            if (!dialog || !t) return
            const {quickAddToInventory} = useInventoryActions()
            const added = await quickAddToInventory({id: item.id, name: item.name}, dialog, t)
            if (added) item.inInventory = 'True'
        },
        confirmationHandler: async (item, confirmDialog, t) => {
            const {removeFromInventory, checkInventoryStatus} = useInventoryActions()
            const removed = await removeFromInventory({id: item.id, name: item.name}, confirmDialog, t)
            if (removed) {
                item.inInventory = (await checkInventoryStatus(item.id)) ? 'True' : 'False'
            }
            return removed
        },
    },

    // One-shot actions
    {key: 'inventory-booking', labelKey: 'InventoryBooking', icon: 'fa-solid fa-boxes-stacked', group: 'Actions', routeName: 'InventoryBookingPage', routeQuery: (item) => ({food_id: item.id})},
    {key: 'recipe', labelKey: 'Recipe', icon: 'fa-solid fa-book', group: 'Actions',
        routeName: 'RecipeViewPage', routeParams: (item) => ({id: item.recipe.id}),
        visible: (item: ModelItem) => !!item.recipe},
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
    {key: 'move', labelKey: 'Move', icon: 'fa-solid fa-arrow-right', group: 'Actions',
        routeName: 'ModelEditPage',
        routeParams: (item, modelName) => ({model: modelName, id: item.id}),
        routeQuery: () => ({tab: 'hierarchy'})},
    {key: 'ingredient-editor', labelKey: 'Ingredient Editor', icon: 'fa-solid fa-table-list', group: 'Actions', routeName: 'IngredientEditorPage', routeQuery: (item) => ({food_id: item.id})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item, modelName) => ({model: modelName, id: item.id})},
]

/**
 * Stat definitions for the Food list stats footer.
 * Keys match the API stats response fields.
 */
export const FOOD_STAT_DEFS: StatDef[] = [
    {key: 'onhand', labelKey: 'OnHand', icon: 'fa-solid fa-check-circle', color: 'success'},
    {key: 'shopping', labelKey: 'Shopping', icon: 'fa-solid fa-cart-shopping', color: 'info'},
    {key: 'ignored', labelKey: 'IgnoreShopping', icon: 'fa-solid fa-ban', color: 'warning'},
    {key: 'inventory', labelKey: 'InInventory', icon: 'fa-solid fa-warehouse', color: 'info'},
    {key: 'expired', labelKey: 'Expired', icon: 'fa-solid fa-calendar-xmark', color: 'error'},
]

/**
 * List settings for the Food model.
 */
export const FOOD_LIST_SETTINGS: ListSettings = {
    settingsKey: 'food',
    settingsPanel: true,
    treeEnabled: true,
    statsFooter: true,
    mobileList: true,
    filterVisibility: true,
    defaults: {
        quickActions: ['shopping', 'recipe', 'pantry'],
        showStats: true,
        showMobileHeaders: true,
    },
}

/**
 * Sort option definitions for the Food list.
 * Each key can be prefixed with `-` for descending at the point of use.
 */
export const FOOD_SORT_OPTIONS: SortDef[] = [
    {key: 'name', labelKey: 'Name'},
    {key: 'numrecipe', labelKey: 'Recipes', defaultDescending: true},
    {key: 'numchild', labelKey: 'Children', defaultDescending: true},
    {key: 'supermarket_category__name', labelKey: 'Shopping_Category'},
    {key: 'created_at', labelKey: 'date_created', defaultDescending: true},
]

export const FOOD_BATCH_ACTIONS: BatchAction[] = [
    {key: 'batchEdit', labelKey: 'BatchEdit', icon: 'fa-solid fa-list-check'},
]
