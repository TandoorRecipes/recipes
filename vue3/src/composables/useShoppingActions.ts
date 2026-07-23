import {unref} from 'vue'
import type {ActionConfirmEntry} from '@/components/dialogs/ActionConfirmDialog.vue'
import type {ActionConfirmDialogInstance, FoodRef, TranslateFunc} from '@/composables/modellist/types'
import {ApiApi, type FoodShopping, type Unit} from '@/openapi'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'

const api = new ApiApi()

export function useShoppingActions() {
    /**
     * Add a food to the shopping list.
     * Returns true on success.
     */
    async function addToShopping(food: FoodRef, amount: number = 1, unit?: Unit | null): Promise<boolean> {
        await api.apiShoppingListEntryCreate({
            shoppingListEntry: {
                food: {id: food.id, name: food.name} as FoodShopping,
                amount,
                unit: unit ?? undefined,
            },
        })
        return true
    }

    /**
     * Remove a food from the shopping list with selectable confirmation dialog.
     * Shows unchecked entries with checkboxes, deletes selected on confirm.
     * Returns true if any entries were deleted.
     */
    async function removeFromShopping(food: FoodRef, confirmDialog: ActionConfirmDialogInstance, t: TranslateFunc): Promise<boolean> {
        const confirmPromise = confirmDialog.open({
            title: t('Confirm'),
            message: t('RemoveFromShoppingConfirm', {name: food.name}),
            loading: true,
            selectable: true,
            confirmLabel: t('Remove'),
            confirmColor: 'warning',
            confirmIcon: 'fa-solid fa-cart-shopping',
        })

        try {
            const result = await api.apiShoppingListEntryList({food: food.id, pageSize: 100})
            // API default returns unchecked + recently-checked; only show unchecked for removal
            const foodEntries = (result.results ?? []).filter(e => !e.checked)
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
                if (e.createdAt) subtextParts.push(new Date(e.createdAt).toLocaleString())
                return {id: e.id, text, subtext: subtextParts.join(' · ') || undefined, icon: 'fa-solid fa-cart-shopping'} as ActionConfirmEntry
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
            idsToDelete.map(id => api.apiShoppingListEntryDestroy({id}))
        )
        const failures = results.filter(r => r.status === 'rejected')
        if (failures.length > 0) {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, new Error(`Failed to remove ${failures.length} entries`))
        }
        return true
    }

    /**
     * Check if a food still has unchecked shopping entries.
     */
    async function checkShoppingStatus(foodId: number): Promise<boolean> {
        try {
            const result = await api.apiShoppingListEntryList({food: foodId, pageSize: 1})
            return (result.count ?? 0) > 0
        } catch {
            return false
        }
    }

    return {addToShopping, removeFromShopping, checkShoppingStatus}
}
