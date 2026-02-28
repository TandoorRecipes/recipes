import {
    AccessToken, AiLog, AiProvider,
    ApiApi, ApiKeywordMoveUpdateRequest, Automation, type AutomationTypeEnum, ConnectorConfig, CookLog, CustomFilter,
    Food, FoodInheritField,
    Ingredient,
    InviteLink, Keyword,
    MealPlan,
    MealType,
    Property, PropertyType,
    Recipe, RecipeBook, RecipeBookEntry, RecipeImport, SearchFields, ShoppingList, ShoppingListEntry, Space,
    Step,
    Storage, InventoryLocation, InventoryEntry, InventoryLog,
    Supermarket,
    SupermarketCategory, Sync, SyncLog,
    Unit,
    UnitConversion, User, UserFile,
    UserSpace, ViewLog, Household
} from "@/openapi";
import {getNestedProperty} from "@/utils/utils";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {defineAsyncComponent, shallowRef} from "vue";
import type {FilterDef, ActionDef, BatchAction, HeaderAction, ListSettings, ColumnType, SortDef, StatDef} from "@/composables/modellist/types";

/**
 * returns a GenericModel instance with the given model type
 * throws and error if no model with the given name exist
 * @param modelName name of the model
 * @param t translation function from calling context
 * @return instance of GenericModel
 */
export function getGenericModelFromString(modelName: EditorSupportedModels, t: any): false | GenericModel {
    if (SUPPORTED_MODELS.has(modelName.toLowerCase())) {
        return new GenericModel(SUPPORTED_MODELS.get(modelName.toLowerCase())!, t)
    } else {
        return false
    }
}

/**
 * register a given model instance in the supported models list
 * @param model model to register
 */
export function registerModel(model: Model) {
    SUPPORTED_MODELS.set(model.name.toLowerCase(), model)
}

/**
 * returns a list of models that should be shown in the list/database view
 */
export function getListModels() {
    let modelList: Model[] = []
    SUPPORTED_MODELS.forEach((model) => {
        if (!model.disableListView) {
            modelList.push(model)
        }
    })
    return modelList
}

/**
 * common list parameters shared by all generic models
 * index signature allows filter params to pass through to API
 */
type GenericListRequestParameter = {
    page: number,
    pageSize: number,
    query: string,
    [key: string]: any,
}

/**
 * common list parameters shared by all generic models
 */
type DeleteRelationRequestParameter = {
    page: number,
    pageSize: number,
    id: number,
    cache: boolean,
}

/**
 * if a model is shown in a table, these are the table headers
 * structure similar to the VDataTableHeaders but simplified and
 * extended by a "hidden" attribute to allow custom table configuration for users
 *
 * converted to VDataTableHeaders by the GenericModel instance
 */
export type ModelTableHeaders = {
    title: string,
    key: string,
    align?: 'end' | 'start',
    hidden?: boolean,
    /** Enhanced column config: cell renderer type */
    type?: ColumnType,
    /** For boolean-indicator type: icon when true */
    trueIcon?: string,
    /** For boolean-indicator type: icon when false */
    falseIcon?: string,
    /** Whether this column supports display mode switching (icon vs text) */
    hasDisplayMode?: boolean,
    /** Default display mode if hasDisplayMode is true */
    defaultDisplayMode?: 'icon' | 'text',
    /** Dot-path to data field if different from key */
    field?: string,
    /** For number type: apply font-weight-medium when value > 0 */
    emphasizeNonZero?: boolean,
    /** For label-chip type: maps stringified values to chip display. Special key '_default' for catch-all. */
    chipMap?: Record<string, {label: string, color: string}>,
    /** For label-chip type: resolves the chip map key from the full item (when logic needs more than the cell value) */
    chipValueResolver?: (item: Record<string, any>) => string,
    /** For text type with array values: joins array items by this sub-field (e.g., 'name' → item[key].map(x => x.name).join(', ')) */
    joinField?: string,
    /** For label-chip type: optional click handler on the chip */
    chipClickHandler?: (item: Record<string, any>) => void,
}

