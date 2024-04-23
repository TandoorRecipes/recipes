<template>

    <template v-if="props.recipe.name != undefined">

        <v-card class="mt-md-4 rounded-0">
            <recipe-image
                max-height="25vh"
                :recipe="props.recipe"
            >
                <template #overlay>
                    <v-chip class="ms-2" color="primary" variant="flat" size="x-small">by {{ props.recipe.createdBy }}</v-chip>
                    <KeywordsComponent variant="flat" class="ms-1 mb-2" :keywords="props.recipe.keywords"></KeywordsComponent>
                </template>
            </recipe-image>


            <v-card>
                <v-sheet class="d-flex align-center">
                    <span class="ps-2 text-h5  flex-grow-1" :class="{'text-truncate': !showFullRecipeName}" @click="showFullRecipeName = !showFullRecipeName">{{ props.recipe.name }}</span>
                    <recipe-context-menu :recipe="recipe"></recipe-context-menu>
                </v-sheet>
            </v-card>
        </v-card>

        <v-card class="mt-1">
            <v-container>
                <v-row class="text-center text-body-2">
                    <v-col class="pt-1 pb-1">
                        <i class="fas fa-cogs fa-fw mr-1"></i> {{ props.recipe.workingTime }} min<br/>
                        <div class="text-grey">Working Time</div>
                    </v-col>
                    <v-col class="pt-1 pb-1">
                        <div><i class="fas fa-hourglass-half fa-fw mr-1"></i> {{ props.recipe.waitingTime }} min</div>
                        <div class="text-grey">Waiting Time</div>
                    </v-col>
                    <v-col class="pt-1 pb-1">
                        <NumberScalerDialog :number="servings" @change="servings = $event.number" title="Servings">
                            <template #activator>
                                <div class="cursor-pointer">
                                    <i class="fas fa-sort-numeric-up fa-fw mr-1"></i> {{ servings }} <br/>
                                    <div class="text-grey"><span v-if="props.recipe?.servingsText">{{ props.recipe.servingsText }}</span><span v-else>Servings</span></div>
                                </div>
                            </template>
                        </NumberScalerDialog>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>

        <v-card class="mt-1" v-if="props.recipe.steps.length > 1">
            <StepsOverview :steps="props.recipe.steps"></StepsOverview>
        </v-card>

        <v-card class="mt-1" v-for="(step, index) in props.recipe.steps" :key="step.id">
            <Step :step="step" :step-number="index+1" :ingredient_factor="ingredientFactor"></Step>
        </v-card>

        <recipe-activity :recipe="recipe"></recipe-activity>
    </template>
</template>

<script setup lang="ts">

import {computed, defineComponent, PropType, ref, watch} from 'vue'
import {ApiApi, Ingredient, Recipe} from "@/openapi"
import KeywordsBar from "@/components/display/KeywordsBar.vue"
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue"
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import StepsOverview from "@/components/display/StepsOverview.vue";
import Step from "@/components/display/Step.vue";
import RecipeActivity from "@/components/display/RecipeActivity.vue";
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeImage from "@/components/display/RecipeImage.vue";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    }
})

const servings = ref(1)
const showFullRecipeName = ref(false)

const ingredientFactor = computed(() => {
    return servings.value / ((props.recipe.servings != undefined) ? props.recipe.servings : 1)
})

watch(() => props.recipe.servings, () => {
    if (props.recipe.servings) {
        servings.value = props.recipe.servings
    }
})

</script>

<style scoped>

</style>