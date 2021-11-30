<template>
  <b-card no-body v-hover>
    <b-card-header class="p-4">
      <h5>{{ $t('Table_of_Contents') }}</h5>
    </b-card-header>
    <b-card-body class="p-4">
      <ol style="max-height: 60vh;overflow-y:auto;-webkit-overflow-scrolling: touch;" class="mb-1">
        <li v-for="(recipe, index) in recipes" v-bind:key="index" v-on:click="$emit('switchRecipe', index)">
          <a href="javascript:void(0)">{{ recipe.recipe_content.name }} <recipe-rating :recipe="recipe"></recipe-rating> </a>
        </li>
      </ol>
      <b-card-text v-if="recipes.length === 0">
        {{ $t('Empty')}}
      </b-card-text>
    </b-card-body>
  </b-card>
</template>

<script>
import RecipeRating from "./RecipeRating";
export default {
  name: "CookbookToc",
  components: {RecipeRating},
  props: {
    recipes: Array
  },
  directives: {
    hover: {
      inserted: function (el) {
        el.addEventListener('mouseenter', () => {
          el.classList.add("shadow")
        });
        el.addEventListener('mouseleave', () => {
          el.classList.remove("shadow")
        });
      }
    }
  }
}
</script>

<style scoped>

</style>