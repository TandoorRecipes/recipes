<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6" offset-md="3">
                <v-text-field :label="$t('Search')"
                              v-model="query"
                              :loading="loading"
                              @submit="searchRecipes({page: 1})"
                              @keydown.enter="searchRecipes({page: 1})"
                              @click:clear="query = ''"
                              clearable hide-details>
                    <template v-slot:append>
                        <v-btn @click="panel ='search' " v-if="panel == ''" color="primary" icon><i class="fa-solid fa-caret-down"></i></v-btn>
                        <v-btn @click="panel ='' " v-if="panel == 'search'" color="primary" icon><i class="fa-solid fa-caret-up"></i></v-btn>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col>
                <v-expansion-panels v-model="panel">
                    <v-expansion-panel value="search">
                        <v-expansion-panel-text>
                            <v-form :disabled="loading" class="mt-4">

                                <div v-for="filter in Object.values(filters)" :key="filter.id">
                                    <template v-if="filter.enabled">
                                        <component :="filter" :is="filter.is" density="compact" v-model="filter.modelValue">
                                            <template #append>
                                                <v-btn icon="fa-solid fa-times" size="small" variant="plain"
                                                       @click="filter.enabled = false; filter.modelValue = filter.default"></v-btn>
                                            </template>
                                        </component>
                                    </template>
                                </div>

                                <v-divider class="mt-2 mb-2"></v-divider>

                                <v-autocomplete :items="availableFilters"
                                                @update:model-value="(item:string) =>{ filters[item].enabled = true; nextTick(() => {addFilterSelect = null})}" density="compact"
                                                :label="$t('AddFilter')" v-model="addFilterSelect"></v-autocomplete>

                                <model-select model="CustomFilter" v-model="selectedCustomFilter" density="compact">
                                    <template #append>
                                        <v-btn icon="fa-solid fa-upload" color="warning" :disabled="Object.keys(selectedCustomFilter).length == 0"
                                               @click="loadCustomFilter()"></v-btn>
                                        <v-btn icon="$save" class="ms-1" color="save" @click="saveCustomFilter()"></v-btn>
                                    </template>
                                </model-select>
                            </v-form>
                            <v-row>
                                <v-col cols="6">
                                    <v-select :label="$t('View')" v-model="useUserPreferenceStore().deviceSettings.search_viewMode"
                                              :items="[{title: $t('Table'), value: 'table'}, {title: $t('Cards'), value: 'grid'},]" density="compact"></v-select>
                                </v-col>
                                <v-col cols="6">
                                    <v-select class="float-right" :label="$t('PerPage')" v-model="pageSize" :items="[10,25,50,100]" density="compact"
                                              width="100%"></v-select>
                                </v-col>
                            </v-row>

                        </v-expansion-panel-text>

                        <v-card-actions v-if="panel == 'search'">
                            <v-btn @click="reset()" prepend-icon="fa-solid fa-circle-xmark">{{ $t('Reset') }}</v-btn>
                            <v-btn @click="searchRecipes({page: 1})" prepend-icon="$search">{{ $t('Search') }}</v-btn>
                        </v-card-actions>
                    </v-expansion-panel>
                </v-expansion-panels>

            </v-col>
        </v-row>

        <v-row v-if="recipes.length > 0 && useUserPreferenceStore().deviceSettings.search_viewMode == 'table'">
            <v-col>
                <v-card>
                    <v-data-table-server
                        @update:options="searchRecipes"
                        :loading="loading"
                        :items="recipes"
                        :headers="tableHeaders"
                        :page="page"
                        :items-per-page="pageSize"
                        :items-length="tableItemCount"
                        @click:row="handleRowClick"
                        disable-sort
                        hide-default-header
                        hide-default-footer
                    >
                        <template #item.image="{item}">
                            <v-avatar :image="item.image" size="x-large" class="mt-1 mb-1" v-if="item.image"></v-avatar>
                            <v-avatar color="primary" variant="tonal" size="x-large" class="mt-1 mb-1" v-else>
                                <random-icon></random-icon>
                            </v-avatar>
                        </template>

                        <template #item.keywords="{item}">
                            <keywords-bar :keywords="item.keywords"></keywords-bar>
                        </template>

                        <template #item.action="{item}">
                            <recipe-context-menu :recipe="item"></recipe-context-menu>
                        </template>
                    </v-data-table-server>
                </v-card>
            </v-col>
        </v-row>

        <template v-if="recipes.length > 0 && useUserPreferenceStore().deviceSettings.search_viewMode == 'grid'">
            <v-row>
                <v-col cols="6" md="4" v-for="r in recipes" :key="r.id" class="pa-0">
                    <recipe-card :recipe="r"></recipe-card>
                </v-col>

            </v-row>

        </template>
        <v-row>
            <v-col cols="12" md="6" offset-md="3">
                <v-pagination v-model="page" :length="Math.ceil(tableItemCount/pageSize)"
                              @update:modelValue="searchRecipes({page: page})" class="ms-2 me-2" size="small"
                ></v-pagination>
            </v-col>
        </v-row>


        <v-dialog v-model="dialog">
            <v-card>
                <v-closable-card-title :title="$t('SavedSearch')" v-model="dialog"></v-closable-card-title>
                <v-card-text>
                    <v-text-field :label="$t('Name')" v-model="newFilterName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn prepend-icon="$create" color="create" @click="createCustomFilter()">{{ $t('Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">

