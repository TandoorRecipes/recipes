/**
 * CustomFilter-specific configuration for the enhanced ModelListPage.
 * The backend accepts `type` as a multi-valued enum (RECIPE/FOOD/KEYWORD).
 */

import type {FilterDef, ActionDef, ListSettings, SortDef, ModelItem} from './types'

const CUSTOMFILTER_TYPE_OPTIONS: {value: string, labelKey: string}[] = [
    {value: 'RECIPE', labelKey: 'Recipe'},
    {value: 'FOOD', labelKey: 'Food'},
    {value: 'KEYWORD', labelKey: 'Keyword'},
]

export const CUSTOMFILTER_FILTER_DEFS: FilterDef[] = [
    {key: 'type', labelKey: 'Type', type: 'select', icon: 'fa-solid fa-filter', options: CUSTOMFILTER_TYPE_OPTIONS, group: 'Attributes'},
]

export const CUSTOMFILTER_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
]

export const CUSTOMFILTER_LIST_SETTINGS: ListSettings = {
    settingsKey: 'customFilter',
    settingsPanel: true,
    mobileList: true,
    defaults: {
        showMobileHeaders: true,
    },
}

export const CUSTOMFILTER_SORT_OPTIONS: SortDef[] = [
    {key: 'name', labelKey: 'Name'},
    {key: 'type', labelKey: 'Type'},
    {key: 'created_at', labelKey: 'date_created', defaultDescending: true},
]
