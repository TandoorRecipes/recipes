<template>
    <v-container>
        <horizontal-meal-plan-window v-if="useUserPreferenceStore().deviceSettings.start_showMealPlan"></horizontal-meal-plan-window>

        <v-card v-if="totalRecipes == 0" class="mt-5 mb-5">
            <v-card-title><i class="fa-solid fa-eye-slash"></i> {{ $t('search_no_recipes') }}</v-card-title>
            <v-card-text>
                <v-btn-group divided>
                    <v-btn size="large" color="success" prepend-icon="$create" :to="{ name: 'ModelEditPage', params: {model: 'recipe'} }">{{ $t('Create Recipe') }}</v-btn>
                    <v-btn size="large" color="primary" prepend-icon="fa-solid fa-globe" :to="{ name: 'RecipeImportPage', params: {} }">{{ $t('Import Recipe') }}</v-btn>
                </v-btn-group>
            </v-card-text>
        </v-card>

        <horizontal-recipe-scroller :skeletons="4" mode="recent"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="new"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="keyword"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="random"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="created_by"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="2" mode="rating"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="keyword"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="random"></horizontal-recipe-scroller>

        <v-row>
            <v-col class="text-center">
                <v-btn size="x-large" rounded="xl" prepend-icon="$search" variant="tonal" :to="{name: 'SearchPage', params: {query: ''}}">{{ $t('View_Recipes') }}</v-btn>
            </v-col>
        </v-row>


    </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import {ApiApi} from "@/openapi"
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeWindow.vue"
import HorizontalMealPlanWindow from "@/components/display/HorizontalMealPlanWindow.vue"
import SearchPage from "@/pages/SearchPage.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const totalRecipes = ref(-1)

onMounted(() => {
    const api = new ApiApi()

    api.apiRecipeList({pageSize: 1}).then((r) => {
        totalRecipes.value = r.count
    })
})
</script>

<style scoped></style>
