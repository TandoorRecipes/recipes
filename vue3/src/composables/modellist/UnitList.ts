/**
 * Unit-specific configuration for the enhanced ModelListPage.
 */

import type {FilterDef, ActionDef, StatDef, ListSettings, SortDef, ModelItem} from './types'

export const UNIT_FILTER_DEFS: FilterDef[] = [
    {key: 'hasRecipe', labelKey: 'UsedInRecipes', type: 'tristate', icon: 'fa-solid fa-utensils', group: 'Attributes'},
]

export const UNIT_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
    {key: 'ingredient-editor', labelKey: 'Ingredient Editor', icon: 'fa-solid fa-table-list', group: 'Actions', routeName: 'IngredientEditorPage', routeQuery: (item: ModelItem) => ({unit_id: item.id})},
    {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
]

export const UNIT_STAT_DEFS: StatDef[] = [
    {key: 'withRecipe', labelKey: 'UsedInRecipes', icon: 'fa-solid fa-utensils', color: 'success'},
]

export const UNIT_LIST_SETTINGS: ListSettings = {
    settingsKey: 'unit',
    settingsPanel: true,
    statsFooter: true,
    mobileList: true,
    defaults: {
        showStats: true,
    },
}

export const UNIT_SORT_OPTIONS: SortDef[] = [
    {key: 'name', labelKey: 'Name'},
    {key: 'numrecipe', labelKey: 'Recipes', defaultDescending: true},
]
