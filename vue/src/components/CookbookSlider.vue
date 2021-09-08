<template>
  <div v-bind:style="{ backgroundImage: 'url(' + book_background + ')' }"
       style="background-repeat: no-repeat; background-size: cover; padding-top: 76%;position: relative;"
       class="pb-2 w-100">
    <div id="book_carousel" class="carousel slide row" data-ride="carousel"
         style=" position: absolute;top: 0;left: 0;bottom: 0;right: 0;">
      <div class="row m-0 w-100">
        <div class="carousel-item m-0 w-100" v-for="(i, index) in Math.ceil(recipes.length / 2)" v-bind:key="index"
             :class="{ 'active': index === 0 }">
          <div class="row m-0 w-100">
            <div class="col-6 pt-5" v-for="recipe in recipes.slice((i - 1) * 2, i * 2)" v-bind:key="recipe.id">
              <recipe-card :recipe="recipe.recipe_content" class="mt-5 ml-5 mr-5"></recipe-card>
            </div>
          </div>
        </div>
      </div>
      <div class="row m-0 pl-4 pr-4 w-100">
        <div class="col-6 pull-left">
          <a class="btn btn-primary mb-3 mr-1" href="#book_carousel" role="button" data-slide="prev">
            <i class="fa fa-arrow-left"></i>
          </a>
        </div>
        <div class="col-6 text-right">
          <a class="btn btn-primary mb-3 " href="#book_carousel" role="button" data-slide="next">
          <i class="fa fa-arrow-right"></i>
        </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import RecipeCard from "./RecipeCard";

export default {
  name: "CookbookSlider.vue",
  components: {RecipeCard},
  props: {
    recipes: Array
  },
  data() {
    return {
      cookbooks: [],
      book_background: window.IMAGE_BOOK
    }
  }
}
</script>

<style scoped>

</style>