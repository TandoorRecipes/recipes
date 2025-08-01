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

        <template class="d-block d-lg-none">

            <!-- mobile layout -->
            <v-card class="rounded-0">
                <recipe-image
                    max-height="25vh"
                    :recipe="recipe"
                    v-if="recipe.internal"
                >
                </recipe-image>

                <v-card>
                    <v-sheet class="d-flex align-center">
                    <span class="ps-2 text-h5  flex-grow-1 pa-1" :class="{'text-truncate': !showFullRecipeName}" @click="showFullRecipeName = !showFullRecipeName">
                        {{ recipe.name }}
                    </span>
                        <recipe-context-menu :recipe="recipe" v-if="useUserPreferenceStore().isAuthenticated"></recipe-context-menu>
                    </v-sheet>
                    <keywords-component variant="flat" class="ms-1" :keywords="recipe.keywords"></keywords-component>
                    <v-rating v-model="recipe.rating" size="x-small" v-if="recipe.rating" readonly></v-rating>
                    <v-sheet class="ps-2 text-disabled">
                        {{ recipe.description }}
                    </v-sheet>
                </v-card>
            </v-card>

            <template v-if="recipe.internal">
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
            </template>
        </template>
        <!-- Desktop horizontal layout -->
        <template class="d-none d-lg-block">
            <v-row dense>
                <v-col cols="8">
                    <recipe-image
                        :rounded="true"
                        max-height="40vh"
                        :recipe="recipe"
                        v-if="recipe.internal">
                    </recipe-image>
                </v-col>
                <v-col cols="4">
                    <v-card class="h-100 d-flex flex-column">
                        <v-card-text class="flex-grow-1">
                            <div class="d-flex">
                                <h1 class="flex-column flex-grow-1">{{ recipe.name }}</h1>
                                <recipe-context-menu :recipe="recipe" v-if="useUserPreferenceStore().isAuthenticated" class="flex-column mb-auto mt-2 float-right"></recipe-context-menu>
                            </div>
                            <p>
                                {{ $t('created_by') }} {{ recipe.createdBy.displayName }} ({{ DateTime.fromJSDate(recipe.createdAt).toLocaleString(DateTime.DATE_SHORT) }})
                            </p>
                            <p>
                                <i>{{ recipe.description }}</i>
                            </p>

                            <v-rating v-model="recipe.rating" size="x-small" v-if="recipe.rating" readonly></v-rating>

                            <keywords-component variant="flat" class="mt-4" :keywords="recipe.keywords"></keywords-component>

                        </v-card-text>

                        <v-row class="text-center text-body-2 mb-1 flex-grow-0">
                            <v-col>
                                <i class="fas fa-cogs fa-fw mr-1"></i> {{ recipe.workingTime }} {{ $t('min') }}<br/>
                                <div class="text-grey">{{ $t('WorkingTime') }}</div>
                            </v-col>
                            <v-col>
                                <div><i class="fas fa-hourglass-half fa-fw mr-1"></i> {{ recipe.waitingTime }} {{ $t('min') }}</div>
                                <div class="text-grey">{{ $t('WaitingTime') }}</div>
                            </v-col>
                            <v-col>
                                <div class="cursor-pointer">
                                    <i class="fas fa-sort-numeric-up fa-fw mr-1"></i> {{ servings }} <br/>
                                    <div class="text-grey"><span v-if="recipe.servingsText">{{ recipe.servingsText }}</span><span v-else>{{ $t('Servings') }}</span></div>
                                    <number-scaler-dialog :number="servings" @confirm="(s: number) => {servings = s}" title="Servings">
                                    </number-scaler-dialog>
                                </div>
                            </v-col>
                        </v-row>

                    </v-card>

                </v-col>
            </v-row>
        </template>

        <template v-if="!recipe.internal">
            <external-recipe-viewer :recipe="recipe"></external-recipe-viewer>
        </template>
        <template v-else>
            <v-card class="mt-1" v-if="recipe.steps.length > 1 && recipe.showIngredientOverview">
                <steps-overview :steps="recipe.steps" :ingredient-factor="ingredientFactor"></steps-overview>
            </v-card>

            <v-card class="mt-1" v-for="(step, index) in recipe.steps" :key="step.id">
                <step-view v-model="recipe.steps[index]" :step-number="index+1" :ingredientFactor="ingredientFactor"></step-view>
            </v-card>
        </template>

        <property-view v-model="recipe" :servings="servings" v-if="recipe.internal"></property-view>

        <v-card class="mt-2">
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-card
                            variant="outlined"
                            :title="$t('CreatedBy')"
                            :subtitle="recipe.createdBy.displayName"
                            prepend-icon="fa-solid fa-user">
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-card
                            variant="outlined"
                            :title="$t('Created')"
                            :subtitle="DateTime.fromJSDate(recipe.createdAt).toLocaleString(DateTime.DATETIME_MED)"
                            prepend-icon="$create">
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-card
                            variant="outlined"
                            :title="$t('Updated')"
                            :subtitle="DateTime.fromJSDate(recipe.updatedAt).toLocaleString(DateTime.DATETIME_MED)"
                            prepend-icon="$edit">
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="3" v-if="recipe.sourceUrl">
                        <v-card
                            variant="outlined"
                            :title="$t('Imported_From')"
                            prepend-icon="$import">
                            <template #subtitle>
                                <a :href="recipe.sourceUrl" target="_blank">{{ recipe.sourceUrl }}</a>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <recipe-activity :recipe="recipe" v-if="useUserPreferenceStore().userSettings.comments"></recipe-activity>
    </template>
</template>

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {Recipe} from "@/openapi"
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue"
import StepsOverview from "@/components/display/StepsOverview.vue";
import RecipeActivity from "@/components/display/RecipeActivity.vue";
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeImage from "@/components/display/RecipeImage.vue";
import ExternalRecipeViewer from "@/components/display/ExternalRecipeViewer.vue";
import {useMediaQuery, useWakeLock} from "@vueuse/core";
import StepView from "@/components/display/StepView.vue";
import {DateTime} from "luxon";
import PropertyView from "@/components/display/PropertyView.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const {request, release} = useWakeLock()

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

onMounted(() => {
    //keep screen on while viewing a recipe
    request("screen")
})

onBeforeUnmount(() => {
    // allow screen to turn off after leaving the recipe page
    release()
})

</script>

<style scoped>

</style>