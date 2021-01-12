<template>
  <div id="app" v-if="!loading">
    <h1>{{ recipe.name }}</h1>

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

import {makeToast} from "@/utils/utils.js";

const _ = window.gettext

import Step from "@/components/Step";

Vue.use(BootstrapVue)

import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    servings: 1
  }
})

import {apiLoadRecipe} from "@/utils/django";

export default {
  name: 'RecipeView',
  store: store,
  components: {
    Step
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
