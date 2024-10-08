import { ApiApi } from "@/openapi";
import {VDataTable} from "vuetify/components";

type VDataTableProps = InstanceType<typeof VDataTable>['$props']

/**
 * returns a GenericModel instance with the given model type
 * throws and error if no model with the given name exist
 * @param modelName name of the model
 * @param t translation function from calling context
 * @return instance of GenericModel
 */
export function getGenericModelFromString(modelName: string, t: any) {
    if (SUPPORTED_MODELS.has(modelName.toLowerCase())) {
        return new GenericModel(SUPPORTED_MODELS.get(modelName.toLowerCase()), t)
    } else {
        throw Error(`Model ${modelName} not in SUPPORTED_MODELS`)
    }
}

/**
 * register a given model instance in the supported models list
 * @param model model to register
 */
function registerModel(model: Model){
    SUPPORTED_MODELS.set(model.name.toLowerCase(), model)
}

/**
 * common list parameters shared by all generic models
 */
type GenericListRequestParameter = {
    page: number,
    pageSize: number,
    query: string,
}

/**
 * if a model is shown in a table, these are the table headers
 * structure similar to the VDataTableHeaders but simplified and
 * extended by a "hidden" attribute to allow custom table configuration for users
 *
 * converted to VDataTableHeaders by the GenericModel instance
 */
type ModelTableHeaders = {
    title: string,
    key: string,
    align: 'end' | 'start',
    hidden?: boolean,
}

/**
 * custom type containing all attributes needed by the generic model system to properly handle all functions
 */
export type Model = {
    name: string,
    localizationKey: string,
    icon: string,
    toStringKeys: Array<string>,

    disableList?: boolean | undefined,
    disableRetrieve?: boolean | undefined,
    disableCreate?: boolean | undefined,
    disableUpdate?: boolean | undefined,
    disableDelete?: boolean | undefined,

    isPaginated: boolean | undefined,

    tableHeaders: ModelTableHeaders[],
}
export let SUPPORTED_MODELS = new Map<string, Model>()

export type EditorSupportedModels = 'UnitConversion' | 'AccessToken' | 'InviteLink' | 'UserSpace' | 'MealType' | 'Property' | 'Food' | 'Supermarket' | 'SupermarketCategory' | 'PropertyType' | 'Automation'

export const TFood = {
    name: 'Food',
    localizationKey: 'Food',
    icon: 'fa-solid fa-carrot',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Category', key: 'supermarketCategory.name'},
        {title: 'Plural', key: 'plural', hidden: true},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TFood)

