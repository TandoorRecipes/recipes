<template>
    <template v-if="!props.loading">

        <router-link :to="dest" :target="linkTarget">
            <recipe-image :style="{height: props.height}" :recipe="props.recipe" rounded="lg" class="mr-3 ml-3" :disable-lightbox="true">
                <template #overlay>
                    <span v-if="deviceSettings.card_showRating && props.recipe.rating != null"
                          class="card-overlay-top-right">
                        <v-icon icon="fa-solid fa-star" size="8" color="amber" />
                        <span class="card-overlay-rating-text">{{ props.recipe.rating.toFixed(1) }}</span>
                    </span>
                    <span v-if="deviceSettings.card_showNewBadge && props.recipe._new"
                          class="card-overlay-bottom-left card-overlay-new">
                        {{ t('New') }}
                    </span>
                    <span v-if="hasMetadataOverlay"
                          class="card-overlay-bottom-right">
                        <span v-if="deviceSettings.card_showAuthor">{{ props.recipe.createdBy?.displayName }}</span>
                        <span v-if="deviceSettings.card_showAuthor && deviceSettings.card_showLastCooked && props.recipe.lastCooked"> · </span>
                        <span v-if="deviceSettings.card_showLastCooked && props.recipe.lastCooked">{{ lastCookedText }}</span>
                    </span>
                </template>
            </recipe-image>
        </router-link>
        <div class="ml-3">
            <div class="d-flex ">
                <div class="flex-grow-1 cursor-pointer" @click="openRecipe()">
                    <p class="font-weight-bold mt-1">{{ props.recipe.name }}</p>
                </div>
                <div class="mt-1">
                    <recipe-context-menu :recipe="props.recipe" size="small" v-if="props.showMenu"></recipe-context-menu>
                </div>
            </div>
            <keywords-component variant="outlined" :keywords="props.recipe.keywords" :max-keywords="deviceSettings.card_maxKeywords" v-if="props.showKeywords">
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


        <v-card :to="dest" :style="{'height': props.height}" v-if="false">
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
import {computed, PropType} from 'vue'
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import {Recipe, RecipeOverview} from "@/openapi";

import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue";
import RecipeImage from "@/components/display/RecipeImage.vue";
import {useRouter} from "vue-router";
import PrivateRecipeBadge from "@/components/display/PrivateRecipeBadge.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useI18n} from "vue-i18n";

const props = defineProps({
    recipe: {type: {} as PropType<Recipe | RecipeOverview>, required: true,},
    loading: {type: Boolean, required: false},
    showKeywords: {type: Boolean, default: true, required: false},
    show_description: {type: Boolean, required: false},
    height: {type: String, required: false, default: '15vh'},
    linkTarget: {type: String, required: false, default: ''},
    showMenu: {type: Boolean, default: true, required: false},
    servings: {type: Number, required: false},
})

const router = useRouter()
const {t} = useI18n()
const deviceSettings = useUserPreferenceStore().deviceSettings

const hasMetadataOverlay = computed(() =>
    (deviceSettings.card_showAuthor && props.recipe.createdBy?.displayName) ||
    (deviceSettings.card_showLastCooked && props.recipe.lastCooked)
)

const lastCookedText = computed(() => {
    if (!props.recipe.lastCooked) return ''
    const date = new Date(props.recipe.lastCooked)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return t('today')
    if (diffDays === 0) return t('today')
    if (diffDays === 1) return t('yesterday')
    if (diffDays < 30) return t('days_ago', {count: diffDays})
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths < 12) return t('months_ago', {count: diffMonths})
    const diffYears = Math.floor(diffDays / 365)
    return t('years_ago', {count: diffYears})
})

const dest = computed(() => {
    const route: any = { name: 'RecipeViewPage', params: { id: props.recipe.id } };
    if (props.servings !== undefined) {
        route.query = { servings: String(props.servings) };
    }
    return route;
})

/**
 * open the recipe either in the same tab or in a new tab depending on the link target prop
 */
function openRecipe() {
    if (props.linkTarget != '') {
        const routeData = router.resolve(dest.value);
        window.open(routeData.href, props.linkTarget);
    } else {
        router.push(dest.value);
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

.card-overlay-top-right,
.card-overlay-bottom-right,
.card-overlay-bottom-left {
    position: absolute;
    z-index: 1;
    background: rgba(0, 0, 0, 0.35);
    color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    font-size: 10px;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 4px;
}

.card-overlay-top-right {
    top: 6px;
    right: 6px;
    display: flex;
    align-items: center;
    gap: 3px;
}

.card-overlay-rating-text {
    font-weight: 600;
    font-size: 11px;
}

.card-overlay-bottom-right {
    bottom: 6px;
    right: 6px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-overlay-bottom-left {
    bottom: 6px;
    left: 6px;
}

.card-overlay-new {
    background: rgba(76, 175, 80, 0.85);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
</style>