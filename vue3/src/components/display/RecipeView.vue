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
    <template class="d-block d-lg-none recipe__header header--mobile">
      <!-- mobile layout -->
      <v-card class="rounded-0">
        <recipe-image class="recipe__image" :recipe="recipe" v-if="recipe.image != undefined"> </recipe-image>

        <v-card class="recipe__frontmatter">
          <v-sheet class="d-flex align-center">
            <span class="ps-2 text-h5 flex-grow-1 pa-1 recipe__title" :class="{ 'text-truncate': !showFullRecipeName }" @click="showFullRecipeName = !showFullRecipeName">
              {{ recipe.name }}
            </span>
            <recipe-context-menu class="recipe__actions" :recipe="recipe" v-if="useUserPreferenceStore().isAuthenticated"></recipe-context-menu>
          </v-sheet>
          <keywords-component variant="flat" class="ms-1 recipe__keywords" :keywords="recipe.keywords"></keywords-component>
          <private-recipe-badge :users="recipe.shared" class="recipe__private" v-if="recipe._private"></private-recipe-badge>
          <v-rating v-model="recipe.rating" class="recipe__rating" size="x-small" v-if="recipe.rating" half-increments readonly></v-rating>
          <v-sheet class="ps-2 text-disabled recipe__description">
            {{ recipe.description }}
          </v-sheet>
        </v-card>
      </v-card>

      <!-- only display values if not all are default (e.g. for external recipes) -->
      <v-card class="mt-1 recipe__meta" v-if="recipe.workingTime != 0 || recipe.waitingTime != 0 || recipe.servings != 1">
        <v-container>
          <v-row class="text-center text-body-2">
            <v-col class="pt-1 pb-1 recipe__worktime" :class="'worktime--' + String(recipe.workingTime)">
              <i class="fas fa-cogs fa-fw mr-1"></i> {{ recipe.workingTime }} min<br />
              <div class="text-grey">{{ $t("WorkingTime") }}</div>
            </v-col>
            <v-col class="pt-1 pb-1 recipe__waittime" :class="'waittime--' + String(recipe.waitingTime)">
              <div><i class="fas fa-hourglass-half fa-fw mr-1"></i> {{ recipe.waitingTime }} min</div>
              <div class="text-grey">{{ $t("WaitingTime") }}</div>
            </v-col>
            <v-col class="pt-1 pb-1 recipe__servings" :class="'servings--' + String(recipe.servings)">
              <div class="cursor-pointer">
                <i class="fas fa-sort-numeric-up fa-fw mr-1"></i> {{ servings }} <br />
                <div class="text-grey">
                  <span v-if="recipe.servingsText">{{ recipe.servingsText }}</span
                  ><span v-else>{{ $t("Servings") }}</span>
                </div>
                <number-scaler-dialog :number="servings" @confirm="(s: number) => {servings = s}" title="Servings"> </number-scaler-dialog>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </template>
    <!-- Desktop horizontal layout -->
    <template class="d-none d-lg-block recipe__header header--desktop">
      <v-row dense>
        <v-col cols="8">
          <recipe-image :rounded="true" class="recipe__image" :recipe="recipe"> </recipe-image>
        </v-col>
        <v-col cols="4">
          <v-card class="h-100 d-flex flex-column recipe__frontmatter">
            <v-card-text class="flex-grow-1">
              <div class="recipe__title">
                <h1 class="flex-column flex-grow-1">{{ recipe.name }}</h1>
                <recipe-context-menu
                  :recipe="recipe"
                  v-if="useUserPreferenceStore().isAuthenticated"
                  class="flex-column mb-auto mt-2 float-right recipe__actions"
                ></recipe-context-menu>
              </div>
              <p class="recipe__byline">
                {{ $t("created_by") }} {{ recipe.createdBy.displayName }} ({{ DateTime.fromJSDate(recipe.createdAt).toLocaleString(DateTime.DATE_SHORT) }})
              </p>
              <p class="recipe__description">
                <i>{{ recipe.description }}</i>
              </p>

              <private-recipe-badge :users="recipe.shared" class="recipe__private" v-if="recipe._private"></private-recipe-badge>

              <v-rating v-model="recipe.rating" class="recipe__rating" size="x-small" v-if="recipe.rating" readonly></v-rating>

              <keywords-component variant="flat" class="recipe__keywords" :keywords="recipe.keywords"></keywords-component>
            </v-card-text>

            <v-row class="text-center text-body-2 mb-1 flex-grow-0 recipe__meta">
              <v-col class="recipe__worktime" :class="'worktime--' + String(recipe.workingTime)">
                <i class="fas fa-cogs fa-fw mr-1"></i> {{ recipe.workingTime }} {{ $t("min") }}<br />
                <div class="text-grey">{{ $t("WorkingTime") }}</div>
              </v-col>
              <v-col class="recipe__waittime" :class="'waittime--' + String(recipe.waitingTime)">
                <div><i class="fas fa-hourglass-half fa-fw mr-1"></i> {{ recipe.waitingTime }} {{ $t("min") }}</div>
                <div class="text-grey">{{ $t("WaitingTime") }}</div>
              </v-col>
              <v-col class="recipe__servings" :class="'servings--' + String(recipe.servings)">
                <div class="cursor-pointer">
                  <i class="fas fa-sort-numeric-up fa-fw mr-1"></i> {{ servings }} <br />
                  <div class="text-grey">
                    <span v-if="recipe.servingsText">{{ recipe.servingsText }}</span
                    ><span v-else>{{ $t("Servings") }}</span>
                  </div>
                  <number-scaler-dialog :number="servings" @confirm="(s: number) => {servings = s}" title="Servings"> </number-scaler-dialog>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <template class="recipe__external" v-if="recipe.filePath">
      <external-recipe-viewer class="mt-2" :recipe="recipe"></external-recipe-viewer>

      <v-card :title="$t('AI')" prepend-icon="$ai" @click="aiConvertRecipe()" :loading="fileApiLoading || loading" :disabled="fileApiLoading || loading" v-if="!recipe.internal">
        <v-card-text> Convert the recipe using AI </v-card-text>
      </v-card>
    </template>

    <v-card
      class="mt-1 recipe__ingredients"
      v-if="(recipe.steps.length > 1 || (recipe.steps.length == 1 && !recipe.steps[0].showIngredientsTable)) && recipe.showIngredientOverview"
    >
      <steps-overview :steps="recipe.steps" :ingredient-factor="ingredientFactor"></steps-overview>
    </v-card>

    <v-card class="mt-1 recipe__step step" :class="'step--' + String(index + 1)" v-for="(step, index) in recipe.steps" :key="step.id">
      <step-view v-model="recipe.steps[index]" :step-number="index + 1" :ingredientFactor="ingredientFactor"></step-view>
    </v-card>

    <property-view v-model="recipe" :servings="servings"></property-view>

    <v-card class="mt-2 recipe__footer recipe__history">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3" class="recipe__createdby">
            <v-card
              variant="outlined"
              :title="$t('CreatedBy')"
              :subtitle="recipe.createdBy.displayName"
              prepend-icon="fa-solid fa-user"
              :to="{name: 'SearchPage', query: {createdby: recipe.createdBy.id!}}"
            >
            </v-card>
          </v-col>
          <v-col cols="12" md="3" class="recipe__createdon">
            <v-card
              variant="outlined"
              :title="$t('Created')"
              :subtitle="DateTime.fromJSDate(recipe.createdAt).toLocaleString(DateTime.DATETIME_MED)"
              prepend-icon="$create"
              :to="{ name: 'SearchPage', query: { createdon: DateTime.fromJSDate(recipe.createdAt).toISODate() } }"
            >
            </v-card>
          </v-col>
          <v-col cols="12" md="3" class="recipe__updatedon">
            <v-card
              variant="outlined"
              :title="$t('Updated')"
              :subtitle="DateTime.fromJSDate(recipe.updatedAt).toLocaleString(DateTime.DATETIME_MED)"
              prepend-icon="$edit"
              :to="{ name: 'SearchPage', query: { updatedon: DateTime.fromJSDate(recipe.updatedAt).toISODate() } }"
            >
            </v-card>
          </v-col>
          <v-col cols="12" md="3" class="recipe__importedfrom" v-if="recipe.sourceUrl">
            <v-card variant="outlined" :title="$t('Imported_From')" prepend-icon="$import">
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { ApiApi, Recipe } from "@/openapi"
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue"
import StepsOverview from "@/components/display/StepsOverview.vue"
import RecipeActivity from "@/components/display/RecipeActivity.vue"
import RecipeContextMenu from "@/components/inputs/RecipeContextMenu.vue"
import KeywordsComponent from "@/components/display/KeywordsBar.vue"
import RecipeImage from "@/components/display/RecipeImage.vue"
import ExternalRecipeViewer from "@/components/display/ExternalRecipeViewer.vue"
import { useWakeLock } from "@vueuse/core"
import StepView from "@/components/display/StepView.vue"
import { DateTime } from "luxon"
import PropertyView from "@/components/display/PropertyView.vue"
import { useUserPreferenceStore } from "@/stores/UserPreferenceStore.ts"
import { ErrorMessageType, useMessageStore } from "@/stores/MessageStore.ts"
import { useFileApi } from "@/composables/useFileApi.ts"
import PrivateRecipeBadge from "@/components/display/PrivateRecipeBadge.vue"

