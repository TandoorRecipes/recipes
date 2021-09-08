<template>
    <div>
        <b-form-group
            v-bind:label="label"
            class="mb-3">
          <generic-multiselect 
            @change="new_value=$event.val"
            @remove="new_value=undefined"
            :initial_selection="initialSelection"  
            :model="model"
            :multiple="false"
            :sticky_options="sticky_options"
            :allow_create="create_new"
            :create_placeholder="createPlaceholder"
            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
            :placeholder="modelName"
            @new="addNew">
          </generic-multiselect>
        </b-form-group>
    </div>
</template>

<script>
import GenericMultiselect from "@/components/GenericMultiselect";
import {StandardToasts, ApiMixin} from "@/utils/utils";

export default {
  name: 'LookupInput',
  components: {GenericMultiselect},
  mixins: [ApiMixin],
  props: {
    field: {type: String, default: 'You Forgot To Set Field Name'},
    label: {type: String, default: ''},
    value: {type: Object, default () {return undefined}},
    model: {type: Object, default () {return undefined}},
    create_new: {type: Boolean, default: false},
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
  mounted() {
    this.new_value = this.value
  },
  computed: {
    modelName() {
      return this?.model?.name  ?? this.$t('Search')
    },
    initialSelection() {
      // multiselect is expect to get an array of objects - make sure it gets one
      if (Array.isArray(this.new_value)) {
        return this.new_value
      } else if (!this.new_value) {
        return []
      } else if (this.new_value.id) {
        return [this.new_value]
      } else {
        return [{'id': -1, 'name': this.new_value}]
      }
    },
    createPlaceholder() {
      return this.$t('Create_New_' + this?.model?.name)
    }
  },
  watch: {
    'new_value': function () {
      this.$root.$emit('change', this.field, this.new_value ?? null)
    },
  },
  methods: {
    addNew: function(e) {
      // if create a new item requires more than 1 parameter or the field 'name' is insufficient this will need reworked
      // in a perfect world this would trigger a new modal and allow editing all fields
      this.genericAPI(this.model, this.Actions.CREATE, {'name': e}).then((result) => {
        this.new_value = result.data
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
      })
      this.show_modal = false
      
    },
  }
}
</script>