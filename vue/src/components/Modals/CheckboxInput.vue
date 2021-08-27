<template>
    <div>
        <b-form-checkbox>{{label}}</b-form-checkbox>
    </div>
</template>

<script>

export default {
  name: 'CheckboxInput',
  props: {
    label: {type: String, default: 'Checkbox Field'},
    show_delete: {type: Boolean, default: true},
    show_move: {type: Boolean, default: false},
    show_merge: {type: Boolean, default: false},
  },
  methods: {
      Button: function(e) {
        this.$bvModal.show('modal')
      }
  }
}
</script>