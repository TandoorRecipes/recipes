<template>
  <div>
    <component :is="compiled" :servings="servings" :code="code"></component>
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
      template: `<div>${this.code}</div>`
    })

  }
}
</script>