/**
 * custom type containing all attributes needed by the generic model system to properly handle all functions
 */
export type Model = {
    name: EditorSupportedModels,
    localizationKey: string,
    localizationKeyDescription: string,
    icon: string,
    toStringKeys: Array<string>,

    editorComponent?: any,

    itemValue: string | undefined,
    itemLabel: string | undefined,

    disableList?: boolean | undefined,
    disableRetrieve?: boolean | undefined,
    disableCreate?: boolean | undefined,
    disableUpdate?: boolean | undefined,
    disableDelete?: boolean | undefined,
    disableSearch?: boolean | undefined,
    disableListView?: boolean | undefined,

    isAdvancedDelete: boolean | undefined,
    isPaginated: boolean | undefined,
    isMerge?: boolean | undefined,
    mergeAutomation?: string | AutomationTypeEnum,
    isTree?: boolean | undefined,

    tableHeaders: ModelTableHeaders[],

    /** Enhanced list capabilities (optional — when absent, ModelListPage uses current behavior) */
    filterDefs?: FilterDef[],
    actionDefs?: ActionDef[],
    batchActions?: BatchAction[],
    headerActions?: HeaderAction[],
    statDefs?: StatDef[],
    listSettings?: ListSettings,
    sortDefs?: SortDef[],
}
export let SUPPORTED_MODELS = new Map<string, Model>()

// used for (string) name based passing of models (to configure model selects, editor, ...)
export type EditorSupportedModels =
    'UnitConversion'
    | 'AccessToken'
    | 'InviteLink'
    | 'UserSpace'
    | 'MealType'
    | 'MealPlan'
    | 'Property'
    | 'Recipe'
    | 'Step'
    | 'Ingredient'
    | 'Food'
    | 'Unit'
    | 'Supermarket'
    | 'SupermarketCategory'
    | 'PropertyType'
    | 'Automation'
    | 'Keyword'
    | 'UserFile'
    | 'ShoppingList'
    | 'ShoppingListEntry'
    | 'User'
    | 'RecipeBook'
    | 'RecipeBookEntry'
    | 'CustomFilter'
    | 'Sync'
    | 'SyncLog'
    | 'RecipeImport'
    | 'Storage'
    | 'CookLog'
    | 'ViewLog'
    | 'ConnectorConfig'
    | 'SearchFields'
    | 'AiProvider'
    | 'AiLog'
    | 'Space'
    | 'FoodInheritField'
    | 'InventoryLocation'
    | 'InventoryEntry'
    | 'InventoryLog'
    | 'Household'

// used to type methods/parameters in conjunction with configuration type
export type EditorSupportedTypes =
    UnitConversion
    | AccessToken
    | InviteLink
    | UserSpace
    | MealType
    | MealPlan
    | Property
    | Recipe
    | Step
    | Ingredient
    | Food
    | Unit
    | Supermarket
    | SupermarketCategory
    | PropertyType
    | Automation
    | Keyword
    | UserFile
    | ShoppingList
    | ShoppingListEntry
    | User
    | RecipeBook
    | RecipeBookEntry
    | CustomFilter
    | Sync
    | SyncLog
    | RecipeImport
    | Storage
    | CookLog
    | ViewLog
    | ConnectorConfig
    | SearchFields
    | AiProvider
    | AiLog
    | Space
    | FoodInheritField
    | InventoryLocation
    | InventoryEntry
    | InventoryLog
    | Household

import {FOOD_FILTER_DEFS, FOOD_ACTION_DEFS, FOOD_BATCH_ACTIONS, FOOD_STAT_DEFS, FOOD_LIST_SETTINGS, FOOD_SORT_OPTIONS} from "@/composables/modellist/FoodList";

