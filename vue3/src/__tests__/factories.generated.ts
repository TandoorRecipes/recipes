/**
 * AUTO-GENERATED test factories from OpenAPI schema.
 * Do not edit manually — regenerate with:
 *   python vue3/scripts/generate-test-factories.py
 *
 * Three variants per model:
 *   make*()         — happy path defaults for all fields
 *   makeMinimal*()  — only required fields
 *   makeEdgeCase*() — nulls, empty arrays, zeros
 */

import type {
    AccessToken,
    AiImport,
    AiLog,
    AiProvider,
    AuthToken,
    AutoMealPlan,
    Automation,
    BookmarkletImport,
    BookmarkletImportList,
    ConnectorConfig,
    CookLog,
    CustomFilter,
    ExportLog,
    ExportRequest,
    FdcQuery,
    FdcQueryFoods,
    Food,
    FoodBatchUpdate,
    FoodInheritField,
    FoodShopping,
    FoodSimple,
    FoodStats,
    GenericModelReference,
    Group,
    Household,
    ImportLog,
    ImportOpenData,
    ImportOpenDataMetaData,
    ImportOpenDataResponse,
    ImportOpenDataResponseDetail,
    ImportOpenDataVersionMetaData,
    Ingredient,
    IngredientParserRequest,
    IngredientParserResponse,
    IngredientSimple,
    InventoryEntry,
    InventoryLocation,
    InventoryLog,
    InviteLink,
    Keyword,
    KeywordLabel,
    Localization,
    MealPlan,
    MealType,
    NutritionInformation,
    Property,
    PropertyType,
    Recipe,
    RecipeBatchUpdate,
    RecipeBook,
    RecipeBookEntry,
    RecipeFlat,
    RecipeFromSource,
    RecipeFromSourceResponse,
    RecipeImage,
    RecipeImport,
    RecipeOverview,
    RecipeShoppingUpdate,
    RecipeSimple,
    SearchFields,
    SearchPreference,
    ServerSettings,
    ShareLink,
    ShoppingList,
    ShoppingListEntry,
    ShoppingListEntryBulk,
    ShoppingListEntryBulkCreate,
    ShoppingListEntrySimpleCreate,
    ShoppingListRecipe,
    SourceImportDuplicate,
    SourceImportFood,
    SourceImportIngredient,
    SourceImportKeyword,
    SourceImportProperty,
    SourceImportPropertyType,
    SourceImportRecipe,
    SourceImportStep,
    SourceImportUnit,
    Space,
    Step,
    Storage,
    Supermarket,
    SupermarketCategory,
    SupermarketCategoryRelation,
    Sync,
    SyncLog,
    Unit,
    UnitConversion,
    User,
    UserFile,
    UserFileView,
    UserPreference,
    UserSpace,
    UserSpaceBatchUpdate,
    ViewLog
} from '@/openapi'

// Forward declarations to handle circular references
// Each factory uses lazy calls to nested factories

