<template>

  <div id="app">


    <div class="row">
      <div class="col col-md-12">
        <h3>{{ $t('Files') }} <a class="btn btn-success float-right"><i class="fas fa-plus-circle"></i> {{ $t('New') }}</a>
        </h3>
      </div>

    </div>

    <div class="row" style="margin-top: 2vh">
      <div class="col col-md-12">
        <b-progress :max="max_file_size_mb">
          <b-progress-bar :value="current_file_size_mb">
            <span><strong>{{ current_file_size_mb.toFixed(2) }} / {{ max_file_size_mb }} MB</strong></span>
          </b-progress-bar>
        </b-progress>
      </div>

    </div>

    <div class="row" style="margin-top: 2vh">
      <div class="col col-md-12">
        <table class="table">
          <thead>
          <tr>
            <th>{{ $t('Name') }}</th>
            <th>{{ $t('Size') }} (MB)</th>
          </tr>
          </thead>
          <tr v-for="f in files" v-bind:key="f.id">
            <td>{{ f.name }}</td>
            <td>{{ f.file_size_kb / 1000 }}</td>
          </tr>
        </table>
      </div>

    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ResolveUrlMixin, ToastMixin} from "@/utils/utils";


import {ApiApiFactory} from "@/utils/openapi/api.ts";

Vue.use(BootstrapVue)
// import draggable from 'vuedraggable'

import axios from 'axios'
// import Multiselect from "vue-multiselect";

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

export default {
  name: 'UserFileView',
  mixins: [
    ResolveUrlMixin,
    ToastMixin,
  ],
  components: {
    // Multiselect,
    // draggable
  },
  data() {
    return {
      files: [],

      current_file_size_mb: window.CURRENT_FILE_SIZE_MB,
      max_file_size_mb: window.MAX_FILE_SIZE_MB
    }
  },
  mounted() {
    this.$i18n.locale = window.CUSTOM_LOCALE
    this.loadInitial()
  },
  methods: {
    loadInitial: function () {
      let apiClient = new ApiApiFactory()
      apiClient.listUserFiles().then(results => {
        this.files = results.data
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
  }
}

</script>

<style>


</style>
