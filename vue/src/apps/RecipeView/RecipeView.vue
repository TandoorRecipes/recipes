<template>
  <div id="app" v-if="!loading">

    <div class="row">
      <div class="col col-md-8">
        <h3>{{ recipe.name }}</h3>
        <!--TODO rating -->
        <!--TODO username -->
        <!--TODO storage -->
      </div>
      <div class="col col-md-4 d-print-none" style="text-align: right">
        <recipe-context-menu v-bind:recipe="recipe"></recipe-context-menu>
      </div>
    </div>

    <!--TODO keywords -->
    <span class="badge badge-secondary"><i class="fas fa-user-clock"></i>
      {{ _('Preparation time ~') }} {{ recipe.working_time }} {{ _('min') }}
    </span>
    <span class="badge badge-secondary"><i class="far fa-clock"></i>
      {{ _('Waiting time ~') }} {{ recipe.waiting_time }} {{ _('min') }}
    </span>


    <div class="row">
      <div class="col-md-6 order-md-1 col-sm-12 order-sm-2 col-12 order-2" v-if="recipe && has_ingredients">
        <div v-for="s in recipe.steps" v-bind:key="s.id">
          <div v-for="i in s.ingredients" v-bind:key="i.id">
            <Ingredient v-bind:ingredient="i"></Ingredient>
          </div>
        </div>
      </div>

      <div class="col-12 order-1 col-sm-12 order-sm-1 col-md-6 order-md-2" style="text-align: center">
        <img class="img img-fluid rounded" :src="recipe.image" style="max-height: 30vh;"
             :alt="_( 'Recipe Image')">
        <br/>
        <br/>
      </div>
    </div>

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
import Ingredient from "@/components/Ingredient";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeView',
  mixins: [
    GettextMixin,
    ToastMixin,
  ],
  components: {
    Ingredient,
    Step,
    RecipeContextMenu,
  },
  data() {
    return {
      loading: true,
      recipe_id: window.RECIPE_ID,
      recipe: undefined,
      has_ingredients: false,
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

        for (let step of this.recipe.steps) {
          if (step.ingredients.length > 0) {
            this.has_ingredients = true
          }
          if (step.time !== 0) {
            this.has_times = true
          }
        }
      })
    }
  }
}

</script>

<style>


</style>
