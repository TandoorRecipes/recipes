/**
 * Types for Food filter panel component
 */

/**
 * Represents a boolean filter with include/exclude toggle
 */
export interface BooleanFilter {
    enabled: boolean
    exclude: boolean
}

/**
 * All food filters available in the filter panel
 */
export interface FoodFilters {
    root: BooleanFilter
    hasChildren: BooleanFilter
    onHand: BooleanFilter
    hasRecipes: BooleanFilter
    isRecipe: BooleanFilter
    inShopping: BooleanFilter
    ignoreShopping: BooleanFilter
    hasSubstitutes: BooleanFilter
    minRecipes: number
    category: number | null
}

/**
 * Filter definition for a boolean filter in the panel
 */
export interface BooleanFilterDefinition {
    key: keyof Omit<FoodFilters, 'minRecipes' | 'category'>
    label: string
    color: string
}
