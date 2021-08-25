<template>
  <multiselect
      v-model="selected_objects"
      :options="objects"
      :close-on-select="true"
      :clear-on-select="true"
      :hide-selected="true"
      :preserve-search="true"
      :placeholder="placeholder"
      :label="label"
      track-by="id"
      :multiple="multiple"
      :loading="loading"
      @search-change="search"
      @input="selectionChanged">
  </multiselect>
</template>

<script>

import Multiselect from 'vue-multiselect'
import {ApiApiFactory} from "@/utils/openapi/api";

export default {
  name: "GenericMultiselect",
  components: {Multiselect},
  data() {
    return {
      loading: false,
      objects: [],
      selected_objects: [],
    }
  },
  props: {
    placeholder: String,
    search_function: String,
    label: String,
    parent_variable: {type: String, default: undefined},
    limit: {type: Number, default: 10,},
    sticky_options: {type:Array, default(){return []}},
    initial_selection: {type:Array, default(){return []}},
    multiple: {type: Boolean, default: true},
    tree_api: {type: Boolean, default: false} // api requires params that are unique to TreeMixin
  },
  watch: {
    initial_selection: function (newVal, oldVal) { // watch it
      this.selected_objects = newVal
    },
  },
  mounted() {
    this.search('')
  },
  methods: {
    search: function (query) {
      let apiClient = new ApiApiFactory()
      if (this.tree_api) {
        let page = 1
        let root = undefined
        let tree = undefined
        let pageSize = 10

        if (query === '') {
          query = undefined
        }
        apiClient[this.search_function](query, root, tree, page, pageSize).then(result => {
          this.objects = this.sticky_options.concat(result.data.results)
        })
      } else {
        apiClient[this.search_function]({query: {query: query, limit: this.limit}}).then(result => {
          this.objects = this.sticky_options.concat(result.data)
        })
      }
    },
    selectionChanged: function () {
      this.$emit('change', {var: this.parent_variable, val: this.selected_objects})
    }
  }
}
</script>

<style scoped>

</style>
