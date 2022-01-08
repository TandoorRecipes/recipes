<template>
  <div id="app">

    <h2>{{ $t('Export') }}</h2>
    <div class="row">
        <div class="col col-md-12">

          <br/>
          <!-- TODO get option dynamicaly -->
          <select class="form-control" v-model="recipe_app">
            <option value="DEFAULT">Default</option>
            <option value="PAPRIKA">Paprika</option>
            <option value="NEXTCLOUD">Nextcloud Cookbook</option>
            <option value="MEALIE">Mealie</option>
            <option value="CHOWDOWN">Chowdown</option>
            <option value="SAFFRON">Saffron</option>
            <option value="CHEFTAP">ChefTap</option>
            <option value="PEPPERPLATE">Pepperplate</option>
            <option value="RECETTETEK">RecetteTek</option>
            <option value="RECIPESAGE">Recipe Sage</option>
            <option value="DOMESTICA">Domestica</option>
            <option value="MEALMASTER">MealMaster</option>
            <option value="REZKONV">RezKonv</option>
            <option value="OPENEATS">Openeats</option>
            <option value="RECIPEKEEPER">Recipe Keeper</option>
            <option value="PLANTOEAT">Plantoeat</option>
            <option value="COOKBOOKAPP">CookBookApp</option>
            <option value="COPYMETHAT">CopyMeThat</option>
            <option value="PDF">PDF</option>
          </select>

          <br/>
          <b-form-checkbox v-model="export_all" @change="disabled_multiselect=$event" name="check-button" switch style="margin-top: 1vh">
              {{ $t('All recipes') }}
          </b-form-checkbox>

          <multiselect
              :searchable="true"
              :disabled="disabled_multiselect"
              v-model="recipe_list"
              :options="recipes"
              :close-on-select="false"
              :clear-on-select="true"
              :hide-selected="true"
              :preserve-search="true"
              placeholder="Select Recipes"
              :taggable="false"
              label="name"
              track-by="id"
              id="id_recipes"
              :multiple="true"
              :loading="recipes_loading"
              @search-change="searchRecipes">
          </multiselect>



          <br/>
          <button @click="exportRecipe()" class="btn btn-primary shadow-none"><i class="fas fa-file-export"></i> {{ $t('Export') }}
          </button>
        </div>
    </div>

  </div>


</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'


import LoadingSpinner from "@/components/LoadingSpinner";

import {StandardToasts, makeToast, resolveDjangoUrl} from "@/utils/utils";
import Multiselect from "vue-multiselect";
import {ApiApiFactory} from "@/utils/openapi/api.ts";
import axios from "axios";


Vue.use(BootstrapVue)


export default {
  name: 'ExportView',
  /*mixins: [
    ResolveUrlMixin,
    ToastMixin,
  ],*/
  components: {Multiselect},
  data() {
    return {
      export_id: window.EXPORT_ID,
      loading: false,
      disabled_multiselect: false,

      recipe_app: 'DEFAULT',
      recipe_list: [],
      recipes_loading: false,
      recipes: [],
      export_all: false,
    }
  },
  mounted() {

    this.insertRequested()

  },
  methods: {

    insertRequested: function(){

      let apiFactory = new ApiApiFactory()

      this.recipes_loading = true
      
      apiFactory.retrieveRecipe(this.export_id).then((response) => {
        this.recipes_loading = false
        this.recipe_list.push(response.data)

      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      }).then(e => this.searchRecipes(''))
    },

    searchRecipes: function (query) {

      let apiFactory = new ApiApiFactory()

      this.recipes_loading = true

      let maxResultLenght = 1000
      apiFactory.listRecipes(query, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, maxResultLenght).then((response) => {
        this.recipes = response.data.results;
        this.recipes_loading = false

      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },

    exportRecipe: function () {

      if (this.recipe_list.length < 1 && this.export_all == false) {
        makeToast(this.$t("Error"), this.$t("Select at least one recipe"), "danger")
        return;
      }

      this.error = undefined
      this.loading = true
      let formData = new FormData();
      formData.append('type', this.recipe_app);
      formData.append('all', this.export_all)

      for (var i = 0; i < this.recipe_list.length; i++) {
        formData.append('recipes', this.recipe_list[i].id);
      }

      axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      axios.post(resolveDjangoUrl('view_export',), formData).then((response) => {
          
          window.location.href = resolveDjangoUrl('view_export_response', response.data['export_id'])

      }).catch((err) => {
          this.error = err.data
          this.loading = false
          console.log(err)
          makeToast(this.$t("Error"), this.$t("There was an error loading a resource!"), "danger")
      })
    },

  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>


</style>
