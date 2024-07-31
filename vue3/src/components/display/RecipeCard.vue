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

                    </recipe-image>

                    <v-divider class="p-0" v-if="componentProps.recipe.image == null"></v-divider>

                </template>
                <div v-if="componentProps.recipe.description != null && componentProps.recipe.description != ''">
                    {{ componentProps.recipe.description }}
                </div>
            </v-tooltip>
            <v-card-item>
                <div class="text-rows-2">
                    <h3>{{ componentProps.recipe.name }}</h3>
                </div>
                <!-- TODO decide if context menu should be re-added (maybe make it a setting) -->
                <!-- <recipe-context-menu class="float-end" :recipe="recipe"></recipe-context-menu>-->
            </v-card-item>
            <v-card-text>
                <div class="text-rows-2">
                    <keywords-component variant="outlined" :keywords="componentProps.recipe.keywords">
                        <template #prepend>
                            <v-chip class="mb-1 me-1" size="x-small" prepend-icon="far fa-clock" label variant="outlined" v-if="componentProps.recipe.workingTime != undefined && componentProps.recipe.workingTime > 0">
                                {{ recipe.workingTime! + recipe.waitingTime! }}
                            </v-chip>
                        </template>
                    </keywords-component>
                </div>
            </v-card-text>

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

.text-rows-1 {
    overflow: hidden;
    text-overflow: clip;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
}

.text-rows-2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>