/**
 * Space-specific configuration for the enhanced ModelListPage.
 */

import type {ActionDef} from './types'
import {ApiApi, type UserSpace} from '@/openapi'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

export const SPACE_ACTION_DEFS: ActionDef[] = [
    {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    {key: 'leave', labelKey: 'LeaveSpace', icon: 'fa-solid fa-arrow-right-from-bracket', group: 'Actions', isDanger: true, reloadAfterAction: true,
        visible: (item) => item.createdBy?.id !== useUserPreferenceStore().userSettings.user?.id,
        handler: async (item) => {
            const api = new ApiApi()
            const store = useUserPreferenceStore()
            const userSpace = store.userSpaces.find((us: UserSpace) => us.space === item.id)
            if (userSpace) {
                await api.apiUserSpaceDestroy({id: userSpace.id!})
            }
        },
    },
]
