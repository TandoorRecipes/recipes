<template>

  <div>
    <component :is="compiled" :servings="servings"></component>
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
      test: '<div><span>{{servings}}  Test <scalable-number v-bind:number="2" :factor="servings"></scalable-number></span></div>'
    }
  },
  components: {
    ScalableNumber, // eslint-disable-line
  },
  mounted() {
    setTimeout(() => {
      this.compiled = Vue.component('button-counter', {
        props: ['servings'],
        data: function () {
          return {
            count: 0
          }
        },
        template: '<button v-on:click="count++">You clicked me {{ servings }} times.</button>'
      })
    }, 500)

  }
}
</script>
