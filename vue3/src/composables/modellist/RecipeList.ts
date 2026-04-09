import type {FilterDef, SortDef, ListSettings} from './types'

const KEYWORD_FILTERS: FilterDef[] = [
    {key: 'keywords',          labelKey: 'Keywords',           type: 'tag-select', modelName: 'Keyword', group: 'Content', hidden: true},
    {key: 'keywordsAnd',       labelKey: 'KeywordsAnd',        type: 'tag-select', modelName: 'Keyword', group: 'Content', hidden: true},
    {key: 'keywordsOrNot',     labelKey: 'KeywordsOrNot',      type: 'tag-select', modelName: 'Keyword', group: 'Content', hidden: true},
    {key: 'keywordsAndNot',    labelKey: 'KeywordsAndNot',     type: 'tag-select', modelName: 'Keyword', group: 'Content', hidden: true},
]

const FOOD_FILTERS: FilterDef[] = [
    {key: 'foods',             labelKey: 'Foods',              type: 'tag-select', modelName: 'Food', group: 'Content', hidden: true},
    {key: 'foodsAnd',          labelKey: 'FoodsAnd',           type: 'tag-select', modelName: 'Food', group: 'Content', hidden: true},
    {key: 'foodsOrNot',        labelKey: 'FoodsOrNot',         type: 'tag-select', modelName: 'Food', group: 'Content', hidden: true},
    {key: 'foodsAndNot',       labelKey: 'FoodsAndNot',        type: 'tag-select', modelName: 'Food', group: 'Content', hidden: true},
]

const BOOK_FILTERS: FilterDef[] = [
    {key: 'books',             labelKey: 'Books',              type: 'tag-select', modelName: 'RecipeBook', group: 'Content', hidden: true},
    {key: 'booksAnd',          labelKey: 'BooksAnd',           type: 'tag-select', modelName: 'RecipeBook', group: 'Content', hidden: true},
    {key: 'booksOrNot',        labelKey: 'BooksOrNot',         type: 'tag-select', modelName: 'RecipeBook', group: 'Content', hidden: true},
    {key: 'booksAndNot',       labelKey: 'BooksAndNot',        type: 'tag-select', modelName: 'RecipeBook', group: 'Content', hidden: true},
]

const SINGLE_CONTENT_FILTERS: FilterDef[] = [
    {key: 'units',             labelKey: 'Units',              type: 'tag-select', modelName: 'Unit', group: 'Content'},
    {key: 'createdby',         labelKey: 'CreatedBy',          type: 'model-select', modelName: 'User', group: 'Activity'},
]

const RATING_FILTERS: FilterDef[] = [
    {key: 'rating',            labelKey: 'Rating',             type: 'number-range', group: 'Rating'},
    {key: 'unrated',           labelKey: 'UnratedOnly',        type: 'tristate', group: 'Rating'},
]

const TIMESCOOKED_FILTERS: FilterDef[] = [
    {key: 'timescooked',       labelKey: 'TimesCooked',        type: 'number-range', group: 'Activity'},
]

const DATE_RANGE_FILTERS: FilterDef[] = [
    {key: 'cookedon',          labelKey: 'CookedOn',           type: 'date-range', group: 'Dates'},
    {key: 'viewedon',          labelKey: 'ViewedOn',           type: 'date-range', group: 'Dates'},
    {key: 'createdon',         labelKey: 'CreatedOn',          type: 'date-range', group: 'Dates'},
    {key: 'updatedon',         labelKey: 'UpdatedOn',          type: 'date-range', group: 'Dates'},
]

const FLAG_FILTERS: FilterDef[] = [
    {key: 'internal',          labelKey: 'Internal',           type: 'tristate', group: 'Flags'},
    {key: 'makenow',           labelKey: 'MakeNow',            type: 'tristate', group: 'Flags'},
    {key: 'includeChildren',   labelKey: 'IncludeChildren',    type: 'tristate', group: 'Flags'},
]

export const RECIPE_FILTER_DEFS: FilterDef[] = [
    ...KEYWORD_FILTERS,
    ...FOOD_FILTERS,
    ...BOOK_FILTERS,
    ...SINGLE_CONTENT_FILTERS,
    ...RATING_FILTERS,
    ...TIMESCOOKED_FILTERS,
    ...DATE_RANGE_FILTERS,
    ...FLAG_FILTERS,
]

export const RECIPE_SORT_DEFS: SortDef[] = [
    {key: 'score',           labelKey: 'SortByScoreAsc'},
    {key: '-score',          labelKey: 'SortByScoreDesc'},
    {key: 'name',            labelKey: 'SortByNameAsc'},
    {key: '-name',           labelKey: 'SortByNameDesc'},
    {key: 'lastcooked',      labelKey: 'SortByLastCookedAsc'},
    {key: '-lastcooked',     labelKey: 'SortByLastCookedDesc'},
    {key: 'rating',          labelKey: 'SortByRatingAsc'},
    {key: '-rating',         labelKey: 'SortByRatingDesc'},
    {key: 'times_cooked',    labelKey: 'SortByTimesCookedAsc'},
    {key: '-times_cooked',   labelKey: 'SortByTimesCookedDesc'},
    {key: 'created_at',      labelKey: 'SortByCreatedAtAsc'},
    {key: '-created_at',     labelKey: 'SortByCreatedAtDesc'},
    {key: 'lastviewed',      labelKey: 'SortByLastViewedAsc'},
    {key: '-lastviewed',     labelKey: 'SortByLastViewedDesc'},
    {key: 'random',          labelKey: 'RandomOrder'},
]

export const RECIPE_LIST_SETTINGS: ListSettings = {
    settingsKey: 'search',
    settingsPanel: true,
}
