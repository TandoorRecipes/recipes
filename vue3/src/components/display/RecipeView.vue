<template>
    <template v-if="recipe.name == undefined">
        <v-skeleton-loader type="card" class="mt-md-4 rounded-0"></v-skeleton-loader>
        <v-skeleton-loader type="article" class="mt-2"></v-skeleton-loader>
        <v-skeleton-loader type="article" class="mt-2"></v-skeleton-loader>
        <v-skeleton-loader type="list-item-avatar-three-line" class="mt-2"></v-skeleton-loader>
        <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
        <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
    </template>

    <template v-if="recipe.name != undefined">
        <v-card class="mt-md-4 rounded-0">
            <recipe-image
                max-height="25vh"
                :recipe="recipe"
                v-if="recipe.internal"
            >
                <template #overlay>
                    <v-chip class="ms-2" color="primary" variant="flat" size="x-small">by {{ recipe.createdBy.displayName }}</v-chip>
                    <keywords-component variant="flat" class="ms-1 mb-2" :keywords="recipe.keywords"></keywords-component>
                </template>
            </recipe-image>


            <v-card>
                <v-sheet class="d-flex align-center">
                    <span class="ps-2 text-h5  flex-grow-1 pa-1" :class="{'text-truncate': !showFullRecipeName}" @click="showFullRecipeName = !showFullRecipeName">
                        {{ recipe.name }}
                    </span>
                    <recipe-context-menu :recipe="recipe"></recipe-context-menu>
                </v-sheet>
            </v-card>
        </v-card>

        <template v-if="!recipe.internal">
            <external-recipe-viewer :recipe="recipe"></external-recipe-viewer>
        </template>

        <template v-else>
            <v-card class="mt-1">
                <v-container>
                    <v-row class="text-center text-body-2">
                        <v-col class="pt-1 pb-1">
                            <i class="fas fa-cogs fa-fw mr-1"></i> {{ recipe.workingTime }} min<br/>
                            <div class="text-grey">{{ $t('WorkingTime') }}</div>
                        </v-col>
                        <v-col class="pt-1 pb-1">
                            <div><i class="fas fa-hourglass-half fa-fw mr-1"></i> {{ recipe.waitingTime }} min</div>
                            <div class="text-grey">{{ $t('WaitingTime') }}</div>
                        </v-col>
                        <v-col class="pt-1 pb-1">

                            <div class="cursor-pointer">
                                <i class="fas fa-sort-numeric-up fa-fw mr-1"></i> {{ servings }} <br/>
                                <div class="text-grey"><span v-if="recipe.servingsText">{{ recipe.servingsText }}</span><span v-else>{{ $t('Servings') }}</span></div>
                                <number-scaler-dialog :number="servings" @confirm="(s: number) => {servings = s}" title="Servings">
                                </number-scaler-dialog>
                            </div>


                        </v-col>
                    </v-row>
                </v-container>
            </v-card>

            <v-card class="mt-1" v-if="recipe.steps.length > 1">
                <steps-overview :steps="recipe.steps" :ingredient-factor="ingredientFactor"></steps-overview>
            </v-card>

            <v-card class="mt-1" v-for="(step, index) in recipe.steps" :key="step.id">
                <step v-model="recipe.steps[index]" :step-number="index+1" :ingredientFactor="ingredientFactor"></step>
            </v-card>
        </template>

        <recipe-activity :recipe="recipe"></recipe-activity>
    </template>
</template>

<script setup lang="ts">

import {computed, ref, watch} from 'vue'
import {Recipe} from "@/openapi"
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue"
import StepsOverview from "@/components/display/StepsOverview.vue";
import Step from "@/components/display/Step.vue";
import RecipeActivity from "@/components/display/RecipeActivity.vue";
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeImage from "@/components/display/RecipeImage.vue";
import ExternalRecipeViewer from "@/components/display/ExternalRecipeViewer.vue";

const recipe = defineModel<Recipe>({required: true})

const servings = ref(1)
const showFullRecipeName = ref(false)

const ingredientFactor = computed(() => {
    return servings.value / ((recipe.value.servings != undefined) ? recipe.value.servings : 1)
})

watch(() => recipe.value.servings, () => {
    if (recipe.value.servings) {
        servings.value = recipe.value.servings
    }
})

</script>

<style scoped>

</style>