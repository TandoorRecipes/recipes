<template>
  <div id="app">

    <div class="row">
      <div class="col col-md-12">
        <h2>{{ $t('Import') }}</h2>
      </div>

    </div>

    <br/>
    <br/>

    <template v-if="import_info !== undefined">

      <template v-if="import_info.running" style="text-align: center;">
        <div class="row">
          <div class="col col-md-12">

          </div>

        </div>
        <loading-spinner></loading-spinner>
        <br/>
        <br/>
        <h5 style="text-align: center">{{ $t('Importing') }}...</h5>

      </template>
      <template v-else>
        <div class="row">
          <div class="col col-md-12">
            <span>{{ $t('Import_finished') }}! </span>
            <a :href="`${resolveDjangoUrl('view_search') }?keywords=${import_info.keyword.id}`"
               v-if="import_info.keyword !== null">{{ $t('View_Recipes') }}</a>

          </div>
        </div>

        <br/>

        <div class="row">
          <div class="col col-md-12">
            <label for="id_textarea">{{ $t('Information') }}</label>
            <textarea id="id_textarea" class="form-control" style="height: 50vh" v-html="import_info.msg"
                      disabled></textarea>

          </div>
        </div>


      </template>
    </template>
  </div>


</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ResolveUrlMixin, ToastMixin} from "@/utils/utils";

import LoadingSpinner from "@/components/LoadingSpinner";

import {ApiApiFactory} from "@/utils/openapi/api.ts";

Vue.use(BootstrapVue)

export default {
  name: 'ImportResponseView',
  mixins: [
    ResolveUrlMixin,
    ToastMixin,
  ],
  components: {
    LoadingSpinner
  },
  data() {
    return {
      import_id: window.IMPORT_ID,
      import_info: undefined,
    }
  },
  mounted() {
    this.refreshData()
    this.$i18n.locale = window.CUSTOM_LOCALE
    setInterval(() => {
      if ((this.import_id !== null) && window.navigator.onLine && this.import_info.running) {
        this.refreshData()
      }
    }, 5000)

  },
  methods: {
    refreshData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.retrieveImportLog(this.import_id).then(result => {
        this.import_info = result.data
      })
    }
  }
}

</script>

<style>


</style>
