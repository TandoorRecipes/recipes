/**
 * UserFile-specific configuration for the enhanced ModelListPage.
 * The backend StandardFilterModelViewSet provides a `query` text filter against name;
 * that's wired through the generic search slot rather than the filter panel.
 */

import type {ActionDef, ListSettings, SortDef, ModelItem} from './types'

export const USERFILE_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
]

export const USERFILE_LIST_SETTINGS: ListSettings = {
    settingsKey: 'userFile',
    settingsPanel: true,
    mobileList: true,
    defaults: {
        showMobileHeaders: true,
    },
}

export const USERFILE_SORT_OPTIONS: SortDef[] = [
    {key: 'name', labelKey: 'Name'},
    {key: 'file_size_kb', labelKey: 'Size', defaultDescending: true},
    {key: 'created_at', labelKey: 'date_created', defaultDescending: true},
]
