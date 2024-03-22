<template>
    <template v-if="!loading">
        <v-card :to="`/recipe/${recipe.id}`" :style="{'height': height}">
            <v-tooltip
                class="align-center justify-center"
                location="top center" origin="overlap"
                no-click-animation
                :open-on-hover="recipe.description != null && recipe.description != ''"
                contained
                opacity="2%"
            >
                <template v-slot:activator="{ props }">
                    <v-img v-if="recipe.image != null" v-bind="props"
                           cover
                           height="60%"
                           :src="recipe.image"
                    ></v-img>
                    <v-img v-else src="../../assets/recipe_no_image.svg" cover v-bind="props"
                           height="60%"></v-img>

                </template>
                <div v-if="recipe.description != null && recipe.description != ''">
                    {{recipe.description}}
                </div>
            </v-tooltip>

            <v-card-item>
                <v-card-title>{{ recipe.name }}</v-card-title>

                <v-card-subtitle v-if="show_keywords">
                    <KeywordsComponent :keywords="recipe.keywords"></KeywordsComponent>
                </v-card-subtitle>
            </v-card-item>

            <v-card-text v-if="show_description">
                <v-row align="center" class="mx-0" v-if="recipe.rating">
                    <v-rating
                        :model-value="recipe.rating"
                        color="amber"
                        density="compact"
                        half-increments
                        readonly
                        size="small"
                    ></v-rating>

                    <div class="text-grey ">
                        {{ recipe.rating }}
                    </div>
                </v-row>

            </v-card-text>

        </v-card>
    </template>
    <template v-else>
        <v-card :style="{'height': height}">
            <v-img src="../../assets/recipe_no_image.svg" cover height="60%"></v-img>
            <v-card-title>
                <v-skeleton-loader type="heading"></v-skeleton-loader>
            </v-card-title>
            <v-card-text>
                <v-skeleton-loader type="subtitle"></v-skeleton-loader>
            </v-card-text>
        </v-card>

    </template>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import {Recipe, RecipeOverview} from "@/openapi";

export default defineComponent({
    name: "RecipeCard",
    components: {KeywordsComponent},
    props: {
        recipe: {type: {} as PropType<Recipe | RecipeOverview>, required: true,},
        loading: {type: Boolean, required: false},
        show_keywords: {type: Boolean, required: false},
        show_description: {type: Boolean, required: false},
        height: {type: String, required: false, default: '25vh'},
    }
})
</script>

<style scoped>

</style>