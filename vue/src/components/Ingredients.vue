<template>

  <table class="table table-sm">
    <!-- eslint-disable vue/no-v-for-template-key-on-child -->
    <template v-for="i in step.ingredients">
      <IngredientRow v-bind:ingredient="i" v-bind:servings="servings" :key="i.id"></IngredientRow>
    </template>
    <!-- eslint-enable vue/no-v-for-template-key-on-child -->
  </table>


</template>

<script>

import IngredientRow from "@/components/IngredientRow";

export default {
  name: 'Ingredient',
  components: {
    IngredientRow,
  },
  props: {
    step: Object,
    servings: {
      type: Number,
      default: 1,
    }
  },
}
</script>
