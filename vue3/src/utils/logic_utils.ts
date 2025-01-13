import {ShoppingListEntry, Space} from "@/openapi";
import {IShoppingListFood} from "@/types/Shopping";

/**
 * determine if a shopping list entry is delayed
 * @param entry
 */
export function isDelayed(entry: ShoppingListEntry) {
    // this function is needed because the openapi typescript fetch client always replaces null with undefined, so delayUntil cant be
    // set back to null once it has been delayed once. This will hopefully be fixed at some point, until then un-delaying will set the date to 1997-1-1 00:00
    return entry.delayUntil != null && entry.delayUntil > new Date()
}

/**
 * determine if any entry in a given IShoppingListFood is delayed, if so return true
 */
export function isShoppingListFoodDelayed(slf: IShoppingListFood) {
    let hasDelayedEntry = false
    slf.entries.forEach(sle => {
        hasDelayedEntry = hasDelayedEntry || isDelayed(sle)
    })
    return hasDelayedEntry
}

/**
 * checks if the given space is above any of the configured limits
 * @param space space to check limit for
 */
export function isSpaceAtLimit(space: Space) {
    return isSpaceAtUserLimit(space) || isSpaceAtRecipeLimit(space) || isSpaceAtStorageLimit(space)
}

/**
 * checks if the given space is above the user limit
 * @param space space to check limit for
 */
export function isSpaceAtUserLimit(space: Space) {
    return space.maxUsers > space.userCount && space.maxUsers > 0
}

/**
 * checks if the given space is above the recipe limit
 * @param space space to check limit for
 */
export function isSpaceAtRecipeLimit(space: Space) {
    return space.maxRecipes > space.recipeCount && space.maxRecipes > 0
}

/**
 * checks if the given space is above the file storage limit
 * @param space space to check limit for
 */
export function isSpaceAtStorageLimit(space: Space) {
    return space.maxFileStorageMb > space.fileSizeMb && space.maxFileStorageMb > 0
}