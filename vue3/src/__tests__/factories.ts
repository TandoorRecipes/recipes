/**
 * Test factories for OpenAPI models.
 *
 * These produce typed objects that match the generated interfaces.
 * When the OpenAPI schema is regenerated, `vue-tsc --noEmit` will
 * flag any factory whose shape no longer matches — no extra tooling needed.
 *
 * Usage:
 *   const food = makeFood({ name: 'Butter' })
 *   const recipe = makeRecipe({ steps: [makeStep()] })
 */

import type {
    AccessToken,
    AiProvider,
    AutoMealPlan,
    Automation,
    ConnectorConfig,
    CookLog,
    CustomFilter,
    ExportLog,
    Food,
    FoodInheritField,
    FoodSimple,
    FoodShopping,
    GenericModelReference,
    Group,
    Household,
    ImportLog,
    Ingredient,
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
    RecipeBook,
    RecipeBookEntry,
    RecipeFlat,
    RecipeImport,
    RecipeOverview,
    RecipeSimple,
    SearchFields,
    SearchPreference,
    ServerSettings,
    ShareLink,
    ShoppingList,
    ShoppingListEntry,
    ShoppingListRecipe,
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
    ViewLog,
} from '@/openapi'

// ─── Leaf models (no nested dependencies) ────────────────────────

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 1,
        username: 'testuser',
        firstName: '',
        lastName: '',
        displayName: 'testuser',
        isStaff: false,
        isSuperuser: false,
        isActive: true,
        ...overrides,
    }
}

export function makeGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: 1,
        name: 'user',
        ...overrides,
    }
}

export function makeHousehold(overrides: Partial<Household> = {}): Household {
    return {
        id: 1,
        name: 'Default',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeUnit(overrides: Partial<Unit> = {}): Unit {
    return {
        id: 1,
        name: 'g',
        pluralName: 'g',
        description: '',
        baseUnit: '',
        openDataSlug: '',
        ...overrides,
    }
}

export function makeSupermarketCategory(overrides: Partial<SupermarketCategory> = {}): SupermarketCategory {
    return {
        id: 1,
        name: 'Produce',
        description: '',
        openDataSlug: '',
        ...overrides,
    }
}

export function makeKeywordLabel(overrides: Partial<KeywordLabel> = {}): KeywordLabel {
    return {
        id: 1,
        label: 'test-keyword',
        ...overrides,
    }
}

export function makeKeyword(overrides: Partial<Keyword> = {}): Keyword {
    return {
        id: 1,
        name: 'Test Keyword',
        label: 'Test Keyword',
        description: '',
        parent: 0,
        numchild: 0,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        fullName: 'Test Keyword',
        ...overrides,
    }
}

export function makePropertyType(overrides: Partial<PropertyType> = {}): PropertyType {
    return {
        id: 1,
        name: 'Calories',
        unit: 'kcal',
        description: '',
        order: 0,
        ...overrides,
    }
}

export function makeProperty(overrides: Partial<Property> = {}): Property {
    return {
        id: 1,
        propertyAmount: 100,
        propertyType: makePropertyType(),
        ...overrides,
    }
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
    }
}

export function makeFoodInheritField(overrides: Partial<FoodInheritField> = {}): FoodInheritField {
    return {
        id: 1,
        name: 'Supermarket Category',
        field: 'supermarket_category',
        ...overrides,
    }
}

export function makeLocalization(overrides: Partial<Localization> = {}): Localization {
    return {
        code: 'en',
        language: 'English',
        ...overrides,
    }
}

export function makeSearchFields(overrides: Partial<SearchFields> = {}): SearchFields {
    return {
        id: 1,
        name: 'Name',
        field: 'name',
        ...overrides,
    }
}

export function makeShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
    return {
        id: 1,
        name: 'Weekly',
        description: '',
        color: '',
        ...overrides,
    }
}

export function makeRecipeFlat(overrides: Partial<RecipeFlat> = {}): RecipeFlat {
    return {
        id: 1,
        name: 'Test Recipe',
        image: null,
        ...overrides,
    }
}

export function makeRecipeSimple(overrides: Partial<RecipeSimple> = {}): RecipeSimple {
    return {
        id: 1,
        name: 'Test Recipe',
        url: '',
        ...overrides,
    }
}

export function makeShareLink(overrides: Partial<ShareLink> = {}): ShareLink {
    return {
        pk: 1,
        share: 'abc123',
        link: '/view/recipe/1/abc123',
        ...overrides,
    }
}

export function makeGenericModelReference(overrides: Partial<GenericModelReference> = {}): GenericModelReference {
    return {
        id: 1,
        model: 'Food',
        name: 'Test',
        ...overrides,
    }
}

