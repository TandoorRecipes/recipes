<template>
    <template v-if="loading || recipes.length > 0">
        <v-row justify="space-between">
            <v-col>
                <h4 @click="openSearch()" class="cursor-pointer">
                    <i :class="icon + ' fa-fw'"></i> {{ title }}
                    <span class="ms-2 text-body-2">{{ $t('More') }} <i class="fa-solid fa-chevron-right"></i></span></h4>
            </v-col>
        </v-row>

        <v-row class="mt-0" v-if="recipeWindows.length > 0">
            <v-col>
                <v-window show-arrows>
                    <v-window-item v-for="(w, i) in recipeWindows" :key="i" class="pt-1 pb-1">
                        <v-row dense>
                            <v-col class="pr-0 pl-0" v-for="r in w" :key="r.id">
                                <recipe-card :recipe="r" :show_description="true" :show-keywords="true"></recipe-card>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>

        <v-row v-if="skeletons > 0 && loading">
            <v-col>
                <v-window>
                    <v-window-item>
                        <v-row>
                            <v-col v-for="n in skeletons" :key="n">
                                <v-skeleton-loader :elevation="3" type="card"></v-skeleton-loader>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>
    </template>
</template>


<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import RecipeCard from "@/components/display/RecipeCard.vue";
import {useDisplay} from "vuetify";
import {ApiApi, ApiRecipeListRequest, Recipe, RecipeOverview} from "@/openapi";
import {homePageCols} from "@/utils/breakpoint_utils";
import {useI18n} from "vue-i18n";
import {DateTime} from "luxon";
import {useRouter} from "vue-router";
import type {StartPageSectionMode} from "@/types/settings";

const MODE_CONFIG: Record<StartPageSectionMode, { icon: string, label: string }> = {
    meal_plan: {icon: 'fa-solid fa-calendar-days', label: 'Meal_Plan'},
    recent: {icon: 'fa-solid fa-eye', label: 'Recently_Viewed'},
    random: {icon: 'fa-solid fa-dice', label: 'Random Recipes'},
    new: {icon: 'fa-solid fa-calendar-alt', label: 'New'},
    rating: {icon: 'fa-solid fa-star', label: 'Rating'},
    keyword: {icon: 'fa-solid fa-tags', label: 'Keyword'},
    created_by: {icon: 'fa-solid fa-user', label: 'Created_By'},
    books: {icon: 'fa-solid fa-book', label: 'Recipe_Book'},
    food: {icon: 'fa-solid fa-carrot', label: 'Food'},
    saved_search: {icon: 'fa-solid fa-filter', label: 'Saved_Filter'},
}

// Modes that fetch a single entity by filterId and query recipes by that entity
type EntityConfig = {
    retrieve: (api: ApiApi, id: number) => Promise<{id?: number, name?: string, label?: string, displayName?: string}>
    param: keyof ApiRecipeListRequest
}

const ENTITY_MODES: Partial<Record<StartPageSectionMode, EntityConfig>> = {
    keyword: {retrieve: (api, id) => api.apiKeywordRetrieve({id}), param: 'keywords'},
    books: {retrieve: (api, id) => api.apiRecipeBookRetrieve({id}), param: 'books'},
    food: {retrieve: (api, id) => api.apiFoodRetrieve({id}), param: 'foods'},
    created_by: {retrieve: (api, id) => api.apiUserRetrieve({id}), param: 'createdby'},
}

//TODO mode ideas "last year/month/cooked long ago"
const props = defineProps<{
    mode: StartPageSectionMode
    skeletons?: number
    filterId?: number
}>()

const {t} = useI18n()
const router = useRouter()
const {name} = useDisplay()

const api = new ApiApi()
const loading = ref(true)
const recipes = ref<(Recipe | RecipeOverview)[]>([])
const entityName = ref('')

const queryParams = ref<Record<string, string | number | number[]>>({})

const title = computed(() => entityName.value || t(MODE_CONFIG[props.mode].label))
const icon = computed(() => MODE_CONFIG[props.mode].icon)
const numberOfCols = computed(() => homePageCols(name.value))

onMounted(() => {
    loadRecipes()
})

