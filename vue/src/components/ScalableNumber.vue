<template>
  <p>{{ calculateAmount(number) }}</p>
</template>

<script>

import {calculateAmount} from "@/utils/utils";

export default {
  name: 'ScalableNumber',
  props: {
    number: Number,
    factor: {
      type: Number,
      default: 4
    },
  },
  methods: {
    calculateAmount: function (x) {
      console.log("calculated amount")
      return calculateAmount(x, this.factor)
    }
  }
}
</script>
