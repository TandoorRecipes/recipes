<script setup lang="ts">
import {PropType, reactive} from 'vue'
import {Step} from "@/openapi";

const props = defineProps({
  step: {
    type: Object as PropType<Step>,
    required: true
  }
})

const checked = reactive(Array(props.step?.ingredients.length).fill(false))
</script>

<template>
  <v-chip v-if="props.step?.ingredients.length" variant="text" color="">Ingredients</v-chip>
  <v-chip
      v-for="ingredient in props.step.ingredients" :key="ingredient.id" class="ma-1"
      @click="checked[ingredient.id || 0] = !checked[ingredient.id || 0]"
      :class="{ 'checked': checked[ingredient.id || 0] }"
      :color="checked[ingredient.id || 0] ? 'grey' : 'primary'"
      :variant="checked[ingredient.id || 0] ? 'tonal' : 'elevated'"
  >
    <b>
      {{ `${ingredient.amount}` + (ingredient.unit ? ` ${ingredient.unit.name}` : '') + '&nbsp'}}
    </b>
    {{ ingredient.food?.name }}
  </v-chip>
</template>

<style scoped>

.checked {
  text-decoration: line-through;
}

</style>