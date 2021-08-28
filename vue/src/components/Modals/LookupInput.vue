<template>
    <div>
        <b-form-group 
            v-bind:label="label"
            class="mb-3">
        <generic-multiselect 
          @change="new_value=$event.val"
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
    field: {type: String, default: 'You Forgot To Set Field Name'},
    label: {type: String, default: 'Lookup Field'},
    value: {type: Object, default () {return {}}},
    show_move: {type: Boolean, default: false},
    show_merge: {type: Boolean, default: false},
  },
  data() {
    return {
      new_value: undefined,
    }
  },
  mounted() {
    this.new_value = this.value.id
  },
  watch: {
    'new_value': function () {
      this.$root.$emit('change', this.field, this.new_value)
    },
  },
  methods: {
      Button: function(e) {
        this.$bvModal.show('modal')
      }
  }
}
</script>