import {computed, nextTick, onMounted, ref, toRaw, watch} from "vue";
import {ApiApi, ApiRecipeListRequest, CustomFilter, RecipeOverview} from "@/openapi";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput'
import {VDateInput} from 'vuetify/labs/VDateInput'
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import {useRouter} from "vue-router";
import KeywordsBar from "@/components/display/KeywordsBar.vue";
import {VDataTableUpdateOptions} from "@/vuetify";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {useDisplay} from "vuetify";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useRouteQuery} from "@vueuse/router";
import {stringToBool, toNumberArray} from "@/utils/utils";
import RandomIcon from "@/components/display/RandomIcon.vue";
import {VRating, VSelect, VTextField} from "vuetify/components";
import RatingField from "@/components/inputs/RatingField.vue";

const {t} = useI18n()
const router = useRouter()
const {mdAndUp} = useDisplay()

const query = useRouteQuery('query', "")
const page = useRouteQuery('page', 1, {transform: Number})
const pageSize = useRouteQuery('pageSize', useUserPreferenceStore().deviceSettings.general_tableItemsPerPage, {transform: Number})

/**
 * all filters available to enable
 */
const filters = ref({
    keywords: {
        id: 'keywords',
        label: 'Keyword (any)',
        hint: 'Any of the given keywords',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Keyword',
        modelValue: useRouteQuery('keywords', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    keywordsAnd: {
        id: 'keywordsAnd',
        label: 'Keyword (all)',
        hint: 'All of the given keywords',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Keyword',
        modelValue: useRouteQuery('keywordsAnd', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    keywordsOrNot: {
        id: 'keywordsOrNot',
        label: 'Keyword exclude (any)',
        hint: 'Exclude recipes with any of the given keywords',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Keyword',
        modelValue: useRouteQuery('keywordsOrNot', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    keywordsAndNot: {
        id: 'keywordsAndNot',
        label: 'Keyword exclude (all)',
        hint: 'Exclude recipes with all of the given keywords',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Keyword',
        modelValue: useRouteQuery('keywordsAndNot', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    foods: {
        id: 'foods',
        label: 'Foods (any)',
        hint: 'Any of the given foods',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Food',
        modelValue: useRouteQuery('foods', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    foodsAnd: {
        id: 'foodsAnd',
        label: 'Food (all)',
        hint: 'All of the given foods',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Food',
        modelValue: useRouteQuery('foodsAnd', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    foodsOrNot: {
        id: 'foodsOrNot',
        label: 'Food exclude (any)',
        hint: 'Exclude recipes with any of the given foods',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Food',
        modelValue: useRouteQuery('foodsOrNot', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    foodsAndNot: {
        id: 'foodsAndNot',
        label: 'Food exclude (all)',
        hint: 'Exclude recipes with all of the given foods',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Food',
        modelValue: useRouteQuery('foodsAndNot', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    books: {
        id: 'books',
        label: 'Book (any)',
        hint: 'Recipes that are in any of the given books',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'RecipeBook',
        modelValue: useRouteQuery('books', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    booksAnd: {
        id: 'booksAnd',
        label: 'Book (all)',
        hint: 'Recipes that are in all of the given books',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'RecipeBook',
        modelValue: useRouteQuery('booksAnd', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    booksOrNot: {
        id: 'booksOrNot',
        label: 'Book exclude (any)',
        hint: 'Exclude recipes with any of the given books',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'RecipeBook',
        modelValue: useRouteQuery('booksOrNot', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    booksAndNot: {
        id: 'booksAndNot',
        label: 'Book exclude (all)',
        hint: 'Exclude recipes with all of the given books',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'RecipeBook',
        modelValue: useRouteQuery('booksAndNot', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    createdby: {
        id: 'createdby',
        label: 'Created By',
        hint: 'Recipes created by the selected user',
        enabled: false,
        default: undefined,
        is: ModelSelect,
        model: 'User',
        modelValue: useRouteQuery('createdby', undefined, {transform: Number}),
        mode: 'single',
        object: false,
        searchOnLoad: true
    },
    units: {
        id: 'units',
        label: 'Unit (any)',
        hint: 'Recipes that contain any of the given units',
        enabled: false,
        default: [],
        is: ModelSelect,
        model: 'Unit',
        modelValue: useRouteQuery('units', [], {transform: toNumberArray}),
        mode: 'tags',
        object: false,
        searchOnLoad: true
    },
    internal: {
        id: 'internal',
        label: 'Hide External',
        hint: 'Hide external recipes',
        enabled: false,
        default: "false",
        is: VSelect,
        items: [{value: "true", title: 'Yes'}, {value: "false", title: 'No'}],
        modelValue: useRouteQuery('internal', "false"),
    },
    rating: {
        id: 'rating',
        label: 'Rating (exact)',
        hint: 'Recipes with the exact rating',
        enabled: false,
        default: undefined,
        is: RatingField,
        modelValue: useRouteQuery('rating', undefined, {transform: Number}),
    },
    ratingGte: {
        id: 'ratingGte',
        label: 'Rating (>=)',
        hint: 'Recipes with the given or a greater rating',
        enabled: false,
        default: undefined,
        is: RatingField,
        modelValue: useRouteQuery('ratingGte', undefined, {transform: Number}),
    },
    ratingLte: {
        id: 'ratingLte',
        label: 'Rating (<=)',
        hint: 'Recipes with the given or a smaller rating',
        enabled: false,
        default: undefined,
        is: RatingField,
        modelValue: useRouteQuery('ratingLte', undefined, {transform: Number}),
    },
    timescookedGte: {
        id: 'timescookedGte',
        label: 'Times Cooked (>=)',
        hint: 'Recipes that were cooked at least X times',
        enabled: false,
        default: undefined,
        is: VNumberInput,
        modelValue: useRouteQuery('timescookedGte', undefined, {transform: Number}),
    },
    timescookedLte: {
        id: 'timescookedLte',
        label: 'Times Cooked (<=)',
        hint: 'Recipes that were cooked at most X times',
        enabled: false,
        default: undefined,
        is: VNumberInput,
        modelValue: useRouteQuery('timescookedLte', undefined, {transform: Number}),
    },
    makenow: {
        id: 'makenow',
        label: 'Foods on Hand',
        hint: 'Only recipes were all foods (or its substitutes) are marked as on hand',
        enabled: false,
        default: "false",
        is: VSelect,
        items: [{value: "true", title: 'Yes'}, {value: "false", title: 'No'}],
        modelValue: useRouteQuery('makenow', "false"),
    },

    // cookedonGte: {
    //     id: 'cookedonGte',
    //     label: 'Cooked after',
    //     hint: 'Only recipes that were cooked on or after the given date.',
    //     enabled: false,
    //     default: null,
    //     is: VTextField,
    //     type: "date",
    //     modelValue: useRouteQuery('cookedonGte', null, {transform: Date}),
    // },
    // cookedonLte: {
    //     id: 'cookedonLte',
    //     label: 'Cooked before',
    //     hint: 'Only recipes that were cooked on or before the given date.',
    //     enabled: false,
    //     default: null,
    //     is: VDateInput,
    //     modelValue: useRouteQuery('cookedonLte', null, {transform: Date}),
    // },
})

/**
 * filters that are not yet enabled
 */
const availableFilters = computed(() => {
    let f: Array<{ value: string, title: string }> = []
    Object.entries(filters.value).forEach((entry) => {
        let [key, filter] = entry
        if (!filter.enabled) {
            f.push({value: filter.id, title: filter.label})
        }
    })
    return f
})

const loading = ref(false)
const dialog = ref(false)
const panel = ref('')
const addFilterSelect = ref<string | null>(null)

const tableHeaders = computed(() => {
    let headers = [
        {title: t('Image'), width: '1%', noBreak: true, key: 'image',},
        {title: t('Name'), key: 'name',},
    ]
    if (mdAndUp.value) {
        headers.push({title: t('Keywords'), key: 'keywords',},)
    }
    headers.push({title: t('Actions'), key: 'action', width: '1%', noBreak: true, align: 'end'},)

    return headers
})

const tableItemCount = ref(0)

const recipes = ref([] as RecipeOverview[])
const selectedCustomFilter = ref({} as CustomFilter)
const newFilterName = ref('')

/**
 * handle query updates when using the GlobalSearchDialog on the search page directly
 */
// TODO this also makes the search update on every stroke, do we want this?
watch(() => query.value, () => {
    searchRecipes({page: 1})
})

/**
 * perform initial search on mounted
 */
onMounted(() => {
    enableFiltersWithValues()
    searchRecipes({page: page.value})
})

/**
 * perform the recipe search with the given options
 * @param options
 */
function searchRecipes(options: VDataTableUpdateOptions) {
    let api = new ApiApi()
    loading.value = true

    let searchParameters = {
        query: query.value,
        page: page.value,
        pageSize: pageSize.value,
    } as ApiRecipeListRequest

    Object.values(filters.value).forEach((filter) => {
        if (!isFilterDefaultValue(filter)) {
            searchParameters[filter.id] = filter.modelValue
        }
    })

    api.apiRecipeList(searchParameters).then((r) => {
        recipes.value = r.results
        tableItemCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
        window.scrollTo({top: 0, behavior: 'smooth'})
    })
}

/**
 * reset all search parameters and perform emtpy searchj
 */
function reset() {
    page.value = 1
    query.value = ''
    Object.values(filters.value).forEach((filter) => {
        filter.enabled = false
        filter.modelValue = filter.default
    })
    recipes.value = []
    searchRecipes({page: 1})
}

/**
 * handle clicking a table row by opening the selected recipe
 * @param event
 * @param data
 */
function handleRowClick(event: PointerEvent, data: any) {
    router.push({name: 'RecipeViewPage', params: {id: recipes.value[data.index].id}})
}

/**
 * enable UI of filters that have a value that is not the default for the given filter
 */
function enableFiltersWithValues() {
    Object.values(filters.value).forEach((filter) => {
        if (!isFilterDefaultValue(filter)) {
            filter.enabled = true
        }
    })
}

/**
 * determines if the current value of a filter is its default value
 * @param filter
 */
function isFilterDefaultValue(filter: any) {
    if (Array.isArray(filter.default) && Array.isArray(filter.modelValue)) {
        return filter.default.length == filter.modelValue.length
    } else if (isNaN(filter.default) && isNaN(filter.modelValue)) {
        return true
    } else {
        return toRaw(filter.default) === filter.modelValue
    }
}

// -------------------------------------------
// --------- Logic for saved filters ---------
// -------------------------------------------

/**
 * triggered by save button, if filter exists update it, if not open dialog to create a new filter
 */
function saveCustomFilter() {
    let api = new ApiApi()

    if (Object.keys(selectedCustomFilter.value).length > 0) {
        loading.value = true
        selectedCustomFilter.value.search = JSON.stringify(apiRecipeListRequestToCustomFilter())
        api.apiCustomFilterUpdate({id: selectedCustomFilter.value.id!, customFilter: selectedCustomFilter.value}).then((r) => {
            selectedCustomFilter.value = r
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    } else {
        dialog.value = true
    }
}

/**
 * create new filter
 */
function createCustomFilter() {
    let api = new ApiApi()

    dialog.value = false
    loading.value = true
    api.apiCustomFilterCreate({customFilter: {name: newFilterName.value, search: JSON.stringify(apiRecipeListRequestToCustomFilter())} as CustomFilter}).then((r) => {
        selectedCustomFilter.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function loadCustomFilter() {
    let obj = customFilterToApiRecipeListRequest(selectedCustomFilter.value.search)
    console.log(obj, selectedCustomFilter.value.search)
    Object.keys(obj).forEach((key) => {
        urlSearchParams[key] = obj[key]
    })
}


// TODO temporary function to convert old saved search format, either make proper db table or convert to native new format
/**
 * turn data in the format of a CustomFilter into the format needed for api request
 * @param customFilterParams
 */
function customFilterToApiRecipeListRequest(customFilterParams: any) {
    let recipeListRequestParams: any = {};
    customFilterParams = JSON.parse(customFilterParams)

    if (customFilterParams['books'] != null) {
        recipeListRequestParams['books'] = customFilterParams['books'];
    }

    if (customFilterParams['books_and'] != null) {
        recipeListRequestParams['booksAnd'] = customFilterParams['books_and'];
    }

    if (customFilterParams['books_and_not'] != null) {
        recipeListRequestParams['booksAndNot'] = customFilterParams['books_and_not'];
    }

    if (customFilterParams['books_or'] != null) {
        recipeListRequestParams['booksOr'] = customFilterParams['books_or'];
    }

    if (customFilterParams['books_or_not'] != null) {
        recipeListRequestParams['booksOrNot'] = customFilterParams['books_or_not'];
    }

    if (customFilterParams['cookedon'] != null) {
        recipeListRequestParams['cookedon'] = customFilterParams['cookedon'];
    }

    if (customFilterParams['createdon'] != null) {
        recipeListRequestParams['createdon'] = customFilterParams['createdon'];
    }

    if (customFilterParams['foods'] != null) {
        recipeListRequestParams['foods'] = customFilterParams['foods'];
    }

    if (customFilterParams['foods_and'] != null) {
        recipeListRequestParams['foodsAnd'] = customFilterParams['foods_and'];
    }

    if (customFilterParams['foods_and_not'] != null) {
        recipeListRequestParams['foodsAndNot'] = customFilterParams['foods_and_not'];
    }

    if (customFilterParams['foods_or'] != null) {
        recipeListRequestParams['foodsOr'] = customFilterParams['foods_or'];
    }

    if (customFilterParams['foods_or_not'] != null) {
        recipeListRequestParams['foodsOrNot'] = customFilterParams['foods_or_not'];
    }

    if (customFilterParams['internal'] != null) {
        recipeListRequestParams['internal'] = customFilterParams['internal'];
    }

    if (customFilterParams['keywords'] != null) {
        recipeListRequestParams['keywords'] = customFilterParams['keywords'];
    }

    if (customFilterParams['keywords_and'] != null) {
        recipeListRequestParams['keywordsAnd'] = customFilterParams['keywords_and'];
    }

    if (customFilterParams['keywords_and_not'] != null) {
        recipeListRequestParams['keywordsAndNot'] = customFilterParams['keywords_and_not'];
    }

    if (customFilterParams['keywords_or'] != null) {
        recipeListRequestParams['keywordsOr'] = customFilterParams['keywords_or'];
    }

    if (customFilterParams['keywords_or_not'] != null) {
        recipeListRequestParams['keywordsOrNot'] = customFilterParams['keywords_or_not'];
    }

    if (customFilterParams['makenow'] != null) {
        recipeListRequestParams['makenow'] = customFilterParams['makenow'];
    }

    if (customFilterParams['new'] != null) {
        recipeListRequestParams['_new'] = customFilterParams['new'];
    }

    if (customFilterParams['num_recent'] != null) {
        recipeListRequestParams['numRecent'] = customFilterParams['num_recent'];
    }

    if (customFilterParams['page'] != null) {
        recipeListRequestParams['page'] = customFilterParams['page'];
    }

    if (customFilterParams['page_size'] != null) {
        recipeListRequestParams['pageSize'] = customFilterParams['page_size'];
    }

    if (customFilterParams['query'] != null) {
        recipeListRequestParams['query'] = customFilterParams['query'];
    }

    if (customFilterParams['random'] != null) {
        recipeListRequestParams['random'] = customFilterParams['random'];
    }

    if (customFilterParams['rating'] != null) {
        recipeListRequestParams['rating'] = customFilterParams['rating'];
    }

    if (customFilterParams['timescooked'] != null) {
        recipeListRequestParams['timescooked'] = customFilterParams['timescooked'];
    }

    if (customFilterParams['units'] != null) {
        recipeListRequestParams['units'] = customFilterParams['units'];
    }

    if (customFilterParams['updatedon'] != null) {
        recipeListRequestParams['updatedon'] = customFilterParams['updatedon'];
    }

    if (customFilterParams['viewedon'] != null) {
        recipeListRequestParams['viewedon'] = customFilterParams['viewedon'];
    }

    return recipeListRequestParams

}

function apiRecipeListRequestToCustomFilter() {
    let customFilterParams: any = {};

    if (urlSearchParams['books'] != null) {
        customFilterParams['books'] = urlSearchParams['books'];
    }

    if (urlSearchParams['booksAnd'] != null) {
        customFilterParams['books_and'] = urlSearchParams['booksAnd'];
    }

    if (urlSearchParams['booksAndNot'] != null) {
        customFilterParams['books_and_not'] = urlSearchParams['booksAndNot'];
    }

    if (urlSearchParams['booksOr'] != null) {
        customFilterParams['books_or'] = urlSearchParams['booksOr'];
    }

    if (urlSearchParams['booksOrNot'] != null) {
        customFilterParams['books_or_not'] = urlSearchParams['booksOrNot'];
    }

    if (urlSearchParams['cookedon'] != null) {
        customFilterParams['cookedon'] = urlSearchParams['cookedon'];
    }

    if (urlSearchParams['createdon'] != null) {
        customFilterParams['createdon'] = urlSearchParams['createdon'];
    }

    if (urlSearchParams['foods'] != null) {
        customFilterParams['foods'] = urlSearchParams['foods'];
    }

    if (urlSearchParams['foodsAnd'] != null) {
        customFilterParams['foods_and'] = urlSearchParams['foodsAnd'];
    }

    if (urlSearchParams['foodsAndNot'] != null) {
        customFilterParams['foods_and_not'] = urlSearchParams['foodsAndNot'];
    }

    if (urlSearchParams['foodsOr'] != null) {
        customFilterParams['foods_or'] = urlSearchParams['foodsOr'];
    }

    if (urlSearchParams['foodsOrNot'] != null) {
        customFilterParams['foods_or_not'] = urlSearchParams['foodsOrNot'];
    }

    if (urlSearchParams['internal'] != null) {
        customFilterParams['internal'] = urlSearchParams['internal'];
    }

    if (urlSearchParams['keywords'] != null) {
        customFilterParams['keywords'] = urlSearchParams['keywords'];
    }

    if (urlSearchParams['keywordsAnd'] != null) {
        customFilterParams['keywords_and'] = urlSearchParams['keywordsAnd'];
    }

    if (urlSearchParams['keywordsAndNot'] != null) {
        customFilterParams['keywords_and_not'] = urlSearchParams['keywordsAndNot'];
    }

    if (urlSearchParams['keywordsOr'] != null) {
        customFilterParams['keywords_or'] = urlSearchParams['keywordsOr'];
    }

    if (urlSearchParams['keywordsOrNot'] != null) {
        customFilterParams['keywords_or_not'] = urlSearchParams['keywordsOrNot'];
    }

    if (urlSearchParams['makenow'] != null) {
        customFilterParams['makenow'] = urlSearchParams['makenow'];
    }

    if (urlSearchParams['_new'] != null) {
        customFilterParams['new'] = urlSearchParams['_new'];
    }

    if (urlSearchParams['numRecent'] != null) {
        customFilterParams['num_recent'] = urlSearchParams['numRecent'];
    }

    if (urlSearchParams['page'] != null) {
        customFilterParams['page'] = urlSearchParams['page'];
    }

    if (urlSearchParams['pageSize'] != null) {
        customFilterParams['page_size'] = urlSearchParams['pageSize'];
    }

    if (urlSearchParams['query'] != null) {
        customFilterParams['query'] = urlSearchParams['query'];
    }

    if (urlSearchParams['random'] != null) {
        customFilterParams['random'] = urlSearchParams['random'];
    }

    if (urlSearchParams['rating'] != null) {
        customFilterParams['rating'] = urlSearchParams['rating'];
    }

    if (urlSearchParams['timescooked'] != null) {
        customFilterParams['timescooked'] = urlSearchParams['timescooked'];
    }

    if (urlSearchParams['units'] != null) {
        customFilterParams['units'] = urlSearchParams['units'];
    }

    if (urlSearchParams['updatedon'] != null) {
        customFilterParams['updatedon'] = urlSearchParams['updatedon'];
    }

    if (urlSearchParams['viewedon'] != null) {
        customFilterParams['viewedon'] = urlSearchParams['viewedon'];
    }

    return customFilterParams
}

</script>

<style scoped>

</style>