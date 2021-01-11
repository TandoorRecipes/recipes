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
//import {gettext} from "@/utils/jsi18n";

const _ = window.gettext

import Step from "@/components/Step";
import axios from "axios";


Vue.use(BootstrapVue)

import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    servings: 1
  }
})


export default {
  name: 'RecipeView',
  store: store,
  components: {
    Step
  },
  data() {
    return {
      loading: true,
      recipe: undefined,
      servings: 1,
    }
  },
  mounted() {
    //makeToast("Error", "Error", "danger")
    this.loadRecipe(5)
    console.log(_('Error'))
  },
  methods: {
    loadRecipe: function (recipe_id) {
      axios.get(`/api/recipe/${recipe_id}`).then((response) => {

        this.recipe = response.data;
        this.loading = false;
      }).catch((err) => {
        console.log(err)
        makeToast('Error', 'There was an error loading a resource!', 'danger')
      })
    }

  }
}
</script>

<style>


</style>
