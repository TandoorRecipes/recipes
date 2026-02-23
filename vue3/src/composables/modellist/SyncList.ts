/**
 * Sync-specific configuration for the enhanced ModelListPage.
 */

import type {ActionDef} from './types'

export const SYNC_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    {key: 'sync-import', labelKey: 'Import', icon: 'fa-solid fa-rotate', group: 'Actions'},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
]
