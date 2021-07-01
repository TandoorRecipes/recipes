<template>
  <div id="app" style="margin-bottom: 4vh">
    <div class="row">
      <div class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1">
        <div class="row">
          <div class="col col-md-12">
            <div class="row justify-content-center">
              <div class="col-12 col-lg-10 col-xl-8 mt-3 mb-3">
                <b-input-group>
                  <b-input class="form-control form-control-lg form-control-borderless form-control-search" v-model="settings.search_input"
                           v-bind:placeholder="$t('Search')"></b-input>
                  <b-input-group-append>
                    <b-button v-b-toggle.collapse_advanced_search
                              v-bind:class="{'btn-primary': !isAdvancedSettingsSet(), 'btn-danger': isAdvancedSettingsSet()}"
                              class="shadow-none btn"><i
                        class="fas fa-caret-down" v-if="!settings.advanced_search_visible"></i><i
                        class="fas fa-caret-up"
                        v-if="settings.advanced_search_visible"></i>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </div>
            </div>


            <b-collapse id="collapse_advanced_search" class="mt-2 shadow-sm" v-model="settings.advanced_search_visible">
              <div class="card">
                <div class="card-body p-4">

                  <div class="row">
                    <div class="col-md-3">
                      <a class="btn btn-primary btn-block text-uppercase"
                         :href="resolveDjangoUrl('new_recipe')">{{ $t('New_Recipe') }}</a>
                    </div>
                    <div class="col-md-3">
                      <a class="btn btn-primary btn-block text-uppercase"
                         :href="resolveDjangoUrl('data_import_url')">{{ $t('Import') }}</a>
                    </div>
                    <div class="col-md-3">
                      <button class="btn btn-block text-uppercase" v-b-tooltip.hover :title="$t('show_only_internal')"
                              v-bind:class="{'btn-success':settings.search_internal, 'btn-primary':!settings.search_internal}"
                              @click="settings.search_internal = !settings.search_internal;refreshData()">
                        {{ $t('Internal') }}
                      </button>
                    </div>

                    <div class="col-md-3">
                      <button id="id_settings_button" class="btn btn-primary btn-block text-uppercase"><i
                          class="fas fa-cog fa-lg  m-1"></i>
                      </button>
                    </div>


                  </div>


                  <b-popover
                      target="id_settings_button"
                      triggers="click"
                      placement="bottom"
                      :title="$t('Settings')">
                    <div>
                      <b-form-group
                          v-bind:label="$t('Recently_Viewed')"
                          label-for="popover-input-1"
                          label-cols="6"
                          class="mb-3">
                        <b-form-input
                            type="number"
                            v-model="settings.recently_viewed"
                            id="popover-input-1"
                            size="sm"
                        ></b-form-input>
                      </b-form-group>

                      <b-form-group
                          v-bind:label="$t('Meal_Plan')"
                          label-for="popover-input-2"
                          label-cols="6"
                          class="mb-3">
                        <b-form-checkbox
                            switch
                            v-model="settings.show_meal_plan"
                            id="popover-input-2"
                            size="sm"
                        ></b-form-checkbox>
                      </b-form-group>
                    </div>
                    <div class="row" style="margin-top: 1vh">
                      <div class="col-12">
                        <a :href="resolveDjangoUrl('view_settings') + '#search'">{{ $t('Advanced Search Settings') }}</a>
                      </div>
                    </div>
                    <div class="row" style="margin-top: 1vh">
                      <div class="col-12" style="text-align: right">
                        <b-button size="sm" variant="secondary" style="margin-right:8px"
                                  @click="$root.$emit('bv::hide::popover')">{{ $t('Close') }}
                        </b-button>
                      </div>
                    </div>
                  </b-popover>

                  <div class="row">
                    <div class="col-12">
                      <b-input-group class="mt-2">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_keywords"
                                             :initial_selection="settings.search_keywords"
                                             search_function="listKeywords" label="label"
                                             :tree_api="true"
                                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                             v-bind:placeholder="$t('Keywords')"></generic-multiselect>
                        <b-input-group-append>
                          <b-input-group-text>
                            <b-form-checkbox v-model="settings.search_keywords_or" name="check-button"
                                             @change="refreshData(false)"
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
                      <b-input-group class="mt-2">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_foods"
                                             :initial_selection="settings.search_foods"
                                             search_function="listFoods" label="name"
                                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                             v-bind:placeholder="$t('Ingredients')"></generic-multiselect>
                        <b-input-group-append>
                          <b-input-group-text>
                            <b-form-checkbox v-model="settings.search_foods_or" name="check-button"
                                             @change="refreshData(false)"
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
                      <b-input-group class="mt-2">
                        <generic-multiselect @change="genericSelectChanged" parent_variable="search_books"
                                             :initial_selection="settings.search_books"
                                             search_function="listRecipeBooks" label="name"
                                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                             v-bind:placeholder="$t('Books')"></generic-multiselect>
                        <b-input-group-append>
                          <b-input-group-text>
                            <b-form-checkbox v-model="settings.search_books_or" name="check-button"
                                             @change="refreshData(false)"
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

        <div class="row">
          <div class="col col-md-12 text-right" style="margin-top: 2vh">
            <span class="text-muted">
            {{ $t('Page') }} {{ settings.pagination_page }}/{{ pagination_count }} <a href="#" @click="resetSearch"><i
                class="fas fa-times-circle"></i> {{ $t('Reset') }}</a>
            </span>
          </div>
        </div>

        <div class="row">
          <div class="col col-md-12">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));grid-gap: 1rem;">

              <template
                  v-if="settings.search_input === '' && settings.search_keywords.length === 0 &&  settings.search_foods.length === 0  && settings.search_books.length === 0">
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
            <b-pagination pills
                          v-model="settings.pagination_page"
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
import _debounce from 'lodash/debounce'

