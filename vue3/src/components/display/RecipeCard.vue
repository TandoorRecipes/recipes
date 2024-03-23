<template>
    <template v-if="!loading">
        <v-card :to="`/recipe/${recipe.id}`" :style="{'height': height}">
            <v-tooltip
                class="align-center justify-center"
                location="top center" origin="overlap"
                no-click-animation
                :open-on-hover="recipe.description != null && recipe.description != ''"
                contained
            >
                <template v-slot:activator="{ props }">
                    <v-img cover
                           height="60%"
                           :src="recipeImageUrl"
                    >
                        <v-chip size="x-small" prepend-icon="fa fa-clock" label color="light" variant="elevated"
                                class="float-start ms-1 mt-1" v-if="recipe.workingTime != undefined && recipe.workingTime > 0">
                            {{ recipe.workingTime }}
                        </v-chip>
                        <v-chip size="x-small" prepend-icon="fa fa-pause" label color="secondary" variant="elevated"
                                class="float-start ms-1 mt-1" v-if="recipe.waitingTime != undefined && recipe.waitingTime > 0">
                            {{ recipe.waitingTime }}
                        </v-chip>
                    </v-img>
                    <v-divider class="p-0" v-if="recipe.image == null"></v-divider>

                </template>
                <div v-if="recipe.description != null && recipe.description != ''">
                    {{ recipe.description }}
                </div>
            </v-tooltip>

            <v-card-item>
                <v-card-title>
                             {{ recipe.name }}
                            <recipe-context-menu class="float-end" :recipe="recipe"></recipe-context-menu>

                </v-card-title>


                <v-card-subtitle v-if="show_keywords">
                    <KeywordsComponent :keywords="recipe.keywords"></KeywordsComponent>
                </v-card-subtitle>
                <v-rating
                    v-if="recipe.rating != null"
                    v-model="recipe.rating"
                    color="amber"
                    density="comfortable"
                    half-increments
                    readonly
                    size="x-small"
                ></v-rating>

            </v-card-item>

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
import recipeNoImage from '@/assets/recipe_no_image.svg';
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";

export default defineComponent({
    name: "RecipeCard",
    components: {RecipeContextMenu, KeywordsComponent},
    props: {
        recipe: {type: {} as PropType<Recipe | RecipeOverview>, required: true,},
        loading: {type: Boolean, required: false},
        show_keywords: {type: Boolean, required: false},
        show_description: {type: Boolean, required: false},
        height: {type: String, required: false, default: '25vh'},
    },
    computed: {
        recipeImageUrl: function () {
            return (this.recipe.image != null) ? this.recipe.image : recipeNoImage
        }
    }
})
</script>

<style scoped>

</style>