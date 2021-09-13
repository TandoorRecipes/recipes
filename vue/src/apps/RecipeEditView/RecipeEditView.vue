<template>
  <div id="app" >

  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ResolveUrlMixin} from "@/utils/utils";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeSearchView',
  mixins: [ResolveUrlMixin],
  components: {},
  data() {
    return {

    }

  },
  computed: {

  },
  mounted() {

    this.$i18n.locale = window.CUSTOM_LOCALE
  },
  watch: {

  },
  methods: {

  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
