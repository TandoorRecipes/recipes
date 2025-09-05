<template>
  <v-container class="recipe" :class="[scaleClass, { 'ps-0 pe-0 pt-0': mobile }]">
    <recipe-view v-model="recipe" @update:ingredientFactor="onIngFactor"></recipe-view>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue"
import { ApiApi, ApiRecipeRetrieveRequest, Recipe, ViewLog } from "@/openapi"
import RecipeView from "@/components/display/RecipeView.vue"
import { useDisplay } from "vuetify"
import { useTitle, useUrlSearchParams } from "@vueuse/core"
import { ErrorMessageType, useMessageStore } from "@/stores/MessageStore"
import { useUserPreferenceStore } from "@/stores/UserPreferenceStore"

const props = defineProps({
  id: { type: String, required: true },
})

const params = useUrlSearchParams("history")
const { mobile } = useDisplay()
const title = useTitle()

const recipe = ref({} as Recipe)

watch(
  () => props.id,
  () => {
    refreshData(props.id)
  }
)

onMounted(() => {
  refreshData(props.id)
})

function refreshData(recipeId: string) {
  const api = new ApiApi()
  recipe.value = {} as Recipe

  let requestParameters: ApiRecipeRetrieveRequest = { id: props.id }
  if (params.share && typeof params.share == "string") {
    requestParameters.share = params.share
  }

  api
    .apiRecipeRetrieve(requestParameters)
    .then((r) => {
      recipe.value = r
      title.value = recipe.value.name

      if (useUserPreferenceStore().isAuthenticated) {
        api.apiViewLogCreate({ viewLog: { recipe: Number(recipeId) } as ViewLog })
      }
    })
    .catch((err) => {
      if (err.response.status == 403) {
        // TODO maybe redirect to login if fails with 403? or conflict with group/sapce system?
      } else {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
      }
    })
}

// set scaling class based on ingredient factor
const ingredientFactor = ref(1)
const scaleClass = computed(() => (ingredientFactor.value > 1 ? "scaled--up" : ingredientFactor.value < 1 ? "scaled--down" : "scaled--default"))

function onIngFactor(val: number) {
  ingredientFactor.value = val
}
</script>

<style scoped></style>
