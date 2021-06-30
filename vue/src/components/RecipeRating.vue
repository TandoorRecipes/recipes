<template>
  <div>

    <span class="d-inline" v-if="recipe.rating > 0">
      <i class="fas fa-star fa-xs text-primary" v-for="i in Math.floor(recipe.rating)" v-bind:key="i"></i>
      <i class="fas fa-star-half-alt fa-xs text-primary" v-if="recipe.rating % 1 > 0"></i>
      <i class="far fa-star fa-xs text-secondary" v-for="i in (5 - Math.ceil(recipe.rating))" v-bind:key="i + 10"></i>
    </span>
  </div>


</template>

<script>
export default {
  name: "RecipeRating",
  props: {
    recipe: Object
  }
}
</script>

<style scoped>

</style>