<template>
    <div>
        <b-form-group 
            v-bind:label="label"
            class="mb-3">
        <generic-multiselect 
          label="name"
          :initial_selection="[]"  
          search_function="listSupermarketCategorys" 
          :multiple="false"
          :sticky_options="[{'id': null,'name': $t('None')}]"
          style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
          :placeholder="$t('Shopping_Category')">
        </generic-multiselect>
    </div>
</template>

<script>
import GenericMultiselect from "@/components/GenericMultiselect";

export default {
  name: 'LookupInput',
  components: {GenericMultiselect},
  props: {
    label: {type: String, default: 'Lookup Field'},
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