export const TFood = {
    name: 'Food',
    localizationKey: 'Food',
    localizationKeyDescription: 'FoodHelp',
    icon: 'fa-solid fa-carrot',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/FoodEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    isMerge: true,
    isTree: true,
    mergeAutomation: 'FOOD_ALIAS',
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name', type: 'text'},
        {title: 'Category', key: 'supermarketCategory.name', type: 'text'},
        {title: 'Recipes', key: 'numrecipe', type: 'number', align: 'end'},
        {title: 'Children', key: 'numchild', type: 'number', align: 'end', hidden: true, emphasizeNonZero: true},
        {title: 'Plural', key: 'pluralName', type: 'text'},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ],
    filterDefs: FOOD_FILTER_DEFS,
    actionDefs: FOOD_ACTION_DEFS,
    batchActions: FOOD_BATCH_ACTIONS,
    statDefs: FOOD_STAT_DEFS,
    listSettings: FOOD_LIST_SETTINGS,
    sortDefs: FOOD_SORT_OPTIONS,
} as Model
registerModel(TFood)

export const TUnit = {
    name: 'Unit',
    localizationKey: 'Unit',
    localizationKeyDescription: 'UnitHelp',
    icon: 'fa-solid fa-scale-balanced',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/UnitEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    isMerge: true,
    mergeAutomation: 'UNIT_ALIAS',
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name', type: 'text'},
        {title: 'Plural', key: 'pluralName', type: 'text', hidden: true},
        {title: 'Recipes', key: 'numrecipe', type: 'number', align: 'end', hidden: true},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ],
    actionDefs: [
        {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
        {key: 'ingredient-editor', labelKey: 'Ingredient Editor', icon: 'fa-solid fa-table-list', group: 'Actions', routeName: 'IngredientEditorPage', routeQuery: (item) => ({unit_id: item.id})},
        {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
        {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    ],
    listSettings: {settingsKey: 'unit', settingsPanel: true, mobileList: true},
} as Model
registerModel(TUnit)

export const TKeyword = {
    name: 'Keyword',
    localizationKey: 'Keyword',
    localizationKeyDescription: 'KeywordHelp',
    icon: 'fa-solid fa-tags',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/KeywordEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    isMerge: true,
    isTree: true,
    mergeAutomation: 'KEYWORD_ALIAS',
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name', type: 'text'},
        {title: 'Full Name', key: 'fullName', type: 'text', hidden: true},
        {title: 'Recipes', key: 'numrecipe', type: 'number', align: 'end', hidden: true},
        {title: 'Children', key: 'numchild', type: 'number', align: 'end', hidden: true},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ],
    actionDefs: [
        {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
        {key: 'merge', labelKey: 'Merge', icon: 'fa-solid fa-arrows-to-dot', group: 'Actions'},
        {key: 'move', labelKey: 'Move', icon: 'fa-solid fa-arrow-right', group: 'Actions',
            routeName: 'ModelEditPage',
            routeParams: (item, modelName) => ({model: modelName, id: item.id}),
            routeQuery: () => ({tab: 'hierarchy'})},
        {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    ],
    listSettings: {settingsKey: 'keyword', settingsPanel: true, mobileList: true, treeEnabled: true},
} as Model
registerModel(TKeyword)

export const TRecipe = {
    name: 'Recipe',
    localizationKey: 'Recipe',
    localizationKeyDescription: 'RecipeHelp',
    icon: 'fa-solid fa-book',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/RecipeEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    toStringKeys: ['name'],

    disableListView: true,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TRecipe)

export const TStep = {
    name: 'Step',
    localizationKey: 'Step',
    localizationKeyDescription: 'StepHelp',
    icon: 'fa-solid fa-list',

    isPaginated: true,
    toStringKeys: ['name'],

    disableListView: true,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TStep)

export const TIngredient = {
    name: 'Ingredient',
    localizationKey: 'Ingredient',
    localizationKeyDescription: 'IngredientHelp',
    icon: 'fa-solid fa-jar',

    isPaginated: true,
    toStringKeys: ['id'],

    disableListView: true,

    tableHeaders: [
        {title: 'Name', key: 'id'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TIngredient)

export const TMealType = {
    name: 'MealType',
    localizationKey: 'Meal_Type',
    localizationKeyDescription: 'MealTypeHelp',
    icon: 'fa-solid fa-utensils',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/MealTypeEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TMealType)

export const TMealPlan = {
    name: 'MealPlan',
    localizationKey: 'Meal_Plan',
    localizationKeyDescription: 'MealPlanHelp',
    icon: 'fa-solid fa-calendar-days',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/MealPlanEditor.vue`)),

    isPaginated: true,
    toStringKeys: ['title', 'recipe.name'],

    disableListView: true,

    tableHeaders: [
        {title: 'Title', key: 'title'},
        {title: 'StartDate', key: 'startDate'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TMealPlan)

export const TRecipeBook = {
    name: 'RecipeBook',
    localizationKey: 'Recipe_Book',
    localizationKeyDescription: 'RecipeBookHelp',
    icon: 'fa-solid fa-book-bookmark',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/RecipeBookEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    toStringKeys: ['name'],

    disableListView: true,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TRecipeBook)

export const TRecipeBookEntry = {
    name: 'RecipeBookEntry',
    localizationKey: 'Recipe_Book',
    localizationKeyDescription: 'RecipeBookEntryHelp',
    icon: 'fa-solid fa-book-bookmark',

    isPaginated: true,
    toStringKeys: ['book.name', 'recipe.name'],

    disableListView: true,

    tableHeaders: [
        {title: 'Book', key: 'book.name'},
        {title: 'Recipe', key: 'recipe.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TRecipeBookEntry)

export const TCustomFilter = {
    name: 'CustomFilter',
    localizationKey: 'SavedSearch',
    localizationKeyDescription: 'SavedSearchHelp',
    icon: 'fa-solid fa-filter',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/CustomFilterEditor.vue`)),

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TCustomFilter)

export const TUser = {
    name: 'User',
    localizationKey: 'User',
    localizationKeyDescription: 'UserHelp',
    icon: 'fa-solid fa-user',

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,
    disableListView: true,

    isPaginated: false,
    toStringKeys: ['displayName'],
    itemLabel: 'displayName',

    tableHeaders: [
        {title: 'Name', key: 'displayName'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TUser)

export const TSupermarket = {
    name: 'Supermarket',
    localizationKey: 'Supermarket',
    localizationKeyDescription: 'SupermarketHelp',
    icon: 'fa-solid fa-store',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/SupermarketEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
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
    localizationKeyDescription: 'SupermarketCategoryHelp',
    icon: 'fa-solid fa-boxes-stacked',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/SupermarketCategoryEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    isMerge: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TSupermarketCategory)


export const TShoppingList = {
    name: 'ShoppingList',
    localizationKey: 'ShoppingList',
    localizationKeyDescription: 'ShoppingListHelp',
    icon: 'fa-solid fa-file-lines',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/ShoppingListEditor.vue`)),

    disableListView: true,
    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Color', key: 'color', type: 'color-chip'},
        {title: 'Description', key: 'description'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TShoppingList)

export const TShoppingListEntry = {
    name: 'ShoppingListEntry',
    localizationKey: 'ShoppingListEntry',
    localizationKeyDescription: 'ShoppingListEntryHelp',
    icon: 'fa-solid fa-list-check',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/ShoppingListEntryEditor.vue`)),

    disableListView: true,
    isPaginated: true,
    toStringKeys: ['amount', 'unit.name', 'food.name'],

    tableHeaders: [
        {title: 'Amount', key: 'amount'},
        {title: 'Unit', key: 'unit.name'},
        {title: 'Food', key: 'food.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TShoppingListEntry)

export const TPropertyType = {
    name: 'PropertyType',
    localizationKey: 'Property',
    localizationKeyDescription: 'PropertyTypeHelp',
    icon: 'fa-solid fa-database',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/PropertyTypeEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
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
    localizationKeyDescription: 'PropertyHelp',
    icon: 'fa-solid fa-database',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/PropertyEditor.vue`)),

    disableListView: true,
    isPaginated: true,
    toStringKeys: ['propertyAmount', 'propertyType.name'],

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
    localizationKeyDescription: 'UnitConversionHelp',
    icon: 'fa-solid fa-exchange-alt',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/UnitConversionEditor.vue`)),

    isPaginated: true,
    toStringKeys: ['food.name', 'baseUnit.name', 'convertedUnit.name'],

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
    localizationKeyDescription: 'UserFileHelp',
    icon: 'fa-solid fa-file',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/UserFileEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
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
    localizationKeyDescription: 'AutomationHelp',
    icon: 'fa-solid fa-robot',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/AutomationEditor.vue`)),

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
    localizationKeyDescription: 'CookLogHelp',
    icon: 'fa-solid fa-table-list',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/CookLogEditor.vue`)),

    disableCreate: true,

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
    localizationKeyDescription: 'ViewLogHelp',
    icon: 'fa-solid fa-clock-rotate-left',

    isPaginated: true,
    disableCreate: true,
    disableUpdate: true,
    disableDelete: true,
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
    localizationKeyDescription: 'AccessTokenHelp',
    icon: 'fa-solid fa-key',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/AccessTokenEditor.vue`)),

    disableListView: true,
    isPaginated: true,
    toStringKeys: ['token'],

    tableHeaders: [
        {title: 'Access_Token', key: 'token'},
        {title: 'Created', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TAccessToken)


export const THousehold = {
    name: 'Household',
    localizationKey: 'Household',
    localizationKeyDescription: 'HouseholdHelp',
    icon: 'fa-solid fa-house-chimney-user',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/HouseholdEditor.vue`)),

    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(THousehold)

export const TUserSpace = {
    name: 'UserSpace',
    localizationKey: 'SpaceMembers',
    localizationKeyDescription: 'SpaceMembersHelp',
    icon: 'fa-solid fa-users',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/UserSpaceEditor.vue`)),

    disableListView: true,
    isPaginated: true,
    toStringKeys: ['user.displayName'],

    disableCreate: true,

    tableHeaders: [
        {title: 'User', key: 'user.displayName'},
        {title: 'Group', key: 'groups', type: 'text', joinField: 'name'},
        {title: 'Household', key: 'household.name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ],
    headerActions: [
        {type: 'button', key: 'invites', labelKey: 'Invites', icon: 'fa-solid fa-link',
            routeName: 'ModelListPage', routeParams: {model: 'InviteLink'}},
    ],
} as Model
registerModel(TUserSpace)

export const TInviteLink = {
    name: 'InviteLink',
    localizationKey: 'Invite_Link',
    localizationKeyDescription: 'InviteLinkHelp',
    icon: 'fa-solid fa-link',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/InviteLinkEditor.vue`)),

    disableSearch: true,
    isPaginated: true,
    toStringKeys: ['email', 'role'],

    tableHeaders: [
        {title: 'Email', key: 'email'},
        {title: 'Role', key: 'group.name'},
        {title: 'Valid Until', key: 'validUntil'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TInviteLink)

export const TSpace = {
    name: 'Space',
    localizationKey: 'Space',
    localizationKeyDescription: 'SpaceHelp',
    icon: 'fa-solid fa-hard-drive',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/SpaceEditor.vue`)),

    disableDelete: true,
    isPaginated: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Owner', key: 'createdBy.displayName'},
        {title: 'Active', key: 'active', type: 'label-chip',
            chipValueResolver: (item: any) => item.id === useUserPreferenceStore().activeSpace.id ? 'active' : 'select',
            chipMap: {active: {label: 'Active', color: 'success'}, select: {label: 'Select', color: 'info'}},
            chipClickHandler: (item: any) => useUserPreferenceStore().switchSpace(item)},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ],
    actionDefs: [
        {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item: any, modelName: string) => ({model: modelName, id: item.id})},
        {key: 'leave', labelKey: 'LeaveSpace', icon: 'fa-solid fa-arrow-right-from-bracket', group: 'Actions', isDanger: true, reloadAfterAction: true,
            visible: (item: any) => item.createdBy?.id !== useUserPreferenceStore().userSettings.user?.id,
            handler: async (item: any) => {
                const api = new ApiApi()
                const store = useUserPreferenceStore()
                const userSpace = store.userSpaces.find((us: UserSpace) => us.space === item.id)
                if (userSpace) {
                    await api.apiUserSpaceDestroy({id: userSpace.id!})
                }
            },
        },
    ],
} as unknown as Model
registerModel(TSpace)

export const TStorage = {
    name: 'Storage',
    localizationKey: 'Storage',
    localizationKeyDescription: 'StorageHelp',
    icon: 'fa-solid fa-cloud',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/StorageEditor.vue`)),

    disableListView: false,
    toStringKeys: ['name'],
    isPaginated: true,
    isAdvancedDelete: true,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TStorage)

