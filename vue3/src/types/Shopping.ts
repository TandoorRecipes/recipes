import {Food, ShoppingListEntry, SupermarketCategory} from "@/openapi";
import {b} from "vite/dist/node/types.d-aGj9QkWt";
import {ref} from "vue";

export enum ShoppingGroupingOptions {
    CATEGORY = 'CATEGORY',
    CREATED_BY = 'CREATED_BY',
    RECIPE = 'RECIPE',
}

export interface IShoppingList {
    categories: Map<string, IShoppingListCategory>
}

export interface IShoppingListCategory {
    name: string,
    foods: Map<number, IShoppingListFood>,
    stats: ShoppingListStats,
}

export interface IShoppingListFood {
    food: Food,
    entries: Map<number, ShoppingListEntry>
}

export interface IGroupingOption {
    id: string,
    translationKey: string
}

export interface IShoppingExportEntry {
    amount: number,
    unit: string,
    food: string,
}

export interface IShoppingSyncQueueEntry {
    ids: number[],
    checked: boolean,
    status: 'waiting' | 'syncing' | 'syncing_failed_before' | 'waiting_failed_before',
}

export type ShoppingListStats = {
    countChecked: number,
    countUnchecked: number,
    countCheckedFood: number,
    countUncheckedFood: number,
}
export type ShoppingOperationHistoryType = 'CREATED' | 'CHECKED' | 'UNCHECKED' | 'DELAY' | 'UNDELAY'

export type ShoppingOperationHistoryEntry = {
    type: ShoppingOperationHistoryType,
    entries: ShoppingListEntry[]
}