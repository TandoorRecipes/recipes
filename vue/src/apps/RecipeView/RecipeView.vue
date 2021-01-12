<template>
  <div id="app" v-if="!loading">
    <h1>{{ recipe.name }}</h1>
    <recipe-context-menu v-bind:recipe="recipe"></recipe-context-menu>

    <img v-bind:src="recipe.image">

    <div v-for="s in recipe.steps" v-bind:key="s.id">
      <Step v-bind:step="s" v-bind:servings="servings"></Step>
    </div>
  </div>

</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {apiLoadRecipe} from "@/utils/api";

import Step from "@/components/Step";
import RecipeContextMenu from "@/components/RecipeContextMenu";
import {GettextMixin, ToastMixin} from "@/utils/utils";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeView',
  mixins: [
    GettextMixin,
    ToastMixin,
  ],
  components: {
    Step,
    RecipeContextMenu,
  },
  data() {
    return {
      loading: true,
      recipe_id: window.RECIPE_ID,
      recipe: undefined,
      servings: 1,
    }
  },
  mounted() {
    this.loadRecipe(this.recipe_id)
  },
  methods: {
    loadRecipe: function (recipe_id) {
      apiLoadRecipe(recipe_id).then(recipe => {
        this.recipe = recipe
        this.loading = false
      })
    }
  }
}

</script>

<style>


</style>
