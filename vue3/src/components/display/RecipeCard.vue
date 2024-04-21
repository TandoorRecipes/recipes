<template>
    <template v-if="!componentProps.loading">
        <v-card :to="`/recipe/${componentProps.recipe.id}`" :style="{'height': componentProps.height}">
            <v-tooltip
                class="align-center justify-center"
                location="top center" origin="overlap"
                no-click-animation
                :open-on-hover="componentProps.recipe.description != null && componentProps.recipe.description != ''"
                contained
            >
                <template v-slot:activator="{ props }">
                    <recipe-image
                        height="60%"
                        width="100%"
                        :recipe="componentProps.recipe"
                    >
                        <template #overlay>
                            <v-chip size="x-small" prepend-icon="fa fa-clock" label color="light" variant="elevated"
                                    class="float-start ms-1 mt-1" v-if="componentProps.recipe.workingTime != undefined && componentProps.recipe.workingTime > 0">
                                {{ recipe.workingTime }}
                            </v-chip>
                            <v-chip size="x-small" prepend-icon="fa fa-pause" label color="secondary" variant="elevated"
                                    class="float-start ms-1 mt-1" v-if="componentProps.recipe.waitingTime != undefined && componentProps.recipe.waitingTime > 0">
                                {{ recipe.waitingTime }}
                            </v-chip>

                            <keywords-component variant="flat" :keywords="componentProps.recipe.keywords"></keywords-component>
                        </template>
                    </recipe-image>

                    <v-divider class="p-0" v-if="componentProps.recipe.image == null"></v-divider>

                </template>
                <div v-if="componentProps.recipe.description != null && componentProps.recipe.description != ''">
                    {{ componentProps.recipe.description }}
                </div>
            </v-tooltip>

            <v-card-item>
                <v-card-title>
                    {{ componentProps.recipe.name }}
                    <recipe-context-menu class="float-end" :recipe="recipe"></recipe-context-menu>
                </v-card-title>
                <v-card-subtitle>by {{ componentProps.recipe.createdBy }}</v-card-subtitle>


                <!--                <v-card-subtitle v-if="show_keywords">-->
                <!--                    <keywords-component :keywords="recipe.keywords"></keywords-component>-->
                <!--                </v-card-subtitle>-->
                <!--                <v-rating-->
                <!--                    v-if="recipe.rating != null"-->
                <!--                    v-model="recipe.rating"-->
                <!--                    color="amber"-->
                <!--                    density="comfortable"-->
                <!--                    half-increments-->
                <!--                    readonly-->
                <!--                    size="x-small"-->
                <!--                ></v-rating>-->

            </v-card-item>

        </v-card>
    </template>
    <template v-else>
        <v-card :style="{'height': componentProps.height}">
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

<script setup lang="ts">
import {PropType} from 'vue'
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import {Recipe, RecipeOverview} from "@/openapi";

import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import RecipeImage from "@/components/display/RecipeImage.vue";

const componentProps = defineProps({
    recipe: {type: {} as PropType<Recipe | RecipeOverview>, required: true,},
    loading: {type: Boolean, required: false},
    show_keywords: {type: Boolean, required: false},
    show_description: {type: Boolean, required: false},
    height: {type: String, required: false, default: '25vh'},
})

</script>

<style scoped>

</style>