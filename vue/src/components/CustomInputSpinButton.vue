// code taken from https://github.com/bootstrap-vue/bootstrap-vue/issues/4977#issuecomment-740215609 and modified
<template>
  <b-input-group>
    <b-input-group-prepend class="d-print-none">
      <b-button variant="outline-primary" class="py-0 px-2" size="sm" @click="valueChange(value - 1)">
        <b-icon icon="dash" font-scale="1.6" />
      </b-button>
    </b-input-group-prepend>

    <b-form-input
      variant="outline-primary"
      :size="size"
      :value="value"
      type="number"      
      min="0"
      class="custom-spin-input"
      number
      @update="valueChange"
    />

    <b-input-group-append class="d-print-none">
      <b-button variant="outline-primary" class="py-0 px-2" size="sm" @click="valueChange(value + 1)">
        <b-icon icon="plus" font-scale="1.6" />
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
import { BIcon, BIconDash, BIconPlus } from 'bootstrap-vue'

export default {
  name: 'CustomInputSpinButton',

  components: {
    BIcon,

    /* eslint-disable vue/no-unused-components */
    BIconDash,
    BIconPlus
  },

  props: {

    size: {
      type: String,
      required: false,
      default: 'md',
      validator: function (value) {
        return ['sm', 'md', 'lg'].includes(value)
      }
    },

    value: {
      type: Number,
      required: true
    }
  },

  methods: {
    valueChange (newValue) {
      if (newValue <= 0) {
        this.$emit('input', 0)
      } else {
        this.$emit('input', newValue)
      }
    }
  }
}
</script>

<style scoped>
input.custom-spin-input {
  text-align: center;
  width: 50px;
  border-radius: 0 !important;
}

/* Remove up and down arrows inside number input */
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

@media print {
  input.custom-spin-input {
    background-color: transparent !important;
    border: none !important;
  }
}
</style>
