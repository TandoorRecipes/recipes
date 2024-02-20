<template>
  <span class="step__scalable-num" :class="[this.factor===1 ? 'step__scalable-num_scaled_false' : (this.factor > 1 ? 'step__scalable-num_scaled_up':'step__scalable-num_scaled_down')]" v-html="calculateAmount(number)"></span>
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
      return calculateAmount(x, this.factor)
    }
  }
}
</script>
