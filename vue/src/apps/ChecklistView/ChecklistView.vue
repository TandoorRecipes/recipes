<template>
  <div id="app" style="margin-bottom: 4vh" v-if="this_model">
    <div class="row">
      <div class="col-md-2 d-none d-md-block">
      </div>
      <div class="col-xl-8 col-12">
        <div class="container-fluid d-flex flex-column flex-grow-1">

          <div class="row">
            <div class="col-md-6" style="margin-top: 1vh">
              <h3>
                <!-- <model-menu/>  Replace with a List Menu or a Checklist Menu? -->
                <span>{{ this.this_model.name }}</span>
                <span><b-button variant="link" @click="startAction({'action':'new'})"><i
                    class="fas fa-plus-circle fa-2x"></i></b-button></span>
              </h3>
            </div>
          </div>

          <div class="row">
            <div class="col col-md-12">
              <b-table small :items="items" :fields="fields" :busy="loading">
                <template #cell(checked)="data">
                  <b-form-checkbox
                    v-model="data.item.checked"
                    @change="checkboxChanged(data.item)"
                  />
                </template>
                <template #cell(all_notes)="data">
                  {{ formatNotes(data.item) }}
                </template>
              </b-table>
              <!-- <div v-for="i in items" v-bind:key="i.id">
                {{i.supermarket_category}} --- {{i.food && i.food.name || 'null'}} --- {{i.id}} --- {{i.checked}} --- {{i.amount}} --- {{i.unit && i.unit.name || 'null'}} --- {{i.list_recipe && i.list_recipe.recipe_name || 'null'}} --- {{allNotes(i)}}
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ApiMixin} from "@/utils/utils";
import {StandardToasts} from "@/utils/utils";

Vue.use(BootstrapVue)

export default {
  // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available 
  // or i'm capturing it incorrectly
  name: 'ChecklistView',
  mixins: [ApiMixin],
  components: { },
  data() {
    return {
      // this.Models and this.Actions inherited from ApiMixin
      items: [],
      this_model: undefined,
      model_menu: undefined,
      this_action: undefined,
      this_item: {},
      show_modal: false,
      fields: [
        {
          'key': 'checked',
          'label': '',
          class: 'text-center'
        },
        {
          'key': 'food.supermarket_category.name',
          'label': this.$t('Category'),
          'formatter': 'formatCategory',
        },
        {
          'key': 'amount',
          class: 'text-center'
        },
        {
          'key': 'unit.name',
          'label': this.$t('Unit')
        },
        {
          'key': 'food.name',
          'label': this.$t('Food')
        },
        {
          'key': 'recipe_mealplan.name',
          'label': this.$t('Recipe'),
        },
        {
          'key': 'all_notes',
          'label': this.$t('Notes'),
          'formatter': 'formatNotes',
        },
        {
          'key': 'created_by.username',
          'label': this.$t('Added_by'),
        },
        {
          'key': 'created_at',
          'label': this.$t('Added_on'),
          'formatter': 'formatDate',
        },
      ],
      loading: true
    }
  },
  mounted() {
    // value is passed from lists.py
    let model_config = JSON.parse(document.getElementById('model_config').textContent)
    this.this_model = this.Models[model_config?.model]
    this.getItems()
  },
  methods: {
    // this.genericAPI inherited from ApiMixin
    startAction: function (e, param) {
      let source = e?.source ?? {}
      this.this_item = source
      // remove recipe from shopping list
      // mark on-hand
      // mark puchased
      // edit shopping category on food
      // delete food from shopping list
      // add food to shopping list
      // add other to shopping list
      // edit unit conversion
      // edit purchaseable unit
      switch (e.action) {
        case 'delete':
          this.this_action = this.Actions.DELETE
          this.show_modal = true
          break;
        case 'new':
          this.this_action = this.Actions.CREATE
          this.show_modal = true
          break;
        case 'edit':
          this.this_item = e.source
          this.this_action = this.Actions.UPDATE
          this.show_modal = true
          break;
      }
    },
    finishAction: function (e) {
      let update = undefined
      switch (e?.action) {
        case 'save':
          this.saveThis(e.form_data)
          break;
      }
      if (e !== 'cancel') {
        switch (this.this_action) {
          case this.Actions.DELETE:
            this.deleteThis(this.this_item.id)
            break;
          case this.Actions.CREATE:
            this.saveThis(e.form_data)
            break;
          case this.Actions.UPDATE:
            update = e.form_data
            update.id = this.this_item.id
            this.saveThis(update)
            break;
          case this.Actions.MERGE:
            this.mergeThis(this.this_item, e.form_data.target, false)
            break;
          case this.Actions.MOVE:
            this.moveThis(this.this_item.id, e.form_data.target.id)
            break;
        }
      }
      this.clearState()
    },
    getItems: function (params={}) {
      params.options = {'query':{'extended': 1}} // returns extended values in API response
      this.genericAPI(this.this_model, this.Actions.LIST, params).then((results) => {
        console.log('generic', results, results.data?.length)
        if (results.data?.length) {
          this.items = results.data
        } else {
          console.log('no data returned')
        }
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    getThis: function (id) {
      return this.genericAPI(this.this_model, this.Actions.FETCH, {'id': id})
    },
    saveThis: function (thisItem, toast=true) {
      if (!thisItem?.id) { // if there is no item id assume it's a new item
        this.genericAPI(this.this_model, this.Actions.CREATE, thisItem).then((result) => {
          // this.items = result.data - refresh the list here
          if (toast) { StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE) }
        }).catch((err) => {
          console.log(err)
          if (toast) { StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE) }
        })
      } else {
        this.genericAPI(this.this_model, this.Actions.UPDATE, thisItem).then((result) => {
          // this.refreshThis(thisItem.id) refresh the list here
          if (toast) { StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE) }
        }).catch((err) => {
          console.log(err, err.response)
          if (toast) { StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE) }
        })
      }
    },
    getRecipe: function (item) {
      // change to get pop up card?  maybe same for unit and food?
    },
    deleteThis: function (id) {
      this.genericAPI(this.this_model, this.Actions.DELETE, {'id': id}).then((result) => {
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
      })
    },
    clearState: function () {
      this.show_modal = false
      this.this_action = undefined
      this.this_item = undefined
    },
    formatCategory: function(value) {
      return value || this.$t('Undefined')
    },
    formatNotes: function (item) {     
      return [item?.recipe_mealplan?.mealplan_note, item?.ingredient_note,].filter(String).join("\n")
    },
    formatDate: function (datetime) {
      return Intl.DateTimeFormat(window.navigator.language, { dateStyle: 'short', timeStyle: 'short' }).format(Date.parse(datetime))
    },
    checkboxChanged: function(item) {
      this.saveThis(item, false)
    }
  }
}

</script>

<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->

<style>

</style>
