/**
 * ViewLog-specific configuration for the enhanced ModelListPage.
 * ViewLog is read-only (disableCreate/disableUpdate/disableDelete on the Model) —
 * no action defs, no filter defs; only sorting and list settings.
 */

import type {ListSettings, SortDef} from './types'

export const VIEWLOG_LIST_SETTINGS: ListSettings = {
    settingsKey: 'viewLog',
    settingsPanel: true,
    mobileList: true,
    defaults: {
        showMobileHeaders: true,
    },
}

export const VIEWLOG_SORT_OPTIONS: SortDef[] = [
    {key: 'created_at', labelKey: 'date_created', defaultDescending: true},
    {key: 'recipe__name', labelKey: 'Recipe'},
]
