/**
 * Unit-specific configuration for the enhanced ModelListPage.
 */

import type {ActionDef, ListSettings} from './types'

export const UNIT_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    {key: 'ingredient-editor', labelKey: 'Ingredient Editor', icon: 'fa-solid fa-table-list', group: 'Actions', routeName: 'IngredientEditorPage', routeQuery: (item) => ({unit_id: item.id})},
    {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
]

export const UNIT_LIST_SETTINGS: ListSettings = {
    settingsKey: 'unit',
    settingsPanel: true,
    mobileList: true,
}