const { request, release } = useWakeLock()
const { doAiImport, fileApiLoading } = useFileApi()

const loading = ref(false)
const recipe = defineModel<Recipe>({ required: true })

const servings = ref(1)
const showFullRecipeName = ref(false)

/**
 * factor for multiplying ingredient amounts based on recipe base servings and user selected servings
 */
const ingredientFactor = computed(() => {
  return servings.value / (recipe.value.servings != undefined ? recipe.value.servings : 1)
})

/**
 * change servings when recipe servings are changed
 */
watch(
  () => recipe.value.servings,
  () => {
    if (recipe.value.servings) {
      servings.value = recipe.value.servings
    }
  }
)

onMounted(() => {
  //keep screen on while viewing a recipe
  request("screen")
})

onBeforeUnmount(() => {
  // allow screen to turn off after leaving the recipe page
  release()
})

/**
 * converts the recipe into an internal recipe using AI
 */
function aiConvertRecipe() {
  let api = new ApiApi()

  doAiImport(null, "", recipe.value.id!)
    .then((r) => {
      if (r.recipe) {
        recipe.value.internal = true
        recipe.value.steps = r.recipe.steps
        recipe.value.keywords = r.recipe.keywords
        recipe.value.servings = r.recipe.servings
        recipe.value.servingsText = r.recipe.servingsText
        recipe.value.workingTime = r.recipe.workingTime
        recipe.value.waitingTime = r.recipe.waitingTime

        servings.value = r.recipe.servings
        loading.value = true

        api
          .apiRecipeUpdate({ id: recipe.value.id!, recipe: recipe.value })
          .then((r) => {
            recipe.value = r
          })
          .catch((err) => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, [r.error, r.msg])
      }
    })
    .catch((err) => {
      useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * emit ingredient factor changes to parent (RecipeViewPage) to adjust scaling class
 */
const emit = defineEmits<{ (e: "update:ingredientFactor", value: number): void }>()
watch(ingredientFactor, (val) => emit("update:ingredientFactor", val), { immediate: true })
</script>

<style scoped>
.recipe__image {
  .header--mobile & {
    max-height: 25vh;
  }
  .header--desktop & {
    max-height: 40vh;
  }
}
</style>
