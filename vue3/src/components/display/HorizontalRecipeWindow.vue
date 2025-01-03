<template>
    <template v-if="loading || recipes.length > 0">
        <v-row justify="space-between">
            <v-col>
                <h4><i :class="icon + ' fa-fw'"></i> {{ title }}</h4>
            </v-col>
        </v-row>

        <v-row class="mt-0" v-if="recipeWindows.length > 0">
            <v-col>
                <v-window show-arrows>
                    <v-window-item v-for="w in recipeWindows" class="pt-1 pb-1">
                        <v-row dense>
                            <v-col class="pr-0 pl-0" v-for="r in w" :key="r.id">
                                <recipe-card :recipe="r" :show_description="true" :show_keywords="true" style="height: 20vh"></recipe-card>
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
                            <v-col v-for="n in skeletons">
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
import {computed, onMounted, PropType, ref, toRefs} from 'vue'
import RecipeCard from "@/components/display/RecipeCard.vue";
import {DisplayBreakpoint, useDisplay} from "vuetify";
import {ApiApi, ApiRecipeListRequest, Keyword, Recipe, RecipeOverview} from "@/openapi";
import {homePageCols} from "@/utils/breakpoint_utils";
import {useI18n} from "vue-i18n";
import {DateTime} from "luxon";

//TODO mode ideas "last year/month/cooked long ago"
const props = defineProps(
    {
        mode: {type: String as PropType<'recent' | 'new' | 'keyword' | 'rating'>, required: true},
        skeletons: {type: Number, default: 0},
    }
)

const {t} = useI18n()
const {name} = useDisplay()

const loading = ref(true)
const recipes = ref([] as Recipe[] | RecipeOverview[])
const keyword = ref({} as Keyword)

/**
 * determine title based on type
 */
const title = computed(() => {
    switch (props.mode) {
        case 'recent':
            return t('Recently_Viewed')
        case 'new':
            return t('New')
        case 'rating':
            return t('Rating')
        case 'keyword':
            if (Object.keys(keyword.value).length > 0) {
                return keyword.value.label
            }
            return t('Keyword')
    }
})

/**
 * determine icon based on type
 */
const icon = computed(() => {
    switch (props.mode) {
        case 'recent':
            return 'fa-solid fa-eye'
        case 'new':
            return 'fa-solid fa-calendar-alt'
        case 'rating':
            return 'fa-solid fa-star'
        case 'keyword':
            return 'fa-solid fa-tags'
    }
})

/**
 * number of columns to show depending on display size
 */
const numberOfCols = computed(() => {
    return homePageCols(name.value)
})

onMounted(() => {
    loadRecipes()
})

/**
 * load recipes depending on type by creating request parameters and executing request function
 */
function loadRecipes() {
    let api = new ApiApi()
    let requestParameters = {pageSize: 16} as ApiRecipeListRequest

    switch (props.mode) {
        case 'recent':
            // TODO implement correct parameter
            requestParameters.numRecent = 16
            break;
        case 'new':
            requestParameters._new = 'true'
            break;
        case 'rating':
            requestParameters.rating = 4
            break;
        case 'keyword':
            api.apiKeywordList({random: "true", limit: "1"}).then((r) => {
                if (r.count > 0) {
                    keyword.value = r.results[0]
                    requestParameters.keywords = [keyword.value.id!]
                    doRecipeRequest(requestParameters)
                } else {
                    loading.value = false
                }
            })
            return;
    }
    doRecipeRequest(requestParameters)
}

/**
 * actual request function requesting the recipes from the server based on the given parameters
 * @param params
 */
function doRecipeRequest(params: ApiRecipeListRequest) {
    let api = new ApiApi()

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

</script>


<style scoped>

</style>