/**
 * Fetch a single entity by ID, set display name, then query recipes filtered by that entity.
 */
function loadEntitySection(requestParameters: ApiRecipeListRequest) {
    const config = ENTITY_MODES[props.mode]
    if (!config) return

    if (props.filterId) {
        config.retrieve(api, props.filterId).then((r) => {
            entityName.value = r.label ?? r.displayName ?? r.name ?? ''
            if (config.param === 'createdby') {
                requestParameters.createdby = r.id
            } else {
                (requestParameters as any)[config.param] = [r.id!]
            }
            queryParams.value = {[config.param]: r.id!}
            doRecipeRequest(requestParameters)
        }).catch(() => { loading.value = false })
    } else if (props.mode === 'keyword') {
        api.apiKeywordList({random: "true", limit: "1"}).then((r) => {
            if (r.count > 0) {
                entityName.value = r.results[0].label ?? r.results[0].name ?? ''
                requestParameters.keywords = [r.results[0].id!]
                queryParams.value = {keywords: r.results[0].id!}
                doRecipeRequest(requestParameters)
            } else {
                loading.value = false
            }
        })
    } else if (props.mode === 'created_by') {
        api.apiUserList({}).then((r) => {
            if (r.length > 0) {
                const user = r[Math.floor(Math.random() * r.length)]
                entityName.value = t('CreatedBy') + ' ' + user.displayName
                requestParameters.createdby = user.id
                requestParameters.random = "true"
                queryParams.value = {createdby: user.id!}
                doRecipeRequest(requestParameters)
            } else {
                loading.value = false
            }
        })
    } else {
        loading.value = false
    }
}

function loadRecipes() {
    const requestParameters = {pageSize: 16} as ApiRecipeListRequest

    switch (props.mode) {
        case 'recent':
            requestParameters.numRecent = 16
            queryParams.value = {sortOrder: '-created_at'}
            break
        case 'random':
            requestParameters.random = 'true'
            queryParams.value = {sortOrder: 'random'}
            break
        case 'new':
            requestParameters._new = 'true'
            queryParams.value = {sortOrder: '-created_at', createdonGte: DateTime.now().minus({days: 14}).toISODate()}
            break
        case 'rating': {
            const minRating = props.filterId ?? 4
            requestParameters.rating = minRating
            queryParams.value = {ratingGte: minRating}
            break
        }
        case 'saved_search':
            if (props.filterId) {
                api.apiCustomFilterRetrieve({id: props.filterId}).then((r) => {
                    entityName.value = r.name
                    requestParameters.filter = props.filterId
                    queryParams.value = {}
                    doRecipeRequest(requestParameters)
                }).catch(() => { loading.value = false })
            } else {
                console.debug(`[StartPage] saved_search section has no filterId, skipping`)
                loading.value = false
            }
            return
        default:
            // keyword, books, food, created_by — entity-based modes
            loadEntitySection(requestParameters)
            return
    }
    doRecipeRequest(requestParameters)
}

/**
 * actual request function requesting the recipes from the server based on the given parameters
 * @param params
 */
function doRecipeRequest(params: ApiRecipeListRequest) {
    api.apiRecipeList(params).then((r) => {
        if (props.mode == 'new') {
            recipes.value = r.results.filter(r => r._new)
        } else if (props.mode == 'recent') {
            recipes.value = r.results.filter(r => r.recent != "0")
        } else {
            recipes.value = r.results
        }
    }).finally(() => {
        loading.value = false
    })
}

/**
 * split the list of recipes into windows for display based on column count
 */
let recipeWindows = computed(() => {
    let windows = []
    let current_window = []
    for (const [i, r] of recipes?.value.entries()) {
        current_window.push(r)

        if (i % numberOfCols.value == numberOfCols.value - 1) {
            if (current_window.length > 0) {
                windows.push(current_window)
            }
            current_window = []
        }
    }
    if (current_window.length > 0) {
        windows.push(current_window)
    }
    return windows
})

/**
 * open the advanced search page with the fitting query parameters
 */
function openSearch() {
    router.push({name: 'SearchPage', query: queryParams.value})
}

</script>

<style scoped></style>