export const TInventoryLocation = {
    name: 'InventoryLocation',
    localizationKey: 'InventoryLocation',
    localizationKeyDescription: 'InventoryLocationHelp',
    icon: 'fa-solid fa-warehouse',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/InventoryLocationEditor.vue`)),

    isPaginated: true,
    isAdvancedDelete: true,
    toStringKeys: ['name'],

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Household', key: 'household.name'},
        {title: 'Freezer', key: 'isFreezer'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TInventoryLocation)

export const TInventoryEntry = {
    name: 'InventoryEntry',
    localizationKey: 'InventoryEntry',
    localizationKeyDescription: 'InventoryEntryHelp',
    icon: 'fa-solid fa-jar-wheat',

    isPaginated: true,
    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,
    toStringKeys: ['label'],
    itemLabel: 'label',

    tableHeaders: [
        {title: 'Food', key: 'food.name'},
        {title: 'Amount', key: 'amount'},
        {title: 'Unit', key: 'unit.name'},
        {title: 'Location', key: 'inventoryLocation.name'},
        {title: 'Expires', key: 'expires'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TInventoryEntry)

export const TInventoryLog = {
    name: 'InventoryLog',
    localizationKey: 'InventoryLog',
    localizationKeyDescription: 'InventoryLogHelp',
    icon: 'fa-solid fa-clipboard-list',

    isPaginated: true,
    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    tableHeaders: [
        {title: 'Food', key: 'entry.food.name'},
        {title: 'Type', key: 'bookingType'},
        {title: 'Old Amount', key: 'oldAmount'},
        {title: 'New Amount', key: 'newAmount'},
        {title: 'Date', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TInventoryLog)

export const TSync = {
    name: 'Sync',
    localizationKey: 'SyncedPath',
    localizationKeyDescription: 'SyncedPathHelp',
    icon: 'fa-solid fa-folder-plus',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/SyncEditor.vue`)),

    disableListView: false,
    toStringKeys: ['path'],
    isPaginated: true,
    isAdvancedDelete: true,

    tableHeaders: [
        {title: 'SyncedPath', key: 'path'},
        {title: 'ExternalStorage', key: 'storage.name'},
        {title: 'Updated', key: 'lastChecked'},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ],
    actionDefs: [
        {key: 'edit', labelKey: 'Edit', icon: 'fa-solid fa-pen', group: 'Actions', routeName: 'ModelEditPage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
        {key: 'sync-import', labelKey: 'Import', icon: 'fa-solid fa-rotate', group: 'Actions'},
        {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item, modelName) => ({model: modelName, id: item.id})},
    ],
} as Model
registerModel(TSync)

