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
      :taggable="allow_create"
      :tag-placeholder="create_placeholder"
      :loading="loading"
      @search-change="search"
      @input="selectionChanged"
      @tag="addNew">
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
    model: {
      type: Object, default() {
        return {}
      }
    },
    label: {type: String, default: 'name'},
    parent_variable: {type: String, default: undefined},
    limit: {type: Number, default: 10,},
    sticky_options: {
      type: Array, default() {
        return []
      }
    },
    initial_selection: {
      type: Array, default() {
        return []
      }
    },
    multiple: {type: Boolean, default: true},
    allow_create: {type: Boolean, default: false}, // TODO: this will create option to add new drop-downs
    create_placeholder: {type: String, default: 'You Forgot to Add a Tag Placeholder'},
  },
  watch: {
    initial_selection: function (newVal, oldVal) { // watch it
      this.selected_objects = newVal
    },
  },
  mounted() {
    this.search('')
    this.selected_objects = this.initial_selection
  },
  computed: {
    lookupPlaceholder() {
      return this.placeholder || this.model.name || this.$t('Search')
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
        if (this.selected_objects.length === 0 && this.initial_selection.length === 0 && this.objects.length > 0) {
          this.objects.forEach((item) => {
            if ("default" in item) {
              if (item.default) {
                if(this.multiple) {
                  this.selected_objects = [item]
                } else {
                  this.selected_objects = item
                }
                this.selectionChanged()
              }
            }
          })
        }
      })
    },
    selectionChanged: function () {
      this.$emit('change', {var: this.parent_variable, val: this.selected_objects})

    },
    addNew(e) {
      this.$emit('new', e)
      // could refactor as Promise - seems unecessary
      setTimeout(() => {
        this.search('');
      }, 750);

    }
  }
}
</script>

<style scoped>

</style>
