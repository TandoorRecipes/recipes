/**
 * Food-specific configuration for the enhanced ModelListPage.
 * This is the single source of truth for all Food list behavior.
 */

import type {FilterDef, ActionDef, BatchAction, StatDef, ListSettings, SortDef, ModelItem} from './types'
import type {ActionConfirmEntry} from '@/components/dialogs/ActionConfirmDialog.vue'
import {ApiApi, type Food, type InventoryEntry, type InventoryLocation} from '@/openapi'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'

const api = new ApiApi()

/** Lightweight reference to an inventory location, saved in device settings. */
type InventoryLocationRef = {id: number, name: string}

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
    {key: 'in_shopping_list', labelKey: 'Shopping', type: 'tristate', icon: 'fa-solid fa-cart-shopping', group: 'Status'},
    {key: 'ignore_shopping', labelKey: 'IgnoreShopping', type: 'tristate', icon: 'fa-solid fa-ban', group: 'Status'},
    {key: 'has_substitute', labelKey: 'Substitute', type: 'tristate', icon: 'fa-solid fa-right-left', group: 'Attributes'},
    {key: 'has_children', labelKey: 'Children', type: 'tristate', icon: 'fa-solid fa-sitemap', group: 'Attributes'},
    {key: 'has_recipe', labelKey: 'Recipe', type: 'tristate', icon: 'fa-solid fa-book', group: 'Attributes'},
    {key: 'used_in_recipes', labelKey: 'UsedInRecipes', type: 'tristate', icon: 'fa-solid fa-utensils', group: 'Attributes'},
    {key: 'supermarket_category', labelKey: 'Category', type: 'model-select', icon: 'fa-solid fa-boxes-stacked', modelName: 'SupermarketCategory', group: 'Attributes'},
    {key: 'has_inventory', labelKey: 'InInventory', type: 'tristate', icon: 'fa-solid fa-warehouse', group: 'Inventory'},
    {key: 'inventory_location', labelKey: 'InventoryLocation', type: 'model-select', icon: 'fa-solid fa-location-dot', modelName: 'InventoryLocation', group: 'Inventory'},
    {key: 'expired', labelKey: 'Expired', type: 'tristate', icon: 'fa-solid fa-calendar-xmark', group: 'Inventory'},
    {key: 'expiring_soon', labelKey: 'ExpiringSoon', type: 'number', icon: 'fa-solid fa-clock', defaultValue: '3', suffixKey: 'Days', group: 'Inventory'},
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
                await api.apiFoodShoppingDestroy({id: item.id})
                item.shopping = 'False'
            } else {
                await api.apiFoodShoppingUpdate({id: item.id, foodShoppingUpdate: {}})
                item.shopping = 'True'
            }
        },
        confirmationHandler: async (item, confirmDialog, t) => {
            const confirmPromise = confirmDialog.open({
                title: t('Confirm'),
                message: t('RemoveFromShoppingConfirm', {name: item.name}),
                loading: true,
                confirmLabel: t('Remove'),
                confirmColor: 'warning',
                confirmIcon: 'fa-solid fa-cart-shopping',
            })
            try {
    
                const result = await api.apiShoppingListEntryList({food: item.id, pageSize: 100})
                const foodEntries = (result.results ?? []).filter((e: any) => !e.checked)
                const entries: ActionConfirmEntry[] = foodEntries.map((e: any) => {
                    const parts: string[] = []
                    if (e.amount) parts.push(String(e.amount))
                    if (e.unit?.name) parts.push(e.unit.name)
                    const text = parts.length > 0 ? parts.join(' ') : t('Shopping')
                    const subtextParts: string[] = []
                    const recipeName = e.listRecipeData?.recipeData?.name
                    if (recipeName) subtextParts.push(recipeName)
                    if (e.createdBy?.displayName || e.createdBy?.username) {
                        subtextParts.push(e.createdBy.displayName || e.createdBy.username)
                    }
                    if (e.createdAt) {
                        subtextParts.push(new Date(e.createdAt).toLocaleString())
                    }
                    return {text, subtext: subtextParts.join(' · ') || undefined, icon: 'fa-solid fa-cart-shopping'} as ActionConfirmEntry
                })
                confirmDialog.setEntries(entries)
            } catch {
                confirmDialog.setEntries([])
            }
            return (await confirmPromise) ?? false
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
        handler: async (item) => {

            try {
                if (isInInventory(item)) {
                    // Remove: delete all inventory entries for this food
                    const result = await api.apiInventoryEntryList({foodId: item.id, pageSize: 100})
                    const invEntries = result.results ?? []
                    await Promise.all(invEntries.filter(e => e.id != null).map(e => api.apiInventoryEntryDestroy({id: e.id!})))
                    item.inInventory = 'False'
                } else {
                    // Add: use saved default location
                    const store = useUserPreferenceStore()
                    const locData = store.deviceSettings.food_defaultInventoryLocation as InventoryLocationRef | null
                    if (!locData) return // activationConfirmationHandler ensures this is set
                    try {
                        await api.apiInventoryEntryCreate({
                            inventoryEntry: {
                                food: {id: item.id, name: item.name} as Food,
                                inventoryLocation: {id: locData.id, name: locData.name} as InventoryLocation,
                                // TODO: update OpenAPI schema to make unit optional
                                unit: null as any,
                                amount: 1,
                            },
                        })
                        item.inInventory = 'True'
                    } catch (err: any) {
                        // Stale location — clear saved default so next tap re-prompts
                        if (err?.response?.status === 400 || err?.response?.status === 404) {
                            store.deviceSettings.food_defaultInventoryLocation = null
                        }
                        throw err
                    }
                }
            } catch (err) {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }
        },
        confirmationHandler: async (item, confirmDialog, t) => {
            const confirmPromise = confirmDialog.open({
                title: t('Confirm'),
                message: t('RemoveFromInventoryConfirm', {name: item.name}),
                loading: true,
                confirmLabel: t('Remove'),
                confirmColor: 'warning',
                confirmIcon: '$pantry',
            })
            try {
    
                const result = await api.apiInventoryEntryList({foodId: item.id, pageSize: 100})
                const invEntries = result.results ?? []
                const entries: ActionConfirmEntry[] = invEntries.map((e: InventoryEntry) => {
                    const parts: string[] = []
                    if (e.amount) parts.push(String(e.amount))
                    if (e.unit?.name) parts.push(e.unit.name)
                    const text = parts.length > 0 ? parts.join(' ') : t('Pantry')
                    const subtextParts: string[] = []
                    if (e.inventoryLocation?.name) subtextParts.push(e.inventoryLocation.name)
                    if (e.createdAt) subtextParts.push(new Date(e.createdAt).toLocaleString())
                    return {text, subtext: subtextParts.join(' · ') || undefined, icon: '$pantry'} as ActionConfirmEntry
                })
                confirmDialog.setEntries(entries)
            } catch {
                confirmDialog.setEntries([])
            }
            return (await confirmPromise) ?? false
        },
        activationConfirmationHandler: async (_item, confirmDialog, t) => {
            const store = useUserPreferenceStore()
            const saved = store.deviceSettings.food_defaultInventoryLocation as InventoryLocationRef | null
            if (saved) return true // default location already set, proceed immediately

            try {
    
                const result = await api.apiInventoryLocationList({pageSize: 100})
                const locations = result.results ?? []

                if (locations.length === 0) {
                    await confirmDialog.open({
                        title: t('Pantry'),
                        message: t('NoInventoryLocations'),
                        confirmLabel: t('OK'),
                    })
                    return false
                }

                if (locations.length === 1) {
                    // Auto-save the only location
                    store.deviceSettings.food_defaultInventoryLocation = {id: locations[0].id!, name: locations[0].name} as InventoryLocationRef
                    return true
                }

                // Multiple locations — prompt user to select
                const confirmPromise = confirmDialog.open({
                    title: t('SelectDefaultLocation'),
                    message: t('SelectDefaultLocationMessage'),
                    loading: true,
                    confirmLabel: t('Confirm'),
                    confirmColor: 'primary',
                    confirmIcon: 'fa-solid fa-location-dot',
                })
                confirmDialog.setSelectOptions(locations.map(l => ({value: l.id!, label: l.name})))
                const confirmed = (await confirmPromise) ?? false
                if (confirmed && confirmDialog.selectedValue.value != null) {
                    const selected = locations.find(l => l.id === confirmDialog.selectedValue.value)
                    if (selected) {
                        store.deviceSettings.food_defaultInventoryLocation = {id: selected.id!, name: selected.name} as InventoryLocationRef
                    }
                    return true
                }
                return false
            } catch (err) {
                useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
                return false
            }
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
]

export const FOOD_BATCH_ACTIONS: BatchAction[] = [
    {key: 'batchEdit', labelKey: 'BatchEdit', icon: 'fa-solid fa-list-check'},
]
