/**
 * Automation-specific configuration for the enhanced ModelListPage.
 */

import type {FilterDef, ActionDef, StatDef, ListSettings, SortDef, ModelItem} from './types'
import {ApiApi, AutomationTypeEnum} from '@/openapi'
import {ErrorMessageType, useMessageStore} from '@/stores/MessageStore'

const api = new ApiApi()

/** Build select options from AutomationTypeEnum values with matching i18n keys. */
const AUTOMATION_TYPE_OPTIONS: {value: string, labelKey: string}[] = Object.values(AutomationTypeEnum).map(v => ({
    value: v,
    labelKey: v.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/ /g, '_'),
}))

export const AUTOMATION_FILTER_DEFS: FilterDef[] = [
    {key: 'type', labelKey: 'Type', type: 'select', icon: 'fa-solid fa-robot', options: AUTOMATION_TYPE_OPTIONS, group: 'Attributes'},
    {key: 'disabled', labelKey: 'Disabled', type: 'tristate', icon: 'fa-solid fa-toggle-off', group: 'Status'},
]

export const AUTOMATION_ACTION_DEFS: ActionDef[] = [
    {key: 'toggle-disabled', labelKey: 'Disabled', icon: 'fa-solid fa-toggle-off', isToggle: true, toggleField: 'disabled', activeColor: 'error', inactiveColor: '', group: 'Status',
        isActive: (item: ModelItem) => item.disabled,
        colorResolver: (item: ModelItem) => item.disabled ? 'error' : 'success',
        handler: async (item: ModelItem) => {
            try {
                await api.apiAutomationPartialUpdate({id: item.id, patchedAutomation: {disabled: !item.disabled}})
                item.disabled = !item.disabled
            } catch (err) {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }
        },
    },
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true,
        routeName: 'ModelDeletePage',
        routeParams: (item: ModelItem, modelName: string) => ({model: modelName, id: item.id})},
]

export const AUTOMATION_SORT_OPTIONS: SortDef[] = [
    {key: 'name', labelKey: 'Name'},
    {key: 'type', labelKey: 'Type'},
    {key: 'order', labelKey: 'Order'},
]

/** Per-type stat entries — keys match the camelCase property names from the generated TS client
 *  (e.g., type_FOOD_ALIAS → typeFOODALIAS). */
const TYPE_STAT_DEFS: StatDef[] = AUTOMATION_TYPE_OPTIONS.map(o => ({
    key: `type${o.value.replace(/_/g, '')}`,
    labelKey: o.labelKey,
    icon: 'fa-solid fa-robot',
    color: 'info',
}))

export const AUTOMATION_STAT_DEFS: StatDef[] = [
    {key: 'enabled', labelKey: 'Enabled', icon: 'fa-solid fa-toggle-on', color: 'success'},
    {key: 'disabled', labelKey: 'Disabled', icon: 'fa-solid fa-toggle-off', color: 'error'},
    ...TYPE_STAT_DEFS,
]

export const AUTOMATION_LIST_SETTINGS: ListSettings = {
    settingsKey: 'automation',
    settingsPanel: true,
    statsFooter: true,
    mobileList: true,
    defaults: {
        showStats: true,
    },
}
