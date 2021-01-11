<template>
  <div>
    <input type="checkbox">
    {{ingredient.amount}}
    {{ingredient.unit}}
    {{ingredient.food}}
    {{ingredient.note}}
  </div>
</template>

<script>

export default {
  name: 'Ingredient',
  props: {
    ingredient: Object,
    servings: Number
  }
}
</script>
