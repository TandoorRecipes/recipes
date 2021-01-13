<template>
  <div id="app" v-if="!loading">

    <div class="row">
      <div class="col-12" style="text-align: center">
        <h3>{{ recipe.name }}</h3>
      </div>
    </div>

    <!--TODO Tags -->

    <div class="row">
      <div class="col-12" style="text-align: center">
        <i>{{ recipe.description }}</i>
      </div>
    </div>

    <hr/>
    <div class="row">
      <div class="col col-md-3">
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

      <div class="col  col-md-3">
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

      <div class="col col-md-4 col-10">
        <table>
          <tr>
            <td>
              <i class="fas fa-pizza-slice fa-2x text-primary"></i>
            </td>
            <td>
              <input dir="rtl"
                     style="border-width:0px;border:none; padding:0px; padding-left: 0.5vw; padding-right: 8px; max-width: 80px"
                     value="1" maxlength="3"
                     type="number" class="form-control form-control-lg" v-model.number="servings"/>
            </td>

            <td style="padding-left: 0.5vw">
              <b>{{ _('Servings') }}</b>
            </td>
          </tr>
        </table>

      </div>

      <div class="col col-md-2 col-2" style="text-align: right; padding-right: 1vw">
        <recipe-context-menu v-bind:recipe="recipe" :servings="servings"></recipe-context-menu>
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
            </div>
            <br/>
            <div class="row">
              <div class="col-md-12">
                  <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                  <template v-for="s in recipe.steps">
                      <Ingredients :step="s" :servings="servings" :key="s.id"></Ingredients>
                  </template>
                  <!-- eslint-enable vue/no-v-for-template-key-on-child -->
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

    <div v-if="recipe.file_path.includes('.pdf')">
      <PdfViewer :recipe="recipe"></PdfViewer>
    </div>
    <div
        v-if="recipe.file_path.includes('.png') || recipe.file_path.includes('.jpg') || recipe.file_path.includes('.jpeg')">
      <ImageViewer :recipe="recipe"></ImageViewer>
    </div>

    <!--TODO timers -->
    <div v-for="(s, index) in recipe.steps" v-bind:key="s.id" style="margin-top: 1vh">
      <Step :recipe="recipe" :step="s" :servings="servings" :index="index" :start_time="start_time"
      @update-start-time="updateStartTime"></Step>
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
import Ingredients from "@/components/Ingredients";

import PdfViewer from "@/components/PdfViewer";
import ImageViewer from "@/components/ImageViewer";
import Nutrition from "@/components/Nutrition";

import moment from 'moment'

Vue.prototype.moment = moment

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
    Ingredients,
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
      start_time: ""
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

        let total_time = 0
        for (let step of this.recipe.steps) {
          this.ingredient_count += step.ingredients.length

          step.time_offset = total_time
          total_time += step.time
        }

        // set start time only if there are any steps with timers (otherwise no timers are rendered)
        if (total_time > 0) {
          this.start_time = moment().format('yyyy-MM-DDTHH:mm')
        }
      })
    },
    updateStartTime: function (e) {
      this.start_time = e
    }
  }
}

</script>

<style>


</style>
