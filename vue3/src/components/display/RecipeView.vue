<template>

    <v-img cover lazy :src="recipe.image"></v-img>


    <v-card>

        <v-card-title>{{ recipe.name }}</v-card-title>

        <v-container>
            <v-row class="text-center text-body-2">
                <v-col class="pt-1 pb-1">
                    <i class="fas fa-cogs"></i> {{ recipe.workingTime }} min<br/>
                    <v-label>Working Time</v-label>
                </v-col>
                <v-col class="pt-1 pb-1">
                    <div><i class="fas fa-hourglass-half"></i> {{ recipe.waitingTime }} min</div>
                    <div class="text-grey">Waiting Time</div>
                </v-col>
                <v-col class="pt-1 pb-1">
                    <NumberScalerDialog :number="recipe.servings" @change="recipe.servings = $event.number" title="Servings">
                        <template #activator>
                            <i class="fas fa-calendar-alt"></i> {{ recipe.servings }} <br/>
                            <div class="text-grey"><span v-if="recipe?.servingsText">{{ recipe.servingsText }}</span><span v-else>Servings</span></div>
                        </template>
                    </NumberScalerDialog>


                </v-col>

            </v-row>
        </v-container>

        <v-card-subtitle v-if="recipe?.description"> {{ recipe.description }}</v-card-subtitle>
        <v-card-subtitle>
            <KeywordsBar :keywords="recipe?.keywords"></KeywordsBar>
        </v-card-subtitle>


        <v-card-text>

            <v-chip size="small" color="primary" label>
                <v-icon icon="fa fa-clock" class="mr-2"></v-icon>
                {{ recipe.workingTime }} min
            </v-chip>
            <v-chip size="small" color="primary" label>
                <v-icon icon="fas fa-hourglass-half" class="mr-2"></v-icon>
                {{ recipe.waitingTime }} min
            </v-chip>
            <v-chip size="small" color="primary" label>
                <v-icon icon="fas fa-calendar" class="mr-2"></v-icon>
                {{ recipe.lastCooked }}
            </v-chip>
            <v-rating v-model="recipe.rating" color="tandoor"></v-rating>

        </v-card-text>
    </v-card>

    <v-card class="mt-1">
        <StepsOverview :steps="recipe.steps"></StepsOverview>
    </v-card>


    <v-card class="mt-1" v-for="s in recipe.steps" :key="s.id">
        <Step :step="s"></Step>
    </v-card>

    <RecipeActivity :recipe="recipe"></RecipeActivity>

</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue'
import {ApiApi, Ingredient, Recipe} from "@/openapi"
import KeywordsBar from "@/components/display/KeywordsBar.vue"
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue"
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import StepsOverview from "@/components/display/StepsOverview.vue";
import Step from "@/components/display/Step.vue";
import RecipeActivity from "@/components/display/RecipeActivity.vue";

export default defineComponent({
    name: "RecipeView",
    components: {RecipeActivity, Step, StepsOverview, IngredientsTable, NumberScalerDialog, KeywordsBar},
    computed: {},
    data() {
        return {

        }
    },
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        }
    },
    mounted() {

    },
    methods: {}
})
</script>

<style scoped>

</style>