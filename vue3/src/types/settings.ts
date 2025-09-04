import {Supermarket} from "@/openapi";

export type DeviceSettings = {
    shopping_show_checked_entries: boolean
    shopping_show_delayed_entries: boolean
    shopping_show_selected_supermarket_only: boolean
    shopping_selected_grouping: string
    shopping_selected_supermarket: Supermarket | null
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

    search_itemsPerPage: number,
    search_viewMode: 'table'|'grid',
    search_visibleFilters: String[],

    start_showMealPlan: boolean,

    general_tableItemsPerPage: number
    general_closedHelpAlerts: String[]
}