// ─── Models with leaf dependencies ───────────────────────────────

export function makeUserFileView(overrides: Partial<UserFileView> = {}): UserFileView {
    return {
        id: 1,
        name: 'test.jpg',
        fileDownload: '/media/test.jpg',
        preview: '/media/test_preview.jpg',
        fileSizeKb: 100,
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeUserFile(overrides: Partial<UserFile> = {}): UserFile {
    return {
        id: 1,
        name: 'test.jpg',
        file: '/media/test.jpg',
        fileDownload: '/media/test.jpg',
        preview: '/media/test_preview.jpg',
        fileSizeKb: 100,
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeFoodSimple(overrides: Partial<FoodSimple> = {}): FoodSimple {
    return {
        id: 1,
        name: 'Test Food',
        pluralName: '',
        ...overrides,
    }
}

export function makeFood(overrides: Partial<Food> = {}): Food {
    return {
        id: 1,
        name: 'Test Food',
        pluralName: '',
        description: '',
        shopping: '',
        recipe: undefined,
        url: '',
        properties: [],
        propertiesFoodAmount: undefined,
        propertiesFoodUnit: undefined,
        fdcId: undefined,
        foodOnhand: false,
        supermarketCategory: undefined,
        parent: 0,
        numchild: 0,
        inheritFields: [],
        fullName: 'Test Food',
        ignoreShopping: false,
        substitute: [],
        substituteSiblings: false,
        substituteChildren: false,
        substituteOnhand: false,
        childInheritFields: [],
        openDataSlug: '',
        shoppingLists: [],
        ...overrides,
    }
}

export function makeFoodShopping(overrides: Partial<FoodShopping> = {}): FoodShopping {
    return {
        id: 1,
        name: 'Test Food',
        pluralName: '',
        supermarketCategory: makeSupermarketCategory(),
        shoppingLists: [],
        ...overrides,
    }
}

export function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
    return {
        id: 1,
        food: makeFood(),
        unit: makeUnit(),
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
    }
}

export function makeStep(overrides: Partial<Step> = {}): Step {
    return {
        id: 1,
        name: '',
        instruction: '',
        ingredients: [],
        instructionsMarkdown: '',
        time: 0,
        order: 0,
        showAsHeader: false,
        file: undefined,
        stepRecipe: undefined,
        stepRecipeData: null,
        numrecipe: 0,
        ...overrides,
    }
}

export function makeMealType(overrides: Partial<MealType> = {}): MealType {
    return {
        id: 1,
        name: 'Dinner',
        order: 0,
        time: '18:00',
        color: '',
        createdBy: 1,
        ...overrides,
    }
}

export function makeRecipeOverview(overrides: Partial<RecipeOverview> = {}): RecipeOverview {
    return {
        id: 1,
        name: 'Test Recipe',
        description: '',
        image: null,
        keywords: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        internal: true,
        servings: 4,
        servingsText: '',
        rating: null,
        lastCooked: null,
        _new: false,
        recent: '',
        ...overrides,
    }
}

export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
    return {
        id: 1,
        name: 'Test Recipe',
        description: '',
        image: null,
        keywords: [],
        steps: [],
        workingTime: 0,
        waitingTime: 0,
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        sourceUrl: '',
        internal: true,
        showIngredientOverview: true,
        nutrition: undefined,
        properties: [],
        foodProperties: null,
        servings: 4,
        filePath: '',
        servingsText: '',
        diameter: undefined,
        diameterText: '',
        rating: null,
        lastCooked: null,
        shared: [],
        ...overrides,
    }
}

export function makeRecipeBook(overrides: Partial<RecipeBook> = {}): RecipeBook {
    return {
        id: 1,
        name: 'Test Book',
        description: '',
        shared: [],
        createdBy: makeUser(),
        filter: undefined,
        order: 0,
        ...overrides,
    }
}

export function makeRecipeBookEntry(overrides: Partial<RecipeBookEntry> = {}): RecipeBookEntry {
    return {
        id: 1,
        book: 1,
        bookContent: makeRecipeBook(),
        recipe: 1,
        recipeContent: makeRecipeOverview(),
        ...overrides,
    }
}

export function makeMealPlan(overrides: Partial<MealPlan> = {}): MealPlan {
    return {
        id: 1,
        title: '',
        recipe: makeRecipeOverview(),
        servings: 4,
        note: '',
        noteMarkdown: '',
        fromDate: new Date('2026-03-22'),
        toDate: undefined,
        mealType: makeMealType(),
        createdBy: 1,
        recipeName: 'Test Recipe',
        mealTypeName: 'Dinner',
        shopping: false,
        ...overrides,
    }
}

export function makeAutoMealPlan(overrides: Partial<AutoMealPlan> = {}): AutoMealPlan {
    return {
        startDate: new Date('2026-03-22'),
        endDate: new Date('2026-03-28'),
        mealTypeId: 1,
        keywords: [],
        servings: 4,
        shared: [],
        addshopping: false,
        ...overrides,
    }
}

export function makeShoppingListRecipe(overrides: Partial<ShoppingListRecipe> = {}): ShoppingListRecipe {
    return {
        id: 1,
        name: 'Test Recipe',
        recipe: 1,
        recipeData: makeRecipeOverview(),
        mealPlanData: makeMealPlan(),
        mealplan: undefined,
        servings: 4,
        createdBy: makeUser(),
        ...overrides,
    }
}

export function makeShoppingListEntry(overrides: Partial<ShoppingListEntry> = {}): ShoppingListEntry {
    return {
        id: 1,
        listRecipe: undefined,
        shoppingLists: [],
        food: makeFoodShopping(),
        unit: makeUnit(),
        amount: 1,
        order: 0,
        checked: false,
        ingredient: undefined,
        listRecipeData: makeShoppingListRecipe(),
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeInventoryLocation(overrides: Partial<InventoryLocation> = {}): InventoryLocation {
    return {
        id: 1,
        name: 'Fridge',
        isFreezer: false,
        household: makeHousehold(),
        ...overrides,
    }
}

export function makeInventoryEntry(overrides: Partial<InventoryEntry> = {}): InventoryEntry {
    return {
        id: 1,
        inventoryLocation: makeInventoryLocation(),
        subLocation: '',
        code: '',
        food: makeFood(),
        unit: makeUnit(),
        amount: 1,
        expires: undefined,
        note: '',
        label: 'Test Food - 1 g',
        createdAt: new Date('2026-01-01'),
        createdBy: 1,
        ...overrides,
    }
}

export function makeInventoryLog(overrides: Partial<InventoryLog> = {}): InventoryLog {
    return {
        id: 1,
        entry: makeInventoryEntry(),
        oldAmount: 0,
        newAmount: 1,
        oldInventoryLocation: makeInventoryLocation(),
        newInventoryLocation: makeInventoryLocation(),
        note: '',
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeInviteLink(overrides: Partial<InviteLink> = {}): InviteLink {
    return {
        id: 1,
        uuid: 'test-uuid-1234',
        email: '',
        group: makeGroup(),
        household: makeHousehold(),
        validUntil: undefined,
        usedBy: null,
        reusable: false,
        internalNote: '',
        createdBy: 1,
        createdAt: new Date('2026-01-01'),
        emailSent: false,
        ...overrides,
    }
}

export function makeUserSpace(overrides: Partial<UserSpace> = {}): UserSpace {
    return {
        id: 1,
        user: makeUser(),
        space: 1,
        groups: [makeGroup()],
        household: makeHousehold(),
        active: true,
        internalNote: '',
        inviteLink: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeSpace(overrides: Partial<Space> = {}): Space {
    return {
        id: 1,
        name: 'Test Space',
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        message: '',
        maxRecipes: 0,
        maxFileStorageMb: 0,
        maxUsers: 0,
        allowSharing: true,
        demo: false,
        foodInherit: [],
        userCount: 1,
        recipeCount: 0,
        fileSizeMb: 0,
        aiMonthlyCreditsUsed: 0,
        ...overrides,
    }
}

export function makeSearchPreference(overrides: Partial<SearchPreference> = {}): SearchPreference {
    return {
        user: makeUser(),
        lookup: true,
        unaccent: [],
        icontains: [],
        istartswith: [],
        trigram: [],
        fulltext: [],
        trigramThreshold: 0.1,
        ...overrides,
    }
}

export function makeUserPreference(overrides: Partial<UserPreference> = {}): UserPreference {
    return {
        user: makeUser(),
        theme: undefined,
        navBgColor: '',
        navShowLogo: true,
        defaultUnit: 'g',
        useFractions: false,
        useKj: false,
        navSticky: true,
        ingredientDecimals: 2,
        comments: true,
        shoppingAutoSync: 5,
        mealplanAutoaddShopping: false,
        foodInheritDefault: makeFoodInheritField(),
        foodChildrenExist: false,
        defaultDelay: 4,
        mealplanAutoincludeRelated: true,
        mealplanAutoexcludeOnhand: true,
        shoppingRecentDays: 7,
        csvDelim: ',',
        csvPrefix: '',
        ...overrides,
    }
}

export function makeCookLog(overrides: Partial<CookLog> = {}): CookLog {
    return {
        id: 1,
        recipe: 1,
        servings: 4,
        rating: undefined,
        comment: '',
        createdBy: makeUser(),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeViewLog(overrides: Partial<ViewLog> = {}): ViewLog {
    return {
        id: 1,
        recipe: 1,
        createdBy: 1,
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeCustomFilter(overrides: Partial<CustomFilter> = {}): CustomFilter {
    return {
        id: 1,
        name: 'Test Filter',
        search: 'test',
        shared: [],
        createdBy: 1,
        ...overrides,
    }
}

export function makeAccessToken(overrides: Partial<AccessToken> = {}): AccessToken {
    return {
        id: 1,
        token: 'test-token-abc123',
        expires: new Date('2027-01-01'),
        scope: 'read write',
        created: new Date('2026-01-01'),
        updated: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeAiProvider(overrides: Partial<AiProvider> = {}): AiProvider {
    return {
        id: 1,
        name: 'Test Provider',
        description: '',
        apiKey: '',
        modelName: 'gpt-4',
        url: '',
        logCreditCost: false,
        space: 1,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeAutomation(overrides: Partial<Automation> = {}): Automation {
    return {
        id: 1,
        type: 'FOOD_ALIAS' as any,
        name: 'Test Automation',
        description: '',
        param1: '',
        param2: '',
        param3: '',
        order: 0,
        disabled: false,
        createdBy: 1,
        ...overrides,
    }
}

export function makeConnectorConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
    return {
        id: 1,
        name: 'Test Connector',
        url: '',
        token: '',
        todoEntity: '',
        enabled: true,
        onShoppingListEntryCreatedEnabled: false,
        onShoppingListEntryUpdatedEnabled: false,
        onShoppingListEntryDeletedEnabled: false,
        supportsDescriptionField: false,
        createdBy: 1,
        ...overrides,
    }
}

export function makeStorage(overrides: Partial<Storage> = {}): Storage {
    return {
        id: 1,
        name: 'Test Storage',
        username: '',
        password: '',
        token: '',
        url: '',
        path: '',
        createdBy: 1,
        ...overrides,
    }
}

export function makeSync(overrides: Partial<Sync> = {}): Sync {
    return {
        id: 1,
        storage: makeStorage(),
        path: '/',
        active: true,
        lastChecked: undefined,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeSyncLog(overrides: Partial<SyncLog> = {}): SyncLog {
    return {
        id: 1,
        sync: makeSync(),
        status: 'success',
        msg: '',
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeSupermarket(overrides: Partial<Supermarket> = {}): Supermarket {
    return {
        id: 1,
        name: 'Test Supermarket',
        categoryToSupermarket: [],
        ...overrides,
    }
}

export function makeSupermarketCategoryRelation(overrides: Partial<SupermarketCategoryRelation> = {}): SupermarketCategoryRelation {
    return {
        id: 1,
        category: makeSupermarketCategory(),
        supermarket: 1,
        order: 0,
        ...overrides,
    }
}

export function makeUnitConversion(overrides: Partial<UnitConversion> = {}): UnitConversion {
    return {
        id: 1,
        name: 'g to kg',
        baseAmount: 1000,
        baseUnit: makeUnit({ name: 'g' }),
        convertedAmount: 1,
        convertedUnit: makeUnit({ id: 2, name: 'kg' }),
        food: undefined,
        openDataSlug: '',
        ...overrides,
    }
}

export function makeExportLog(overrides: Partial<ExportLog> = {}): ExportLog {
    return {
        id: 1,
        type: 'default',
        msg: '',
        running: false,
        totalRecipes: 0,
        exportedRecipes: 0,
        cacheDuration: 0,
        possiblyNotExpired: false,
        createdBy: 1,
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeImportLog(overrides: Partial<ImportLog> = {}): ImportLog {
    return {
        id: 1,
        type: 'default',
        msg: '',
        running: false,
        keyword: makeKeyword(),
        totalRecipes: 0,
        importedRecipes: 0,
        createdBy: 1,
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeRecipeImport(overrides: Partial<RecipeImport> = {}): RecipeImport {
    return {
        id: 1,
        name: 'Imported Recipe',
        storage: makeStorage(),
        createdAt: new Date('2026-01-01'),
        ...overrides,
    }
}

export function makeServerSettings(overrides: Partial<ServerSettings> = {}): ServerSettings {
    return {
        shoppingMinAutosyncInterval: '5',
        disableExternalConnectors: false,
        termsUrl: '',
        privacyUrl: '',
        imprintUrl: '',
        hosted: false,
        debug: false,
        version: '1.0.0',
        unauthenticatedThemeFromSpace: 0,
        forceThemeFromSpace: 0,
        ...overrides,
    }
}
