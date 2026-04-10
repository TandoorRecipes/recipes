import type {FilterDef, SortDef, ListSettings} from './types'

const KEYWORD_FILTERS: FilterDef[] = [
    {key: 'keywords',          labelKey: 'Keywords',           type: 'tag-select', modelName: 'Keyword', group: 'Content'},
    {key: 'keywordsAnd',       labelKey: 'KeywordsAnd',        type: 'tag-select', modelName: 'Keyword', group: 'Content'},
    {key: 'keywordsOrNot',     labelKey: 'KeywordsOrNot',      type: 'tag-select', modelName: 'Keyword', group: 'Content'},
    {key: 'keywordsAndNot',    labelKey: 'KeywordsAndNot',     type: 'tag-select', modelName: 'Keyword', group: 'Content'},
]

const FOOD_FILTERS: FilterDef[] = [
    {key: 'foods',             labelKey: 'Foods',              type: 'tag-select', modelName: 'Food', group: 'Content'},
    {key: 'foodsAnd',          labelKey: 'FoodsAnd',           type: 'tag-select', modelName: 'Food', group: 'Content'},
    {key: 'foodsOrNot',        labelKey: 'FoodsOrNot',         type: 'tag-select', modelName: 'Food', group: 'Content'},
    {key: 'foodsAndNot',       labelKey: 'FoodsAndNot',        type: 'tag-select', modelName: 'Food', group: 'Content'},
]

const BOOK_FILTERS: FilterDef[] = [
    {key: 'books',             labelKey: 'Books',              type: 'tag-select', modelName: 'RecipeBook', group: 'Content'},
    {key: 'booksAnd',          labelKey: 'BooksAnd',           type: 'tag-select', modelName: 'RecipeBook', group: 'Content'},
    {key: 'booksOrNot',        labelKey: 'BooksOrNot',         type: 'tag-select', modelName: 'RecipeBook', group: 'Content'},
    {key: 'booksAndNot',       labelKey: 'BooksAndNot',        type: 'tag-select', modelName: 'RecipeBook', group: 'Content'},
]


const RATING_FILTERS: FilterDef[] = [
    {key: 'rating',            labelKey: 'Rating',             type: 'rating', group: 'Rating'},
    {key: 'unrated',           labelKey: 'UnratedOnly',        type: 'toggle', group: 'Rating'},
]

const COOKING_FILTERS: FilterDef[] = [
    {key: 'timescooked',       labelKey: 'TimesCooked',        type: 'number-range', group: 'Cooking'},
    {key: 'cookedon',          labelKey: 'CookedOn',           type: 'date-range', group: 'Cooking'},
]

const RECIPE_FILTERS: FilterDef[] = [
    {key: 'servings',          labelKey: 'Servings',           type: 'number-range', group: 'Recipe'},
    {key: 'units',             labelKey: 'Units',              type: 'tag-select', modelName: 'Unit', group: 'Recipe'},
    {key: 'hasPhoto',          labelKey: 'HasPhoto',           type: 'tristate', group: 'Recipe'},
    {key: 'hasKeywords',       labelKey: 'HasKeywords',        type: 'tristate', group: 'Recipe'},
]

const TIME_FILTERS: FilterDef[] = [
    {key: 'workingTime',       labelKey: 'WorkingTime',        type: 'number-range', group: 'Time'},
    {key: 'waitingTime',       labelKey: 'WaitingTime',        type: 'number-range', group: 'Time'},
    {key: 'totalTime',         labelKey: 'TotalTime',          type: 'number-range', group: 'Time'},
]

const DATE_FILTERS: FilterDef[] = [
    {key: 'createdon',         labelKey: 'CreatedOn',          type: 'date-range', group: 'Date'},
    {key: 'updatedon',         labelKey: 'UpdatedOn',          type: 'date-range', group: 'Date'},
    {key: 'viewedon',          labelKey: 'ViewedOn',           type: 'date-range', group: 'Date'},
]

const OTHER_FILTERS: FilterDef[] = [
    {key: 'createdby',         labelKey: 'CreatedBy',          type: 'model-select', modelName: 'User', group: 'Other'},
    {key: 'internal',          labelKey: 'Internal',           type: 'tristate', group: 'Other'},
    {key: 'makenow',           labelKey: 'AvailableToCook',    type: 'tristate', group: 'Other'},
]

export const RECIPE_FILTER_DEFS: FilterDef[] = [
    ...KEYWORD_FILTERS,
    ...FOOD_FILTERS,
    ...BOOK_FILTERS,
    ...RATING_FILTERS,
    ...COOKING_FILTERS,
    ...RECIPE_FILTERS,
    ...TIME_FILTERS,
    ...DATE_FILTERS,
    ...OTHER_FILTERS,
]

export const RECIPE_SORT_DEFS: SortDef[] = [
    {key: 'score',        labelKey: 'Score'},
    {key: 'name',         labelKey: 'Name'},
    {key: 'lastcooked',   labelKey: 'LastCooked',   defaultDescending: true},
    {key: 'rating',       labelKey: 'Rating',        defaultDescending: true},
    {key: 'times_cooked', labelKey: 'TimesCooked',   defaultDescending: true},
    {key: 'created_at',   labelKey: 'CreatedAt',     defaultDescending: true},
    {key: 'lastviewed',   labelKey: 'LastViewed',    defaultDescending: true},
    {key: 'random',       labelKey: 'Random'},
]

export const RECIPE_LIST_SETTINGS: ListSettings = {
    settingsKey: 'search',
    settingsPanel: true,
}
