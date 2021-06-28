<template>
  <div>

    <span style="display: inline-block;" v-if="recipe.rating > 0">
      <i class="fas fa-star fa-xs" v-for="i in Math.floor(recipe.rating)" v-bind:key="i"></i>
      <i class="fas fa-star-half-alt fa-xs" v-if="recipe.rating % 1 > 0"></i>
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