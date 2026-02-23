/**
 * RecipeImport-specific configuration for the enhanced ModelListPage.
 */

import type {ActionDef, HeaderAction} from './types'
import {ApiApi, type RecipeImport} from '@/openapi'

export const RECIPE_IMPORT_HEADER_ACTIONS: HeaderAction[] = [
    {type: 'button', key: 'importAll', labelKey: 'ImportAll', icon: 'fa-solid fa-rotate', color: 'success',
        handler: async () => {
            const api = new ApiApi()
            await api.apiRecipeImportImportAllCreate({recipeImport: {} as RecipeImport})
        },
    },
]

export const RECIPE_IMPORT_ACTION_DEFS: ActionDef[] = [
    {key: 'import', labelKey: 'Import', icon: 'fa-solid fa-rotate', group: 'Actions',
        reloadAfterAction: true,
        handler: async (item) => {
            const api = new ApiApi()
            await api.apiRecipeImportImportRecipeCreate({id: item.id, recipeImport: item as RecipeImport})
        },
    },
    {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
]
