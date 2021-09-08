<template>
  <div id="app" style="margin-bottom: 4vh">
    <!-- v-if prevents component from loading before this_model has been assigned -->
    <generic-modal-form v-if="this_model"
                        :model="this_model"
                        :action="this_action"
                        :item1="this_item"
                        :item2="this_target"
                        :show="show_modal"
                        @finish-action="finishAction"/>
    <generic-split-lists v-if="this_model"
                         :list_name="this_model.name"
                         :right_counts="right_counts"
                         :left_counts="left_counts"
                         @reset="resetList"
                         @get-list="getItems"
                         @item-action="startAction">
      <template v-slot:cards-left>
        <generic-horizontal-card
            v-for="i in items_left" v-bind:key="i.id"
            :item=i
            :item_type="this_model.name"
            :draggable="true"
            :merge="this_model['merge'] !== false"
            :move="this_model['move'] !== false"
            @item-action="startAction($event, 'left')">
          <!-- foods can also be a recipe, show link to the recipe if it exists -->
          <template v-slot:upper-right>
            <b-button v-if="i.recipe" v-b-tooltip.hover :title="i.recipe.name"
                      class=" btn fas fa-book-open p-0 border-0" variant="link" :href="i.recipe.url"/>
            <!-- keywords can have icons - if it exists, display it -->
            <b-button v-if="i.icon"
                      class=" btn p-0 border-0" variant="link">
                      {{i.icon}}
            </b-button>
          </template>
        </generic-horizontal-card>
      </template>
      <template v-slot:cards-right>
        <generic-horizontal-card v-for="i in items_right" v-bind:key="i.id"
                                 :item=i
                                 :item_type="this_model.name"
                                 :draggable="true"
                                 :merge="this_model['merge'] !== false"
                                 :move="this_model['move'] !== false"
                                 @item-action="startAction($event, 'right')">
          <!-- foods can also be a recipe, show link to the recipe if it exists -->
          <template v-slot:upper-right>
            <b-button v-if="i.recipe" v-b-tooltip.hover :title="i.recipe.name"
                      class=" btn fas fa-book-open p-0 border-0" variant="link" :href="i.recipe.url"/>
          </template>
        </generic-horizontal-card>
      </template>
    </generic-split-lists>


  </div>
</template>

<script>

import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {CardMixin, ToastMixin, ApiMixin} from "@/utils/utils";
import {StandardToasts} from "@/utils/utils";

import GenericSplitLists from "@/components/GenericSplitLists";
import GenericHorizontalCard from "@/components/GenericHorizontalCard";
import GenericModalForm from "@/components/Modals/GenericModalForm";

Vue.use(BootstrapVue)

