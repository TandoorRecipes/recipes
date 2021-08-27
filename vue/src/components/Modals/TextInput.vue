<template>
    <div>
        <b-form-group
            v-bind:label="label"
            class="mb-3">
        <b-form-input
            type="string"
        ></b-form-input>
        </b-form-group>
    </div>
</template>

<script>

export default {
  name: 'TextInput',
  props: {
    label: {type: String, default: 'Text Field'},
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