export function makeAccessToken(overrides: Partial<AccessToken> = {}): AccessToken {
    return {
        id: 1,
        token: '',
        expires: new Date('2026-01-01T00:00:00Z'),
        scope: '',
        created: new Date('2026-01-01T00:00:00Z'),
        updated: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as AccessToken
}

export function makeMinimalAccessToken(overrides: Partial<AccessToken> = {}): AccessToken {
    return {
        id: 1,
        token: '',
        expires: new Date('2026-01-01T00:00:00Z'),
        created: new Date('2026-01-01T00:00:00Z'),
        updated: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as AccessToken
}

export function makeEdgeCaseAccessToken(overrides: Partial<AccessToken> = {}): AccessToken {
    return {
        id: 0,
        token: '',
        expires: new Date(0),
        scope: '',
        created: new Date(0),
        updated: new Date(0),
        ...overrides,
    } as AccessToken
}

export function makeAiImport(overrides: Partial<AiImport> = {}): AiImport {
    return {
        aiProviderId: 1,
        file: '',
        text: '',
        recipeId: '',
        ...overrides,
    } as AiImport
}

export function makeMinimalAiImport(overrides: Partial<AiImport> = {}): AiImport {
    return {
        aiProviderId: 1,
        file: '',
        text: '',
        recipeId: '',
        ...overrides,
    } as AiImport
}

export function makeEdgeCaseAiImport(overrides: Partial<AiImport> = {}): AiImport {
    return {
        aiProviderId: 0,
        file: null,
        text: null,
        recipeId: null,
        ...overrides,
    } as AiImport
}

export function makeAiLog(overrides: Partial<AiLog> = {}): AiLog {
    return {
        id: 1,
        aiProvider: undefined as any,
        function: '',
        creditCost: 0,
        creditsFromBalance: false,
        inputTokens: 0,
        outputTokens: 0,
        startTime: new Date('2026-01-01T00:00:00Z'),
        endTime: new Date('2026-01-01T00:00:00Z'),
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as AiLog
}

export function makeMinimalAiLog(overrides: Partial<AiLog> = {}): AiLog {
    return {
        id: 1,
        aiProvider: undefined as any,
        function: '',
        creditCost: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as AiLog
}

export function makeEdgeCaseAiLog(overrides: Partial<AiLog> = {}): AiLog {
    return {
        id: 0,
        aiProvider: undefined as any,
        function: '',
        creditCost: 0,
        creditsFromBalance: false,
        inputTokens: 0,
        outputTokens: 0,
        startTime: null,
        endTime: null,
        createdBy: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        ...overrides,
    } as AiLog
}

export function makeAiProvider(overrides: Partial<AiProvider> = {}): AiProvider {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        apiKey: '',
        modelName: 'Test model_name',
        url: 'https://example.com',
        logCreditCost: false,
        space: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as AiProvider
}

export function makeMinimalAiProvider(overrides: Partial<AiProvider> = {}): AiProvider {
    return {
        id: 1,
        name: 'Test name',
        modelName: 'Test model_name',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as AiProvider
}

export function makeEdgeCaseAiProvider(overrides: Partial<AiProvider> = {}): AiProvider {
    return {
        id: 0,
        name: '',
        description: '',
        apiKey: '',
        modelName: '',
        url: null,
        logCreditCost: false,
        space: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        ...overrides,
    } as AiProvider
}

export function makeAuthToken(overrides: Partial<AuthToken> = {}): AuthToken {
    return {
        username: 'Test username',
        password: '',
        token: '',
        ...overrides,
    } as AuthToken
}

export function makeMinimalAuthToken(overrides: Partial<AuthToken> = {}): AuthToken {
    return {
        username: 'Test username',
        password: '',
        token: '',
        ...overrides,
    } as AuthToken
}

export function makeEdgeCaseAuthToken(overrides: Partial<AuthToken> = {}): AuthToken {
    return {
        username: '',
        password: '',
        token: '',
        ...overrides,
    } as AuthToken
}

export function makeAutoMealPlan(overrides: Partial<AutoMealPlan> = {}): AutoMealPlan {
    return {
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-01-01T00:00:00Z'),
        mealTypeId: 1,
        keywords: [],
        keywordMode: undefined as any,
        servings: 0,
        shared: [],
        addshopping: false,
        ...overrides,
    } as AutoMealPlan
}

export function makeMinimalAutoMealPlan(overrides: Partial<AutoMealPlan> = {}): AutoMealPlan {
    return {
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-01-01T00:00:00Z'),
        mealTypeId: 1,
        servings: 0,
        addshopping: false,
        ...overrides,
    } as AutoMealPlan
}

export function makeEdgeCaseAutoMealPlan(overrides: Partial<AutoMealPlan> = {}): AutoMealPlan {
    return {
        startDate: new Date(0),
        endDate: new Date(0),
        mealTypeId: 0,
        keywords: [],
        keywordMode: undefined as any,
        servings: 0,
        shared: null,
        addshopping: false,
        ...overrides,
    } as AutoMealPlan
}

export function makeAutomation(overrides: Partial<Automation> = {}): Automation {
    return {
        id: 1,
        type: 'FOOD_ALIAS' as any,
        name: 'Test name',
        description: '',
        param1: '',
        param2: '',
        param3: '',
        order: 0,
        disabled: false,
        createdBy: 0,
        ...overrides,
    } as Automation
}

export function makeMinimalAutomation(overrides: Partial<Automation> = {}): Automation {
    return {
        id: 1,
        type: 'FOOD_ALIAS' as any,
        createdBy: 0,
        ...overrides,
    } as Automation
}

export function makeEdgeCaseAutomation(overrides: Partial<Automation> = {}): Automation {
    return {
        id: 0,
        type: 'NAME_REPLACE' as any,
        name: '',
        description: null,
        param1: null,
        param2: null,
        param3: null,
        order: 0,
        disabled: false,
        createdBy: 0,
        ...overrides,
    } as Automation
}

export function makeBookmarkletImport(overrides: Partial<BookmarkletImport> = {}): BookmarkletImport {
    return {
        id: 1,
        url: 'https://example.com',
        html: '',
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as BookmarkletImport
}

export function makeMinimalBookmarkletImport(overrides: Partial<BookmarkletImport> = {}): BookmarkletImport {
    return {
        id: 1,
        html: '',
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as BookmarkletImport
}

export function makeEdgeCaseBookmarkletImport(overrides: Partial<BookmarkletImport> = {}): BookmarkletImport {
    return {
        id: 0,
        url: null,
        html: '',
        createdBy: 0,
        createdAt: new Date(0),
        ...overrides,
    } as BookmarkletImport
}

export function makeBookmarkletImportList(overrides: Partial<BookmarkletImportList> = {}): BookmarkletImportList {
    return {
        id: 1,
        url: 'https://example.com',
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as BookmarkletImportList
}

export function makeMinimalBookmarkletImportList(overrides: Partial<BookmarkletImportList> = {}): BookmarkletImportList {
    return {
        id: 1,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as BookmarkletImportList
}

export function makeEdgeCaseBookmarkletImportList(overrides: Partial<BookmarkletImportList> = {}): BookmarkletImportList {
    return {
        id: 0,
        url: null,
        createdBy: 0,
        createdAt: new Date(0),
        ...overrides,
    } as BookmarkletImportList
}

export function makeConnectorConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
    return {
        id: 1,
        name: 'Test name',
        type: 'HomeAssistant' as any,
        url: 'https://example.com',
        token: '',
        todoEntity: '',
        enabled: false,
        onShoppingListEntryCreatedEnabled: false,
        onShoppingListEntryUpdatedEnabled: new Date('2026-01-01T00:00:00Z'),
        onShoppingListEntryDeletedEnabled: false,
        supportsDescriptionField: false,
        createdBy: 0,
        ...overrides,
    } as ConnectorConfig
}

export function makeMinimalConnectorConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
    return {
        id: 1,
        name: 'Test name',
        createdBy: 0,
        ...overrides,
    } as ConnectorConfig
}

export function makeEdgeCaseConnectorConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
    return {
        id: 0,
        name: '',
        type: 'HomeAssistant' as any,
        url: null,
        token: null,
        todoEntity: null,
        enabled: false,
        onShoppingListEntryCreatedEnabled: false,
        onShoppingListEntryUpdatedEnabled: new Date(0),
        onShoppingListEntryDeletedEnabled: false,
        supportsDescriptionField: false,
        createdBy: 0,
        ...overrides,
    } as ConnectorConfig
}

export function makeCookLog(overrides: Partial<CookLog> = {}): CookLog {
    return {
        id: 1,
        recipe: 0,
        servings: 0,
        rating: 0,
        comment: '',
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as CookLog
}

export function makeMinimalCookLog(overrides: Partial<CookLog> = {}): CookLog {
    return {
        id: 1,
        recipe: 0,
        createdBy: undefined as any,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as CookLog
}

export function makeEdgeCaseCookLog(overrides: Partial<CookLog> = {}): CookLog {
    return {
        id: 0,
        recipe: 0,
        servings: null,
        rating: null,
        comment: null,
        createdBy: undefined as any,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        ...overrides,
    } as CookLog
}

export function makeCustomFilter(overrides: Partial<CustomFilter> = {}): CustomFilter {
    return {
        id: 1,
        name: 'Test name',
        type: 'RECIPE' as any,
        search: undefined as any,
        shared: [],
        createdBy: undefined as any,
        ...overrides,
    } as CustomFilter
}

export function makeMinimalCustomFilter(overrides: Partial<CustomFilter> = {}): CustomFilter {
    return {
        id: 1,
        name: 'Test name',
        createdBy: undefined as any,
        ...overrides,
    } as CustomFilter
}

export function makeEdgeCaseCustomFilter(overrides: Partial<CustomFilter> = {}): CustomFilter {
    return {
        id: 0,
        name: '',
        type: 'KEYWORD' as any,
        search: undefined as any,
        shared: [],
        createdBy: undefined as any,
        ...overrides,
    } as CustomFilter
}

export function makeExportLog(overrides: Partial<ExportLog> = {}): ExportLog {
    return {
        id: 1,
        type: '',
        msg: '',
        running: false,
        totalRecipes: 0,
        exportedRecipes: 0,
        cacheDuration: 0,
        possiblyNotExpired: false,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ExportLog
}

export function makeMinimalExportLog(overrides: Partial<ExportLog> = {}): ExportLog {
    return {
        id: 1,
        type: '',
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ExportLog
}

export function makeEdgeCaseExportLog(overrides: Partial<ExportLog> = {}): ExportLog {
    return {
        id: 0,
        type: '',
        msg: '',
        running: false,
        totalRecipes: 0,
        exportedRecipes: 0,
        cacheDuration: 0,
        possiblyNotExpired: false,
        createdBy: 0,
        createdAt: new Date(0),
        ...overrides,
    } as ExportLog
}

export function makeExportRequest(overrides: Partial<ExportRequest> = {}): ExportRequest {
    return {
        type: '',
        all: false,
        recipes: [],
        customFilter: undefined as any,
        ...overrides,
    } as ExportRequest
}

export function makeMinimalExportRequest(overrides: Partial<ExportRequest> = {}): ExportRequest {
    return {
        type: '',
        ...overrides,
    } as ExportRequest
}

export function makeEdgeCaseExportRequest(overrides: Partial<ExportRequest> = {}): ExportRequest {
    return {
        type: '',
        all: false,
        recipes: [],
        customFilter: null,
        ...overrides,
    } as ExportRequest
}

export function makeFdcQuery(overrides: Partial<FdcQuery> = {}): FdcQuery {
    return {
        totalHits: 0,
        currentPage: 0,
        totalPages: 0,
        foods: [],
        ...overrides,
    } as FdcQuery
}

export function makeMinimalFdcQuery(overrides: Partial<FdcQuery> = {}): FdcQuery {
    return {
        totalHits: 0,
        currentPage: 0,
        totalPages: 0,
        foods: [],
        ...overrides,
    } as FdcQuery
}

export function makeEdgeCaseFdcQuery(overrides: Partial<FdcQuery> = {}): FdcQuery {
    return {
        totalHits: 0,
        currentPage: 0,
        totalPages: 0,
        foods: [],
        ...overrides,
    } as FdcQuery
}

export function makeFdcQueryFoods(overrides: Partial<FdcQueryFoods> = {}): FdcQueryFoods {
    return {
        fdcId: 1,
        description: '',
        dataType: '',
        ...overrides,
    } as FdcQueryFoods
}

export function makeMinimalFdcQueryFoods(overrides: Partial<FdcQueryFoods> = {}): FdcQueryFoods {
    return {
        fdcId: 1,
        description: '',
        dataType: '',
        ...overrides,
    } as FdcQueryFoods
}

export function makeEdgeCaseFdcQueryFoods(overrides: Partial<FdcQueryFoods> = {}): FdcQueryFoods {
    return {
        fdcId: 0,
        description: '',
        dataType: '',
        ...overrides,
    } as FdcQueryFoods
}

export function makeFood(overrides: Partial<Food> = {}): Food {
    return {
        id: 1,
        name: 'Test name',
        pluralName: 'Test plural_name',
        description: '',
        shopping: '',
        recipe: undefined as any,
        url: 'https://example.com',
        properties: [],
        propertiesFoodAmount: 1,
        propertiesFoodUnit: undefined as any,
        fdcId: 1,
        foodOnhand: false,
        supermarketCategory: undefined as any,
        parent: 0,
        numchild: 0,
        numrecipe: 0,
        inheritFields: [],
        fullName: 'Test full_name',
        ignoreShopping: false,
        substitute: [],
        substituteSiblings: false,
        substituteChildren: false,
        substituteOnhand: false,
        childInheritFields: [],
        openDataSlug: '',
        shoppingLists: [],
        inInventory: '',
        substituteInventory: false,
        ...overrides,
    } as Food
}

export function makeMinimalFood(overrides: Partial<Food> = {}): Food {
    return {
        id: 1,
        name: 'Test name',
        shopping: '',
        parent: 0,
        numchild: 0,
        numrecipe: 0,
        fullName: 'Test full_name',
        substituteOnhand: false,
        inInventory: '',
        substituteInventory: false,
        ...overrides,
    } as Food
}

export function makeEdgeCaseFood(overrides: Partial<Food> = {}): Food {
    return {
        id: 0,
        name: '',
        pluralName: null,
        description: '',
        shopping: '',
        recipe: null,
        url: null,
        properties: null,
        propertiesFoodAmount: 0,
        propertiesFoodUnit: null,
        fdcId: null,
        foodOnhand: null,
        supermarketCategory: null,
        parent: 0,
        numchild: 0,
        numrecipe: 0,
        inheritFields: null,
        fullName: '',
        ignoreShopping: false,
        substitute: null,
        substituteSiblings: false,
        substituteChildren: false,
        substituteOnhand: false,
        childInheritFields: null,
        openDataSlug: null,
        shoppingLists: [],
        inInventory: '',
        substituteInventory: false,
        ...overrides,
    } as Food
}

export function makeFoodBatchUpdate(overrides: Partial<FoodBatchUpdate> = {}): FoodBatchUpdate {
    return {
        foods: [],
        category: 0,
        substituteAdd: [],
        substituteRemove: [],
        substituteSet: [],
        substituteRemoveAll: false,
        inheritFieldsAdd: [],
        inheritFieldsRemove: [],
        inheritFieldsSet: [],
        inheritFieldsRemoveAll: false,
        childInheritFieldsAdd: [],
        childInheritFieldsRemove: [],
        childInheritFieldsSet: [],
        childInheritFieldsRemoveAll: false,
        shoppingListsAdd: [],
        shoppingListsRemove: [],
        shoppingListsSet: [],
        shoppingListsRemoveAll: false,
        substituteChildren: false,
        substituteSiblings: false,
        ignoreShopping: false,
        onHand: false,
        parentRemove: false,
        parentSet: 0,
        ...overrides,
    } as FoodBatchUpdate
}

export function makeMinimalFoodBatchUpdate(overrides: Partial<FoodBatchUpdate> = {}): FoodBatchUpdate {
    return {
        foods: [],
        substituteAdd: [],
        substituteRemove: [],
        substituteSet: [],
        inheritFieldsAdd: [],
        inheritFieldsRemove: [],
        inheritFieldsSet: [],
        childInheritFieldsAdd: [],
        childInheritFieldsRemove: [],
        childInheritFieldsSet: [],
        ...overrides,
    } as FoodBatchUpdate
}

export function makeEdgeCaseFoodBatchUpdate(overrides: Partial<FoodBatchUpdate> = {}): FoodBatchUpdate {
    return {
        foods: [],
        category: null,
        substituteAdd: [],
        substituteRemove: [],
        substituteSet: [],
        substituteRemoveAll: false,
        inheritFieldsAdd: [],
        inheritFieldsRemove: [],
        inheritFieldsSet: [],
        inheritFieldsRemoveAll: false,
        childInheritFieldsAdd: [],
        childInheritFieldsRemove: [],
        childInheritFieldsSet: [],
        childInheritFieldsRemoveAll: false,
        shoppingListsAdd: [],
        shoppingListsRemove: [],
        shoppingListsSet: [],
        shoppingListsRemoveAll: false,
        substituteChildren: null,
        substituteSiblings: null,
        ignoreShopping: null,
        onHand: null,
        parentRemove: null,
        parentSet: null,
        ...overrides,
    } as FoodBatchUpdate
}

export function makeFoodInheritField(overrides: Partial<FoodInheritField> = {}): FoodInheritField {
    return {
        id: 1,
        name: 'Test name',
        field: '',
        ...overrides,
    } as FoodInheritField
}

export function makeMinimalFoodInheritField(overrides: Partial<FoodInheritField> = {}): FoodInheritField {
    return {
        id: 1,
        ...overrides,
    } as FoodInheritField
}

export function makeEdgeCaseFoodInheritField(overrides: Partial<FoodInheritField> = {}): FoodInheritField {
    return {
        id: 0,
        name: null,
        field: null,
        ...overrides,
    } as FoodInheritField
}

export function makeFoodShopping(overrides: Partial<FoodShopping> = {}): FoodShopping {
    return {
        id: 1,
        name: 'Test name',
        pluralName: 'Test plural_name',
        supermarketCategory: undefined as any,
        shoppingLists: [],
        ...overrides,
    } as FoodShopping
}

export function makeMinimalFoodShopping(overrides: Partial<FoodShopping> = {}): FoodShopping {
    return {
        id: 1,
        name: 'Test name',
        supermarketCategory: undefined as any,
        shoppingLists: [],
        ...overrides,
    } as FoodShopping
}

export function makeEdgeCaseFoodShopping(overrides: Partial<FoodShopping> = {}): FoodShopping {
    return {
        id: 0,
        name: '',
        pluralName: null,
        supermarketCategory: undefined as any,
        shoppingLists: [],
        ...overrides,
    } as FoodShopping
}

export function makeFoodSimple(overrides: Partial<FoodSimple> = {}): FoodSimple {
    return {
        id: 1,
        name: 'Test name',
        pluralName: 'Test plural_name',
        ...overrides,
    } as FoodSimple
}

export function makeMinimalFoodSimple(overrides: Partial<FoodSimple> = {}): FoodSimple {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as FoodSimple
}

export function makeEdgeCaseFoodSimple(overrides: Partial<FoodSimple> = {}): FoodSimple {
    return {
        id: 0,
        name: '',
        pluralName: null,
        ...overrides,
    } as FoodSimple
}

export function makeFoodStats(overrides: Partial<FoodStats> = {}): FoodStats {
    return {
        onhand: 0,
        shopping: 0,
        ignored: 0,
        inventory: 0,
        expired: 0,
        total: 0,
        ...overrides,
    } as FoodStats
}

export function makeMinimalFoodStats(overrides: Partial<FoodStats> = {}): FoodStats {
    return {
        onhand: 0,
        shopping: 0,
        ignored: 0,
        inventory: 0,
        expired: 0,
        total: 0,
        ...overrides,
    } as FoodStats
}

export function makeEdgeCaseFoodStats(overrides: Partial<FoodStats> = {}): FoodStats {
    return {
        onhand: 0,
        shopping: 0,
        ignored: 0,
        inventory: 0,
        expired: 0,
        total: 0,
        ...overrides,
    } as FoodStats
}

export function makeGenericModelReference(overrides: Partial<GenericModelReference> = {}): GenericModelReference {
    return {
        id: 1,
        model: '',
        name: 'Test name',
        ...overrides,
    } as GenericModelReference
}

export function makeMinimalGenericModelReference(overrides: Partial<GenericModelReference> = {}): GenericModelReference {
    return {
        id: 1,
        model: '',
        name: 'Test name',
        ...overrides,
    } as GenericModelReference
}

export function makeEdgeCaseGenericModelReference(overrides: Partial<GenericModelReference> = {}): GenericModelReference {
    return {
        id: 0,
        model: '',
        name: '',
        ...overrides,
    } as GenericModelReference
}

export function makeGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as Group
}

export function makeMinimalGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as Group
}

export function makeEdgeCaseGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: 0,
        name: '',
        ...overrides,
    } as Group
}

export function makeHousehold(overrides: Partial<Household> = {}): Household {
    return {
        id: 1,
        name: 'Test name',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as Household
}

export function makeMinimalHousehold(overrides: Partial<Household> = {}): Household {
    return {
        id: 1,
        name: 'Test name',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as Household
}

export function makeEdgeCaseHousehold(overrides: Partial<Household> = {}): Household {
    return {
        id: 0,
        name: '',
        createdAt: new Date(0),
        updatedAt: new Date(0),
        ...overrides,
    } as Household
}

export function makeImportLog(overrides: Partial<ImportLog> = {}): ImportLog {
    return {
        id: 1,
        type: '',
        msg: '',
        running: false,
        keyword: undefined as any,
        totalRecipes: 0,
        importedRecipes: 0,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ImportLog
}

export function makeMinimalImportLog(overrides: Partial<ImportLog> = {}): ImportLog {
    return {
        id: 1,
        type: '',
        keyword: undefined as any,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ImportLog
}

export function makeEdgeCaseImportLog(overrides: Partial<ImportLog> = {}): ImportLog {
    return {
        id: 0,
        type: '',
        msg: '',
        running: false,
        keyword: undefined as any,
        totalRecipes: 0,
        importedRecipes: 0,
        createdBy: 0,
        createdAt: new Date(0),
        ...overrides,
    } as ImportLog
}

export function makeImportOpenData(overrides: Partial<ImportOpenData> = {}): ImportOpenData {
    return {
        selectedVersion: '',
        selectedDatatypes: [],
        updateExisting: new Date('2026-01-01T00:00:00Z'),
        useMetric: false,
        ...overrides,
    } as ImportOpenData
}

export function makeMinimalImportOpenData(overrides: Partial<ImportOpenData> = {}): ImportOpenData {
    return {
        selectedVersion: '',
        selectedDatatypes: [],
        ...overrides,
    } as ImportOpenData
}

export function makeEdgeCaseImportOpenData(overrides: Partial<ImportOpenData> = {}): ImportOpenData {
    return {
        selectedVersion: '',
        selectedDatatypes: [],
        updateExisting: new Date(0),
        useMetric: false,
        ...overrides,
    } as ImportOpenData
}

export function makeImportOpenDataMetaData(overrides: Partial<ImportOpenDataMetaData> = {}): ImportOpenDataMetaData {
    return {
        versions: [],
        datatypes: [],
        base: makeImportOpenDataVersionMetaData(),
        cs: makeImportOpenDataVersionMetaData(),
        da: makeImportOpenDataVersionMetaData(),
        de: makeImportOpenDataVersionMetaData(),
        el: makeImportOpenDataVersionMetaData(),
        en: makeImportOpenDataVersionMetaData(),
        es: makeImportOpenDataVersionMetaData(),
        fr: makeImportOpenDataVersionMetaData(),
        hu: makeImportOpenDataVersionMetaData(),
        it: makeImportOpenDataVersionMetaData(),
        nbNo: makeImportOpenDataVersionMetaData(),
        nl: makeImportOpenDataVersionMetaData(),
        pl: makeImportOpenDataVersionMetaData(),
        pt: makeImportOpenDataVersionMetaData(),
        ptBr: makeImportOpenDataVersionMetaData(),
        sk: makeImportOpenDataVersionMetaData(),
        sl: makeImportOpenDataVersionMetaData(),
        zhHans: makeImportOpenDataVersionMetaData(),
        ...overrides,
    } as ImportOpenDataMetaData
}

export function makeMinimalImportOpenDataMetaData(overrides: Partial<ImportOpenDataMetaData> = {}): ImportOpenDataMetaData {
    return {
        versions: [],
        datatypes: [],
        base: undefined as any,
        cs: undefined as any,
        da: undefined as any,
        de: undefined as any,
        el: undefined as any,
        en: undefined as any,
        es: undefined as any,
        fr: undefined as any,
        hu: undefined as any,
        it: undefined as any,
        nbNo: undefined as any,
        nl: undefined as any,
        pl: undefined as any,
        pt: undefined as any,
        ptBr: undefined as any,
        sk: undefined as any,
        sl: undefined as any,
        zhHans: undefined as any,
        ...overrides,
    } as ImportOpenDataMetaData
}

export function makeEdgeCaseImportOpenDataMetaData(overrides: Partial<ImportOpenDataMetaData> = {}): ImportOpenDataMetaData {
    return {
        versions: [],
        datatypes: [],
        base: makeMinimalImportOpenDataVersionMetaData(),
        cs: makeMinimalImportOpenDataVersionMetaData(),
        da: makeMinimalImportOpenDataVersionMetaData(),
        de: makeMinimalImportOpenDataVersionMetaData(),
        el: makeMinimalImportOpenDataVersionMetaData(),
        en: makeMinimalImportOpenDataVersionMetaData(),
        es: makeMinimalImportOpenDataVersionMetaData(),
        fr: makeMinimalImportOpenDataVersionMetaData(),
        hu: makeMinimalImportOpenDataVersionMetaData(),
        it: makeMinimalImportOpenDataVersionMetaData(),
        nbNo: makeMinimalImportOpenDataVersionMetaData(),
        nl: makeMinimalImportOpenDataVersionMetaData(),
        pl: makeMinimalImportOpenDataVersionMetaData(),
        pt: makeMinimalImportOpenDataVersionMetaData(),
        ptBr: makeMinimalImportOpenDataVersionMetaData(),
        sk: makeMinimalImportOpenDataVersionMetaData(),
        sl: makeMinimalImportOpenDataVersionMetaData(),
        zhHans: makeMinimalImportOpenDataVersionMetaData(),
        ...overrides,
    } as ImportOpenDataMetaData
}

export function makeImportOpenDataResponse(overrides: Partial<ImportOpenDataResponse> = {}): ImportOpenDataResponse {
    return {
        food: makeImportOpenDataResponseDetail(),
        unit: makeImportOpenDataResponseDetail(),
        category: makeImportOpenDataResponseDetail(),
        property: makeImportOpenDataResponseDetail(),
        store: makeImportOpenDataResponseDetail(),
        conversion: makeImportOpenDataResponseDetail(),
        ...overrides,
    } as ImportOpenDataResponse
}

export function makeMinimalImportOpenDataResponse(overrides: Partial<ImportOpenDataResponse> = {}): ImportOpenDataResponse {
    return {
        ...overrides,
    } as ImportOpenDataResponse
}

export function makeEdgeCaseImportOpenDataResponse(overrides: Partial<ImportOpenDataResponse> = {}): ImportOpenDataResponse {
    return {
        food: makeMinimalImportOpenDataResponseDetail(),
        unit: makeMinimalImportOpenDataResponseDetail(),
        category: makeMinimalImportOpenDataResponseDetail(),
        property: makeMinimalImportOpenDataResponseDetail(),
        store: makeMinimalImportOpenDataResponseDetail(),
        conversion: makeMinimalImportOpenDataResponseDetail(),
        ...overrides,
    } as ImportOpenDataResponse
}

export function makeImportOpenDataResponseDetail(overrides: Partial<ImportOpenDataResponseDetail> = {}): ImportOpenDataResponseDetail {
    return {
        totalCreated: 0,
        totalUpdated: new Date('2026-01-01T00:00:00Z'),
        totalUntouched: 0,
        totalErrored: 0,
        ...overrides,
    } as ImportOpenDataResponseDetail
}

export function makeMinimalImportOpenDataResponseDetail(overrides: Partial<ImportOpenDataResponseDetail> = {}): ImportOpenDataResponseDetail {
    return {
        ...overrides,
    } as ImportOpenDataResponseDetail
}

export function makeEdgeCaseImportOpenDataResponseDetail(overrides: Partial<ImportOpenDataResponseDetail> = {}): ImportOpenDataResponseDetail {
    return {
        totalCreated: 0,
        totalUpdated: new Date(0),
        totalUntouched: 0,
        totalErrored: 0,
        ...overrides,
    } as ImportOpenDataResponseDetail
}

export function makeImportOpenDataVersionMetaData(overrides: Partial<ImportOpenDataVersionMetaData> = {}): ImportOpenDataVersionMetaData {
    return {
        food: 0,
        unit: 0,
        category: 0,
        property: 0,
        store: 0,
        conversion: 0,
        ...overrides,
    } as ImportOpenDataVersionMetaData
}

export function makeMinimalImportOpenDataVersionMetaData(overrides: Partial<ImportOpenDataVersionMetaData> = {}): ImportOpenDataVersionMetaData {
    return {
        food: 0,
        unit: 0,
        category: 0,
        property: 0,
        store: 0,
        conversion: 0,
        ...overrides,
    } as ImportOpenDataVersionMetaData
}

export function makeEdgeCaseImportOpenDataVersionMetaData(overrides: Partial<ImportOpenDataVersionMetaData> = {}): ImportOpenDataVersionMetaData {
    return {
        food: 0,
        unit: 0,
        category: 0,
        property: 0,
        store: 0,
        conversion: 0,
        ...overrides,
    } as ImportOpenDataVersionMetaData
}

export function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
    return {
        id: 1,
        food: undefined as any,
        unit: undefined as any,
        amount: 1,
        conversions: [],
        note: '',
        order: 0,
        isHeader: false,
        noAmount: false,
        originalText: '',
        usedInRecipes: [],
        checked: false,
        ...overrides,
    } as Ingredient
}

export function makeMinimalIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
    return {
        id: 1,
        food: undefined as any,
        unit: undefined as any,
        amount: 1,
        conversions: [],
        usedInRecipes: [],
        checked: false,
        ...overrides,
    } as Ingredient
}

export function makeEdgeCaseIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
    return {
        id: 0,
        food: null,
        unit: null,
        amount: 0,
        conversions: [],
        note: null,
        order: 0,
        isHeader: false,
        noAmount: false,
        originalText: null,
        usedInRecipes: [],
        checked: false,
        ...overrides,
    } as Ingredient
}

export function makeIngredientParserRequest(overrides: Partial<IngredientParserRequest> = {}): IngredientParserRequest {
    return {
        ingredient: '',
        ingredients: [],
        ...overrides,
    } as IngredientParserRequest
}

export function makeMinimalIngredientParserRequest(overrides: Partial<IngredientParserRequest> = {}): IngredientParserRequest {
    return {
        ...overrides,
    } as IngredientParserRequest
}

export function makeEdgeCaseIngredientParserRequest(overrides: Partial<IngredientParserRequest> = {}): IngredientParserRequest {
    return {
        ingredient: '',
        ingredients: [],
        ...overrides,
    } as IngredientParserRequest
}

export function makeIngredientParserResponse(overrides: Partial<IngredientParserResponse> = {}): IngredientParserResponse {
    return {
        ingredient: undefined as any,
        ingredients: [],
        ...overrides,
    } as IngredientParserResponse
}

export function makeMinimalIngredientParserResponse(overrides: Partial<IngredientParserResponse> = {}): IngredientParserResponse {
    return {
        ingredient: undefined as any,
        ingredients: [],
        ...overrides,
    } as IngredientParserResponse
}

export function makeEdgeCaseIngredientParserResponse(overrides: Partial<IngredientParserResponse> = {}): IngredientParserResponse {
    return {
        ingredient: null,
        ingredients: [],
        ...overrides,
    } as IngredientParserResponse
}

export function makeIngredientSimple(overrides: Partial<IngredientSimple> = {}): IngredientSimple {
    return {
        id: 1,
        food: undefined as any,
        unit: undefined as any,
        amount: 1,
        note: '',
        order: 0,
        isHeader: false,
        noAmount: false,
        originalText: '',
        checked: false,
        ...overrides,
    } as IngredientSimple
}

export function makeMinimalIngredientSimple(overrides: Partial<IngredientSimple> = {}): IngredientSimple {
    return {
        id: 1,
        food: undefined as any,
        unit: undefined as any,
        amount: 1,
        checked: false,
        ...overrides,
    } as IngredientSimple
}

export function makeEdgeCaseIngredientSimple(overrides: Partial<IngredientSimple> = {}): IngredientSimple {
    return {
        id: 0,
        food: null,
        unit: null,
        amount: 0,
        note: null,
        order: 0,
        isHeader: false,
        noAmount: false,
        originalText: null,
        checked: false,
        ...overrides,
    } as IngredientSimple
}

export function makeInventoryEntry(overrides: Partial<InventoryEntry> = {}): InventoryEntry {
    return {
        id: 1,
        inventoryLocation: makeInventoryLocation(),
        subLocation: '',
        code: '',
        food: makeFood(),
        unit: undefined as any,
        amount: 1,
        expires: new Date('2026-01-01T00:00:00Z'),
        note: '',
        label: '',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        createdBy: 0,
        ...overrides,
    } as InventoryEntry
}

export function makeMinimalInventoryEntry(overrides: Partial<InventoryEntry> = {}): InventoryEntry {
    return {
        id: 1,
        inventoryLocation: undefined as any,
        food: undefined as any,
        unit: undefined as any,
        label: '',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        createdBy: 0,
        ...overrides,
    } as InventoryEntry
}

export function makeEdgeCaseInventoryEntry(overrides: Partial<InventoryEntry> = {}): InventoryEntry {
    return {
        id: 0,
        inventoryLocation: makeMinimalInventoryLocation(),
        subLocation: null,
        code: null,
        food: makeMinimalFood(),
        unit: null,
        amount: 0,
        expires: null,
        note: null,
        label: '',
        createdAt: new Date(0),
        createdBy: 0,
        ...overrides,
    } as InventoryEntry
}

export function makeInventoryLocation(overrides: Partial<InventoryLocation> = {}): InventoryLocation {
    return {
        id: 1,
        name: 'Test name',
        isFreezer: false,
        household: makeHousehold(),
        ...overrides,
    } as InventoryLocation
}

export function makeMinimalInventoryLocation(overrides: Partial<InventoryLocation> = {}): InventoryLocation {
    return {
        id: 1,
        name: 'Test name',
        household: undefined as any,
        ...overrides,
    } as InventoryLocation
}

export function makeEdgeCaseInventoryLocation(overrides: Partial<InventoryLocation> = {}): InventoryLocation {
    return {
        id: 0,
        name: '',
        isFreezer: false,
        household: makeMinimalHousehold(),
        ...overrides,
    } as InventoryLocation
}

export function makeInventoryLog(overrides: Partial<InventoryLog> = {}): InventoryLog {
    return {
        id: 1,
        entry: makeInventoryEntry(),
        bookingType: 'add' as any,
        oldAmount: 1,
        newAmount: 1,
        oldInventoryLocation: makeInventoryLocation(),
        newInventoryLocation: makeInventoryLocation(),
        note: '',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as InventoryLog
}

export function makeMinimalInventoryLog(overrides: Partial<InventoryLog> = {}): InventoryLog {
    return {
        id: 1,
        entry: undefined as any,
        oldInventoryLocation: undefined as any,
        newInventoryLocation: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as InventoryLog
}

export function makeEdgeCaseInventoryLog(overrides: Partial<InventoryLog> = {}): InventoryLog {
    return {
        id: 0,
        entry: makeMinimalInventoryEntry(),
        bookingType: 'move' as any,
        oldAmount: 0,
        newAmount: 0,
        oldInventoryLocation: makeMinimalInventoryLocation(),
        newInventoryLocation: makeMinimalInventoryLocation(),
        note: null,
        createdAt: new Date(0),
        ...overrides,
    } as InventoryLog
}

export function makeInviteLink(overrides: Partial<InviteLink> = {}): InviteLink {
    return {
        id: 1,
        uuid: '',
        email: 'test@example.com',
        group: makeGroup(),
        household: undefined as any,
        validUntil: new Date('2026-01-01T00:00:00Z'),
        usedBy: 0,
        reusable: false,
        internalNote: '',
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        emailSent: false,
        ...overrides,
    } as InviteLink
}

export function makeMinimalInviteLink(overrides: Partial<InviteLink> = {}): InviteLink {
    return {
        id: 1,
        uuid: '',
        group: undefined as any,
        usedBy: 0,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        emailSent: false,
        ...overrides,
    } as InviteLink
}

export function makeEdgeCaseInviteLink(overrides: Partial<InviteLink> = {}): InviteLink {
    return {
        id: 0,
        uuid: '',
        email: '',
        group: makeMinimalGroup(),
        household: null,
        validUntil: new Date(0),
        usedBy: null,
        reusable: false,
        internalNote: null,
        createdBy: 0,
        createdAt: new Date(0),
        emailSent: false,
        ...overrides,
    } as InviteLink
}

export function makeKeyword(overrides: Partial<Keyword> = {}): Keyword {
    return {
        id: 1,
        name: 'Test name',
        label: '',
        description: '',
        parent: 0,
        numchild: 0,
        numrecipe: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        fullName: 'Test full_name',
        ...overrides,
    } as Keyword
}

export function makeMinimalKeyword(overrides: Partial<Keyword> = {}): Keyword {
    return {
        id: 1,
        name: 'Test name',
        label: '',
        parent: 0,
        numchild: 0,
        numrecipe: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        fullName: 'Test full_name',
        ...overrides,
    } as Keyword
}

export function makeEdgeCaseKeyword(overrides: Partial<Keyword> = {}): Keyword {
    return {
        id: 0,
        name: '',
        label: '',
        description: '',
        parent: 0,
        numchild: 0,
        numrecipe: 0,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        fullName: '',
        ...overrides,
    } as Keyword
}

export function makeKeywordLabel(overrides: Partial<KeywordLabel> = {}): KeywordLabel {
    return {
        id: 1,
        label: '',
        ...overrides,
    } as KeywordLabel
}

export function makeMinimalKeywordLabel(overrides: Partial<KeywordLabel> = {}): KeywordLabel {
    return {
        id: 1,
        label: '',
        ...overrides,
    } as KeywordLabel
}

export function makeEdgeCaseKeywordLabel(overrides: Partial<KeywordLabel> = {}): KeywordLabel {
    return {
        id: 0,
        label: '',
        ...overrides,
    } as KeywordLabel
}

export function makeLocalization(overrides: Partial<Localization> = {}): Localization {
    return {
        code: '',
        language: '',
        ...overrides,
    } as Localization
}

export function makeMinimalLocalization(overrides: Partial<Localization> = {}): Localization {
    return {
        code: '',
        language: '',
        ...overrides,
    } as Localization
}

export function makeEdgeCaseLocalization(overrides: Partial<Localization> = {}): Localization {
    return {
        code: '',
        language: '',
        ...overrides,
    } as Localization
}

export function makeMealPlan(overrides: Partial<MealPlan> = {}): MealPlan {
    return {
        id: 1,
        title: '',
        recipe: undefined as any,
        servings: 0,
        note: '',
        noteMarkdown: '',
        fromDate: new Date('2026-01-01T00:00:00Z'),
        toDate: new Date('2026-01-01T00:00:00Z'),
        mealType: makeMealType(),
        createdBy: 0,
        recipeName: 'Test recipe_name',
        mealTypeName: 'Test meal_type_name',
        shopping: false,
        addshopping: false,
        ...overrides,
    } as MealPlan
}

export function makeMinimalMealPlan(overrides: Partial<MealPlan> = {}): MealPlan {
    return {
        id: 1,
        servings: 0,
        noteMarkdown: '',
        fromDate: new Date('2026-01-01T00:00:00Z'),
        mealType: undefined as any,
        createdBy: 0,
        recipeName: 'Test recipe_name',
        mealTypeName: 'Test meal_type_name',
        shopping: false,
        ...overrides,
    } as MealPlan
}

export function makeEdgeCaseMealPlan(overrides: Partial<MealPlan> = {}): MealPlan {
    return {
        id: 0,
        title: '',
        recipe: null,
        servings: 0,
        note: '',
        noteMarkdown: '',
        fromDate: new Date(0),
        toDate: new Date(0),
        mealType: makeMinimalMealType(),
        createdBy: 0,
        recipeName: '',
        mealTypeName: '',
        shopping: false,
        addshopping: false,
        ...overrides,
    } as MealPlan
}

export function makeMealType(overrides: Partial<MealType> = {}): MealType {
    return {
        id: 1,
        name: 'Test name',
        order: 0,
        time: '',
        color: '',
        createdBy: 0,
        ...overrides,
    } as MealType
}

export function makeMinimalMealType(overrides: Partial<MealType> = {}): MealType {
    return {
        id: 1,
        name: 'Test name',
        createdBy: 0,
        ...overrides,
    } as MealType
}

export function makeEdgeCaseMealType(overrides: Partial<MealType> = {}): MealType {
    return {
        id: 0,
        name: '',
        order: 0,
        time: null,
        color: null,
        createdBy: 0,
        ...overrides,
    } as MealType
}

export function makeNutritionInformation(overrides: Partial<NutritionInformation> = {}): NutritionInformation {
    return {
        id: 1,
        carbohydrates: 0,
        fats: 0,
        proteins: 0,
        calories: 0,
        source: '',
        ...overrides,
    } as NutritionInformation
}

export function makeMinimalNutritionInformation(overrides: Partial<NutritionInformation> = {}): NutritionInformation {
    return {
        id: 1,
        carbohydrates: 0,
        fats: 0,
        proteins: 0,
        calories: 0,
        ...overrides,
    } as NutritionInformation
}

export function makeEdgeCaseNutritionInformation(overrides: Partial<NutritionInformation> = {}): NutritionInformation {
    return {
        id: 0,
        carbohydrates: 0,
        fats: 0,
        proteins: 0,
        calories: 0,
        source: null,
        ...overrides,
    } as NutritionInformation
}

export function makeProperty(overrides: Partial<Property> = {}): Property {
    return {
        id: 1,
        propertyAmount: 1,
        propertyType: makePropertyType(),
        ...overrides,
    } as Property
}

export function makeMinimalProperty(overrides: Partial<Property> = {}): Property {
    return {
        id: 1,
        propertyAmount: 1,
        propertyType: undefined as any,
        ...overrides,
    } as Property
}

export function makeEdgeCaseProperty(overrides: Partial<Property> = {}): Property {
    return {
        id: 0,
        propertyAmount: null,
        propertyType: makeMinimalPropertyType(),
        ...overrides,
    } as Property
}

export function makePropertyType(overrides: Partial<PropertyType> = {}): PropertyType {
    return {
        id: 1,
        name: 'Test name',
        unit: '',
        description: '',
        order: 0,
        openDataSlug: '',
        fdcId: 1,
        ...overrides,
    } as PropertyType
}

export function makeMinimalPropertyType(overrides: Partial<PropertyType> = {}): PropertyType {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as PropertyType
}

export function makeEdgeCasePropertyType(overrides: Partial<PropertyType> = {}): PropertyType {
    return {
        id: 0,
        name: '',
        unit: null,
        description: null,
        order: 0,
        openDataSlug: null,
        fdcId: null,
        ...overrides,
    } as PropertyType
}

export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        image: '',
        keywords: [],
        steps: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        sourceUrl: 'https://example.com',
        internal: false,
        showIngredientOverview: false,
        nutrition: undefined as any,
        properties: [],
        foodProperties: undefined as any,
        servings: 0,
        filePath: '',
        servingsText: '',
        diameter: 0,
        diameterText: '',
        rating: 0,
        lastCooked: new Date('2026-01-01T00:00:00Z'),
        private: false,
        shared: [],
        ...overrides,
    } as Recipe
}

export function makeMinimalRecipe(overrides: Partial<Recipe> = {}): Recipe {
    return {
        id: 1,
        name: 'Test name',
        image: '',
        steps: [],
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        foodProperties: undefined as any,
        rating: 0,
        lastCooked: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as Recipe
}

export function makeEdgeCaseRecipe(overrides: Partial<Recipe> = {}): Recipe {
    return {
        id: 0,
        name: '',
        description: null,
        image: null,
        keywords: [],
        steps: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: undefined as any,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        sourceUrl: null,
        internal: false,
        showIngredientOverview: false,
        nutrition: null,
        properties: [],
        foodProperties: undefined as any,
        servings: 0,
        filePath: '',
        servingsText: '',
        diameter: 0,
        diameterText: '',
        rating: null,
        lastCooked: null,
        private: false,
        shared: [],
        ...overrides,
    } as Recipe
}

export function makeRecipeBatchUpdate(overrides: Partial<RecipeBatchUpdate> = {}): RecipeBatchUpdate {
    return {
        recipes: [],
        keywordsAdd: [],
        keywordsRemove: [],
        keywordsSet: [],
        keywordsRemoveAll: false,
        workingTime: 0,
        waitingTime: 0,
        servings: 0,
        servingsText: '',
        private: false,
        sharedAdd: [],
        sharedRemove: [],
        sharedSet: [],
        sharedRemoveAll: false,
        showIngredientOverview: false,
        clearDescription: false,
        ...overrides,
    } as RecipeBatchUpdate
}

export function makeMinimalRecipeBatchUpdate(overrides: Partial<RecipeBatchUpdate> = {}): RecipeBatchUpdate {
    return {
        recipes: [],
        keywordsAdd: [],
        keywordsRemove: [],
        keywordsSet: [],
        sharedAdd: [],
        sharedRemove: [],
        sharedSet: [],
        ...overrides,
    } as RecipeBatchUpdate
}

export function makeEdgeCaseRecipeBatchUpdate(overrides: Partial<RecipeBatchUpdate> = {}): RecipeBatchUpdate {
    return {
        recipes: [],
        keywordsAdd: [],
        keywordsRemove: [],
        keywordsSet: [],
        keywordsRemoveAll: false,
        workingTime: null,
        waitingTime: null,
        servings: null,
        servingsText: null,
        private: null,
        sharedAdd: [],
        sharedRemove: [],
        sharedSet: [],
        sharedRemoveAll: false,
        showIngredientOverview: null,
        clearDescription: null,
        ...overrides,
    } as RecipeBatchUpdate
}

export function makeRecipeBook(overrides: Partial<RecipeBook> = {}): RecipeBook {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        shared: [],
        createdBy: undefined as any,
        filter: undefined as any,
        order: 0,
        ...overrides,
    } as RecipeBook
}

export function makeMinimalRecipeBook(overrides: Partial<RecipeBook> = {}): RecipeBook {
    return {
        id: 1,
        name: 'Test name',
        shared: [],
        createdBy: undefined as any,
        ...overrides,
    } as RecipeBook
}

export function makeEdgeCaseRecipeBook(overrides: Partial<RecipeBook> = {}): RecipeBook {
    return {
        id: 0,
        name: '',
        description: '',
        shared: [],
        createdBy: undefined as any,
        filter: null,
        order: 0,
        ...overrides,
    } as RecipeBook
}

export function makeRecipeBookEntry(overrides: Partial<RecipeBookEntry> = {}): RecipeBookEntry {
    return {
        id: 1,
        book: 0,
        bookContent: undefined as any,
        recipe: 0,
        recipeContent: undefined as any,
        ...overrides,
    } as RecipeBookEntry
}

export function makeMinimalRecipeBookEntry(overrides: Partial<RecipeBookEntry> = {}): RecipeBookEntry {
    return {
        id: 1,
        book: 0,
        bookContent: undefined as any,
        recipe: 0,
        recipeContent: undefined as any,
        ...overrides,
    } as RecipeBookEntry
}

export function makeEdgeCaseRecipeBookEntry(overrides: Partial<RecipeBookEntry> = {}): RecipeBookEntry {
    return {
        id: 0,
        book: 0,
        bookContent: undefined as any,
        recipe: 0,
        recipeContent: undefined as any,
        ...overrides,
    } as RecipeBookEntry
}

export function makeRecipeFlat(overrides: Partial<RecipeFlat> = {}): RecipeFlat {
    return {
        id: 1,
        name: 'Test name',
        image: '',
        ...overrides,
    } as RecipeFlat
}

export function makeMinimalRecipeFlat(overrides: Partial<RecipeFlat> = {}): RecipeFlat {
    return {
        id: 1,
        name: 'Test name',
        image: '',
        ...overrides,
    } as RecipeFlat
}

export function makeEdgeCaseRecipeFlat(overrides: Partial<RecipeFlat> = {}): RecipeFlat {
    return {
        id: 0,
        name: '',
        image: null,
        ...overrides,
    } as RecipeFlat
}

export function makeRecipeFromSource(overrides: Partial<RecipeFromSource> = {}): RecipeFromSource {
    return {
        url: 'https://example.com',
        data: '',
        bookmarklet: 0,
        ...overrides,
    } as RecipeFromSource
}

export function makeMinimalRecipeFromSource(overrides: Partial<RecipeFromSource> = {}): RecipeFromSource {
    return {
        ...overrides,
    } as RecipeFromSource
}

export function makeEdgeCaseRecipeFromSource(overrides: Partial<RecipeFromSource> = {}): RecipeFromSource {
    return {
        url: null,
        data: null,
        bookmarklet: null,
        ...overrides,
    } as RecipeFromSource
}

export function makeRecipeFromSourceResponse(overrides: Partial<RecipeFromSourceResponse> = {}): RecipeFromSourceResponse {
    return {
        recipe: makeSourceImportRecipe(),
        recipeId: 1,
        images: [],
        error: false,
        msg: '',
        duplicates: [],
        ...overrides,
    } as RecipeFromSourceResponse
}

export function makeMinimalRecipeFromSourceResponse(overrides: Partial<RecipeFromSourceResponse> = {}): RecipeFromSourceResponse {
    return {
        ...overrides,
    } as RecipeFromSourceResponse
}

export function makeEdgeCaseRecipeFromSourceResponse(overrides: Partial<RecipeFromSourceResponse> = {}): RecipeFromSourceResponse {
    return {
        recipe: makeMinimalSourceImportRecipe(),
        recipeId: 0,
        images: [],
        error: false,
        msg: '',
        duplicates: [],
        ...overrides,
    } as RecipeFromSourceResponse
}

export function makeRecipeImage(overrides: Partial<RecipeImage> = {}): RecipeImage {
    return {
        image: '',
        imageUrl: 'https://example.com',
        ...overrides,
    } as RecipeImage
}

export function makeMinimalRecipeImage(overrides: Partial<RecipeImage> = {}): RecipeImage {
    return {
        ...overrides,
    } as RecipeImage
}

export function makeEdgeCaseRecipeImage(overrides: Partial<RecipeImage> = {}): RecipeImage {
    return {
        image: null,
        imageUrl: null,
        ...overrides,
    } as RecipeImage
}

export function makeRecipeImport(overrides: Partial<RecipeImport> = {}): RecipeImport {
    return {
        id: 1,
        storage: makeStorage(),
        name: 'Test name',
        fileUid: '',
        filePath: '',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as RecipeImport
}

export function makeMinimalRecipeImport(overrides: Partial<RecipeImport> = {}): RecipeImport {
    return {
        id: 1,
        storage: undefined as any,
        name: 'Test name',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as RecipeImport
}

export function makeEdgeCaseRecipeImport(overrides: Partial<RecipeImport> = {}): RecipeImport {
    return {
        id: 0,
        storage: makeMinimalStorage(),
        name: '',
        fileUid: '',
        filePath: '',
        createdAt: new Date(0),
        ...overrides,
    } as RecipeImport
}

export function makeRecipeOverview(overrides: Partial<RecipeOverview> = {}): RecipeOverview {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        image: '',
        keywords: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        internal: false,
        private: false,
        servings: 0,
        servingsText: '',
        rating: 0,
        lastCooked: new Date('2026-01-01T00:00:00Z'),
        new: false,
        ...overrides,
    } as RecipeOverview
}

export function makeMinimalRecipeOverview(overrides: Partial<RecipeOverview> = {}): RecipeOverview {
    return {
        id: 1,
        name: 'Test name',
        image: '',
        keywords: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        internal: false,
        servings: 0,
        servingsText: '',
        rating: 0,
        lastCooked: new Date('2026-01-01T00:00:00Z'),
        new: false,
        ...overrides,
    } as RecipeOverview
}

export function makeEdgeCaseRecipeOverview(overrides: Partial<RecipeOverview> = {}): RecipeOverview {
    return {
        id: 0,
        name: '',
        description: null,
        image: null,
        keywords: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: undefined as any,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        internal: false,
        private: false,
        servings: 0,
        servingsText: '',
        rating: null,
        lastCooked: null,
        new: false,
        ...overrides,
    } as RecipeOverview
}

export function makeRecipeShoppingUpdate(overrides: Partial<RecipeShoppingUpdate> = {}): RecipeShoppingUpdate {
    return {
        id: 1,
        listRecipe: 0,
        ingredients: [],
        servings: 0,
        ...overrides,
    } as RecipeShoppingUpdate
}

export function makeMinimalRecipeShoppingUpdate(overrides: Partial<RecipeShoppingUpdate> = {}): RecipeShoppingUpdate {
    return {
        id: 1,
        ingredients: [],
        ...overrides,
    } as RecipeShoppingUpdate
}

export function makeEdgeCaseRecipeShoppingUpdate(overrides: Partial<RecipeShoppingUpdate> = {}): RecipeShoppingUpdate {
    return {
        id: 0,
        listRecipe: null,
        ingredients: [],
        servings: null,
        ...overrides,
    } as RecipeShoppingUpdate
}

export function makeRecipeSimple(overrides: Partial<RecipeSimple> = {}): RecipeSimple {
    return {
        id: 1,
        name: 'Test name',
        url: 'https://example.com',
        ...overrides,
    } as RecipeSimple
}

export function makeMinimalRecipeSimple(overrides: Partial<RecipeSimple> = {}): RecipeSimple {
    return {
        id: 1,
        name: 'Test name',
        url: 'https://example.com',
        ...overrides,
    } as RecipeSimple
}

export function makeEdgeCaseRecipeSimple(overrides: Partial<RecipeSimple> = {}): RecipeSimple {
    return {
        id: 0,
        name: '',
        url: '',
        ...overrides,
    } as RecipeSimple
}

export function makeSearchFields(overrides: Partial<SearchFields> = {}): SearchFields {
    return {
        id: 1,
        name: 'Test name',
        field: '',
        ...overrides,
    } as SearchFields
}

export function makeMinimalSearchFields(overrides: Partial<SearchFields> = {}): SearchFields {
    return {
        id: 1,
        ...overrides,
    } as SearchFields
}

export function makeEdgeCaseSearchFields(overrides: Partial<SearchFields> = {}): SearchFields {
    return {
        id: 0,
        name: null,
        field: null,
        ...overrides,
    } as SearchFields
}

export function makeSearchPreference(overrides: Partial<SearchPreference> = {}): SearchPreference {
    return {
        user: undefined as any,
        search: 'plain' as any,
        lookup: false,
        unaccent: [],
        icontains: [],
        istartswith: [],
        trigram: [],
        fulltext: [],
        trigramThreshold: 0,
        ...overrides,
    } as SearchPreference
}

export function makeMinimalSearchPreference(overrides: Partial<SearchPreference> = {}): SearchPreference {
    return {
        user: undefined as any,
        ...overrides,
    } as SearchPreference
}

export function makeEdgeCaseSearchPreference(overrides: Partial<SearchPreference> = {}): SearchPreference {
    return {
        user: undefined as any,
        search: 'raw' as any,
        lookup: false,
        unaccent: null,
        icontains: null,
        istartswith: null,
        trigram: null,
        fulltext: null,
        trigramThreshold: 0,
        ...overrides,
    } as SearchPreference
}

export function makeServerSettings(overrides: Partial<ServerSettings> = {}): ServerSettings {
    return {
        shoppingMinAutosyncInterval: '',
        disableExternalConnectors: false,
        termsUrl: 'https://example.com',
        privacyUrl: 'https://example.com',
        imprintUrl: 'https://example.com',
        hosted: false,
        debug: false,
        version: '',
        unauthenticatedThemeFromSpace: 0,
        forceThemeFromSpace: 0,
        logoColor32: '',
        logoColor128: '',
        logoColor144: '',
        logoColor180: '',
        logoColor192: '',
        logoColor512: '',
        logoColorSvg: '',
        customSpaceTheme: '',
        navLogo: '',
        navBgColor: '',
        ...overrides,
    } as ServerSettings
}

export function makeMinimalServerSettings(overrides: Partial<ServerSettings> = {}): ServerSettings {
    return {
        shoppingMinAutosyncInterval: '',
        disableExternalConnectors: false,
        termsUrl: 'https://example.com',
        privacyUrl: 'https://example.com',
        imprintUrl: 'https://example.com',
        hosted: false,
        debug: false,
        version: '',
        unauthenticatedThemeFromSpace: 0,
        forceThemeFromSpace: 0,
        ...overrides,
    } as ServerSettings
}

export function makeEdgeCaseServerSettings(overrides: Partial<ServerSettings> = {}): ServerSettings {
    return {
        shoppingMinAutosyncInterval: '',
        disableExternalConnectors: false,
        termsUrl: '',
        privacyUrl: '',
        imprintUrl: '',
        hosted: false,
        debug: false,
        version: '',
        unauthenticatedThemeFromSpace: 0,
        forceThemeFromSpace: 0,
        logoColor32: '',
        logoColor128: '',
        logoColor144: '',
        logoColor180: '',
        logoColor192: '',
        logoColor512: '',
        logoColorSvg: '',
        customSpaceTheme: '',
        navLogo: '',
        navBgColor: '',
        ...overrides,
    } as ServerSettings
}

export function makeShareLink(overrides: Partial<ShareLink> = {}): ShareLink {
    return {
        pk: 0,
        share: '',
        link: 'https://example.com',
        ...overrides,
    } as ShareLink
}

export function makeMinimalShareLink(overrides: Partial<ShareLink> = {}): ShareLink {
    return {
        pk: 0,
        share: '',
        link: 'https://example.com',
        ...overrides,
    } as ShareLink
}

export function makeEdgeCaseShareLink(overrides: Partial<ShareLink> = {}): ShareLink {
    return {
        pk: 0,
        share: '',
        link: '',
        ...overrides,
    } as ShareLink
}

export function makeShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        color: '',
        ...overrides,
    } as ShoppingList
}

export function makeMinimalShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
    return {
        id: 1,
        ...overrides,
    } as ShoppingList
}

export function makeEdgeCaseShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
    return {
        id: 0,
        name: '',
        description: '',
        color: null,
        ...overrides,
    } as ShoppingList
}

export function makeShoppingListEntry(overrides: Partial<ShoppingListEntry> = {}): ShoppingListEntry {
    return {
        id: 1,
        listRecipe: 0,
        shoppingLists: [],
        food: undefined as any,
        unit: undefined as any,
        amount: 1,
        order: 0,
        checked: false,
        ingredient: 0,
        listRecipeData: undefined as any,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        completedAt: new Date('2026-01-01T00:00:00Z'),
        delayUntil: new Date('2026-01-01T00:00:00Z'),
        mealplanId: 1,
        ...overrides,
    } as ShoppingListEntry
}

export function makeMinimalShoppingListEntry(overrides: Partial<ShoppingListEntry> = {}): ShoppingListEntry {
    return {
        id: 1,
        food: undefined as any,
        amount: 1,
        listRecipeData: undefined as any,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ShoppingListEntry
}

export function makeEdgeCaseShoppingListEntry(overrides: Partial<ShoppingListEntry> = {}): ShoppingListEntry {
    return {
        id: 0,
        listRecipe: null,
        shoppingLists: [],
        food: null,
        unit: null,
        amount: 0,
        order: 0,
        checked: false,
        ingredient: null,
        listRecipeData: undefined as any,
        createdBy: undefined as any,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        completedAt: null,
        delayUntil: null,
        mealplanId: 0,
        ...overrides,
    } as ShoppingListEntry
}

export function makeShoppingListEntryBulk(overrides: Partial<ShoppingListEntryBulk> = {}): ShoppingListEntryBulk {
    return {
        ids: [],
        checked: false,
        timestamp: new Date('2026-01-01T00:00:00Z'),
        shoppingListsAdd: [],
        shoppingListsRemove: [],
        shoppingListsSet: [],
        shoppingListsRemoveAll: false,
        ...overrides,
    } as ShoppingListEntryBulk
}

export function makeMinimalShoppingListEntryBulk(overrides: Partial<ShoppingListEntryBulk> = {}): ShoppingListEntryBulk {
    return {
        ids: [],
        timestamp: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ShoppingListEntryBulk
}

export function makeEdgeCaseShoppingListEntryBulk(overrides: Partial<ShoppingListEntryBulk> = {}): ShoppingListEntryBulk {
    return {
        ids: [],
        checked: null,
        timestamp: new Date(0),
        shoppingListsAdd: [],
        shoppingListsRemove: [],
        shoppingListsSet: [],
        shoppingListsRemoveAll: false,
        ...overrides,
    } as ShoppingListEntryBulk
}

export function makeShoppingListEntryBulkCreate(overrides: Partial<ShoppingListEntryBulkCreate> = {}): ShoppingListEntryBulkCreate {
    return {
        entries: [],
        shoppingListsIds: [],
        ...overrides,
    } as ShoppingListEntryBulkCreate
}

export function makeMinimalShoppingListEntryBulkCreate(overrides: Partial<ShoppingListEntryBulkCreate> = {}): ShoppingListEntryBulkCreate {
    return {
        entries: [],
        ...overrides,
    } as ShoppingListEntryBulkCreate
}

export function makeEdgeCaseShoppingListEntryBulkCreate(overrides: Partial<ShoppingListEntryBulkCreate> = {}): ShoppingListEntryBulkCreate {
    return {
        entries: [],
        shoppingListsIds: [],
        ...overrides,
    } as ShoppingListEntryBulkCreate
}

export function makeShoppingListEntrySimpleCreate(overrides: Partial<ShoppingListEntrySimpleCreate> = {}): ShoppingListEntrySimpleCreate {
    return {
        amount: 1,
        unitId: 1,
        foodId: 1,
        ingredientId: 1,
        ...overrides,
    } as ShoppingListEntrySimpleCreate
}

export function makeMinimalShoppingListEntrySimpleCreate(overrides: Partial<ShoppingListEntrySimpleCreate> = {}): ShoppingListEntrySimpleCreate {
    return {
        amount: 1,
        unitId: 1,
        foodId: 1,
        ingredientId: 1,
        ...overrides,
    } as ShoppingListEntrySimpleCreate
}

export function makeEdgeCaseShoppingListEntrySimpleCreate(overrides: Partial<ShoppingListEntrySimpleCreate> = {}): ShoppingListEntrySimpleCreate {
    return {
        amount: 0,
        unitId: null,
        foodId: null,
        ingredientId: null,
        ...overrides,
    } as ShoppingListEntrySimpleCreate
}

export function makeShoppingListRecipe(overrides: Partial<ShoppingListRecipe> = {}): ShoppingListRecipe {
    return {
        id: 1,
        name: 'Test name',
        recipe: 0,
        recipeData: undefined as any,
        mealPlanData: undefined as any,
        mealplan: 0,
        servings: 0,
        createdBy: undefined as any,
        ...overrides,
    } as ShoppingListRecipe
}

export function makeMinimalShoppingListRecipe(overrides: Partial<ShoppingListRecipe> = {}): ShoppingListRecipe {
    return {
        id: 1,
        recipeData: undefined as any,
        mealPlanData: undefined as any,
        servings: 0,
        createdBy: undefined as any,
        ...overrides,
    } as ShoppingListRecipe
}

export function makeEdgeCaseShoppingListRecipe(overrides: Partial<ShoppingListRecipe> = {}): ShoppingListRecipe {
    return {
        id: 0,
        name: '',
        recipe: null,
        recipeData: undefined as any,
        mealPlanData: undefined as any,
        mealplan: null,
        servings: 0,
        createdBy: undefined as any,
        ...overrides,
    } as ShoppingListRecipe
}

export function makeSourceImportDuplicate(overrides: Partial<SourceImportDuplicate> = {}): SourceImportDuplicate {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as SourceImportDuplicate
}

export function makeMinimalSourceImportDuplicate(overrides: Partial<SourceImportDuplicate> = {}): SourceImportDuplicate {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as SourceImportDuplicate
}

export function makeEdgeCaseSourceImportDuplicate(overrides: Partial<SourceImportDuplicate> = {}): SourceImportDuplicate {
    return {
        id: 0,
        name: '',
        ...overrides,
    } as SourceImportDuplicate
}

export function makeSourceImportFood(overrides: Partial<SourceImportFood> = {}): SourceImportFood {
    return {
        name: 'Test name',
        ...overrides,
    } as SourceImportFood
}

export function makeMinimalSourceImportFood(overrides: Partial<SourceImportFood> = {}): SourceImportFood {
    return {
        name: 'Test name',
        ...overrides,
    } as SourceImportFood
}

export function makeEdgeCaseSourceImportFood(overrides: Partial<SourceImportFood> = {}): SourceImportFood {
    return {
        name: '',
        ...overrides,
    } as SourceImportFood
}

export function makeSourceImportIngredient(overrides: Partial<SourceImportIngredient> = {}): SourceImportIngredient {
    return {
        amount: 1,
        food: makeSourceImportFood(),
        unit: makeSourceImportUnit(),
        note: '',
        originalText: '',
        ...overrides,
    } as SourceImportIngredient
}

export function makeMinimalSourceImportIngredient(overrides: Partial<SourceImportIngredient> = {}): SourceImportIngredient {
    return {
        amount: 1,
        food: undefined as any,
        unit: undefined as any,
        originalText: '',
        ...overrides,
    } as SourceImportIngredient
}

export function makeEdgeCaseSourceImportIngredient(overrides: Partial<SourceImportIngredient> = {}): SourceImportIngredient {
    return {
        amount: 0,
        food: makeMinimalSourceImportFood(),
        unit: makeMinimalSourceImportUnit(),
        note: '',
        originalText: '',
        ...overrides,
    } as SourceImportIngredient
}

export function makeSourceImportKeyword(overrides: Partial<SourceImportKeyword> = {}): SourceImportKeyword {
    return {
        id: 1,
        label: '',
        name: 'Test name',
        importKeyword: false,
        ...overrides,
    } as SourceImportKeyword
}

export function makeMinimalSourceImportKeyword(overrides: Partial<SourceImportKeyword> = {}): SourceImportKeyword {
    return {
        id: 1,
        label: '',
        name: 'Test name',
        ...overrides,
    } as SourceImportKeyword
}

export function makeEdgeCaseSourceImportKeyword(overrides: Partial<SourceImportKeyword> = {}): SourceImportKeyword {
    return {
        id: null,
        label: '',
        name: '',
        importKeyword: false,
        ...overrides,
    } as SourceImportKeyword
}

export function makeSourceImportProperty(overrides: Partial<SourceImportProperty> = {}): SourceImportProperty {
    return {
        propertyType: makeSourceImportPropertyType(),
        propertyAmount: 1,
        ...overrides,
    } as SourceImportProperty
}

export function makeMinimalSourceImportProperty(overrides: Partial<SourceImportProperty> = {}): SourceImportProperty {
    return {
        propertyType: undefined as any,
        propertyAmount: 1,
        ...overrides,
    } as SourceImportProperty
}

export function makeEdgeCaseSourceImportProperty(overrides: Partial<SourceImportProperty> = {}): SourceImportProperty {
    return {
        propertyType: makeMinimalSourceImportPropertyType(),
        propertyAmount: 0,
        ...overrides,
    } as SourceImportProperty
}

export function makeSourceImportPropertyType(overrides: Partial<SourceImportPropertyType> = {}): SourceImportPropertyType {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as SourceImportPropertyType
}

export function makeMinimalSourceImportPropertyType(overrides: Partial<SourceImportPropertyType> = {}): SourceImportPropertyType {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as SourceImportPropertyType
}

export function makeEdgeCaseSourceImportPropertyType(overrides: Partial<SourceImportPropertyType> = {}): SourceImportPropertyType {
    return {
        id: 0,
        name: '',
        ...overrides,
    } as SourceImportPropertyType
}

export function makeSourceImportRecipe(overrides: Partial<SourceImportRecipe> = {}): SourceImportRecipe {
    return {
        steps: [],
        internal: false,
        sourceUrl: 'https://example.com',
        name: 'Test name',
        description: '',
        servings: 0,
        servingsText: '',
        workingTime: 0,
        waitingTime: 0,
        imageUrl: 'https://example.com',
        keywords: [],
        properties: [],
        ...overrides,
    } as SourceImportRecipe
}

export function makeMinimalSourceImportRecipe(overrides: Partial<SourceImportRecipe> = {}): SourceImportRecipe {
    return {
        steps: [],
        sourceUrl: 'https://example.com',
        name: 'Test name',
        ...overrides,
    } as SourceImportRecipe
}

export function makeEdgeCaseSourceImportRecipe(overrides: Partial<SourceImportRecipe> = {}): SourceImportRecipe {
    return {
        steps: [],
        internal: false,
        sourceUrl: '',
        name: '',
        description: '',
        servings: 0,
        servingsText: '',
        workingTime: 0,
        waitingTime: 0,
        imageUrl: '',
        keywords: [],
        properties: [],
        ...overrides,
    } as SourceImportRecipe
}

export function makeSourceImportStep(overrides: Partial<SourceImportStep> = {}): SourceImportStep {
    return {
        instruction: '',
        ingredients: [],
        showIngredientsTable: false,
        ...overrides,
    } as SourceImportStep
}

export function makeMinimalSourceImportStep(overrides: Partial<SourceImportStep> = {}): SourceImportStep {
    return {
        instruction: '',
        ingredients: [],
        ...overrides,
    } as SourceImportStep
}

export function makeEdgeCaseSourceImportStep(overrides: Partial<SourceImportStep> = {}): SourceImportStep {
    return {
        instruction: '',
        ingredients: [],
        showIngredientsTable: false,
        ...overrides,
    } as SourceImportStep
}

export function makeSourceImportUnit(overrides: Partial<SourceImportUnit> = {}): SourceImportUnit {
    return {
        name: 'Test name',
        ...overrides,
    } as SourceImportUnit
}

export function makeMinimalSourceImportUnit(overrides: Partial<SourceImportUnit> = {}): SourceImportUnit {
    return {
        name: 'Test name',
        ...overrides,
    } as SourceImportUnit
}

export function makeEdgeCaseSourceImportUnit(overrides: Partial<SourceImportUnit> = {}): SourceImportUnit {
    return {
        name: '',
        ...overrides,
    } as SourceImportUnit
}

export function makeSpace(overrides: Partial<Space> = {}): Space {
    return {
        id: 1,
        name: 'Test name',
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        message: '',
        maxRecipes: 0,
        maxFileStorageMb: 0,
        maxUsers: 0,
        allowSharing: false,
        demo: false,
        foodInherit: [],
        userCount: 0,
        recipeCount: 0,
        fileSizeMb: 0,
        image: undefined as any,
        navLogo: undefined as any,
        spaceTheme: 'BLANK' as any,
        customSpaceTheme: undefined as any,
        navBgColor: '',
        navTextColor: 'BLANK' as any,
        logoColor32: undefined as any,
        logoColor128: undefined as any,
        logoColor144: undefined as any,
        logoColor180: undefined as any,
        logoColor192: undefined as any,
        logoColor512: undefined as any,
        logoColorSvg: undefined as any,
        aiCreditsMonthly: 0,
        aiCreditsBalance: 0,
        aiMonthlyCreditsUsed: 0,
        aiEnabled: false,
        aiDefaultProvider: undefined as any,
        spaceSetupCompleted: false,
        ...overrides,
    } as Space
}

export function makeMinimalSpace(overrides: Partial<Space> = {}): Space {
    return {
        id: 1,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        maxRecipes: 0,
        maxFileStorageMb: 0,
        maxUsers: 0,
        allowSharing: false,
        demo: false,
        userCount: 0,
        recipeCount: 0,
        fileSizeMb: 0,
        aiMonthlyCreditsUsed: 0,
        ...overrides,
    } as Space
}

export function makeEdgeCaseSpace(overrides: Partial<Space> = {}): Space {
    return {
        id: 0,
        name: '',
        createdBy: undefined as any,
        createdAt: new Date(0),
        message: '',
        maxRecipes: 0,
        maxFileStorageMb: 0,
        maxUsers: 0,
        allowSharing: false,
        demo: false,
        foodInherit: [],
        userCount: 0,
        recipeCount: 0,
        fileSizeMb: 0,
        image: null,
        navLogo: null,
        spaceTheme: 'TANDOOR_DARK' as any,
        customSpaceTheme: null,
        navBgColor: '',
        navTextColor: 'DARK' as any,
        logoColor32: null,
        logoColor128: null,
        logoColor144: null,
        logoColor180: null,
        logoColor192: null,
        logoColor512: null,
        logoColorSvg: null,
        aiCreditsMonthly: 0,
        aiCreditsBalance: 0,
        aiMonthlyCreditsUsed: 0,
        aiEnabled: false,
        aiDefaultProvider: null,
        spaceSetupCompleted: false,
        ...overrides,
    } as Space
}

export function makeStep(overrides: Partial<Step> = {}): Step {
    return {
        id: 1,
        name: 'Test name',
        instruction: '',
        ingredients: [],
        instructionsMarkdown: '',
        time: 0,
        order: 0,
        showAsHeader: false,
        file: undefined as any,
        stepRecipe: 0,
        stepRecipeData: undefined as any,
        showIngredientsTable: false,
        ...overrides,
    } as Step
}

export function makeMinimalStep(overrides: Partial<Step> = {}): Step {
    return {
        id: 1,
        ingredients: [],
        instructionsMarkdown: '',
        stepRecipeData: undefined as any,
        ...overrides,
    } as Step
}

export function makeEdgeCaseStep(overrides: Partial<Step> = {}): Step {
    return {
        id: 0,
        name: '',
        instruction: '',
        ingredients: [],
        instructionsMarkdown: '',
        time: 0,
        order: 0,
        showAsHeader: false,
        file: null,
        stepRecipe: null,
        stepRecipeData: undefined as any,
        showIngredientsTable: false,
        ...overrides,
    } as Step
}

export function makeStorage(overrides: Partial<Storage> = {}): Storage {
    return {
        id: 1,
        name: 'Test name',
        method: 'DB' as any,
        username: 'Test username',
        password: '',
        token: '',
        url: 'https://example.com',
        path: '',
        createdBy: 0,
        ...overrides,
    } as Storage
}

export function makeMinimalStorage(overrides: Partial<Storage> = {}): Storage {
    return {
        id: 1,
        name: 'Test name',
        createdBy: 0,
        ...overrides,
    } as Storage
}

export function makeEdgeCaseStorage(overrides: Partial<Storage> = {}): Storage {
    return {
        id: 0,
        name: '',
        method: 'LOCAL' as any,
        username: null,
        password: null,
        token: null,
        url: null,
        path: '',
        createdBy: 0,
        ...overrides,
    } as Storage
}

export function makeSupermarket(overrides: Partial<Supermarket> = {}): Supermarket {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        shoppingLists: [],
        categoryToSupermarket: [],
        openDataSlug: '',
        ...overrides,
    } as Supermarket
}

export function makeMinimalSupermarket(overrides: Partial<Supermarket> = {}): Supermarket {
    return {
        id: 1,
        name: 'Test name',
        categoryToSupermarket: [],
        ...overrides,
    } as Supermarket
}

export function makeEdgeCaseSupermarket(overrides: Partial<Supermarket> = {}): Supermarket {
    return {
        id: 0,
        name: '',
        description: null,
        shoppingLists: [],
        categoryToSupermarket: [],
        openDataSlug: null,
        ...overrides,
    } as Supermarket
}

export function makeSupermarketCategory(overrides: Partial<SupermarketCategory> = {}): SupermarketCategory {
    return {
        id: 1,
        name: 'Test name',
        description: '',
        openDataSlug: '',
        ...overrides,
    } as SupermarketCategory
}

export function makeMinimalSupermarketCategory(overrides: Partial<SupermarketCategory> = {}): SupermarketCategory {
    return {
        id: 1,
        name: 'Test name',
        ...overrides,
    } as SupermarketCategory
}

export function makeEdgeCaseSupermarketCategory(overrides: Partial<SupermarketCategory> = {}): SupermarketCategory {
    return {
        id: 0,
        name: '',
        description: null,
        openDataSlug: null,
        ...overrides,
    } as SupermarketCategory
}

export function makeSupermarketCategoryRelation(overrides: Partial<SupermarketCategoryRelation> = {}): SupermarketCategoryRelation {
    return {
        id: 1,
        category: makeSupermarketCategory(),
        supermarket: 0,
        order: 0,
        ...overrides,
    } as SupermarketCategoryRelation
}

export function makeMinimalSupermarketCategoryRelation(overrides: Partial<SupermarketCategoryRelation> = {}): SupermarketCategoryRelation {
    return {
        id: 1,
        category: undefined as any,
        supermarket: 0,
        ...overrides,
    } as SupermarketCategoryRelation
}

export function makeEdgeCaseSupermarketCategoryRelation(overrides: Partial<SupermarketCategoryRelation> = {}): SupermarketCategoryRelation {
    return {
        id: 0,
        category: makeMinimalSupermarketCategory(),
        supermarket: 0,
        order: 0,
        ...overrides,
    } as SupermarketCategoryRelation
}

export function makeSync(overrides: Partial<Sync> = {}): Sync {
    return {
        id: 1,
        storage: makeStorage(),
        path: '',
        active: false,
        lastChecked: new Date('2026-01-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as Sync
}

export function makeMinimalSync(overrides: Partial<Sync> = {}): Sync {
    return {
        id: 1,
        storage: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as Sync
}

export function makeEdgeCaseSync(overrides: Partial<Sync> = {}): Sync {
    return {
        id: 0,
        storage: makeMinimalStorage(),
        path: '',
        active: false,
        lastChecked: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        ...overrides,
    } as Sync
}

export function makeSyncLog(overrides: Partial<SyncLog> = {}): SyncLog {
    return {
        id: 1,
        sync: undefined as any,
        status: '',
        msg: '',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as SyncLog
}

export function makeMinimalSyncLog(overrides: Partial<SyncLog> = {}): SyncLog {
    return {
        id: 1,
        sync: undefined as any,
        status: '',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as SyncLog
}

export function makeEdgeCaseSyncLog(overrides: Partial<SyncLog> = {}): SyncLog {
    return {
        id: 0,
        sync: undefined as any,
        status: '',
        msg: '',
        createdAt: new Date(0),
        ...overrides,
    } as SyncLog
}

export function makeUnit(overrides: Partial<Unit> = {}): Unit {
    return {
        id: 1,
        name: 'Test name',
        pluralName: 'Test plural_name',
        description: '',
        baseUnit: '',
        numrecipe: 0,
        openDataSlug: '',
        ...overrides,
    } as Unit
}

export function makeMinimalUnit(overrides: Partial<Unit> = {}): Unit {
    return {
        id: 1,
        name: 'Test name',
        numrecipe: 0,
        ...overrides,
    } as Unit
}

export function makeEdgeCaseUnit(overrides: Partial<Unit> = {}): Unit {
    return {
        id: 0,
        name: '',
        pluralName: null,
        description: null,
        baseUnit: null,
        numrecipe: 0,
        openDataSlug: null,
        ...overrides,
    } as Unit
}

export function makeUnitConversion(overrides: Partial<UnitConversion> = {}): UnitConversion {
    return {
        id: 1,
        name: 'Test name',
        baseAmount: 1,
        baseUnit: makeUnit(),
        convertedAmount: 1,
        convertedUnit: makeUnit(),
        food: undefined as any,
        openDataSlug: '',
        ...overrides,
    } as UnitConversion
}

export function makeMinimalUnitConversion(overrides: Partial<UnitConversion> = {}): UnitConversion {
    return {
        id: 1,
        name: 'Test name',
        baseAmount: 1,
        baseUnit: undefined as any,
        convertedAmount: 1,
        convertedUnit: undefined as any,
        ...overrides,
    } as UnitConversion
}

export function makeEdgeCaseUnitConversion(overrides: Partial<UnitConversion> = {}): UnitConversion {
    return {
        id: 0,
        name: '',
        baseAmount: 0,
        baseUnit: makeMinimalUnit(),
        convertedAmount: 0,
        convertedUnit: makeMinimalUnit(),
        food: null,
        openDataSlug: null,
        ...overrides,
    } as UnitConversion
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 1,
        username: 'Test username',
        firstName: 'Test first_name',
        lastName: 'Test last_name',
        displayName: 'Test display_name',
        isStaff: false,
        isSuperuser: false,
        isActive: false,
        ...overrides,
    } as User
}

export function makeMinimalUser(overrides: Partial<User> = {}): User {
    return {
        id: 1,
        username: 'Test username',
        displayName: 'Test display_name',
        isStaff: false,
        isSuperuser: false,
        isActive: false,
        ...overrides,
    } as User
}

export function makeEdgeCaseUser(overrides: Partial<User> = {}): User {
    return {
        id: 0,
        username: '',
        firstName: '',
        lastName: '',
        displayName: '',
        isStaff: false,
        isSuperuser: false,
        isActive: false,
        ...overrides,
    } as User
}

export function makeUserFile(overrides: Partial<UserFile> = {}): UserFile {
    return {
        id: 1,
        name: 'Test name',
        file: '',
        fileDownload: '',
        preview: '',
        fileSizeKb: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as UserFile
}

export function makeMinimalUserFile(overrides: Partial<UserFile> = {}): UserFile {
    return {
        id: 1,
        name: 'Test name',
        fileDownload: '',
        preview: '',
        fileSizeKb: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as UserFile
}

export function makeEdgeCaseUserFile(overrides: Partial<UserFile> = {}): UserFile {
    return {
        id: 0,
        name: '',
        file: '',
        fileDownload: '',
        preview: '',
        fileSizeKb: 0,
        createdBy: undefined as any,
        createdAt: new Date(0),
        ...overrides,
    } as UserFile
}

export function makeUserFileView(overrides: Partial<UserFileView> = {}): UserFileView {
    return {
        id: 1,
        name: 'Test name',
        fileDownload: '',
        preview: '',
        fileSizeKb: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as UserFileView
}

export function makeMinimalUserFileView(overrides: Partial<UserFileView> = {}): UserFileView {
    return {
        id: 1,
        name: 'Test name',
        fileDownload: '',
        preview: '',
        fileSizeKb: 0,
        createdBy: undefined as any,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as UserFileView
}

export function makeEdgeCaseUserFileView(overrides: Partial<UserFileView> = {}): UserFileView {
    return {
        id: 0,
        name: '',
        fileDownload: '',
        preview: '',
        fileSizeKb: 0,
        createdBy: undefined as any,
        createdAt: new Date(0),
        ...overrides,
    } as UserFileView
}

export function makeUserPreference(overrides: Partial<UserPreference> = {}): UserPreference {
    return {
        user: undefined as any,
        image: undefined as any,
        theme: 'TANDOOR' as any,
        navBgColor: '',
        navShowLogo: false,
        defaultUnit: '',
        defaultPage: 'HOME' as any,
        useFractions: false,
        navSticky: false,
        ingredientDecimals: 0,
        comments: false,
        shoppingAutoSync: 0,
        mealplanAutoaddShopping: false,
        foodInheritDefault: undefined as any,
        defaultDelay: 0,
        mealplanAutoincludeRelated: false,
        mealplanAutoexcludeOnhand: false,
        shoppingRecentDays: 0,
        csvDelim: '',
        csvPrefix: '',
        shoppingUpdateFoodLists: new Date('2026-01-01T00:00:00Z'),
        defaultMealType: undefined as any,
        filterToSupermarket: false,
        shoppingAddOnhand: false,
        leftHanded: false,
        showStepIngredients: false,
        foodChildrenExist: false,
        startPageSections: undefined as any,
        ...overrides,
    } as UserPreference
}

export function makeMinimalUserPreference(overrides: Partial<UserPreference> = {}): UserPreference {
    return {
        user: undefined as any,
        foodInheritDefault: undefined as any,
        foodChildrenExist: false,
        ...overrides,
    } as UserPreference
}

export function makeEdgeCaseUserPreference(overrides: Partial<UserPreference> = {}): UserPreference {
    return {
        user: undefined as any,
        image: null,
        theme: 'TANDOOR_DARK' as any,
        navBgColor: '',
        navShowLogo: false,
        defaultUnit: '',
        defaultPage: 'SHOPPING' as any,
        useFractions: false,
        navSticky: false,
        ingredientDecimals: 0,
        comments: false,
        shoppingAutoSync: 0,
        mealplanAutoaddShopping: false,
        foodInheritDefault: undefined as any,
        defaultDelay: 0,
        mealplanAutoincludeRelated: false,
        mealplanAutoexcludeOnhand: false,
        shoppingRecentDays: 0,
        csvDelim: '',
        csvPrefix: '',
        shoppingUpdateFoodLists: new Date(0),
        defaultMealType: null,
        filterToSupermarket: false,
        shoppingAddOnhand: false,
        leftHanded: false,
        showStepIngredients: false,
        foodChildrenExist: false,
        startPageSections: undefined as any,
        ...overrides,
    } as UserPreference
}

export function makeUserSpace(overrides: Partial<UserSpace> = {}): UserSpace {
    return {
        id: 1,
        user: undefined as any,
        space: 0,
        groups: [],
        household: undefined as any,
        active: false,
        internalNote: '',
        inviteLink: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as UserSpace
}

export function makeMinimalUserSpace(overrides: Partial<UserSpace> = {}): UserSpace {
    return {
        id: 1,
        user: undefined as any,
        space: 0,
        groups: [],
        inviteLink: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as UserSpace
}

export function makeEdgeCaseUserSpace(overrides: Partial<UserSpace> = {}): UserSpace {
    return {
        id: 0,
        user: undefined as any,
        space: 0,
        groups: [],
        household: null,
        active: false,
        internalNote: null,
        inviteLink: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        ...overrides,
    } as UserSpace
}

export function makeUserSpaceBatchUpdate(overrides: Partial<UserSpaceBatchUpdate> = {}): UserSpaceBatchUpdate {
    return {
        userSpaces: [],
        household: 0,
        groupSet: [],
        ...overrides,
    } as UserSpaceBatchUpdate
}

export function makeMinimalUserSpaceBatchUpdate(overrides: Partial<UserSpaceBatchUpdate> = {}): UserSpaceBatchUpdate {
    return {
        userSpaces: [],
        groupSet: [],
        ...overrides,
    } as UserSpaceBatchUpdate
}

export function makeEdgeCaseUserSpaceBatchUpdate(overrides: Partial<UserSpaceBatchUpdate> = {}): UserSpaceBatchUpdate {
    return {
        userSpaces: [],
        household: null,
        groupSet: [],
        ...overrides,
    } as UserSpaceBatchUpdate
}

export function makeViewLog(overrides: Partial<ViewLog> = {}): ViewLog {
    return {
        id: 1,
        recipe: 0,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ViewLog
}

export function makeMinimalViewLog(overrides: Partial<ViewLog> = {}): ViewLog {
    return {
        id: 1,
        recipe: 0,
        createdBy: 0,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    } as ViewLog
}

export function makeEdgeCaseViewLog(overrides: Partial<ViewLog> = {}): ViewLog {
    return {
        id: 0,
        recipe: 0,
        createdBy: 0,
        createdAt: new Date(0),
        ...overrides,
    } as ViewLog
}

