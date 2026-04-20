<template>
    <v-container>
        <!-- Empty state for new users -->
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

        <!-- Configurable sections from user preference -->
        <template v-if="totalRecipes > 0">
            <template v-for="(section, index) in sections" :key="index">
                <horizontal-meal-plan-window
                    v-if="section.mode === 'meal_plan' && section.enabled"
                />
                <horizontal-recipe-scroller
                    v-else-if="section.enabled && isRecipeMode(section.mode) && totalRecipes >= (section.min_recipes ?? 0)"
                    :mode="section.mode"
                    :skeletons="section.mode === 'rating' ? 2 : 4"
                    :filter-id="section.filter_id"
                />
            </template>

            <v-row>
                <v-col class="text-center">
                    <v-btn size="x-large" rounded="xl" prepend-icon="$search" variant="tonal" :to="{name: 'SearchPage'}">{{ $t('View_Recipes') }}</v-btn>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue"
import {ApiApi} from "@/openapi"
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeWindow.vue"
import HorizontalMealPlanWindow from "@/components/display/HorizontalMealPlanWindow.vue"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"
import type {StartPageSection, StartPageSectionMode} from "@/types/settings"

const RECIPE_MODES: Set<string> = new Set(['recent', 'new', 'keyword', 'random', 'created_by', 'rating', 'books', 'food', 'saved_search'])

const totalRecipes = ref(-1)
const userPrefs = useUserPreferenceStore()

const sections = computed<StartPageSection[]>(() => {
    const raw = userPrefs.userSettings?.startPageSections
    if (Array.isArray(raw) && raw.length > 0) return raw
    return defaultSections
})

const defaultSections: StartPageSection[] = [
    {mode: 'meal_plan', enabled: true},
    {mode: 'recent', enabled: true, min_recipes: 10},
    {mode: 'new', enabled: true, min_recipes: 10},
    {mode: 'keyword', enabled: true, min_recipes: 10},
    {mode: 'random', enabled: true, min_recipes: 0},
    {mode: 'created_by', enabled: true, min_recipes: 10},
    {mode: 'rating', enabled: true, min_recipes: 10},
    {mode: 'keyword', enabled: true, min_recipes: 25},
    {mode: 'random', enabled: true, min_recipes: 25},
]

function isRecipeMode(mode: StartPageSectionMode): boolean {
    return RECIPE_MODES.has(mode)
}

// One-time migration: if old device setting disabled meal plan, apply to user preference
onMounted(async () => {
    const api = new ApiApi()
    api.apiRecipeList({pageSize: 1}).then((r) => {
        totalRecipes.value = r.count
    })

    if (userPrefs.deviceSettings.start_showMealPlan === false) {
        const currentSections = sections.value.map(s => ({...s}))
        const mp = currentSections.find(s => s.mode === 'meal_plan')
        if (mp) {
            mp.enabled = false
            try {
                userPrefs.userSettings.startPageSections = currentSections
                await userPrefs.updateUserSettings(true)
            } catch { /* migration best-effort */ }
        }
        userPrefs.deviceSettings.start_showMealPlan = true // reset device setting
    }
})
</script>

<style scoped></style>
