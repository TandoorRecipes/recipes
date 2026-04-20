/**
 * CookLog-specific configuration for the enhanced ModelListPage.
 */

import type {FilterDef, ActionDef, ListSettings, SortDef, ModelItem} from './types'

export const COOKLOG_FILTER_DEFS: FilterDef[] = [
    {key: 'recipe', labelKey: 'Recipe', type: 'model-select', icon: 'fa-solid fa-book', modelName: 'Recipe', group: 'Attributes'},
]

export const COOKLOG_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
]

export const COOKLOG_LIST_SETTINGS: ListSettings = {
    settingsKey: 'cookLog',
    settingsPanel: true,
    mobileList: true,
    defaults: {
        showMobileHeaders: true,
    },
}

export const COOKLOG_SORT_OPTIONS: SortDef[] = [
    {key: 'created_at', labelKey: 'date_created', defaultDescending: true},
    {key: 'rating', labelKey: 'Rating', defaultDescending: true},
    {key: 'recipe__name', labelKey: 'Recipe'},
]