import VueCookies from 'vue-cookies'

Vue.use(VueCookies)

import {ResolveUrlMixin} from "@/utils/utils";

import LoadingSpinner from "@/components/LoadingSpinner";

import {ApiApiFactory} from "@/utils/openapi/api.ts";
import RecipeCard from "@/components/RecipeCard";
import GenericMultiselect from "@/components/GenericMultiselect";

Vue.use(BootstrapVue)

let SETTINGS_COOKIE_NAME = 'search_settings'

export default {
  name: 'RecipeSearchView',
  mixins: [ResolveUrlMixin],
  components: {GenericMultiselect, RecipeCard},
  data() {
    return {
      recipes: [],
      meal_plans: [],
      last_viewed_recipes: [],

      settings_loaded: false,
      settings: {
        search_input: '',
        search_internal: false,
        search_keywords: [],
        search_foods: [],
        search_books: [],

        search_keywords_or: true,
        search_foods_or: true,
        search_books_or: true,
        advanced_search_visible: false,
        show_meal_plan: true,
        recently_viewed: 5,

        pagination_page: 1,
      },

      pagination_count: 0,
    }

  },
  mounted() {
    this.$nextTick(function () {
      if (this.$cookies.isKey(SETTINGS_COOKIE_NAME)) {
        let cookie_val = this.$cookies.get(SETTINGS_COOKIE_NAME)
        for (let i of Object.keys(cookie_val)) {
          this.$set(this.settings, i, cookie_val[i])
        }
        //TODO i have no idea why the above code does not suffice to update the
        //TODO pagination UI element as $set should update all values reactively but it does not
        setTimeout(function () {
          this.$set(this.settings, 'pagination_page', 0)
        }.bind(this), 50)
        setTimeout(function () {
          this.$set(this.settings, 'pagination_page', cookie_val['pagination_page'])
        }.bind(this), 51)

      }


      let urlParams = new URLSearchParams(window.location.search);
      let apiClient = new ApiApiFactory()

      if (urlParams.has('keyword')) {
        this.settings.search_keywords = []
        for (let x of urlParams.getAll('keyword')) {
          let keyword = {id: x, name: 'loading'}
          this.settings.search_keywords.push(keyword)
          apiClient.retrieveKeyword(x).then(result => {
            this.$set(this.settings.search_keywords, this.settings.search_keywords.indexOf(keyword), result.data)
          })
        }
      }

      this.loadMealPlan()
      this.loadRecentlyViewed()
      this.refreshData(false)
    })

    this.$i18n.locale = window.CUSTOM_LOCALE
  },
  watch: {
    settings: {
      handler() {
        this.$cookies.set(SETTINGS_COOKIE_NAME, this.settings, -1)
      },
      deep: true
    },
    'settings.show_meal_plan': function () {
      this.loadMealPlan()
    },
    'settings.recently_viewed': function () {
      this.loadRecentlyViewed()
    },
    'settings.search_input': _debounce(function () {
      this.refreshData(false)
    }, 300),
  },
  methods: {
    refreshData: function (page_load) {
      let apiClient = new ApiApiFactory()
      apiClient.listRecipes(
          this.settings.search_input,
          this.settings.search_keywords.map(function (A) {
            return A["id"];
          }),
          this.settings.search_foods.map(function (A) {
            return A["id"];
          }),
          this.settings.search_books.map(function (A) {
            return A["id"];
          }),
          this.settings.search_keywords_or,
          this.settings.search_foods_or,
          this.settings.search_books_or,

          this.settings.search_internal,
          undefined,
          this.settings.pagination_page,
      ).then(result => {
        window.scrollTo(0, 0);
        this.pagination_count = result.data.count
        this.recipes = result.data.results
      })
    },
    loadMealPlan: function () {
      let apiClient = new ApiApiFactory()

      if (this.settings.show_meal_plan) {
        apiClient.listMealPlans({
          query: {
            from_date: moment().format('YYYY-MM-DD'),
            to_date: moment().format('YYYY-MM-DD')
          }
        }).then(result => {
          this.meal_plans = result.data
        })
      } else {
        this.meal_plans = []
      }


    },
    loadRecentlyViewed: function () {
      let apiClient = new ApiApiFactory()
      if (this.settings.recently_viewed > 0) {
        apiClient.listRecipes(undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined, {query: {last_viewed: this.settings.recently_viewed}}).then(result => {
          this.last_viewed_recipes = result.data.results
        })
      } else {
        this.last_viewed_recipes = []
      }
    },
    genericSelectChanged: function (obj) {
      this.settings[obj.var] = obj.val
      this.refreshData(false)
    },
    resetSearch: function () {
      this.settings.search_input = ''
      this.settings.search_internal = false
      this.settings.search_keywords = []
      this.settings.search_foods = []
      this.settings.search_books = []
      this.settings.pagination_page = 1
      this.refreshData(false)
    },
    pageChange: function (page) {
      this.settings.pagination_page = page
      this.refreshData()
    },
    isAdvancedSettingsSet() {
      return ((this.settings.search_keywords.length + this.settings.search_foods.length + this.settings.search_books.length) > 0)
    }
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
