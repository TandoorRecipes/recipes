<template>

    <template v-if="recipe.name != undefined">


        <v-card class="mt-md-4">

            <v-img max-height="25vh" cover lazy :src="recipe.image" v-if="recipe.image != undefined" class="align-end">
                <KeywordsComponent variant="flat" class="ms-1 mb-2" :keywords="recipe.keywords"></KeywordsComponent>
            </v-img>

            <v-card>
                <v-sheet class="d-flex align-center">
                    <span class="ps-2 text-h5 text-truncate flex-grow-1">{{ recipe.name }}</span>
                    <recipe-context-menu :recipe="recipe"></recipe-context-menu>
                </v-sheet>
            </v-card>

            <!--        <v-card class="mt-1">-->
            <!--            <v-sheet class="d-flex ">-->
            <!--                <span class="ps-2 text-h5 flex-grow-1">{{ recipe.name }}</span>-->
            <!--                <recipe-context-menu :recipe="recipe"></recipe-context-menu>-->
            <!--            </v-sheet>-->
            <!--        </v-card>-->

        </v-card>

        <v-card class="mt-1">
            <v-container>
                <v-row class="text-center text-body-2">
                    <v-col class="pt-1 pb-1">
                        <i class="fas fa-cogs"></i> {{ recipe.workingTime }} min<br/>
                        <div class="text-grey">Working Time</div>
                    </v-col>
                    <v-col class="pt-1 pb-1">
                        <div><i class="fas fa-hourglass-half"></i> {{ recipe.waitingTime }} min</div>
                        <div class="text-grey">Waiting Time</div>
                    </v-col>
                    <v-col class="pt-1 pb-1">
                        <NumberScalerDialog :number="servings" @change="servings = $event.number" title="Servings">
                            <template #activator>
                                <div class="cursor-pointer">
                                    <i class="fas fa-calendar-alt"></i> {{ servings }} <br/>
                                    <div class="text-grey"><span v-if="recipe?.servingsText">{{ recipe.servingsText }}</span><span v-else>Servings</span></div>
                                </div>
                            </template>
                        </NumberScalerDialog>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>

        <v-card class="mt-1" v-if="recipe.steps.length > 1">
            <StepsOverview :steps="recipe.steps"></StepsOverview>
        </v-card>

        <v-card class="mt-1" v-for="s in recipe.steps" :key="s.id">
            <Step :step="s" :ingredient_factor="ingredient_factor"></Step>
        </v-card>

        <!--    <RecipeActivity :recipe="recipe"></RecipeActivity>-->
    </template>
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
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";

export default defineComponent({
    name: "RecipeView",
    components: {KeywordsComponent, RecipeContextMenu, RecipeActivity, Step, StepsOverview, IngredientsTable, NumberScalerDialog, KeywordsBar},
    computed: {
        ingredient_factor: function () {
            return this.servings / this.recipe.servings
        },
    },
    data() {
        return {
            servings: 1,
        }
    },
    watch: {
        'recipe.servings': function () {
            if (this.recipe.servings) {
                this.servings = this.recipe.servings
            }
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