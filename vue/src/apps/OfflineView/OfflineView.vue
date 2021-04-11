<template>
  <div id="app">

    <label>
      {{ $t('Search') }}
      <input type="text" v-model="filter" class="form-control">
    </label>

    <div class="row">
      <div class="col-md-3" v-for="r in filtered_recipes" :key="r.id">
        <b-card :title="r.name" tag="article">
          <b-card-text>
            <span class="text-muted">{{ formatDateTime(r.updated_at) }}</span>
            {{ r.description }}
          </b-card-text>
          <b-button :href="resolveDjangoUrl('view_recipe', r.id)" variant="primary">{{ $t('Open') }}</b-button>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'
import {ResolveUrlMixin} from "@/utils/utils";
import moment from "moment";

Vue.use(BootstrapVue)
Vue.prototype.moment = moment

export default {
  name: 'OfflineView',
  mixins: [
    ResolveUrlMixin,
  ],
  computed: {
    filtered_recipes: function () {
      let filtered_list = {}
      this.recipes.forEach((recipe) => {
        if (recipe.name.toLowerCase().includes(this.filter.toLowerCase())) {
          if (recipe.id in filtered_list) {
            if (recipe.updated_at > filtered_list[recipe.id].updated_at) {
              filtered_list[recipe.id] = recipe
            }
          } else {
            filtered_list[recipe.id] = recipe
          }
        }
      })
      return filtered_list
    }
  },
  data() {
    return {
      recipes: [],
      filter: '',
    }
  },
  mounted() {
    this.loadRecipe()
  },
  methods: {
    formatDateTime: function (datetime) {
      moment.locale(window.navigator.language);
      return moment(datetime).format('LLL')
    },
    loadRecipe: function () {
      caches.open('api-recipe').then(productsRuntimeCache => {
        productsRuntimeCache.keys().then(keys => {
          keys.forEach((key) => {
            caches.match(key).then((response) => {
              response.json().then((json) => {
                this.recipes.push(json)
              })
            })
          })
        });
      });
    },
  }
}

</script>

<style>


</style>
