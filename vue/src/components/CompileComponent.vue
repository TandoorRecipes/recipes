<template>
  <div>
    <component :is="compiled" :servings="servings" :code="code"></component>
  </div>
</template>

<script>
import Vue from 'vue'

import ScalableNumber from "@/components/ScalableNumber";

export default {
  name: 'CompileComponent',
  props: ['code', 'servings'],
  data() {
    return {
      compiled: null,
    }
  },
  mounted() {
    this.compiled = Vue.component('compiled-component', {
      props: ['servings', 'code'],
      components: {
        ScalableNumber, // eslint-disable-line
      },
      template: `
        <div>${this.code}</div>`
    })

  }
}
</script>
