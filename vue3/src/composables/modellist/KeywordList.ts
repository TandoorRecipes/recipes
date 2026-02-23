/**
 * Keyword-specific configuration for the enhanced ModelListPage.
 */

import type {ActionDef, ListSettings} from './types'

export const KEYWORD_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
    {key: 'move', labelKey: 'Move', icon: 'fa-solid fa-arrow-right', group: 'Actions',
        routeName: 'ModelEditPage',
        routeParams: (item, modelName) => ({model: modelName, id: item.id}),
        routeQuery: () => ({tab: 'hierarchy'})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
]

export const KEYWORD_LIST_SETTINGS: ListSettings = {
    settingsKey: 'keyword',
    settingsPanel: true,
    mobileList: true,
    treeEnabled: true,
}
