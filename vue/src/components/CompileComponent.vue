<template>
  <div>
    <component :is="compiled" :ingredient_factor="ingredient_factor" :code="code"></component>
  </div>
</template>

<script>
import Vue from 'vue'

import ScalableNumber from "@/components/ScalableNumber";

/*
i dont 100% understand this kind of dirty workaround but it works ...
If you read this and know a better way of running arbitrary vue code that comes from an API endpoint let me know

obviously only run trusted code this way ...
*/

export default {
  name: 'CompileComponent',
  props: ['code', 'ingredient_factor'],
  data() {
    return {
      compiled: null,
    }
  },
  mounted() {
    this.compiled = Vue.component('compiled-component', {
      props: ['ingredient_factor', 'code'],
      components: {
        ScalableNumber, // eslint-disable-line
      },
      template: `<div>${this.code}</div>`
    })

  }
}
</script>

