import {ShoppingListEntry} from "@/openapi";
import {IShoppingListFood} from "@/types/Shopping";

/**
 * determine if a shopping list entry is delayed
 * @param entry
 */
export function isDelayed(entry: ShoppingListEntry){
    // this function is needed because the openapi typescript fetch client always replaces null with undefined, so delayUntil cant be
    // set back to null once it has been delayed once. This will hopefully be fixed at some point, until then un-delaying will set the date to 1997-1-1 00:00
    return entry.delayUntil !== null && entry.delayUntil > Date.now()
}

/**
 * determine if any entry in a given IShoppingListFood is delayed, if so return true
 */
export function isShoppingListFoodDelayed(slf: IShoppingListFood){
    let hasDelayedEntry = false
    slf.entries.forEach(sle => {
        hasDelayedEntry = hasDelayedEntry || isDelayed(sle)
    })
    return hasDelayedEntry
}