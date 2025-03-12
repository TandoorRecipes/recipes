<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6" offset-md="3">
                <v-text-field :label="$t('Search')"
                              v-model="urlSearchParams.query"
                              :loading="loading"
                              @submit="searchRecipes({page: 1})"
                              @keydown.enter="searchRecipes({page: 1})"
                              clearable hide-details>
                    <template v-slot:append>
                        <v-btn @click="panel ='search' " v-if="panel == ''" color="primary" icon><i class="fa-solid fa-caret-down"></i></v-btn>
                        <v-btn @click="panel ='' " v-if="panel == 'search'" color="primary" icon><i class="fa-solid fa-caret-up"></i></v-btn>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-expansion-panels v-model="panel">
                    <v-expansion-panel value="search">
                        <v-expansion-panel-text>
                            <v-form :disabled="loading">

                                <model-select model="Keyword" mode="tags" v-model="urlSearchParams.keywords" :object="false"></model-select>
                                <model-select model="Food" mode="tags" v-model="urlSearchParams.foods" :object="false"></model-select>
                                <model-select model="Unit" mode="tags" v-model="urlSearchParams.units" :object="false"></model-select>
                                <model-select model="RecipeBook" mode="tags" v-model="urlSearchParams.books" :object="false"></model-select>

                                <!--                            <v-number-input :label="$t('times_cooked')" v-model="searchParameters.timescooked" clearable></v-number-input>-->
                                <!--                            <v-date-input  :label="$t('last_cooked')" v-model="searchParameters.cookedon" clearable></v-date-input>-->
                                <!--                            <v-date-input :label="$t('last_viewed')" v-model="searchParameters.viewedon" clearable></v-date-input>-->
                                <!--                            <v-date-input :label="$t('created_on')" v-model="searchParameters.createdon" clearable></v-date-input>-->
                                <!--                            <v-date-input :label="$t('updatedon')" v-model="searchParameters.updatedon" clearable></v-date-input>-->

                                <v-checkbox :label="$t('make_now')" v-model="urlSearchParams.makenow"></v-checkbox>

                                <model-select model="CustomFilter" v-model="selectedCustomFilter">
                                    <template #append>
                                        <v-btn icon="fa-solid fa-upload" color="warning" :disabled="Object.keys(selectedCustomFilter).length == 0"
                                               @click="loadCustomFilter()"></v-btn>
                                        <v-btn icon="$save" class="ms-1" color="save" @click="saveCustomFilter()"></v-btn>
                                    </template>
                                </model-select>
                            </v-form>

                        </v-expansion-panel-text>

                        <v-card-actions v-if="panel == 'search'">
                            <v-btn @click="reset()" prepend-icon="fa-solid fa-circle-xmark" :disabled="Object.keys(urlSearchParams).length == 0">{{ $t('Reset') }}</v-btn>
                            <v-btn @click="searchRecipes({page: 1})" prepend-icon="$search">{{ $t('Search') }}</v-btn>
                        </v-card-actions>
                    </v-expansion-panel>
                </v-expansion-panels>

            </v-col>
        </v-row>

        <v-row v-if="recipes.length > 0">
            <v-col>
                <v-card>
                    <v-data-table-server
                        @update:options="searchRecipes"
                        :loading="loading"
                        :items="recipes"
                        :headers="tableHeaders"
                        :page="urlSearchParams.page"
                        :items-per-page="urlSearchParams.pageSize"
                        :items-length="tableItemCount"
                        @click:row="handleRowClick"
                        disable-sort
                    >
                        <template #item.image="{item}">
                            <v-avatar :image="item.image"></v-avatar>
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

import {onMounted, ref, watch} from "vue";
import {ApiApi, ApiRecipeListRequest, CustomFilter, RecipeOverview} from "@/openapi";
import {useUrlSearchParams} from "@vueuse/core";
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

const {t} = useI18n()
const router = useRouter()
const urlSearchParams = useUrlSearchParams('history', {})

const loading = ref(false)
const dialog = ref(false)
const panel = ref('')

const tableHeaders = [
    {title: t('Image'), width: '1%', noBreak: true, key: 'image',},
    {title: t('Name'), key: 'name',},
    {title: t('Keywords'), key: 'keywords',},
    {title: t('Actions'), key: 'action', width: '1%', noBreak: true, align: 'end'},
]

const tableItemCount = ref(0)

const recipes = ref([] as RecipeOverview[])
const selectedCustomFilter = ref({} as CustomFilter)
const newFilterName = ref('')

onMounted(() => {
    urlSearchParams.page = 1
    searchRecipes({page: 1})
})

function searchRecipes(options: VDataTableUpdateOptions) {
    let api = new ApiApi()
    loading.value = true

    urlSearchParams.page = options.page
    if (options.itemsPerPage) {
        urlSearchParams.pageSize = options.itemsPerPage
    }

    let searchParameters = {} as ApiRecipeListRequest
    Object.keys(urlSearchParams).forEach(key => {
        searchParameters[key] = urlSearchParams[key]
    })

    api.apiRecipeList(searchParameters).then((r) => {
        recipes.value = r.results
        tableItemCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function reset() {
    Object.keys(urlSearchParams).forEach(key => {
        delete urlSearchParams[key]
    })
    recipes.value = []
}

function handleRowClick(event: PointerEvent, data: any) {
    router.push({name: 'view_recipe', params: {id: recipes.value[data.index].id}})
}

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