<template>
    <div>
      <b-modal class="modal" id="modal" >
        <template v-slot:modal-title><h4>{{model}} {{action}}</h4></template>
        <div v-for="(f, i) in fields" v-bind:key=i>
          <p v-if="f.type=='instruction'">{{f.label}}</p>
          <lookup-input v-if="f.type=='lookup'"
            :label="f.label"
            :value="f.value"
            :field="f.field"
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
          <b-button class="float-right mx-1" variant="primary" v-on:click="doAction">{{buttonLabel}}</b-button>
        </template>
      </b-modal>
        <b-button v-on:click="Button">ok</b-button>
    </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'
Vue.use(BootstrapVue)
import CheckboxInput from "@/components/Modals/CheckboxInput";
import LookupInput from "@/components/Modals/LookupInput";
import TextInput from "@/components/Modals/TextInput";

export default {
  name: 'GenericModalForm',
  components: {CheckboxInput, LookupInput, TextInput},
  props: {
    model: {type: String, default: ''},
    // action: {type: String, default: ''},
    show: {type: Boolean, default: false},
  },
  data() {
    return {
      new_item: {},
      action: '',
      fields: [
        {'label': 'This is a long set of instructions that tell you to be careful with what you do next or really bad things are likely to happen.',
          'type': 'instruction',
          'value': undefined},
        {'field': 'name',
          'label': 'first',
          'type': 'text',
          'value': undefined,
          'placeholder': 'do the thing'},
        {'field': 'shopping',
          'label': 'second',
          'type': 'lookup',
          'value': undefined},
        {'field': 'isreal',
          'label': 'third',
          'type': 'checkbox',
          'value': undefined},
        {'field': 'ignore',
          'label': 'fourth',
          'type': 'checkbox',
          'value': undefined},
        {'field': 'another_category',
          'label': 'fifth',
          'type': 'lookup',
          'value': undefined},
        {'field': 'description',
          'label': 'sixth',
          'type': 'text',
          'value': undefined,
          'placeholder': 'also, do the thing'
        }
      ],
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
        this.$bvModal.show('modal')
      }
    },
  },
  methods: {
      Button: function(e) {
        console.log(typeof({}), typeof([]), typeof('this'), typeof(1))
        this.action='new'
        this.$bvModal.show('modal')
      },
      doAction: function(){
        console.log(this.new_item)
        let alert_text = ''
        for (const [k, v] of Object.entries(this.fields)) {
          if (v.type !== 'instruction'){
            alert_text = alert_text + v.field + ": " + this.new_item[v.field] + "\n"
          }
        }
        this.$nextTick(function() {this.$bvModal.hide('modal')})
        setTimeout(() => {}, 0) // confirm that the 
        alert(alert_text)
        console.log(this.model_values)
      },
      changeValue: function(field, value) {
        this.new_item[field] = value
        console.log('catch value', field, value)
      }
  }
}
</script>