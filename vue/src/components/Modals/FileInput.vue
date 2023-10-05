<template>
  <div>
    <b-form-group
        v-bind:label="field_label"
        class="mb-3">
      <b-form-file
          v-model="new_value"
          type="file"
          :placeholder="placeholder_text"
      ></b-form-file>


    </b-form-group>

    <file-viewer :url="preview_url" v-if="preview_url"></file-viewer>

  </div>
</template>

<script>

import FileViewer from "@/components/FileViewer";

export default {
  name: "FileInput",
  components: {FileViewer},
  props: {
    field: {type: String, default: 'You Forgot To Set Field Name'},
    label: {type: String, default: 'Text Field'},
    value: {type: String, default: ''},
    placeholder: {type: String, default: ''},
    show_merge: {type: Boolean, default: false},
      optional: {type: Boolean, default: false},
  },
    computed: {
        field_label: function () {
            if (this.optional) {
                return this.label
            } else {
                return this.label + '*'
            }
        }
    },
  data() {
    return {
      new_value: undefined,
      placeholder_text: this.placeholder,
      preview_url: this.value
    }
  },
  mounted() {
    if (this.placeholder_text === '') {
      this.placeholder_text = this.$t('Select_File')
    }
  },
  watch: {
    'new_value': function () {
      if (!(typeof this.new_value === 'string' || this.new_value instanceof String)) { // only update file if it was changed
        this.preview_url = URL.createObjectURL(this.new_value) //TODO improve creating obj url so file viewer know which type to display
        this.$root.$emit('change', this.field, this.new_value)
      }
    },
  },
  methods: {}
}
</script>

<style scoped>

</style>