<template>
  <div id="app" style="margin-bottom: 4vh">
    <generic-modal-form 
    :model="this_model"
    :action="this_action"
    :item1="this_item"
    :item2="this_target"
    :show="show_modal"
    @finish-action="finishAction"/>
    <generic-split-lists
      :list_name="this_model.name"
      @reset="resetList"
      @get-list="getItems"
      @item-action="startAction" 
    >
      <template v-slot:cards-left>
        <generic-horizontal-card 
          v-for="i in items_left" v-bind:key="i.id"
          :item=i
          :item_type="this_model.name"
          :draggable="true"
          :merge="true"
          :move="true"
          @item-action="startAction($event, 'left')" 
        >
            <!-- foods can also be a recipe, show link to the recipe if it exists -->
            <template v-slot:upper-right>
              <b-button v-if="i.recipe" v-b-tooltip.hover :title="i.recipe.name" 
                class=" btn fas fa-book-open p-0 border-0" variant="link" :href="i.recipe.url"/>
            </template>
        </generic-horizontal-card>
      </template>
      <template v-slot:cards-right>
        <generic-horizontal-card v-for="i in items_right" v-bind:key="i.id"
          :item=i
          :item_type="this_model.name"
          :draggable="true"
          :merge="true"
          :move="true"
          @item-action="startAction($event, 'right')" 
        >
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

import {CardMixin, ToastMixin, genericAPI} from "@/utils/utils";
import {Models, Actions} from "@/utils/models";
import {StandardToasts} from "@/utils/utils";

import GenericSplitLists from "@/components/GenericSplitLists";
import GenericHorizontalCard from "@/components/GenericHorizontalCard";
import GenericModalForm from "@/components/Modals/GenericModalForm";

Vue.use(BootstrapVue)

export default {
  name: 'FoodListView', // TODO: make generic name
  mixins: [CardMixin, ToastMixin],
  components: {GenericHorizontalCard, GenericSplitLists, GenericModalForm},
  data() {
    return {
      items_left: [],
      items_right: [],
      load_more_left: true,
      load_more_right: true,
      this_model: Models.FOOD,    //TODO: mounted method to calcuate
      this_action: undefined,
      this_item: {},
      this_target: {},
      models: Models,
      show_modal:false
    }
  },
  methods: {
    resetList: function(e) {
      if (e.column === 'left') {
        this.items_left = []
      } else if (e.column === 'right') {
        this.items_right = []
      }
    },
    startAction: function(e, param) {
      let source = e?.source ?? {}
      let target = e?.target ?? undefined
      this.this_item = source
      this.this_target = target

      switch (e.action) {
        case 'delete':
          this.this_action = Actions.DELETE
          this.show_modal = true
          break;
        case 'new':
          this.this_action = Actions.CREATE
          this.show_modal = true
          break;
        case 'edit':
          this.this_item = e.source
          this.this_action = Actions.UPDATE
          this.show_modal = true
          break;
        case 'move':
          if (target == null) {
            this.this_item = e.source
            this.this_action = Actions.MOVE
            this.show_modal = true
          } else {
            this.moveThis(source.id, target.id)
          }
          break;
        case 'merge':
          if (target == null) {
            this.this_item = e.source
            this.this_action = Actions.MERGE
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
    finishAction: function(e) {
      let update = undefined
      if (e !== 'cancel') {
        switch(this.this_action) {
          case Actions.DELETE:
            this.deleteThis(this.this_item.id)
            break;
          case Actions.CREATE:
            this.saveThis(e.form_data)
            break;
          case Actions.UPDATE:
            update = e.form_data
            update.id = this.this_item.id
            this.saveThis(update)
            break;
          case Actions.MERGE:
            this.mergeThis(this.this_item.id, e.form_data.target)
            break;
          case Actions.MOVE:
            this.moveThis(this.this_item.id, e.form_data.target)
            break;
        }
      }
      this.clearState()
    },
    getItems: function(params, callback) {
      let column = params?.column ?? 'left'
      // TODO: does this need to be a callback?
      genericAPI(this.this_model, Actions.LIST, params).then((result) => {
        if (result.data.results.length){
          if (column ==='left') {
            // if paginated results are in result.data.results otherwise just result.data
            this.items_left = this.items_left.concat(result.data?.results ?? result.data)            
          } else if (column ==='right') {
            this.items_right = this.items_right.concat(result.data?.results ?? result.data)
          }
          // are the total elements less than the length of the array? if so, stop loading
          callback(result.data.count > (column==="left" ? this.items_left.length : this.items_right.length))
        } else {
          callback(false) // stop loading
          console.log('no data returned')
        }
        // return true if total objects are still less than the length of the list
        // TODO this needs generalized to handle non-paginated data
        callback(result.data.count < (column==="left" ? this.items_left.length : this.items_right.length)) 

      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    getThis: function(id, callback){
      return genericAPI(this.this_model, Actions.FETCH, {'id': id}) 
    },
    saveThis: function (thisItem) {
      if (!thisItem?.id) { // if there is no item id assume it's a new item
        genericAPI(this.this_model, Actions.CREATE, thisItem).then((result) => {
          // place all new items at the top of the list - could sort instead
          this.items_left = [result.data].concat(this.items_left)
          // this creates a deep copy to make sure that columns stay independent
          this.items_right = [{...result.data}].concat(this.items_right)
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
        }).catch((err) => {
          console.log(err)
          StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
        })
      } else {
        genericAPI(this.this_model, Actions.UPDATE, thisItem).then((result) => {
          this.refreshThis(thisItem.id)
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
        }).catch((err) => {
          console.log(err)
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
      if (!source_id || !target_id) {
        this.makeToast(this.$t('Warning'), this.$t('Nothing to do'), 'warning')
        this.clearState()
        return
      }
      genericAPI(this.this_model, Actions.MOVE, {'source': source_id, 'target': target_id}).then((result) => {
        if (target_id === 0) {
          let item = this.findCard(source_id, this.items_left) || this.findCard(source_id, this.items_right)
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
        // TODO none of the error checking works because the openapi generated functions don't throw an error?  
        // or i'm capturing it incorrectly
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
      genericAPI(this.this_model, Actions.MERGE, {'source': source_id, 'target': target_id}).then((result) => {
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
    getChildren: function(col, item){
      let parent = {}
      let options = {
        'root': item.id,
        'pageSize': 200
      }
      genericAPI(this.this_model, Actions.LIST, options).then((result) => {
        parent = this.findCard(item.id, col === 'left' ? this.items_left : this.items_right)
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
    getRecipes: function(col, food){
      let parent = {}
      // TODO: make this generic
      let options = {
        'foods': food.id,
        'pageSize': 200
      }
      genericAPI(Models.RECIPE, Actions.LIST, options).then((result) => {
        parent = this.findCard(food.id, col === 'left' ? this.items_left : this.items_right)
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
    refreshThis: function(id){
      this.getThis(id).then(result => {
        this.refreshCard(result.data, this.items_left)
        this.refreshCard({...result.data}, this.items_right)
      })
    },
    deleteThis: function(id) {
      genericAPI(this.this_model, Actions.DELETE, {'id': id}).then((result) => {
        this.items_left = this.destroyCard(id, this.items_left)
        this.items_right = this.destroyCard(id, this.items_right)
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
      }) 
    },
    clearState: function() {
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
