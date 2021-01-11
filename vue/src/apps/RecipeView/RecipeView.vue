<template>
  <div id="app">
    <h1>Recipe View</h1>

    {{ recipe }}
  </div>

</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import {makeToast} from "@/utils/utils.js";

Vue.use(BootstrapVue)

export default {
  name: 'App',
  components: {},
  data() {
    return {
      recipe: undefined
    }
  },
  mounted() {
    makeToast("Error", "Error", "danger")
    this.loadRecipe(5)
  },
  methods: {
    loadRecipe: function (recipe_id) {
      fetch(`/api/recipe/${recipe_id}`).then((response) => {
        this.recipe = response.data;
      }).catch((err) => {
        console.log(err)
      })
    }

  }
}
</script>

<style>


</style>
