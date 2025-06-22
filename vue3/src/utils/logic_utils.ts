import {ShoppingListEntry, Space} from "@/openapi";
import {IShoppingListCategory, IShoppingListFood} from "@/types/Shopping";
import {DeviceSettings} from "@/types/settings";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

// -------------- SHOPPING RELATED ----------------------

/**
 * determines if an entry should be visible to the user based on its delayed/checked state and the current device settings
 * @param entry entry for which visibility should be determined
 * @param deviceSettings user device settings based on which entry visibility is controlled
 */
export function isEntryVisible(entry: ShoppingListEntry, deviceSettings: DeviceSettings) {
    let entryVisible = true
    if (isDelayed(entry) && !deviceSettings.shopping_show_delayed_entries) {
        entryVisible = false
    }
    if (entry.checked && !deviceSettings.shopping_show_checked_entries) {
        entryVisible = false
    }
    return entryVisible
}

/**
 * loops through all entries of a shopping list food and determines if it should be visible based on the isEntryVisible function
 * @param slf shopping list food holder
 * @param deviceSettings user device settings based on which entry visibility is controlled
 */
export function isShoppingListFoodVisible(slf: IShoppingListFood, deviceSettings: DeviceSettings) {
    let foodVisible = false
    slf.entries.forEach(entry => {
        foodVisible = foodVisible || isEntryVisible(entry, deviceSettings)
    })
    return foodVisible
}

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
 * determines if a category has entries that should be visible
 * @param category
 */
export function isShoppingCategoryVisible(category: IShoppingListCategory) {
    let entryCount = category.stats.countUnchecked

    if (useUserPreferenceStore().deviceSettings.shopping_show_checked_entries) {
        entryCount += category.stats.countChecked
    }
    if (useUserPreferenceStore().deviceSettings.shopping_show_delayed_entries) {
        entryCount += category.stats.countUncheckedDelayed
    }

    return entryCount > 0
}

// -------------- SPACE RELATED ----------------------

/**
 * checks if the given space is above any of the configured limits
 * @param space space to check limit for
 */
export function isSpaceAboveLimit(space: Space) {
    return isSpaceAboveUserLimit(space) || isSpaceAboveRecipeLimit(space) || isSpaceAboveStorageLimit(space)
}

/**
 * checks if the given space is above the user limit
 * @param space space to check limit for
 */
export function isSpaceAboveUserLimit(space: Space) {
    return space.userCount > space.maxUsers && space.maxUsers > 0
}

/**
 * checks if the given space is above the recipe limit
 * @param space space to check limit for
 */
export function isSpaceAboveRecipeLimit(space: Space) {
    return space.recipeCount > space.maxRecipes && space.maxRecipes > 0
}

/**
 * checks if the given space is at the recipe limit
 * @param space space to check limit for
 */
export function isSpaceAtRecipeLimit(space: Space) {
    return space.recipeCount >= space.maxRecipes && space.maxRecipes > 0
}

/**
 * checks if the given space is above the file storage limit
 * @param space space to check limit for
 */
export function isSpaceAboveStorageLimit(space: Space) {
    return space.fileSizeMb > space.maxFileStorageMb && space.maxFileStorageMb > 0
}