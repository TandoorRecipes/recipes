<template>
  <span class="scalable" :class="[this.factor===1 ? 'unscaled' : (this.factor > 1 ? 'scaled-up':'scaled-down')]" v-html="calculateAmount(number)"></span>
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
