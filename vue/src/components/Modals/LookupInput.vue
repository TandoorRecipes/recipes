<template>
    <div>
        <b-form-group
            v-bind:label="form.label"
            class="mb-3">
          <generic-multiselect 
            @change="new_value=$event.val"
            @remove="new_value=undefined"
            :initial_selection="initialSelection"  
            :model="model"
            :multiple="useMultiple"
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
    form: {type: Object, default () {return undefined}},
    model: {type: Object, default () {return undefined}},

    // TODO: include create_new and create_text props and associated functionality to create objects for drop down
    // see 'tagging' here: https://vue-multiselect.js.org/#sub-tagging
    // perfect world would have it trigger a new modal associated with the associated item model
  },
  data() {
    return {
      new_value: undefined,
      field: undefined,
      label: undefined,
      sticky_options: undefined,
      first_run: true
    }
  },
  mounted() {
    this.new_value = this.form?.value
    this.field = this.form?.field ?? 'You Forgot To Set Field Name'
    this.label = this.form?.label ?? ''
    this.sticky_options = this.form?.sticky_options ?? []
  },
  computed: {
    modelName() {
      return this?.model?.name  ?? this.$t('Search')
    },
    useMultiple() {
      return this.form?.multiple || this.form?.ordered || false
    },
    initialSelection() {
      let this_value = this.form.value
      let arrayValues = undefined
      // multiselect is expect to get an array of objects - make sure it gets one
      if (Array.isArray(this_value)) {
        arrayValues = this_value
      } else if (!this_value) {
        arrayValues = []
      } else if (typeof(this_value) === 'object') {
        arrayValues = [this_value]
      } else {
        arrayValues = [{'id': -1, 'name': this_value}]
      }

      if (this.form?.ordered && this.first_run) {
        return this.flattenItems(arrayValues) 
      } else {
        return arrayValues
      }
    },
    createPlaceholder() {
      return this.$t('Create_New_' + this?.model?.name)
    }
  },
  watch: {
    'new_value': function () {
      let x = this?.new_value
      // pass the unflattened attributes that can be restored when ready to save/update
      if (this.form?.ordered) {
        x['__override__'] = this.unflattenItem(this?.new_value)
      }
      this.$root.$emit('change', this.form.field, x)
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
    },
    // ordered lookups have nested attributes that need flattened attributes to drive lookup
    flattenItems: function(itemlist) {
      let flat_items = []
      let item = undefined
      let label = this.form.list_label.split('::')
      itemlist.forEach(x => {
        item = {}
        for (const [k, v] of Object.entries(x)) {
          if (k == label[0]) {
            item['id'] = v.id
            item[label[1]] = v[label[1]]
          } else {
            item[this.form.field + '__' + k] = v
          }
        }
        flat_items.push(item)
      });
      this.first_run = false
      return flat_items
    },
    unflattenItem: function(itemList) {
      let unflat_items = []
      let item = undefined
      let this_label = undefined
      let label = this.form.list_label.split('::')
      let order = 0
      itemList.forEach(x => {
        item = {}
        item[label[0]] = {}
        for (const [k, v] of Object.entries(x)) {
          switch(k) {
            case 'id':
              item[label[0]]['id'] = v
              break;
            case label[1]:
              item[label[0]][label[1]] = v
              break;
            default:
              this_label = k.replace(this.form.field + '__', '')
          }
          
        }
        item['order'] = order
        order++
        unflat_items.push(item)
      });
      return unflat_items
    }
  }
}
</script>