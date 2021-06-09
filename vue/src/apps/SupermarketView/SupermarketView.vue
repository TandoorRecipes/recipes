<template>

  <div id="app">

    <div class="row">

      <div class="col col-md-12">
        <h2>{{ $t('Supermarket') }}</h2>

        <multiselect v-model="selected_supermarket" track-by="id" label="name"
                     :options="supermarkets">
        </multiselect>

        <b-button class="btn btn-primary btn-block" style="margin-top: 1vh" v-b-modal.modal-supermarket>
          {{ $t('Edit') }}
        </b-button>
        <b-button class="btn btn-success btn-block" @click="selected_supermarket = {new:true, name:''}"
                  v-b-modal.modal-supermarket>{{ $t('New') }}
        </b-button>
      </div>
    </div>

    <hr>

    <div class="row">
      <div class="col col-md-6">
        <h4>{{ $t('Categories') }}
          <button class="btn btn-success btn-sm">{{ $t('New') }}</button>
        </h4>

        <draggable :list="categories" group="supermarket_categories"
                   :empty-insert-threshold="10">
          <div v-for="c in categories" :key="c.id">
            <button class="btn btn-block btn-sm btn-primary" style="margin-top: 0.5vh">{{ c.name }}</button>

          </div>
        </draggable>


      </div>
      <div class="col col-md-6">
        <h4>{{ $t('Selected') }} {{ $t('Categories') }}</h4>

        <draggable :list="selected_categories" group="supermarket_categories"
                   :empty-insert-threshold="10">
          <div v-for="c in selected_categories" :key="c.id">
            <button class="btn btn-block btn-sm btn-primary" style="margin-top: 0.5vh">{{ c.name }}</button>

          </div>
        </draggable>
      </div>
    </div>

    <!-- EDIT MODALS -->
    <b-modal id="modal-supermarket" v-bind:title="$t('Supermarket')" @ok="supermarketModalOk()">
      <label v-if="selected_supermarket !== undefined">
        {{ $t('Name') }}
        <b-input v-model="selected_supermarket.name"></b-input>

      </label>
    </b-modal>

    <b-modal id="modal-category" v-bind:title="$t('Category')" @ok="categoryModalOk()">
      <label v-if="selected_supermarket !== undefined">
        {{ $t('Name') }}
        <b-input v-model="selected_supermarket.name"></b-input>

      </label>
    </b-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ResolveUrlMixin, ToastMixin} from "@/utils/utils";


import {ApiApiFactory} from "@/utils/openapi/api.ts";

Vue.use(BootstrapVue)
import draggable from 'vuedraggable'

import axios from 'axios'
import Multiselect from "vue-multiselect";

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

export default {
  name: 'SupermarketView',
  mixins: [
    ResolveUrlMixin,
    ToastMixin,
  ],
  components: {
    Multiselect,
    draggable
  },
  data() {
    return {
      supermarkets: [],
      categories: [],

      selected_supermarket: {},
      selected_categories: [],
    }
  },
  mounted() {
    this.$i18n.locale = window.CUSTOM_LOCALE
    console.log('LOADED')
    this.loadInitial()
  },
  methods: {
    loadInitial: function () {
      let apiClient = new ApiApiFactory()
      apiClient.listSupermarkets().then(results => {
        this.supermarkets = results.data
      })
      apiClient.listSupermarketCategorys().then(results => {
        this.categories = results.data
      })
    },
    supermarketModalOk: function () {
      let apiClient = new ApiApiFactory()
      if (this.selected_supermarket.new) {
        apiClient.createSupermarket({name: this.selected_supermarket.name}).then(results => {
          this.selected_supermarket = undefined
          this.loadInitial()
        })
      } else {
        apiClient.partialUpdateSupermarket(this.selected_supermarket.id, {name: this.selected_supermarket.name})

      }
    },
    categoryModalOk: function () {
      let apiClient = new ApiApiFactory()
      if (this.selected_supermarket.new) {
        apiClient.createSupermarket({name: this.selected_supermarket.name}).then(results => {
          this.selected_supermarket = undefined
          this.loadInitial()
        })
      } else {
        apiClient.partialUpdateSupermarket(this.selected_supermarket.id, {name: this.selected_supermarket.name})

      }
    }
  }
}

</script>

<style>


</style>
