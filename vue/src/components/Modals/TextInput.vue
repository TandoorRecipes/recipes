<template>
    <div>
        <b-form-group
            v-bind:label="label"
            class="mb-3">
        <b-form-input
            v-model="new_value"
            type="string"
            :placeholder="placeholder"
        ></b-form-input>
        </b-form-group>
    </div>
</template>

<script>

export default {
  name: 'TextInput',
  props: {
    field: {type: String, default: 'You Forgot To Set Field Name'},
    label: {type: String, default: 'Text Field'},
    value: {type: String, default: ''},
    placeholder: {type: String, default: 'You Should Add Placeholder Text'},
    show_merge: {type: Boolean, default: false},
  },
  data() {
    return {
      new_value: undefined,
    }
  },
  mounted() {
    this.new_value = this.value
  },
  watch: {
    'new_value': function () {
      this.$root.$emit('change', this.field, this.new_value)
    },
  },
  methods: {
  }
}
</script>