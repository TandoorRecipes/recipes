<template>
    <div>
        <b-form-group 
            v-bind:label="label"
            class="mb-3">
        <generic-multiselect 
          @change="new_value=$event.val['id']"
          :initial_selection="[]"  
          :model="model"
          :multiple="false"
          :sticky_options="sticky_options"
          style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
          :placeholder="modelName">
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
    label: {type: String, default: ''},
    value: {type: Object, default () {return {}}},
    model: {type: Object, default () {return {}}},
    sticky_options: {type:Array, default(){return []}},
  },
  data() {
    return {
      new_value: undefined,
    }
  },
  mounted() {
    this.new_value = this.value.id
  },
  computed: {
    modelName() {
      return this?.model?.name  ?? this.$t('Search')
    }
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