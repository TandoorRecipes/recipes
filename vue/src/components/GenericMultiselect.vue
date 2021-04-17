<template>
  <multiselect
      v-model="selected_objects"
      :options="objects"
      :close-on-select="false"
      :clear-on-select="true"
      :hide-selected="true"
      :preserve-search="true"
      :placeholder="placeholder"
      :label="label"
      track-by="id"
      :multiple="true"
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
    parent_variable: String,
  },
  methods: {
    search: function (query) {
      let apiClient = new ApiApiFactory()

      apiClient[this.search_function]({query: {query: query, limit: 10}}).then(result => {
        this.objects = result.data
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