<template>
  <div id="app" style="margin-bottom: 4vh">

    <div class="row">
      <div class="col-xl-2 d-none d-xl-block">

      </div>
      <div class="col-xl-8 col-12">


        <div class="row">
          <div class="col col-md-12">
            <b-input class="form-control" v-model="search_input" @keyup="refreshData" v-bind:placeholder="$t('Search')"></b-input>
          </div>
        </div>

        <div class="row" style="margin-top: 2vh">
          <div class="col col-md-12">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));grid-gap: 1rem;">
              <recipe-card v-for="r in recipes" v-bind:key="r.id" :recipe="r"></recipe-card>

            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-2 d-none d-xl-block">

      </div>
    </div>


  </div>


</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ResolveUrlMixin} from "@/utils/utils";

import LoadingSpinner from "@/components/LoadingSpinner";

import {ApiApiFactory} from "@/utils/openapi/api.ts";
import RecipeCard from "@/components/RecipeCard";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeSearchView',
  mixins: [],
  components: {RecipeCard},
  data() {
    return {
      recipes: [],
      search_input: '',
    }

  },
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.listRecipes({query: {query: this.search_input, limit: 20}}).then(result => {
        this.recipes = result.data
      })
    }
  }
}

</script>

<style>


</style>
