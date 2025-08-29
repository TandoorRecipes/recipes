<template>
    <template v-if="!props.loading">

        <router-link :to="{name: 'RecipeViewPage', params: {id: props.recipe.id}}" :target="linkTarget">
            <recipe-image :style="{height: props.height}" :recipe="props.recipe" rounded="lg" class="mr-3 ml-3">

            </recipe-image>
        </router-link>
        <div class="ml-3">
            <div class="d-flex ">
                <div class="flex-grow-1 cursor-pointer" @click="openRecipe()">
                    <p class="font-weight-bold mt-2">{{ props.recipe.name }}</p>
                </div>
                <div class="mt-1">
                    <!--                    <v-btn icon="fas fa-ellipsis-v" size="small" variant="plain"></v-btn>-->
                    <recipe-context-menu :recipe="props.recipe" size="small" v-if="props.showMenu"></recipe-context-menu>
                </div>
            </div>
            <!--            <p class="text-disabled">{{ props.recipe.createdBy.displayName}}</p>-->
            <keywords-component variant="outlined" :keywords="props.recipe.keywords" :max-keywords="3" v-if="props.showKeywords">
                <template #prepend>

                    <v-chip class="mb-1 me-1" size="x-small" label variant="outlined" v-if="recipe._private">
                        <private-recipe-badge  :show-text="false"></private-recipe-badge>
                    </v-chip>
                    <v-chip class="mb-1 me-1" size="x-small" label variant="outlined" color="info"
                            v-if="props.recipe.internal == false">
                        {{ $t('External') }}
                    </v-chip>
                    <v-chip class="mb-1 me-1" size="x-small" prepend-icon="far fa-clock" label variant="outlined"
                            v-if="props.recipe.workingTime != undefined && props.recipe.workingTime > 0">
                        {{ recipe.workingTime! + recipe.waitingTime! }}
                    </v-chip>
                </template>
            </keywords-component>
        </div>


        <v-card :to="{name: 'RecipeViewPage', params: {id: props.recipe.id}}" :style="{'height': props.height}" v-if="false">
            <v-tooltip
                class="align-center justify-center"
                location="top center" origin="overlap"
                no-click-animation
                :open-on-hover="props.recipe.description != null && props.recipe.description != ''"
                contained
            >
                <template v-slot:activator="{ props }">
                    <recipe-image
                        height="70%"
                        width="100%"
                        :recipe="props.recipe"
                    >

                    </recipe-image>

                    <v-divider class="p-0" v-if="props.recipe.image == null"></v-divider>

                </template>
                <div v-if="props.recipe.description != null && props.recipe.description != ''">
                    {{ props.recipe.description }}
                </div>
            </v-tooltip>
            <v-card-item>
                <div class="text-rows-2">
                    <h3>{{ props.recipe.name }}</h3>
                </div>
                <!-- TODO decide if context menu should be re-added (maybe make it a setting) -->
                <!-- <recipe-context-menu class="float-end" :recipe="recipe"></recipe-context-menu>-->
            </v-card-item>
            <!--            <v-card-text>-->
            <!--                <div class="text-rows-2">-->
            <!--                    <keywords-component variant="outlined" :keywords="componentProps.recipe.keywords">-->
            <!--                        <template #prepend>-->
            <!--                            <v-chip class="mb-1 me-1" size="x-small" prepend-icon="far fa-clock" label variant="outlined" v-if="componentProps.recipe.workingTime != undefined && componentProps.recipe.workingTime > 0">-->
            <!--                                {{ recipe.workingTime! + recipe.waitingTime! }}-->
            <!--                            </v-chip>-->
            <!--                        </template>-->
            <!--                    </keywords-component>-->
            <!--                </div>-->
            <!--            </v-card-text>-->

        </v-card>
    </template>
    <template v-else>
        <v-card :style="{'height': props.height}">
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
import {useRouter} from "vue-router";
import PrivateRecipeBadge from "@/components/display/PrivateRecipeBadge.vue";

const props = defineProps({
    recipe: {type: {} as PropType<Recipe | RecipeOverview>, required: true,},
    loading: {type: Boolean, required: false},
    showKeywords: {type: Boolean, default: true, required: false},
    show_description: {type: Boolean, required: false},
    height: {type: String, required: false, default: '15vh'},
    linkTarget: {type: String, required: false, default: ''},
    showMenu: {type: Boolean, default: true, required: false}
})

const router = useRouter()

/**
 * open the recipe either in the same tab or in a new tab depending on the link target prop
 */
function openRecipe() {
    if (props.linkTarget != '') {
        const routeData = router.resolve({name: 'RecipeViewPage', params: {id: props.recipe.id}});
        window.open(routeData.href, props.linkTarget);
    } else {
        router.push({name: 'RecipeViewPage', params: {id: props.recipe.id}})
    }
}

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