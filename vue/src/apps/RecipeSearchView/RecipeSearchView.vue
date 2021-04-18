<template>
  <div id="app" style="margin-bottom: 4vh">

    <div class="row">
      <div class="col-md-2 d-none d-md-block">

      </div>
      <div class="col-xl-8 col-12">


        <div class="row">
          <div class="col col-md-12">


            <b-input-group class="mt-3">
              <b-input class="form-control" v-model="search_input" @keyup="refreshData"
                       v-bind:placeholder="$t('Search')"></b-input>
              <b-input-group-append>
                <b-button v-b-toggle.collapse_advanced_search variant="primary" class="shadow-none"><i
                    class="fas fa-caret-down" v-if="!advanced_search_visible"></i><i class="fas fa-caret-up"
                                                                                     v-if="advanced_search_visible"></i>
                </b-button>
              </b-input-group-append>
            </b-input-group>


            <b-collapse id="collapse_advanced_search" class="mt-2" v-model="advanced_search_visible">
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-4">
                      <a class="btn btn-primary" :href="resolveDjangoUrl('new_recipe')">new Recipe</a>
                    </div>
                    <div class="col-md-4">
                      <a class="btn btn-primary" :href="resolveDjangoUrl('data_import_url')">URL Import</a>
                    </div>
                    <div class="col-md-4">
                      <a class="btn btn-primary" href="#">Rest Search</a>
                    </div>
                    <div class="col-md-4">
                      <b-form-checkbox v-model="search_internal" name="check-button" @change="refreshData"
                                       class="shadow-none" switch>
                        {{ $t('show_only_internal') }}
                      </b-form-checkbox>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">


                      <b-input-group style="margin-top: 1vh">

                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_keywords"
                                             search_function="listKeywords" label="label" style="width: 90%"
                                             v-bind:placeholder="$t('Keywords')"></generic-multiselect>

                        <b-input-group-append is-text style="width: 10%">
                          <b-form-checkbox v-model="search_keywords_or" name="check-button" @change="refreshData"
                                           class="shadow-none" style="width: 100%" switch>
                            <template v-if="search_keywords_or">{{ $t('OR') }}</template>
                            <template v-else>{{ $t('AND') }}</template>
                          </b-form-checkbox>
                        </b-input-group-append>
                      </b-input-group>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">

                      <b-input-group style="margin-top: 1vh">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_foods"

                                             search_function="listFoods" label="name" style="width: 90%"
                                             v-bind:placeholder="$t('Ingredients')"></generic-multiselect>
                        <b-input-group-append is-text style="width: 10%">
                          <b-form-checkbox v-model="search_foods_or" name="check-button" @change="refreshData"
                                           class="shadow-none" tyle="width: 100%" switch>
                            {{ $t('OR') }}
                          </b-form-checkbox>
                        </b-input-group-append>
                      </b-input-group>

                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">

                      <b-input-group style="margin-top: 1vh">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_books"
                                             search_function="listRecipeBooks" label="name" style="width: 90%"
                                             v-bind:placeholder="$t('Books')"></generic-multiselect>
                        <b-input-group-append is-text style="width: 10%">
                          <b-form-checkbox v-model="search_books_or" name="check-button" @change="refreshData"
                                           class="shadow-none" tyle="width: 100%" switch>
                            {{ $t('OR') }}
                          </b-form-checkbox>
                        </b-input-group-append>
                      </b-input-group>


                    </div>
                  </div>


                </div>
              </div>
            </b-collapse>


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
      <div class="col-md-2 d-none d-md-block">

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
import GenericMultiselect from "@/components/GenericMultiselect";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeSearchView',
  mixins: [ResolveUrlMixin],
  components: {GenericMultiselect, RecipeCard},
  data() {
    return {
      recipes: [],
      search_input: '',
      search_internal: false,
      search_keywords: [],
      search_foods: [],
      search_books: [],

      search_keywords_or: true,
      search_foods_or: true,
      search_books_or: true,

      advanced_search_visible: true,

    }

  },
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.listRecipes({
        query: {
          query: this.search_input,
          keywords: this.search_keywords.map(function (A) {
            return A["id"];
          }),
          foods: this.search_foods.map(function (A) {
            return A["id"];
          }),
          books: this.search_books.map(function (A) {
            return A["id"];
          }),

          keywords_or: this.search_keywords_or,
          foods_or: this.search_foods_or,
          books_or: this.search_books_or,

          internal: this.search_internal,
          limit: 20,
        }
      }).then(result => {
        this.recipes = result.data
      })
    },
    genericSelectChanged: function (obj) {
      this[obj.var] = obj.val
      this.refreshData()
    }
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
