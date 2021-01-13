<template>
  <div id="app" v-if="!loading">
    <div class="row">
      <div class="col-12" style="text-align: center">
        <h3>{{ recipe.name }}</h3>
      </div>
    </div>

    <div class="row">
      <div class="col-12" style="text-align: center">
        <i>Hier könnte ihre Rezeptbeschreibung stehen</i>
      </div>
    </div>

    <hr/>
    <div class="row">
      <div class="col-3">
        <table>
          <tr>
            <td rowspan="2"><i class="fas fa-user-clock fa-2x text-primary"></i></td>
            <td><span class="text-primary"><b>{{ _('Preparation') }}</b></span></td>
          </tr>
          <tr>
            <td> {{ recipe.working_time }} {{ _('min') }}</td>
          </tr>
        </table>
      </div>

      <div class="col-3">
        <table>
          <tr>
            <td rowspan="2"><i class="far fa-clock fa-2x text-primary"></i></td>
            <td><span class="text-primary"><b>{{ _('Waiting') }}</b></span></td>
          </tr>
          <tr>
            <td>{{ recipe.waiting_time }} {{ _('min') }}</td>
          </tr>
        </table>
      </div>

      <div class="col-3">
        Hier kann noch text stehen
      </div>

      <div class="col-3" style="text-align: right">
        <recipe-context-menu v-bind:recipe="recipe"></recipe-context-menu>
      </div>
    </div>
    <hr/>

    <div class="row" style="margin-top: 2vh">
      <div class="col-md-6 order-md-1 col-sm-12 order-sm-2 col-12 order-2" v-if="recipe && ingredient_count > 0">

        <div class="card border-primary">
          <div class="card-body">
            <div class="row">
              <div class="col col-md-8">
                <h4 class="card-title"><i class="fas fa-pepper-hot"></i> {{ _('Ingredients') }}</h4>
              </div>
              <div class="col col-md-4">
                <div class="input-group d-print-none">
                  <input type="number" value="1" maxlength="3" class="form-control" style="min-width: 4vw;"
                         v-model.number="servings"/>
                  <div class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-calculator"></i></span>
                  </div>
                </div>
              </div>
            </div>
            <br/>
            <div class="row">
              <div class="col-md-12">
                <table class="table table-sm">
                  <div v-for="s in recipe.steps" v-bind:key="s.id">
                    <div v-for="i in s.ingredients" v-bind:key="i.id">
                      <Ingredient v-bind:ingredient="i" v-bind:servings="servings"></Ingredient>
                    </div>
                  </div>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 order-1 col-sm-12 order-sm-1 col-md-6 order-md-2">
        <div class="row">
          <div class="col-12">

            <img class="img img-fluid rounded" :src="recipe.image" style="max-height: 30vh;"
                 :alt="_( 'Recipe Image')" v-if="recipe.image !== null">
          </div>
        </div>

        <div class="row" style="margin-top: 2vh">
          <div class="col-12">
            <Nutrition :recipe="recipe" :servings="servings"></Nutrition>
          </div>
        </div>
      </div>


    </div>

    <!--TODO Nutritions -->

    <div v-if="recipe.file_path.includes('.pdf')">
      <PdfViewer :recipe="recipe"></PdfViewer>
    </div>
    <div
        v-if="recipe.file_path.includes('.png') || recipe.file_path.includes('.jpg') || recipe.file_path.includes('.jpeg')">
      <ImageViewer :recipe="recipe"></ImageViewer>
    </div>

    <!--TODO timers -->
    <div v-for="(s, index) in recipe.steps" v-bind:key="s.id" style="margin-top: 1vh">
      <Step v-bind:step="s" v-bind:servings="servings" v-bind:index="index"></Step>
    </div>


    <!--TODO Comments -->

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

import PdfViewer from "@/components/PdfViewer";
import ImageViewer from "@/components/ImageViewer";
import Nutrition from "@/components/Nutrition";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeView',
  mixins: [
    GettextMixin,
    ToastMixin,
  ],
  components: {
    PdfViewer,
    ImageViewer,
    Ingredient,
    Step,
    RecipeContextMenu,
    Nutrition,
  },
  data() {
    return {
      loading: true,
      recipe_id: window.RECIPE_ID,
      recipe: undefined,
      ingredient_count: 0,
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
          this.ingredient_count += step.ingredients.length

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
