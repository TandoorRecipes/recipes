import {ShoppingList, Supermarket} from "@/openapi";

export type DeviceSettings = {
    shopping_show_checked_entries: boolean
    shopping_show_delayed_entries: boolean
    shopping_show_selected_supermarket_only: boolean
    shopping_selected_grouping: string
    shopping_selected_supermarket: Supermarket | null
    shopping_selected_shopping_lists: number[]
    shopping_item_info_created_by: boolean
    shopping_item_info_mealplan: boolean
    shopping_item_info_recipe: boolean
    shopping_input_autocomplete: boolean
    shopping_show_debug: boolean

    mealplan_displayPeriod: string
    mealplan_displayPeriodCount: number
    mealplan_startingDayOfWeek: number
    mealplan_displayWeekNumbers: boolean

    recipe_mergeStepOverview: boolean,
    recipe_showIngredientActions: boolean,
    recipe_showCheckboxes: boolean,
    recipe_overviewExpanded: boolean,
    recipe_overviewInlineStatus: boolean,
    recipe_overviewNotesDisplay: 'bubble' | 'inline' | 'truncate',
    recipe_stepInlineStatus: boolean,
    recipe_stepNotesDisplay: 'bubble' | 'inline' | 'truncate',
    recipe_notesTruncateLength: number,
    recipe_contextMenuColor: 'never' | 'onhand' | 'shopping' | 'substitute',

    search_itemsPerPage: number,
    search_viewMode: 'table'|'grid',
    search_visibleFilters: String[],

    start_showMealPlan: boolean,

    general_tableItemsPerPage: number
    general_closedHelpAlerts: String[]
    general_showModelListDescription: boolean

    card_showRating: boolean
    card_showAuthor: boolean
    card_showLastCooked: boolean
    card_showNewBadge: boolean
    card_maxKeywords: number
    card_visibleMenuItems: string[]

    // Model list settings are stored with dynamic keys: `${settingsKey}_${suffix}`
    // e.g. food_hiddenColumns, keyword_treeView, unit_quickActions
    // Index signature allows new models without adding explicit properties
    [key: string]: any
}

export type StartPageSectionMode = 'meal_plan' | 'recent' | 'new' | 'keyword' | 'random' | 'created_by' | 'rating' | 'books' | 'food' | 'saved_search'

export interface StartPageSection {
    mode: StartPageSectionMode
    enabled: boolean
    min_recipes?: number
    filter_id?: number
}
