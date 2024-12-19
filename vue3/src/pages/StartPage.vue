<template>
    <v-container>
        <horizontal-meal-plan-window></horizontal-meal-plan-window>

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
        <horizontal-recipe-scroller :skeletons="2" mode="rating"></horizontal-recipe-scroller>
        <horizontal-recipe-scroller :skeletons="4" mode="keyword"></horizontal-recipe-scroller>

    </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import {ApiApi} from "@/openapi"
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeWindow.vue"
import HorizontalMealPlanWindow from "@/components/display/HorizontalMealPlanWindow.vue"

const totalRecipes = ref(-1)

onMounted(() => {
    const api = new ApiApi()

    api.apiRecipeList({pageSize: 1}).then((r) => {
        totalRecipes.value = r.count
    })
})
</script>

<style scoped></style>