export const TUnit = {
    name: 'Unit',
    localizationKey: 'Unit',
    icon: 'fa-solid fa-scale-balanced',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Plural', key: 'plural', hidden: true},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TUnit)

export const TKeyword = {
    name: 'Keyword',
    localizationKey: 'Keyword',
    icon: 'fa-solid fa-tags',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TKeyword)

export const TRecipe = {
    name: 'Recipe',
    localizationKey: 'Recipe',
    icon: 'fa-solid fa-book',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TRecipe)

export const TMealType = {
    name: 'MealType',
    localizationKey: 'Meal_Type',
    icon: 'fa-solid fa-utensils',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TMealType)

export const TUser = {
    name: 'User',
    localizationKey: 'User',
    icon: 'fa-solid fa-user',

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    isPaginated: false,
    toStringKeys: ['displayName'],

    tableHeaders: [
        {title: 'Name', key: 'displayName'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TUser)

export const TSupermarket = {
    name: 'Supermarket',
    localizationKey: 'Supermarket',
    icon: 'fa-solid fa-store',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TSupermarket)

export const TSupermarketCategory = {
    name: 'SupermarketCategory',
    localizationKey: 'Category',
    icon: 'fa-solid fa-boxes-stacked',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TSupermarketCategory)

export const TPropertyType = {
    name: 'PropertyType',
    localizationKey: 'Property',
    icon: 'fa-solid fa-database',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TPropertyType)

export const TProperty = {
    name: 'Property',
    localizationKey: 'Property',
    icon: 'fa-solid fa-database',

    isPaginated: true,
    toStringKeys: ['propertyType'], // TODO improve

    tableHeaders: [
        {title: 'Amount', key: 'propertyAmount'},
        {title: 'PropertyType', key: 'propertyType.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TProperty)

export const TUnitConversion = {
    name: 'UnitConversion',
    localizationKey: 'UnitConversion',
    icon: 'fa-solid fa-exchange-alt',

    isPaginated: true,
    toStringKeys: ['food'], // TODO improve

    tableHeaders: [
        {title: 'Food', key: 'food.name'},
        {title: 'base_amount', key: 'baseAmount'},
        {title: 'base_unit', key: 'baseUnit.name'},
        {title: 'converted_amount', key: 'convertedAmount'},
        {title: 'converted_unit', key: 'convertedUnit.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TUnitConversion)

export const TUserFile = {
    name: 'UserFile',
    localizationKey: 'File',
    icon: 'fa-solid fa-file',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TUserFile)

export const TAutomation = {
    name: 'Automation',
    localizationKey: 'Automation',
    icon: 'fa-solid fa-robot',

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Type', key: 'type'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TAutomation)

export const TCookLog = {
    name: 'CookLog',
    localizationKey: 'CookLog',
    icon: 'fa-solid fa-table-list',

    isPaginated: true,
    toStringKeys: ['recipe'],

    tableHeaders: [
        {title: 'Recipe', key: 'recipe'},
        {title: 'Created', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TCookLog)

export const TViewLog = {
    name: 'ViewLog',
    localizationKey: 'History',
    icon: 'fa-solid fa-clock-rotate-left',

    isPaginated: true,
    toStringKeys: ['recipe'],

    tableHeaders: [
        {title: 'Recipe', key: 'recipe'},
        {title: 'Created', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TViewLog)

export const TAccessToken = {
    name: 'AccessToken',
    localizationKey: 'Access_Token',
    icon: 'fa-solid fa-key',

    isPaginated: true,
    toStringKeys: ['token'],

    tableHeaders: [
        {title: 'Access_Token', key: 'token'},
        {title: 'Created', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TAccessToken)

export const TUserSpace = {
    name: 'UserSpace',
    localizationKey: 'SpaceMembers',
    icon: 'fa-solid fa-users',

    isPaginated: true,
    toStringKeys: ['user'], // TODO improve

    disableCreate: true,

    tableHeaders: [
        {title: 'User', key: 'user'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TUserSpace)

export const TInviteLink = {
    name: 'InviteLink',
    localizationKey: 'Invite_Link',
    icon: 'fa-solid fa-link',

    isPaginated: true,

    toStringKeys: ['email', 'role'],

    tableHeaders: [
        {title: 'Email', key: 'email'},
        {title: 'Role', key: 'group'},
        {title: 'Valid Until', key: 'validUntil'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TInviteLink)

export const TFoodInheritField = {
    name: 'FoodInheritField',
    localizationKey: 'FoodInherit',
    icon: 'fa-solid fa-list',

    toStringKeys: ['name'],

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    isPaginated: false,
} as Model
registerModel(TFoodInheritField)


/**
 * Many of Tandoors models and model API endpoints share the same interfaces
 * The GenericModel class allows interaction with these models in a standardized manner
 */
export class GenericModel {

    api: Object
    model: Model
    // TODO find out the type of the t useI18n object and use it here
    t: any

    /**
     * create a new generic model based on the given Model type
     * @param model instance of Model type
     * @param t translation function from calling context
     */
    constructor(model: Model, t: any) {
        this.model = model
        this.api = new ApiApi()
        this.t = t
    }

    getTableHeaders(): VDataTableProps['headers'][] {
        let tableHeaders: VDataTableProps['headers'][] = []
        this.model.tableHeaders.forEach(header => {
            if (!header.hidden) {
                header.title = this.t(header.title)
                tableHeaders.push(header as unknown as VDataTableProps['headers'])
            }
        })
        return tableHeaders
    }

    /**
     * query the models list endpoint using the given generic parameters
     * @param genericListRequestParameter parameters
     * @return promise of request
     */
    list(genericListRequestParameter: GenericListRequestParameter) {
        if (this.model.disableList) {
            throw new Error('Cannot list on this model!')
        } else {
            return this.api[`api${this.model.name}List`](genericListRequestParameter)
        }
    };

    /**
     * create a new instance of the given model
     * throws error if creation is not supported for given model
     * @param obj object to create
     * @return promise of request
     */
    create(obj: any) {
        if (this.model.disableCreate) {
            throw new Error('Cannot create on this model!')
        } else {
            let createRequestParams: any = {}
            createRequestParams[this.model.name.charAt(0).toLowerCase() + this.model.name.slice(1)] = obj
            return this.api[`api${this.model.name}Create`](createRequestParams)
        }
    }

    /**
     * update a model instance with the given value
     * throws error if updating is not supported for given model
     * @param id id of object to update
     * @param obj object to update
     * @return promise of request
     */
    update(id: number, obj: any) {
        if (this.model.disableUpdate) {
            throw new Error('Cannot update on this model!')
        } else {
            let updateRequestParams: any = {}
            updateRequestParams['id'] = id
            updateRequestParams[this.model.name.charAt(0).toLowerCase() + this.model.name.slice(1)] = obj
            return this.api[`api${this.model.name}Update`](updateRequestParams)
        }
    }

    /**
     * retrieves the given model
     * throws error if retrieving is not supported for given model
     * @param id object id to retrieve
     * @return promise of request
     */
    retrieve(id: number) {
        if (this.model.disableRetrieve) {
            throw new Error('Cannot delete on this model!')
        } else {
            let retrieveRequestParams: any = {}
            retrieveRequestParams['id'] = id
            return this.api[`api${this.model.name}Retrieve`](retrieveRequestParams)
        }
    }

    /**
     * deletes the given model instance
     * throws error if creation is not supported for given model
     * @param id object id to delete
     * @return promise of request
     */
    destroy(id: number) {
        if (this.model.disableDelete) {
            throw new Error('Cannot delete on this model!')
        } else {
            let destroyRequestParams: any = {}
            destroyRequestParams['id'] = id
            return this.api[`api${this.model.name}Destroy`](destroyRequestParams)
        }
    }

}