export default {
  // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available 
  // or i'm capturing it incorrectly
  name: 'ModelListView',
  mixins: [CardMixin, ToastMixin, ApiMixin],
  components: {GenericHorizontalCard, GenericSplitLists, GenericModalForm},
  data() {
    return {
      // this.Models and this.Actions inherited from ApiMixin
      items_left: [],
      items_right: [],
      right_counts: {'max': 9999, 'current': 0},
      left_counts: {'max': 9999, 'current': 0},
      this_model: undefined,
      this_action: undefined,
      this_recipe_param: undefined,
      this_item: {},
      this_target: {},
      show_modal: false
    }
  },
  mounted() {
    // value is passed from lists.py
    let model_config = JSON.parse(document.getElementById('model_config').textContent)
    this.this_model = this.Models[model_config?.model]
    this.this_recipe_param = model_config?.recipe_param
  },
  methods: {
    // this.genericAPI inherited from ApiMixin
    resetList: function (e) {
      this['items_' + e.column] = []
      this[e.column + '_counts'].max = 9999 + Math.random()
      this[e.column + '_counts'].current = 0
    },
    startAction: function (e, param) {
      let source = e?.source ?? {}
      let target = e?.target ?? undefined
      this.this_item = source
      this.this_target = target

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
        case 'move':
          if (target == null) {
            this.this_item = e.source
            this.this_action = this.Actions.MOVE
            this.show_modal = true
          } else {
            this.moveThis(source.id, target.id)
          }
          break;
        case 'merge':
          if (target == null) {
            this.this_item = e.source
            this.this_action = this.Actions.MERGE
            this.show_modal = true
          } else {
            this.mergeThis(e.source.id, e.target.id)
          }
          break;
        case 'get-children':
          if (source.show_children) {
            Vue.set(source, 'show_children', false)
          } else {
            this.getChildren(param, source)
          }
          break;
        case 'get-recipes':
          if (source.show_recipes) {
            Vue.set(source, 'show_recipes', false)
          } else {
            this.getRecipes(param, source)
          }
          break;
      }
    },
    finishAction: function (e) {
      let update = undefined
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
            this.mergeThis(this.this_item.id, e.form_data.target)
            break;
          case this.Actions.MOVE:
            this.moveThis(this.this_item.id, e.form_data.target)
            break;
        }
      }
      this.clearState()
    },
    getItems: function (params) {
      let column = params?.column ?? 'left'
      this.genericAPI(this.this_model, this.Actions.LIST, params).then((result) => {
        if (result.data.results.length) {
          this['items_' + column] = this['items_' + column].concat(result.data?.results)
          this[column + '_counts']['current'] = this['items_' + column].length
          this[column + '_counts']['max'] = result.data.count
        } else {
          this[column + '_counts']['current'] = 0
          this[column + '_counts']['max'] = 0
          console.log('no data returned')
        }
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    getThis: function (id, callback) {
      return this.genericAPI(this.this_model, this.Actions.FETCH, {'id': id})
    },
    saveThis: function (thisItem) {
      if (!thisItem?.id) { // if there is no item id assume it's a new item
        this.genericAPI(this.this_model, this.Actions.CREATE, thisItem).then((result) => {
          // look for and destroy any existing cards to prevent duplicates in the GET case of get_or_create         
          // then place all new items at the top of the list - could sort instead
          this.items_left = [result.data].concat(this.destroyCard(result?.data?.id, this.items_left))
          // this creates a deep copy to make sure that columns stay independent
          this.items_right = [{...result.data}].concat(this.destroyCard(result?.data?.id, this.items_right))
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
        }).catch((err) => {
          console.log(err)
          StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
        })
      } else {
        this.genericAPI(this.this_model, this.Actions.UPDATE, thisItem).then((result) => {
          this.refreshThis(thisItem.id)
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
        }).catch((err) => {
          console.log(err, err.response)
          StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
        })
      }
    },
    moveThis: function (source_id, target_id) {
      if (source_id === target_id) {
        this.makeToast(this.$t('Error'), this.$t('Cannot move item to itself'), 'danger')
        this.clearState()
        return
      }
      let item = this.findCard(source_id, this.items_left) || this.findCard(source_id, this.items_right)
      if (source_id === undefined || target_id === undefined || item?.parent == target_id) {
        this.makeToast(this.$t('Warning'), this.$t('Nothing to do'), 'warning')
        this.clearState()
        return
      }
      this.genericAPI(this.this_model, this.Actions.MOVE, {'source': source_id, 'target': target_id}).then((result) => {
        if (target_id === 0) {
          
          this.items_left = [item].concat(this.destroyCard(source_id, this.items_left)) // order matters, destroy old card before adding it back in at root
          this.items_right = [...[item]].concat(this.destroyCard(source_id, this.items_right)) // order matters, destroy old card before adding it back in at root
          item.parent = null
        } else {
          this.items_left = this.destroyCard(source_id, this.items_left)
          this.items_right = this.destroyCard(source_id, this.items_right)
          this.refreshThis(target_id)
        }
        // TODO make standard toast
        this.makeToast(this.$t('Success'), 'Succesfully moved resource', 'success')
      }).catch((err) => {
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    mergeThis: function (source_id, target_id) {
      if (source_id === target_id) {
        this.makeToast(this.$t('Error'), this.$t('Cannot merge item with itself'), 'danger')
        this.clearState()
        return
      }
      if (!source_id || !target_id) {
        this.makeToast(this.$t('Warning'), this.$t('Nothing to do'), 'warning')
        this.clearState()
        return
      }
      this.genericAPI(this.this_model, this.Actions.MERGE, {
        'source': source_id,
        'target': target_id
      }).then((result) => {
        this.items_left = this.destroyCard(source_id, this.items_left)
        this.items_right = this.destroyCard(source_id, this.items_right)
        this.refreshThis(target_id)
        // TODO make standard toast
        this.makeToast(this.$t('Success'), 'Succesfully merged resource', 'success')
      }).catch((err) => {
        //TODO error checking not working with OpenAPI methods
        console.log('Error', err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })

    },
    getChildren: function (col, item) {
      let parent = {}
      let options = {
        'root': item.id,
        'pageSize': 200
      }
      this.genericAPI(this.this_model, this.Actions.LIST, options).then((result) => {
        parent = this.findCard(item.id, this['items_' + col])
        if (parent) {
          Vue.set(parent, 'children', result.data.results)
          Vue.set(parent, 'show_children', true)
          Vue.set(parent, 'show_recipes', false)
        }
      }).catch((err) => {
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    getRecipes: function (col, item) {
      let parent = {}
      // TODO: make this generic
      let options = {'pageSize': 200}
      options[this.this_recipe_param] = item.id

      this.genericAPI(this.Models.RECIPE, this.Actions.LIST, options).then((result) => {
        parent = this.findCard(item.id, this['items_' + col])
        if (parent) {
          Vue.set(parent, 'recipes', result.data.results)
          Vue.set(parent, 'show_recipes', true)
          Vue.set(parent, 'show_children', false)
        }

      }).catch((err) => {
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    refreshThis: function (id) {
      this.getThis(id).then(result => {
        this.refreshCard(result.data, this.items_left)
        this.refreshCard({...result.data}, this.items_right)
      })
    },
    deleteThis: function (id) {
      this.genericAPI(this.this_model, this.Actions.DELETE, {'id': id}).then((result) => {
        this.items_left = this.destroyCard(id, this.items_left)
        this.items_right = this.destroyCard(id, this.items_right)
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
      this.this_target = undefined
    }
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
