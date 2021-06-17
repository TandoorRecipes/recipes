<template>
  <div id="app">

    <br/>

    <template v-if="import_info !== undefined">

      <template v-if="import_info.running">
        <h5 style="text-align: center">{{ $t('Importing') }}...</h5>

        <b-progress :max="import_info.total_recipes">
          <b-progress-bar :value="import_info.imported_recipes" :label="`${import_info.imported_recipes}/${import_info.total_recipes}`"></b-progress-bar>
        </b-progress>

        <loading-spinner :size="25"></loading-spinner>
      </template>

      <div class="row">
        <div class="col col-md-12" v-if="!import_info.running">
          <span>{{ $t('Import_finished') }}! </span>
          <a :href="`${resolveDjangoUrl('view_search') }?keyword=${import_info.keyword.id}`"
             v-if="import_info.keyword !== null">{{ $t('View_Recipes') }}</a>

        </div>
      </div>

      <br/>

      <div class="row">
        <div class="col col-md-12">
          <label for="id_textarea">{{ $t('Information') }}</label>
          <textarea id="id_textarea" ref="output_text" class="form-control" style="height: 50vh"
                    v-html="import_info.msg"
                    disabled></textarea>

        </div>
      </div>
      <br/>
      <br/>
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
        let el = this.$refs.output_text
        el.scrollTop = el.scrollHeight;
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
