<template>
  <multiselect
      v-model="selected_objects"
      :options="objects"
      :close-on-select="true"
      :clear-on-select="true"
      :hide-selected="multiple"
      :preserve-search="true"
      :placeholder="lookupPlaceholder"
      :label="label"
      track-by="id"
      :multiple="multiple"
      :taggable="create_new"
      :tag-placeholder="createText"
      :loading="loading"
      @search-change="search"
      @input="selectionChanged">
  </multiselect>
</template>

<script>

import Multiselect from 'vue-multiselect'
import {ApiMixin} from "@/utils/utils";

export default {
  name: "GenericMultiselect",
  components: {Multiselect},
  mixins: [ApiMixin],
  data() {
    return {
      // this.Models and this.Actions inherited from ApiMixin
      loading: false,
      objects: [],
      selected_objects: [],
    }
  },
  props: {
    placeholder: {type: String, default: undefined},
    model: {type: Object, default () {return {}}},
    label: {type: String, default: 'name'},
    parent_variable: {type: String, default: undefined},
    limit: {type: Number, default: 10,},
    sticky_options: {type:Array, default(){return []}},
    initial_selection: {type:Array, default(){return []}},
    multiple: {type: Boolean, default: true},
    create_new: {type: Boolean, default: false}, // TODO: this will create option to add new drop-downs
    create_text: {type: String, default: 'You Forgot to Add a Tag Placeholder'},
  },
  watch: {
    initial_selection: function (newVal, oldVal) { // watch it
      if (this.multiple) {
        this.selected_objects = newVal
      } else if (this.selected_objects != newVal?.[0]) {
        // when not using multiple selections need to convert array to value
        this.selected_objects = newVal?.[0] ?? null
      }
    },
  },
  mounted() {
    this.search('')
    // when not using multiple selections need to convert array to value
    if (!this.multiple & this.selected_objects != this.initial_selection?.[0]) {
        this.selected_objects = this.initial_selection?.[0] ?? null
      }
  },
  computed: {
    lookupPlaceholder() {
      return this.placeholder || this.model.name || this.$t('Search')
    },
    createText() {
      return this.create_text
    },
  },
  methods: {
    // this.genericAPI inherited from ApiMixin
    search: function (query) {
      let options = {
        'page': 1,
        'pageSize': 10,
        'query': query
      }
      this.genericAPI(this.model, this.Actions.LIST, options).then((result) => {
        this.objects = this.sticky_options.concat(result.data?.results ?? result.data)
      })
    },
    selectionChanged: function () {
      this.$emit('change', {var: this.parent_variable, val: this.selected_objects})
    }
  }
}
</script>

<style scoped>

</style>
