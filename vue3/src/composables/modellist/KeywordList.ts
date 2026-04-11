/**
 * Keyword-specific configuration for the enhanced ModelListPage.
 */

import type {FilterDef, ActionDef, StatDef, ListSettings, SortDef, ModelItem} from './types'

export const KEYWORD_FILTER_DEFS: FilterDef[] = [
    {key: 'hasRecipe', labelKey: 'UsedInRecipes', type: 'tristate', icon: 'fa-solid fa-utensils', group: 'Attributes'},
    {key: 'hasChildren', labelKey: 'Children', type: 'tristate', icon: 'fa-solid fa-sitemap', group: 'Attributes'},
]

export const KEYWORD_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
    {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
    {key: 'move', labelKey: 'Move', icon: 'fa-solid fa-arrow-right', group: 'Actions',
        routeName: 'ModelEditPage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id}),
        routeQuery: () => ({tab: 'hierarchy'})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
]

export const KEYWORD_STAT_DEFS: StatDef[] = [
    {key: 'withRecipe', labelKey: 'UsedInRecipes', icon: 'fa-solid fa-utensils', color: 'success'},
    {key: 'withChildren', labelKey: 'Children', icon: 'fa-solid fa-sitemap', color: 'info'},
]

export const KEYWORD_LIST_SETTINGS: ListSettings = {
    settingsKey: 'keyword',
    settingsPanel: true,
    treeEnabled: true,
    statsFooter: true,
    mobileList: true,
    defaults: {
        showStats: true,
    },
}

export const KEYWORD_SORT_OPTIONS: SortDef[] = [
    {key: 'name', labelKey: 'Name'},
    {key: 'numrecipe', labelKey: 'Recipes', defaultDescending: true},
    {key: 'numchild', labelKey: 'Children', defaultDescending: true},
]
