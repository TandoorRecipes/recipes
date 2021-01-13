<template>

  <div>
    <component :is="compiled" :servings="servings" :code="code"></component>
  </div>
</template>

<script>
import Vue from 'vue'

import ScalableNumber from "@/components/ScalableNumber";

var res = Vue.compile('<div><span>{{servings}}  Test <scalable-number v-bind:number="2" :factor="servings"></scalable-number></span></div>')

export default {
  name: 'CompileComponent',
  props: ['code', 'servings'],
  data() {
    return {
      compiled: null,
      test: '<div><p>Alle Zutaten vermischen und an einen <strong>warmen Ort</strong> stelllen <scalable-number v-bind:number="10.0000000000000000" v-bind:factor="servings"></scalable-number> g Anstellgut</p></div>'
    }
  },
  components: {
    ScalableNumber, // eslint-disable-line
  },
  mounted() {
    setTimeout(() => {
      this.compiled = Vue.component('button-counter', {
        props: ['servings', 'code'],
        components: {
          ScalableNumber, // eslint-disable-line
        },
        data: function () {
          return {
            count: 0
          }
        },
        template: `<div>${this.code}</div>`
      })
    }, 500)

  }
}
</script>
