<template>
  <div id="app">
        Test
  </div>


</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ResolveUrlMixin, ToastMixin} from "@/utils/utils";

Vue.use(BootstrapVue)

export default {
  name: 'ImportView',
  mixins: [
    ResolveUrlMixin,
    ToastMixin,
  ],
  components: {

  },
  data() {
    return {

    }
  },
  mounted() {


  },
  methods: {

  }
}

</script>

<style>


</style>
