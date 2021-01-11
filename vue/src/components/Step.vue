<template>
  <div>

    <div v-for="i in step.ingredients" v-bind:key="i.id">
      <Ingredient v-bind:ingredient="i" v-bind:servings="servings"></Ingredient>
    </div>

    <br/>

    Servings Step: {{servings}}

    {{ step.instruction }}

    <br/>
    <br/>
  </div>

</template>

<script>

import Ingredient from "@/components/Ingredient";

export default {
  name: 'Step',
  components: {
    Ingredient
  },
  props: {
    step: Object,
    servings: Number,
  }
}
</script>
