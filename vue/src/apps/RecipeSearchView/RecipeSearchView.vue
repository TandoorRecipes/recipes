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
                    class="fas fa-caret-down" v-if="!settings.advanced_search_visible"></i><i class="fas fa-caret-up"
                                                                                              v-if="settings.advanced_search_visible"></i>
                </b-button>
              </b-input-group-append>
            </b-input-group>


            <b-collapse id="collapse_advanced_search" class="mt-2" v-model="settings.advanced_search_visible">
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-3" style="margin-top: 1vh">
                      <a class="btn btn-primary btn-block text-uppercase"
                         :href="resolveDjangoUrl('new_recipe')">{{ $t('New_Recipe') }}</a>
                    </div>
                    <div class="col-md-3" style="margin-top: 1vh">
                      <a class="btn btn-primary btn-block text-uppercase"
                         :href="resolveDjangoUrl('data_import_url')">{{ $t('Url_Import') }}</a>
                    </div>
                    <div class="col-md-3" style="margin-top: 1vh">
                      <button class="btn btn-primary btn-block text-uppercase" @click="resetSearch">
                        {{ $t('Reset_Search') }}
                      </button>
                    </div>
                    <div class="col-md-3" style="position: relative; margin-top: 1vh">
                      <b-form-checkbox v-model="search_internal" name="check-button" @change="refreshData"
                                       class="shadow-none"
                                       style="position:relative;top: 50%;  transform: translateY(-50%);" switch>
                        {{ $t('show_only_internal') }}
                      </b-form-checkbox>
                    </div>
                  </div>


                  <div class="row">
                    <div class="col-12">


                      <b-input-group style="margin-top: 1vh">

                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_keywords"
                                             :initial_selection="search_keywords"
                                             search_function="listKeywords" label="label"
                                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                             v-bind:placeholder="$t('Keywords')"></generic-multiselect>

                        <b-input-group-append>
                          <b-input-group-text>

                            <b-form-checkbox v-model="settings.search_keywords_or" name="check-button"
                                             @change="refreshData"
                                             class="shadow-none" switch>
                              <span class="text-uppercase" v-if="settings.search_keywords_or">{{ $t('or') }}</span>
                              <span class="text-uppercase" v-else>{{ $t('and') }}</span>
                            </b-form-checkbox>
                          </b-input-group-text>
                        </b-input-group-append>
                      </b-input-group>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">

                      <b-input-group style="margin-top: 1vh">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_foods"
                                             :initial_selection="search_foods"
                                             search_function="listFoods" label="name"
                                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                             v-bind:placeholder="$t('Ingredients')"></generic-multiselect>
                        <b-input-group-append>
                          <b-input-group-text>
                            <b-form-checkbox v-model="settings.search_foods_or" name="check-button"
                                             @change="refreshData"
                                             class="shadow-none" switch>
                              <span class="text-uppercase" v-if="settings.search_foods_or">{{ $t('or') }}</span>
                              <span class="text-uppercase" v-else>{{ $t('and') }}</span>
                            </b-form-checkbox>
                          </b-input-group-text>
                        </b-input-group-append>
                      </b-input-group>

                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">

                      <b-input-group style="margin-top: 1vh">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_books"
                                             :initial_selection="search_books"
                                             search_function="listRecipeBooks" label="name"
                                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                             v-bind:placeholder="$t('Books')"></generic-multiselect>
                        <b-input-group-append>
                          <b-input-group-text>

                            <b-form-checkbox v-model="settings.search_books_or" name="check-button"
                                             @change="refreshData"
                                             class="shadow-none" tyle="width: 100%" switch>
                              <span class="text-uppercase" v-if="settings.search_books_or">{{ $t('or') }}</span>
                              <span class="text-uppercase" v-else>{{ $t('and') }}</span>
                            </b-form-checkbox>
                          </b-input-group-text>
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

              <template
                  v-if="search_input === '' && search_keywords.length === 0 &&  search_foods.length === 0  && search_books.length === 0">
                <recipe-card v-bind:key="`mp_${m.id}`" v-for="m in meal_plans" :recipe="m.recipe"
                             :meal_plan="m" :footer_text="m.meal_type_name"
                             footer_icon="far fa-calendar-alt"></recipe-card>

                <recipe-card v-for="r in last_viewed_recipes" v-bind:key="`rv_${r.id}`" :recipe="r"
                             v-bind:footer_text="$t('Recently_Viewed')" footer_icon="fas fa-eye"></recipe-card>
              </template>

              <recipe-card v-for="r in recipes" v-bind:key="r.id" :recipe="r"></recipe-card>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 2vh">
          <div class="col col-md-12">
            <b-pagination
                v-model="pagination_page"
                :total-rows="pagination_count"
                per-page="25"
                @change="pageChange"
                align="center">

            </b-pagination>
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
import moment from 'moment'

import VueCookies from 'vue-cookies'

Vue.use(VueCookies)

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
      meal_plans: [],
      last_viewed_recipes: [],

      search_input: '',
      search_internal: false,
      search_keywords: [],
      search_foods: [],
      search_books: [],

      settings: {
        search_keywords_or: true,
        search_foods_or: true,
        search_books_or: true,
        advanced_search_visible: false,
      },

      pagination_count: 0,
      pagination_page: 1,
    }

  },
  mounted() {
    if (this.$cookies.isKey('search_settings')) {
      console.log('loaded cookie settings')
      this.settings = this.$cookies.get("search_settings")
    }

    this.refreshData()

    this.loadSpecialData()
  },
  watch: {
    settings: {
      handler(val) {
        console.log('saved cookie settings', val)
        this.$cookies.set("search_settings", this.settings, -1)
      },
      deep: true
    }
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

          keywords_or: this.settings.search_keywords_or,
          foods_or: this.settings.search_foods_or,
          books_or: this.settings.search_books_or,

          internal: this.search_internal,
          page: this.pagination_page,
        }
      }).then(result => {
        this.recipes = result.data.results
        this.pagination_count = result.data.count
      })
    },
    loadSpecialData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.listMealPlans({
        query: {
          from_date: moment().format('YYYY-MM-DD'),
          to_date: moment().format('YYYY-MM-DD')
        }
      }).then(result => {
        this.meal_plans = result.data
      })

      apiClient.listRecipes({query: {last_viewed: 5}}).then(result => {
        this.last_viewed_recipes = result.data.results
      })
    },
    genericSelectChanged: function (obj) {
      this[obj.var] = obj.val
      this.refreshData()
    },
    resetSearch: function () {
      this.search_input = ''
      this.search_internal = false
      this.search_keywords = []
      this.search_foods = []
      this.search_books = []
      this.refreshData()
    },
    pageChange: function (page) {
      this.pagination_page = page
      this.refreshData()
    }
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
