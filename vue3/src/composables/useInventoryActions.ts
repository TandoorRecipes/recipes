import {unref} from 'vue'
import type {ActionConfirmEntry} from '@/components/dialogs/ActionConfirmDialog.vue'
import type {InventoryQuickAddResult} from '@/components/dialogs/InventoryQuickAddDialog.vue'
import type {ActionConfirmDialogInstance, FoodRef, TranslateFunc} from '@/composables/modellist/types'
import {ApiApi, type Food, type InventoryEntry, type InventoryLocation, type Unit} from '@/openapi'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

const api = new ApiApi()

export type InventoryLocationRef = {
    id: number
    name: string
    household: {id: number, name: string}
}

/** Instance type for InventoryQuickAddDialog template ref. */
export type InventoryQuickAddDialogInstance = {
    open: (opts: {
        title: string,
        locations: {value: number, label: string}[],
        defaultLocationId?: number | null,
        amount?: number,
        unit?: Unit | null,
    }) => Promise<InventoryQuickAddResult | null>
}

export function useInventoryActions() {
    /**
     * Add a food to inventory at the given location.
     * On 400/404 (stale location), clears the saved default and throws.
     */
    async function addToInventory(food: FoodRef, location: InventoryLocationRef, amount: number = 1, unit?: Unit | null): Promise<boolean> {
        const store = useUserPreferenceStore()
        try {
            await api.apiInventoryEntryCreate({
                inventoryEntry: {
                    food: {id: food.id, name: food.name} as Food,
                    inventoryLocation: {id: location.id, name: location.name, household: location.household} as InventoryLocation,
                    // TODO: regenerate OpenAPI schema — serializer now accepts null
                    unit: (unit ?? null) as any,
                    amount,
                },
            })
            return true
        } catch (err: any) {
            if (err?.response?.status === 400 || err?.response?.status === 404) {
                store.deviceSettings.food_defaultInventoryLocation = null
            }
            throw err
        }
    }

    /**
     * Open a quick-add dialog for inventory with location, amount, and unit fields.
     * Pre-fills from caller context (e.g. ingredient amount/unit).
     * Saves selected location as the default for future use.
     * Returns true if entry was created, false if cancelled or no locations exist.
     */
    async function quickAddToInventory(
        food: FoodRef,
        dialog: InventoryQuickAddDialogInstance,
        t: TranslateFunc,
        defaults?: {amount?: number, unit?: Unit | null},
    ): Promise<boolean> {
        const store = useUserPreferenceStore()

        let locations: InventoryLocationRef[]
        try {
            const result = await api.apiInventoryLocationList({pageSize: 100})
            locations = (result.results ?? []).filter(l => l.id != null).map(l => ({
                id: l.id!,
                name: l.name,
                household: {id: l.household.id!, name: l.household.name},
            }))
        } catch (err) {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            return false
        }

        if (locations.length === 0) {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, t('NoInventoryLocations'))
            return false
        }

        const saved = getDefaultLocation()
        const dialogResult = await dialog.open({
            title: t('AddToInventory', {name: food.name}),
            locations: locations.map(l => ({value: l.id, label: l.name})),
            defaultLocationId: saved?.id ?? null,
            amount: defaults?.amount ?? 1,
            unit: defaults?.unit ?? null,
        })

        if (!dialogResult) return false

        const selectedLoc = locations.find(l => l.id === dialogResult.locationId)
        if (!selectedLoc) return false

        // Save selected location as default
        store.deviceSettings.food_defaultInventoryLocation = {
            id: selectedLoc.id,
            name: selectedLoc.name,
            household: selectedLoc.household,
        } as InventoryLocationRef

        try {
            await addToInventory(food, selectedLoc, dialogResult.amount, dialogResult.unit)
            return true
        } catch (err) {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            return false
        }
    }

    /**
     * Remove a food from inventory with selectable confirmation dialog.
     * Shows inventory entries with checkboxes, deletes selected on confirm.
     * Returns true if any entries were deleted.
     */
    async function removeFromInventory(food: FoodRef, confirmDialog: ActionConfirmDialogInstance, t: TranslateFunc): Promise<boolean> {
        const confirmPromise = confirmDialog.open({
            title: t('Confirm'),
            message: t('RemoveFromInventoryConfirm', {name: food.name}),
            loading: true,
            selectable: true,
            confirmLabel: t('Remove'),
            confirmColor: 'warning',
            confirmIcon: '$pantry',
        })

        try {
            const result = await api.apiInventoryEntryList({foodId: food.id, pageSize: 100})
            const invEntries = result.results ?? []
            const entries: ActionConfirmEntry[] = invEntries.map((e: InventoryEntry) => {
                const parts: string[] = []
                if (e.amount) parts.push(String(e.amount))
                if (e.unit?.name) parts.push(e.unit.name)
                const text = parts.length > 0 ? parts.join(' ') : t('Pantry')
                const subtextParts: string[] = []
                if (e.inventoryLocation?.name) subtextParts.push(e.inventoryLocation.name)
                if (e.createdAt) subtextParts.push(new Date(e.createdAt).toLocaleString())
                return {id: e.id!, text, subtext: subtextParts.join(' · ') || undefined, icon: '$pantry'} as ActionConfirmEntry
            })
            confirmDialog.setEntries(entries)
        } catch {
            confirmDialog.setEntries([])
        }

        const confirmed = (await confirmPromise) ?? false
        if (!confirmed) return false

        // unref handles both raw arrays (template ref auto-unwrap) and ComputedRef
        const idsToDelete = unref(confirmDialog.selectedEntryIds)
        const results = await Promise.allSettled(
            idsToDelete.map(id => api.apiInventoryEntryDestroy({id}))
        )
        const failures = results.filter(r => r.status === 'rejected')
        if (failures.length > 0) {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, new Error(`Failed to remove ${failures.length} entries`))
        }
        return true
    }

    /**
     * Ensure a default inventory location is saved in device settings.
     * Returns true if a location is available, false otherwise.
     */
    async function ensureDefaultLocation(confirmDialog: ActionConfirmDialogInstance, t: TranslateFunc): Promise<boolean> {
        const store = useUserPreferenceStore()
        let saved = store.deviceSettings.food_defaultInventoryLocation as InventoryLocationRef | null

        // Clear stale refs saved before household was included
        if (saved && !saved.household) {
            store.deviceSettings.food_defaultInventoryLocation = null
            saved = null
        }
        if (saved) return true

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
                store.deviceSettings.food_defaultInventoryLocation = {
                    id: locations[0].id!,
                    name: locations[0].name,
                    household: {id: locations[0].household.id!, name: locations[0].household.name},
                } as InventoryLocationRef
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
            const selectedVal = unref(confirmDialog.selectedValue)
            if (confirmed && selectedVal != null) {
                const selected = locations.find(l => l.id === selectedVal)
                if (selected) {
                    store.deviceSettings.food_defaultInventoryLocation = {
                        id: selected.id!,
                        name: selected.name,
                        household: {id: selected.household.id!, name: selected.household.name},
                    } as InventoryLocationRef
                    return true
                }
            }
            return false
        } catch (err) {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
            return false
        }
    }

    /**
     * Get the currently saved default inventory location, or null.
     */
    function getDefaultLocation(): InventoryLocationRef | null {
        const store = useUserPreferenceStore()
        const saved = store.deviceSettings.food_defaultInventoryLocation as InventoryLocationRef | null
        if (saved && !saved.household) {
            store.deviceSettings.food_defaultInventoryLocation = null
            return null
        }
        return saved
    }

    /**
     * Check if a food has any inventory entries.
     */
    async function checkInventoryStatus(foodId: number): Promise<boolean> {
        try {
            const result = await api.apiInventoryEntryList({foodId, pageSize: 1})
            return (result.count ?? 0) > 0
        } catch {
            return false
        }
    }

    return {addToInventory, quickAddToInventory, removeFromInventory, ensureDefaultLocation, getDefaultLocation, checkInventoryStatus}
}
