<template>
    <div>
      <b-modal class="modal" id="modal" @hidden="cancelAction">
        <template v-slot:modal-title><h4>{{form.title}}</h4></template>
        <div v-for="(f, i) in form.fields" v-bind:key=i>
          <p v-if="f.type=='instruction'">{{f.label}}</p>
          <!-- this lookup is single selection -->
          <lookup-input v-if="f.type=='lookup'"
            :label="f.label"
            :value="f.value"
            :field="f.field"
            :model="listModel(f.list)"
            :sticky_options="f.sticky_options || undefined"
            @change="storeValue"/> <!-- TODO add ability to create new items associated with lookup -->
          <!-- TODO: add multi-selection input list -->
          <checkbox-input v-if="f.type=='checkbox'"
            :label="f.label"
            :value="f.value"
            :field="f.field"/>
          <text-input v-if="f.type=='text'"
            :label="f.label"
            :value="f.value"
            :field="f.field"
            :placeholder="f.placeholder"/>
          <emoji-input v-if="f.type=='emoji'"
            :label="f.label"
            :value="f.value"
            :field="f.field"
            @change="storeValue"/>
        </div>
        
        <template  v-slot:modal-footer>
          <b-button class="float-right mx-1" variant="secondary" v-on:click="cancelAction">{{$t('Cancel')}}</b-button>
          <b-button class="float-right mx-1" variant="primary" v-on:click="doAction">{{form.ok_label}}</b-button>
        </template>
      </b-modal>
    </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'
import {getForm} from "@/utils/utils";
Vue.use(BootstrapVue)

import {Models} from "@/utils/models";
import CheckboxInput from "@/components/Modals/CheckboxInput";
import LookupInput from "@/components/Modals/LookupInput";
import TextInput from "@/components/Modals/TextInput";
import EmojiInput from "@/components/Modals/EmojiInput";

export default {
  name: 'GenericModalForm',
  components: {CheckboxInput, LookupInput, TextInput, EmojiInput},
  props: {
    model: {required: true, type: Object, default: function() {}},
    action: {required: true, type: Object, default: function() {}},
    item1: {type: Object, default: function() {}},
    item2: {type: Object, default: function() {}},
    show: {required: true, type: Boolean, default: false},
  },
  data() {
    return {
      form_data: {},
      form: {},
      dirty: false
    }
  },
  mounted() {
    this.$root.$on('change', this.storeValue);  // modal is outside Vue instance(?) so have to listen at root of component
  },
  computed: {
    buttonLabel() {
      return this.buttons[this.action].label;
    },
  },
  watch: {
    'show': function () {
      if (this.show) {
        this.form = getForm(this.model, this.action, this.item1, this.item2)
        this.dirty = true
        this.$bvModal.show('modal')
      } else {
        this.$bvModal.hide('modal')
        this.form_data = {}
      }
    },
  },
  methods: {
      doAction: function(){
        this.dirty = false
        this.$emit('finish-action', {'form_data': this.form_data })
      },
      cancelAction: function() {
        if (this.dirty) {
          this.dirty = false
          this.$emit('finish-action', 'cancel')
        }
      },
      storeValue: function(field, value) {
        this.form_data[field] = value
      },
      listModel: function(m) {
        if (m === 'self') {
          return this.model
        } else {
          return Models[m]
        }
      }
  }
}
</script>