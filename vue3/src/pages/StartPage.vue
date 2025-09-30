<template>
    <v-container>
        <horizontal-meal-plan-window v-if="useUserPreferenceStore().deviceSettings.start_showMealPlan"></horizontal-meal-plan-window>

        <v-card v-if="totalRecipes == 0" class="mt-5 mb-5">
            <v-card-title class="text-center"><i class="fa-solid fa-eye-slash"></i> {{ $t('search_no_recipes') }}</v-card-title>
            <v-card-text>
                <v-card
                    :title="$t('Create Recipe')"
                    variant="outlined"
                    :to="{name: 'ModelEditPage', params: {model: 'Recipe'}}"
                    prepend-icon="$recipes"
                    append-icon="fa-solid fa-arrow-right"
                    class="mb-4">
                    <template #subtitle>
                        <p class="text-wrap">
                            {{ $t('CreateFirstRecipe') }}
                        </p>
                    </template>
                </v-card>

                <v-card
                    :title="$t('Import')"
                    variant="outlined"
                    :to="{name: 'RecipeImportPage', params: {}}"
                    prepend-icon="$import"
                    append-icon="fa-solid fa-arrow-right">
                    <template #subtitle>
                        <p class="text-wrap">
                            {{ $t('ImportFirstRecipe') }}
                        </p>
                    </template>
                </v-card>
            </v-card-text>
        </v-card>
        <template v-if="totalRecipes > 0">
            <horizontal-recipe-scroller :skeletons="4" mode="recent" v-if="totalRecipes > 5"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="new"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="keyword" v-if="totalRecipes > 10"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="random"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="created_by" v-if="totalRecipes > 5"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="2" mode="rating" v-if="totalRecipes > 5"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="keyword" v-if="totalRecipes > 5"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="random" v-if="totalRecipes > 25"></horizontal-recipe-scroller>

            <v-row>
                <v-col class="text-center">
                    <v-btn size="x-large" rounded="xl" prepend-icon="$search" variant="tonal" :to="{name: 'SearchPage', params: {query: ''}}">{{ $t('View_Recipes') }}</v-btn>
                </v-col>
            </v-row>

        </template>


    </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import {ApiApi} from "@/openapi"
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeWindow.vue"
import HorizontalMealPlanWindow from "@/components/display/HorizontalMealPlanWindow.vue"
import SearchPage from "@/pages/SearchPage.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useRouter} from "vue-router";

const totalRecipes = ref(-1)

onMounted(() => {
    const api = new ApiApi()

    api.apiRecipeList({pageSize: 1}).then((r) => {
        totalRecipes.value = r.count
    })
})
</script>

<style scoped></style>
