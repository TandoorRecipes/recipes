<template>
    <div>
      <b-modal class="modal" id="modal" >
        <template v-slot:modal-title><h4>{{form.title}}</h4></template>
        <div v-for="(f, i) in form.fields" v-bind:key=i>
          <p v-if="f.type=='instruction'">{{f.label}}</p>
          <lookup-input v-if="f.type=='lookup'"
            :label="f.label"
            :value="f.value"
            :field="f.field"
            :model="listModel(f.list)"
            :sticky_options="f.sticky_options || undefined"
            @change="changeValue"/> <!-- TODO add ability to create new items associated with lookup -->
          <checkbox-input v-if="f.type=='checkbox'"
            :label="f.label"
            :value="f.value"
            :field="f.field"/>
          <text-input v-if="f.type=='text'"
            :label="f.label"
            :value="f.value"
            :field="f.field"
            :placeholder="f.placeholder"/>
        </div>
        
        <template  v-slot:modal-footer>
          <b-button class="float-right mx-1" variant="secondary" v-on:click="$bvModal.hide('modal')">{{$t('Cancel')}}</b-button>
          <b-button class="float-right mx-1" variant="primary" v-on:click="doAction">{{form.ok_label}}</b-button>
        </template>
      </b-modal>
        <b-button v-on:click="Button">ok</b-button>
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

export default {
  name: 'GenericModalForm',
  components: {CheckboxInput, LookupInput, TextInput},
  props: {
    model: {type: Object, default: function() {}},
    action: {type: Object, default: function() {}},
    item1: {type: Object, default: function() {}},
    item2: {type: Object, default: function() {}},
    // action: {type: String, default: ''},
    show: {type: Boolean, default: false},
  },
  data() {
    return {
      new_item: {},
      form: {},
      buttons: {
        'new':{'label': this.$t('Save')},
        'delete':{'label': this.$t('Delete')},
        'edit':{'label': this.$t('Save')},
        'move':{'label': this.$t('Move')},
        'merge':{'label': this.$t('Merge')}
      }
    }
  },
  mounted() {
    this.$root.$on('change', this.changeValue);  // modal is outside Vue instance(?) so have to listen at root of component
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
        this.$bvModal.show('modal')
      }
    },
  },
  methods: {
      Button: function(e) {
        this.form = getForm(this.model, this.action, this.item1, this.item2)
        console.log(this.form)
        this.$bvModal.show('modal')
      },
      doAction: function(){
        let alert_text = ''
        for (const [k, v] of Object.entries(this.form.fields)) {
          if (v.type !== 'instruction'){
            alert_text = alert_text + v.field + ": " + this.new_item[v.field] + "\n"
          }
        }
        this.$nextTick(function() {this.$bvModal.hide('modal')})
        setTimeout(() => {}, 0) // confirm that the 
        alert(alert_text)
      },
      changeValue: function(field, value) {
        // console.log('catch change', field, value)
        this.new_item[field] = value
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