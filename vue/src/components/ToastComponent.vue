<template>

</template>

<script>
import Vue from 'vue'

import {BootstrapVue} from 'bootstrap-vue'

Vue.use(BootstrapVue)

export default {
  name: "ToastComponent",
  methods: {
    this.$bvToast.toast(message, {
      title: title,
      variant: variant,
      toaster: 'b-toaster-top-center',
      solid: true
    })
  }
}
</script>

<style scoped>

</style>