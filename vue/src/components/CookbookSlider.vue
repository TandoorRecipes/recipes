<template>
  <div v-bind:style="{ backgroundImage: 'url(' + book_background + ')' }"
       style="background-repeat: no-repeat; background-size: cover; padding-top: 76%;position: relative;"
       class="pb-2 w-100">
    <div id="book_carousel" class="carousel slide" data-interval="0"
         style=" position: absolute;top: 0;left: 0;bottom: 0;right: 0;">
      <div class="row m-0 pl-4 pr-4 pt-5 w-100" style="height: 15vh">
        <a class="mb-3 col-6 pull-left" href="#book_carousel" role="button" data-slide="prev">
        </a>
        <a class="mb-3 col-6 text-right" href="#book_carousel" role="button" data-slide="next">
        </a>
      </div>
      <div class="row m-0 w-100 pt-2">
        <div class="carousel-item w-100 active">
          <div class="row m-0 w-100">
            <div class="col-6">
              <b-card no-body v-hover class="ml-5 mr-5">
                <b-card-header class="p-4">
                  <h5>{{ book.name }} <span class="pull-right">{{ book.icon }}</span></h5>
                </b-card-header>
                <b-card-body class="p-4">
                  <b-card-text style="text-overflow: ellipsis;">
                    {{ book.description }}
                  </b-card-text>
                </b-card-body>
              </b-card>
            </div>
            <div class="col-6">
              <b-card no-body v-hover class="ml-5 mr-5">
                <b-card-header class="p-4">
                  <h5>{{ $t('TableOfContents') }}</h5>
                </b-card-header>
                <b-card-body class="p-4">
                  <ol>
                    <li v-for="recipe in recipes" v-bind:key="recipe.name">
                      {{ recipe.recipe_content.name }}
                    </li>
                  </ol>
                </b-card-body>
              </b-card>
            </div>
          </div>
        </div>
        <div class="carousel-item w-100" v-for="(i, index) in Math.ceil(recipes.length / 2)" v-bind:key="index">
          <div class="row m-0 w-100">
            <div class="col-6" v-for="recipe in recipes.slice((i - 1) * 2, i * 2)" v-bind:key="recipe.id">
              <recipe-card :recipe="recipe.recipe_content" class="ml-5 mr-5"></recipe-card>
            </div>
          </div>
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
    recipes: Array,
    book: Object
  },
  data() {
    return {
      cookbooks: [],
      book_background: window.IMAGE_BOOK
    }
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