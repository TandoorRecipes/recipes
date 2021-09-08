<template>
    <div>
        <b-form-group 
            v-bind:label="label"
            class="mb-3">
          <generic-multiselect 
            @change="new_value=$event.val"
            :initial_selection="[value]"  
            :model="model"
            :multiple="false"
            :sticky_options="sticky_options"
            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
            :placeholder="modelName">
          </generic-multiselect>
        </b-form-group>
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
    // TODO: include create_new and create_text props and associated functionality to create objects for drop down
    // see 'tagging' here: https://vue-multiselect.js.org/#sub-tagging
    // perfect world would have it trigger a new modal associated with the associated item model
  },
  data() {
    return {
      new_value: undefined,
    }
  },
  computed: {
    modelName() {
      return this?.model?.name  ?? this.$t('Search')
    }
  },
  watch: {
    'new_value': function () {
      this.$root.$emit('change', this.field, this.new_value ?? null)
    },
  },
}
</script>