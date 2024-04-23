import {Food, ShoppingListEntry, SupermarketCategory} from "@/openapi";

export interface IShoppingList {
    categories: Map<string, IShoppingListCategory>
}

export interface IShoppingListCategory {
    name: string,
    foods: Map<number, IShoppingListFood>
}

export interface IShoppingListFood {
    food: Food,
    entries: Map<number, ShoppingListEntry>
}

export interface IGroupingOption {
    id: string,
    translationKey: string
}