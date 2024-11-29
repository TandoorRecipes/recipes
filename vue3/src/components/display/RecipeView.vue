<template>
  <template v-if="props.recipe.name != undefined">
    <v-card class="mt-md-4 rounded-0">
      <recipe-image
          max-height="40vh"
          :recipe="props.recipe"
          class="align-end"
          gradient="to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,1)"
          cover
      >
        <template #overlay>
          <div class="mx-3 my-3">
          <span class="text-white ps-2">
            {{ props.recipe.createdBy }} <br>
          </span>
            <b class="ps-2 text-h4 text-white" :class="{'text-truncate': !showFullRecipeName}"
               @click="showFullRecipeName = !showFullRecipeName">{{ props.recipe.name }}</b>
          </div>
        </template>
      </recipe-image>
      <v-card>
      </v-card>
    </v-card>

    <div class="content-grid">
      <div> <!-- Main side -->
          <StepsOverview :steps="props.recipe.steps"></StepsOverview>
        <v-card class="mt-1" v-if="props.recipe.steps.length > 1">
        </v-card>

        <v-card class="mt-1" v-for="(step, index) in props.recipe.steps" :key="step.id" :ref="'step' + index">
          <Step :step="step" :step-number="index+1" :ingredient_factor="ingredientFactor"></Step>
        </v-card>

        <recipe-activity :recipe="recipe"></recipe-activity>
      </div>

      <div class="recipe-sidebar"> <!-- Side bar -->
        <v-card class="mt-1 mb-1">
          <v-container>
            <v-row class="text-center text-body-2">
              <v-col class="pt-1 pb-1">
                <b>
                  <i class="fas fa-clock fa-fw mr-1"></i>
                  {{ (props.recipe.waitingTime || 0) + (props.recipe.workingTime || 0) }} min<br/>
                  <div class="text-grey">Total</div>
                </b>
              </v-col>
              <v-col class="pt-1 pb-1">
                <i class="fas fa-cogs fa-fw mr-1"></i> {{ props.recipe.workingTime }} min<br/>
                <div class="text-grey">Work</div>
              </v-col>
              <v-col class="pt-1 pb-1">
                <div><i class="fas fa-hourglass-half fa-fw mr-1"></i> {{ props.recipe.waitingTime }} min</div>
                <div class="text-grey">Wait</div>
              </v-col>
            </v-row>
            <v-row class="text-center text-body-2 pt-1 pb-1">
              <v-col class="pt-1 pb-1">
                <NumberScalerDialog :number="servings" @change="servings = $event.number" title="Servings">
                  <template #activator>
                    <div class="cursor-pointer">
                      Serving <b>{{ servings }}
                      </b><span v-if="props.recipe?.servingsText">{{
                          props.recipe.servingsText
                        }}</span> <span class="text-blue">Edit</span>
                    </div>
                  </template>
                </NumberScalerDialog>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <v-card
            v-if="recipe.sourceUrl"
            :href="recipe.sourceUrl"
            rel="noopener"
            :subtitle="recipe.sourceUrl"
            target="_blank"
            title="Imported From"
            color="blue lighten-2"
            prepend-icon="fa:fas fa-arrow-up-right-from-square"
        ></v-card>

        <v-card class="mt-1 mb-1 px-3 py-3">
          <KeywordsComponent variant="flat" size="default" class="ms-1 mb-2" color="primary"
                             :keywords="props.recipe.keywords"></KeywordsComponent>
          <p>
            {{ props.recipe.description }}
          </p>

        </v-card>

        <v-card v-if="recipe.properties?.length || 0 > 0" class="mt-1 mb-1">
          <v-container>
            <v-row>
              <h4 style="margin: 5px">Properties</h4>
            </v-row>
            <v-row class="text-body-2">
              <v-col class="pt-1 pb-1">
                <v-list v-for="property in recipe.properties" :key="property.id" class="ma-1" color="primary">
                  <b>{{ property.propertyType.name }}</b> {{ property.propertyAmount }} {{ property.propertyType.unit }}
                </v-list>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <v-card v-if="recipe.sourceUrl">
        </v-card>

        <v-card class="mt-1" style="margin-bottom: 5px">
          <v-container>
            <v-row>
              <h4 style="margin: 5px">Manage</h4>
            </v-row>
            <v-row class="text-center text-body-2">
              <v-col class="pt-1 pb-1">
                <v-btn @click="openRecipe()">
                  <i class="fas fa-edit fa-fw mr-2"></i> Edit
                </v-btn>
                <v-btn @click="deleteRecipe()">
                  <i class="fas fa-trash fa-fw mr-2"></i> Delete
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import {computed, PropType, ref, watch, onMounted, onBeforeUnmount} from 'vue'
import {Recipe} from "@/openapi"
import NumberScalerDialog from "@/components/inputs/NumberScalerDialog.vue"
import StepsOverview from "@/components/display/StepsOverview.vue";
import Step from "@/components/display/Step.vue";
import RecipeActivity from "@/components/display/RecipeActivity.vue";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeImage from "@/components/display/RecipeImage.vue";
import {useRouter} from "vue-router";

const router = useRouter()

const props = defineProps({
  recipe: {
    type: Object as PropType<Recipe>,
    required: true
  }
})

const servings = ref(1)
const showFullRecipeName = ref(false)
const currentStep = ref(0)

const ingredientFactor = computed(() => {
  return servings.value / ((props.recipe.servings != undefined) ? props.recipe.servings : 1)
})

watch(() => props.recipe.servings, () => {
  if (props.recipe.servings) {
    servings.value = props.recipe.servings
  }
})

function openRecipe() {
  router.push({name: 'edit_recipe', params: {recipe_id: props.recipe.id}})
}

const handleScroll = () => {
  const steps = props.recipe.steps
  for (let i = 0; i < steps.length; i++) {
    const stepElement = document.getElementById('step' + i)
    if (stepElement && stepElement.getBoundingClientRect().top < window.innerHeight / 2) {
      currentStep.value = i
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: 70% 30%;
}

.recipe-sidebar {
  margin: 0 10px 0 10px;
}

@media (max-width: 1280px) {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .recipe-sidebar {
    order: -1; /* Display the sidebar first */
    margin: 0;
  }
}

.active-step {
  font-weight: bold;
  color: blue;
}
</style>