export const TSyncLog = {
    name: 'SyncLog',
    localizationKey: 'SyncLog',
    localizationKeyDescription: 'SyncLogHelp',
    icon: 'fa-solid fa-bars-staggered',

    disableListView: false,
    toStringKeys: ['sync.path'],
    isPaginated: true,

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    tableHeaders: [
        {title: 'SyncedPath', key: 'sync.path'},
        {title: 'Status', key: 'status'},
        {title: 'Created', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TSyncLog)

export const TRecipeImport = {
    name: 'RecipeImport',
    localizationKey: 'ExternalRecipeImport',
    localizationKeyDescription: 'ExternalRecipeImportHelp',
    icon: 'fa-solid fa-file-half-dashed',

    disableListView: false,
    toStringKeys: ['name'],
    isPaginated: true,

    disableCreate: true,
    disableDelete: false,
    disableUpdate: false,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Storage', key: 'storage.name'},
        {title: 'Created', key: 'createdAt'},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ],
    actionDefs: [
        {key: 'import', labelKey: 'Import', icon: 'fa-solid fa-rotate', group: 'Actions',
            reloadAfterAction: true,
            handler: async (item: any) => {
                const api = new ApiApi()
                await api.apiRecipeImportImportRecipeCreate({id: item.id, recipeImport: item as RecipeImport})
            },
        },
        {key: 'delete', labelKey: 'Delete', icon: 'fa-solid fa-trash', group: 'Actions', isDanger: true, routeName: 'ModelDeletePage', routeParams: (item: any, modelName: string) => ({model: modelName, id: item.id})},
    ],
    headerActions: [
        {type: 'button', key: 'importAll', labelKey: 'ImportAll', icon: 'fa-solid fa-rotate', color: 'success',
            handler: async () => {
                const api = new ApiApi()
                await api.apiRecipeImportImportAllCreate({recipeImport: {} as RecipeImport})
            },
        },
    ],
} as unknown as Model
registerModel(TRecipeImport)

export const TConnectorConfig = {
    name: 'ConnectorConfig',
    localizationKey: 'ConnectorConfig',
    localizationKeyDescription: 'ConnectorConfigHelp',
    icon: 'fa-solid fa-arrows-turn-to-dots',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/ConnectorConfigEditor.vue`)),

    disableListView: false,
    toStringKeys: ['name'],
    isPaginated: true,
    isAdvancedDelete: true,

    disableCreate: false,
    disableDelete: false,
    disableUpdate: false,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Type', key: 'type'},
        {title: 'Actions', key: 'action', align: 'end'},
    ]
} as Model
registerModel(TConnectorConfig)

export const TAiProvider = {
    name: 'AiProvider',
    localizationKey: 'AiProvider',
    localizationKeyDescription: 'AiProviderHelp',
    icon: 'fa-solid fa-wand-magic-sparkles',

    editorComponent: defineAsyncComponent(() => import(`@/components/model_editors/AiProviderEditor.vue`)),

    disableListView: false,
    toStringKeys: ['name'],
    isPaginated: true,
    isAdvancedDelete: true,

    disableCreate: false,
    disableDelete: false,
    disableUpdate: false,

    tableHeaders: [
        {title: 'Name', key: 'name'},
        {title: 'Global', key: 'space', type: 'label-chip',
            chipValueResolver: (item) => item.space == null ? 'global' : 'space',
            chipMap: {global: {label: 'Global', color: 'success'}, space: {label: 'Space', color: 'info'}}},
        {title: 'Actions', key: 'action', type: 'action-menu', align: 'end'},
    ]
} as Model
registerModel(TAiProvider)

export const TAiLog = {
    name: 'AiLog',
    localizationKey: 'AiLog',
    localizationKeyDescription: 'AiLogHelp',
    icon: 'fa-solid fa-wand-magic-sparkles',

    disableListView: false,
    toStringKeys: ['aiProvider.name', 'function', 'created_at'],
    isPaginated: true,

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    tableHeaders: [
        {title: 'Type', key: '_function'},
        {title: 'AiProvider', key: 'aiProvider.name',},
        {title: 'Credits', key: 'creditCost',},
        {title: 'FromBalance', key: 'creditsFromBalance',},
        {title: 'CreatedAt', key: 'createdAt'},
        {title: 'Actions', key: 'action', align: 'end'},
    ],
    headerActions: [
        {type: 'widget', component: defineAsyncComponent(() => import('@/components/display/AiCreditsBar.vue'))},
    ],
} as Model
registerModel(TAiLog)

export const TFoodInheritField = {
    name: 'FoodInheritField',
    localizationKey: 'FoodInherit',
    localizationKeyDescription: 'food_inherit_info',
    icon: 'fa-solid fa-list',

    disableListView: true,
    toStringKeys: ['name'],

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    isPaginated: false,
} as Model
registerModel(TFoodInheritField)

export const TSearchFields = {
    name: 'SearchFields',
    localizationKey: 'SearchFields',
    localizationKeyDescription: '',
    icon: 'fa-solid fa-search',

    disableListView: true,
    toStringKeys: ['name'],

    disableCreate: true,
    disableDelete: true,
    disableUpdate: true,

    isPaginated: false,
} as Model
registerModel(TSearchFields)


/**
 * Many of Tandoors models and model API endpoints share the same interfaces
 * The GenericModel class allows interaction with these models in a standardized manner
 */
export class GenericModel {

    api: ApiApi & Record<string, (...args: any[]) => any>
    model: Model
    // TODO find out the type of the t useI18n object and use it here
    // TODO decouple context from Generic model so t does not need to be passed
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
    }

    /**
     * create a new instance of the given model
     * throws error if creation is not supported for given model
     * @param obj object to create
     * @return promise of request
     */
    create(obj: EditorSupportedTypes) {
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
    update(id: number, obj: EditorSupportedTypes) {
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

    /**
     * merge the given source into the target by updating all entries using source to use target instead and deleting source
     * @param source object to be replaced by target
     * @param target object replacing source
     */
    merge(source: EditorSupportedTypes, target: EditorSupportedTypes) {
        if (!this.model.isMerge) {
            throw new Error('Cannot merge on this model!')
        } else {
            let mergeRequestParams: any = {id: source.id, target: target.id}
            mergeRequestParams[this.model.name.charAt(0).toLowerCase() + this.model.name.slice(1)] = {}

            return this.api[`api${this.model.name}MergeUpdate`](mergeRequestParams)
        }
    }

    /**
     * move the given source object so that its parent is the given parentId.
     * @param source object to change parent for
     * @param parentId parent id to change the object to or 0 to remove parent
     */
    move(source: EditorSupportedTypes, parentId: number) {
        if (!this.model.isTree) {
            throw new Error('This model does not support trees!')
        } else {
            let moveRequestParams: any = {id: source.id, parent: parentId}
            moveRequestParams[this.model.name.charAt(0).toLowerCase() + this.model.name.slice(1)] = source

            return this.api[`api${this.model.name}MoveUpdate`](moveRequestParams)
        }
    }

    /**
     * query the protecting list endpoint
     * @param deleteRelationRequestParameter parameters
     * @return promise of request
     */
    getDeleteProtecting(deleteRelationRequestParameter: DeleteRelationRequestParameter) {
        return this.api[`api${this.model.name}ProtectingList`](deleteRelationRequestParameter)
    };

    /**
     * query the cascading list endpoint
     * @param deleteRelationRequestParameter parameters
     * @return promise of request
     */
    getDeleteCascading(deleteRelationRequestParameter: DeleteRelationRequestParameter) {
        return this.api[`api${this.model.name}CascadingList`](deleteRelationRequestParameter)
    };

    /**
     * query the nulling list endpoint
     * @param deleteRelationRequestParameter parameters
     * @return promise of request
     */
    getDeleteNulling(deleteRelationRequestParameter: DeleteRelationRequestParameter) {
        return this.api[`api${this.model.name}NullingList`](deleteRelationRequestParameter)
    };

    /**
     * gets a label for a specific object instance using the model toStringKeys property
     * @param obj obj to get label for
     */
    getLabel(obj: EditorSupportedTypes) {
        let name = ''

        if (obj) {
            this.model.toStringKeys.forEach(key => {
                let value = getNestedProperty(obj, key)
                name += ' ' + ((value != null) ? value : '')
            })
        }
        return name
    }

    /**
     * fetch aggregate stats from the dedicated stats endpoint
     * @return promise resolving to stats object, or empty object if not supported
     */
    stats(): Promise<Record<string, number>> {
        const method = `api${this.model.name}StatsRetrieve`
        if (typeof this.api[method] !== 'function') return Promise.resolve({})
        return this.api[method]()
    }

}