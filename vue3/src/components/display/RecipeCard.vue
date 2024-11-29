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
              height="100%"
              width="100%"
              :recipe="componentProps.recipe"
              cover
              class="align-end"
          >
            <template #overlay>
              <v-card
                  style="backdrop-filter: blur(2px); background: rgba(0, 0, 0, 0.5)"
              >
                <v-card-title class="text-white py-0">{{ componentProps.recipe.name }}
                </v-card-title>

                <div style="padding: 0 7px 7px 7px">
                  <v-chip size="small" color="white" variant="flat" style="margin-right: 5px"
                          v-for="badge in generateInfoBadges(componentProps.recipe, componentProps.info_badges)">
                    {{ badge }}
                  </v-chip>
                  <v-chip v-for="(keyword, index) in componentProps.recipe.keywords?.slice(0, 2)" :key="index"
                          size="small" color="white" variant="outlined" style="margin-right: 5px">
                    {{ keyword.label }}
                  </v-chip>
                  <v-chip v-if="(componentProps.recipe.keywords?.length || 0) > 2" size="small" color="white"
                          variant="outlined" style="margin-right: 5px">
                    {{ (componentProps.recipe.keywords?.length || 0) - 2 }} more
                  </v-chip>
                </div>

              </v-card>
            </template>
          </recipe-image>

          <v-divider class="p-0" v-if="componentProps.recipe.image == null"></v-divider>
        </template>

        <div v-if="componentProps.recipe.description != null && componentProps.recipe.description != ''">
          {{ componentProps.recipe.description }}
        </div>
      </v-tooltip>

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
  info_badges: {type: Array as PropType<infoBadgeProperties[]>, required: false, default: () => ['serves', 'time']}
})

// Can add more..
type infoBadgeProperties = 'serves' | 'time'

const generateInfoBadges = (recipe: Recipe | RecipeOverview, properties: infoBadgeProperties[]) => {
  const badges = {
    'serves': `Serves ${recipe.servings}`,
    'time': `Ready in ${(recipe.waitingTime || 0) + (recipe.workingTime || 0)} min`,
  }

  return properties.map((property) => {
    return badges[property]
  })
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