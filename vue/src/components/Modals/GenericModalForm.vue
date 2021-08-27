<template>
    <div>
        <!-- <modal name=modal style="z-index: 9999"
          :draggable="true"
          :resizable="false"
          :scrollable="true"
          :minHeight="300"
          :minWidth="100"
          height="auto"
          :shiftX=".5"
          :shiftY=".1"
        >  -->
      <b-modal class="modal" id="modal" >
        <template v-slot:modal-title><h4>{{model}} {{action}}</h4></template>
        <div v-for="(f, i) in fields" v-bind:key=i>
          <p v-if="f.type=='instruction'">{{f.label}}</p>
          <lookup-input v-if="f.type=='lookup'"
            :label="f.label"/> <!-- TODO add ability to create new items associated with lookup -->
          <checkbox-input v-if="f.type=='checkbox'"
            :label="f.label"/>
          <text-input v-if="f.type=='text'"
            :label="f.label"/>
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
      action: '',
      fields: [
        {'label': 'This is a long set of instructions that tell you to be careful with what you do next or really bad things are likely to happen.',
          'type': 'instruction'},
        {'label': 'first',
          'type': 'text'},
        {'label': 'second',
        'type': 'lookup'},
        {'label': 'third',
        'type': 'checkbox'},
        {'label': 'fourth',
        'type': 'checkbox'},
        {'label': 'fifth',
        'type': 'lookup'},
        {'label': 'sixth',
        'type': 'text'}
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
  // mounted() {

  // },
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
        this.action='new'
        this.$bvModal.show('modal')
      },
      doAction: function(){
        this.$bvModal.hide('modal')
        alert('i did it')
      }
  }
}
</script>