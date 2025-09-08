<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-title>
                <i class="far fa-list-alt fa-fw me-2"></i> {{ $t('StepsOverview') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                    <v-row>
                        <v-col>
                            <v-btn-toggle density="compact" v-model="useUserPreferenceStore().deviceSettings.recipe_mergeStepOverview" border divided>
                                <v-btn :value="false" prepend-icon="fa-solid fa-folder-tree">{{ $t('Structured') }}</v-btn>
                                <v-btn :value="true" prepend-icon="fa-solid fa-arrows-to-circle">{{ $t('Summary') }}</v-btn>
                            </v-btn-toggle>
                        </v-col>
                    </v-row>
                    <v-row v-for="(s, i) in props.steps" v-if="!useUserPreferenceStore().deviceSettings.recipe_mergeStepOverview">
                        <v-col class="pa-1" cols="12" md="6">
                            <b v-if="s.showAsHeader">{{ i + 1 }}. {{ s.name }} </b>
                            <ingredients-table v-model="s.ingredients" :ingredient-factor="props.ingredientFactor"></ingredients-table>

                            <template v-if="s.stepRecipe">
                                <v-card class="ma-2 border-md" prepend-icon="$recipes" :title="s.stepRecipeData.name"
                                        :to="{name: 'RecipeViewPage', params: {id: s.stepRecipeData.id}}" target="_blank">
                                    <v-row v-for="subRecipeStep in s.stepRecipeData.steps">
                                        <v-col>
                                            <ingredients-table v-model="subRecipeStep.ingredients" :ingredient-factor="props.ingredientFactor"></ingredients-table>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </template>
                        </v-col>
                    </v-row>

                    <v-row v-if="useUserPreferenceStore().deviceSettings.recipe_mergeStepOverview">
                        <v-col class="pa-1" cols="12" md="6">
                            <ingredients-table v-model="mergedIngredients" :ingredient-factor="props.ingredientFactor" :show-checkbox="false"></ingredients-table>
                        </v-col>
                    </v-row>

            </v-expansion-panel-text>
        </v-expansion-panel>

    </v-expansion-panels>

</template>

<script setup lang="ts">
import {computed, PropType, ref} from 'vue'
import {Ingredient, Step} from "@/openapi";
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const props = defineProps({
    steps: {
        type: Array as PropType<Array<Step>>,
        default: [],
    },
    ingredientFactor: {
        type: Number,
        required: true,
    },
})

const showMergedIngredients = ref(false)

const mergedIngredients = computed(() => {
    // Function to collect all ingredients from recipe steps
    const getAllIngredients = () => {
        const ingredients: Array<Ingredient> = [];

        // Add ingredients from steps
        props.steps.forEach(step => {
            step.ingredients.forEach(ingredient => {
                if (ingredient.food && !ingredient.isHeader && !ingredient.noAmount) {
                    ingredients.push(ingredient);
                }
            });

            // Add ingredients from step recipes if they exist
            if (step.stepRecipeData) {
                step.stepRecipeData.steps?.forEach((subStep: Step) => {
                    subStep.ingredients.forEach((ingredient: Ingredient) => {
                        if (ingredient.food && !ingredient.isHeader && !ingredient.noAmount) {
                            ingredients.push(ingredient);
                        }
                    });
                });
            }
        });

        return ingredients;
    };

    // Get all ingredients
    const allIngredients = getAllIngredients();

    // Create a map to group and sum ingredients by food and unit
    const groupedIngredients = new Map<string, Ingredient>();

    allIngredients.forEach(ingredient => {
        if (!ingredient.food || !ingredient.unit) return;

        // Create a unique key for food-unit combination
        const key = `${ingredient.food.id}-${ingredient.unit.id}`;

        if (groupedIngredients.has(key)) {
            // If this food-unit combination already exists, sum the amounts
            const existingIngredient = groupedIngredients.get(key)!;
            existingIngredient.amount += ingredient.amount;
        } else {
            // Create a new entry with the adjusted amount
            const clonedIngredient = {...ingredient};
            groupedIngredients.set(key, clonedIngredient);
        }
    });

    // Convert the map back to an array
    const result = Array.from(groupedIngredients.values());

    // Sort alphabetically by food name
    return result.sort((a, b) => {
        const foodNameA = a.food?.name.toLowerCase() || '';
        const foodNameB = b.food?.name.toLowerCase() || '';
        return foodNameA.localeCompare(foodNameB);
    });
})

</script>


<style scoped>

</style>