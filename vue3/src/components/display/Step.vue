<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col><span v-if="props.step.name">{{ props.step.name }}</span><span v-else>Step {{ props.stepNumber }}</span>
        </v-col>
        <v-col class="text-right">
          <v-btn-group density="compact" variant="tonal">
            <v-btn size="small" color="info" v-if="props.step.time != undefined && props.step.time > 0"
                   @click="timerRunning = true"><i class="fas fa-stopwatch mr-1 fa-fw"></i> {{ props.step.time }}
            </v-btn>
            <v-btn size="small" color="success" v-if="hasDetails" @click="stepChecked = !stepChecked"><i
                class="fas fa-fw" :class="{'fa-check': !stepChecked, 'fa-times': stepChecked}"></i></v-btn>
          </v-btn-group>
        </v-col>
      </v-row>
    </v-card-title>
    <template v-if="!stepChecked">
      <timer :seconds="props.step.time != undefined ? props.step.time*60 : 0" @stop="timerRunning = false"
             v-if="timerRunning"></timer>

      <IngredientsInline :step="props.step"></IngredientsInline>

      <v-card-text v-if="props.step.instructionsMarkdown.length > 0">
        <instructions :instructions_html="props.step.instructionsMarkdown"
                      :ingredient_factor="ingredient_factor"></instructions>
      </v-card-text>
    </template>

  </v-card>
</template>

<script setup lang="ts">
import {computed, defineComponent, PropType, ref} from 'vue'
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import {Step} from "@/openapi";

import Instructions from "@/components/display/Instructions.vue";
import Timer from "@/components/display/Timer.vue";
import IngredientsInline from "@/components/display/IngredientsInline.vue";

const props = defineProps({
  step: {
    type: {} as PropType<Step>,
    required: true,
  },
  stepNumber: {
    type: Number,
    required: false,
    default: 1
  },
  ingredient_factor: {
    type: Number,
    required: true,
  },
})

const timerRunning = ref(false)
const stepChecked = ref(false)

const hasDetails = computed(() => {
  return props.step.ingredients.length > 0 || (props.step.instruction != undefined && props.step.instruction.length > 0) || props.step.stepRecipeData != undefined || props.step.file != undefined
})

</script>

<style scoped>

</style>