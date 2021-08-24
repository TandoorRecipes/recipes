<template>
  <div id="app" style="margin-bottom: 4vh">
    <generic-split-lists
      :list_name="this_model"
      :load_more_left="load_more_left"
      :load_more_right="load_more_right"
      @reset="resetList"
      @get-list="getFoods"
      @item-action="startAction" 
    >
      <template v-slot:cards-left>
        <generic-horizontal-card 
          v-for="f in foods" v-bind:key="f.id"
          :model=f
          :model_name="this_model"
          :draggable="true"
          :tree="true"
          :merge="true"
          :move="true"
          @item-action="startAction($event, 'left')" 
        >
            <template v-slot:upper-right>
              <b-button v-if="f.recipe" v-b-tooltip.hover :title="f.recipe.name" 
                class=" btn fas fa-book-open p-0 border-0" variant="link" :href="f.recipe.url"/>
            </template>
        </generic-horizontal-card>
      </template>
      <template v-slot:cards-right>
        <generic-horizontal-card v-for="f in foods2" v-bind:key="f.id"
          :model=f
          :model_name="this_model"
          :draggable="true"
          :tree="true"
          :merge="true"
          :move="true"
          @item-action="startAction($event, 'right')" 
        >
          <template v-slot:upper-right>
            <b-button v-if="f.recipe" v-b-tooltip.hover :title="f.recipe.name" 
              class=" btn fas fa-book-open p-0 border-0" variant="link" :href="f.recipe.url"/>
          </template>
        </generic-horizontal-card>
      </template>
    </generic-split-lists>
    
    <!-- TODO Modals can probably be made generic and moved to component -->
    <!-- edit modal -->
    <b-modal class="modal" 
      :id="'id_modal_food_edit'"
      :title="this.$t('Edit_Food')" 
      :ok-title="this.$t('Save')"
      :cancel-title="this.$t('Cancel')" 
      @ok="saveFood">
      <form>
        <label for="id_food_name_edit">{{ this.$t('Name') }}</label>
        <input class="form-control" type="text" id="id_food_name_edit" v-model="this_item.name">
        <label for="id_food_description_edit">{{ this.$t('Description') }}</label>
        <input class="form-control" type="text" id="id_food_description_edit" v-model="this_item.description">
        <label for="id_food_recipe_edit">{{ this.$t('Recipe') }}</label>
        <!-- TODO initial selection isn't working and I don't know why -->
        <generic-multiselect 
          @change="this_item.recipe=$event.val"
          label="name"
          :initial_selection="[this_item.recipe]"  
          search_function="listRecipes" 
          :multiple="false"
          :sticky_options="[{'id': null,'name': $t('None')}]"
          style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
          :placeholder="this.$t('Search')">
        </generic-multiselect>
        <div class="form-group form-check">
          <input type="checkbox" class="form-check-input" id="id_food_ignore_edit" v-model="this_item.ignore_shopping">
          <label class="form-check-label" for="id_food_ignore_edit">{{ this.$t('Ignore_Shopping') }}</label>
        </div>
        <label for="id_food_category_edit">{{ this.$t('Shopping_Category') }}</label>
        <generic-multiselect 
          @change="this_item.supermarket_category=$event.val"
          label="name"
          :initial_selection="[this_item.supermarket_category]"  
          search_function="listSupermarketCategorys" 
          :multiple="false"
          :sticky_options="[{'id': null,'name': $t('None')}]"
          style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
          :placeholder="this.$t('Shopping_Category')">
        </generic-multiselect>
      </form>
    </b-modal>
    <!-- delete modal -->
    <b-modal class="modal" 
      :id="'id_modal_food_delete'"
      :title="this.$t('Delete_Food')" 
      :ok-title="this.$t('Delete')"
      :cancel-title="this.$t('Cancel')" 
      @ok="deleteThis(this_item.id, this_model)">
      {{this.$t("delete_confimation", {'kw': this_item.name})}} 
    </b-modal>
    <!-- move modal -->
    <b-modal class="modal" 
      :id="'id_modal_food_move'"
      :title="this.$t('Move_Food')" 
      :ok-title="this.$t('Move')"
      :cancel-title="this.$t('Cancel')" 
      @ok="moveFood(this_item.id, this_item.target.id)">
      {{ this.$t("move_selection", {'child': this_item.name}) }}
      <generic-multiselect 
        @change="this_item.target=$event.val"
        label="name"
        search_function="listFoods" 
        :multiple="false"
        :sticky_options="[{'id': 0,'name': $t('Root')}]"
        :tree_api="true"
        style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
        :placeholder="this.$t('Search')">
      </generic-multiselect>
    </b-modal>
    <!-- merge modal -->
    <b-modal class="modal" 
      :id="'id_modal_food_merge'"
      :title="this.$t('Merge_Food')" 
      :ok-title="this.$t('Merge')"
      :cancel-title="this.$t('Cancel')" 
      @ok="mergeFood(this_item.id, this_item.target.id)">
      {{ this.$t("merge_selection", {'source': this_item.name, 'type': this.$t('food')}) }}
      <generic-multiselect 
        @change="this_item.target=$event.val"
        label="name"
        search_function="listFoods"
        :multiple="false"
        :tree_api="true"
        style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
        :placeholder="this.$t('Search')">
      </generic-multiselect>
    </b-modal>
  </div>
</template>

<script>

import axios from "axios";
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ToastMixin} from "@/utils/utils";

import {ApiApiFactory} from "@/utils/openapi/api.ts";
import GenericSplitLists from "@/components/GenericSplitLists";
import GenericHorizontalCard from "@/components/GenericHorizontalCard";
import GenericMultiselect from "@/components/GenericMultiselect";

Vue.use(BootstrapVue)

export default {
  name: 'FoodListView',
  mixins: [ToastMixin, GenericSplitLists, GenericHorizontalCard],
  components: {GenericHorizontalCard, GenericMultiselect, GenericSplitLists},
  data() {
    return {
      this_model: 'Food',
      foods: [],
      foods2: [],
      load_more_left: true,
      load_more_right: true,
      blank_item: {
        'id': undefined,
        'name': '',
        'description': '',
        'recipe': null,
        'recipe_full': undefined, 
        'ignore_shopping': false,
        'supermarket_category': undefined,
        'target': {
          'id': undefined,
          'name': ''
        },
      },
      this_item: {
        'id': undefined,
        'name': '',
        'description': '',
        'recipe': null,
        'recipe_full': undefined, 
        'ignore_shopping': false,
        'supermarket_category': undefined,
        'target': {
          'id': undefined,
          'name': ''
        },
      },
    }
  },
  methods: {
    // TODO should model actions be included with the context menu?  the card? a seperate mixin avaible to all?
    resetList: function(e) {
      if (e.column === 'left') {
        this.foods = []
      } else if (e.column === 'right') {
        this.foods2 = []
      }
    },
    startAction: function(e, param) {
      let source = e?.source ?? this.blank_item
      let target = e?.target ?? undefined
      this.this_item = source
      this.this_item.target = target || undefined

      switch (e.action) {
        case 'delete':
          this.$bvModal.show('id_modal_food_delete')
          break;
        case 'new':
          this.this_item = {...this.blank_item}
          this.$bvModal.show('id_modal_food_edit')
          break;
        case 'edit':
          this.$bvModal.show('id_modal_food_edit')
          break;
        case 'move':
          if (target == null) {
            this.$bvModal.show('id_modal_food_move')
          } else {
            this.moveFood(source.id, target.id)
          }
          break;
        case 'merge':
          if (target == null) {
            this.$bvModal.show('id_modal_food_merge')
          } else {
            this.mergeFood(e.source.id, e.target.id)
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
    getFoods: function(params, callback) {
      let apiClient = new ApiApiFactory()
      let query = options?.query ?? ''
      let page = options?.page ?? 1
      let root = options?.root ?? undefined
      let tree = options?.tree ?? undefined
      let pageSize = options?.pageSize ?? 25

      if (query === '') {
        query = undefined
        root = 0
      }
      //  delete above
      let options = {
        'query': params?.query ?? '',
        'page': params?.page ?? 1,
        'root' : params?.id ?? undefined
      }
      let column = params?.column ?? 'left'

      // let promise = this.listObjects(this.this_model, options).then(result => {
      let promise = apiClient.listFoods(query, root, tree, page, pageSize).then((result) => {
        if (result.data.results.length){
          if (column ==='left') {
            this.foods = this.foods.concat(result.data.results)
            if (this.foods?.length < result.data.count) {
              this.load_more_left = true
            } else {
              this.load_more_left = false
            }
            
          } else if (column ==='right') {
            this.foods2 = this.foods2.concat(result.data.results)

            if (this.foods2?.length < result.data.count) {
              this.load_more_right = true
            } else {
              this.load_more_right = false
            }
          }
        } else {
          if (column ==='left') {
            this.load_more_left = false
          } else if (column ==='right') {
            this.load_more_right = false
          }
          console.log('no data returned')
        }
        callback(promise)
      }).catch((err) => {
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    saveFood: function () {
      let apiClient = new ApiApiFactory()
      let food = {
        name: this.this_item.name,
        description: this.this_item.description,
        recipe: this.this_item.recipe?.id ?? null,
        ignore_shopping: this.this_item.ignore_shopping,
        supermarket_category: this.this_item.supermarket_category?.id ?? null,
      }
      if (!this.this_item.id) { // if there is no item id assume its a new item
        apiClient.createFood(food).then(result => {
          // place all new foods at the top of the list - could sort instead
          this.foods = [result.data].concat(this.foods)
          // this creates a deep copy to make sure that columns stay independent
          if (this.show_split){
            this.foods2 = [JSON.parse(JSON.stringify(result.data))].concat(this.foods2)
          } else {
            this.foods2 = []
          }
        }).catch((err) => {
          console.log(err)
        })
      } else {
        apiClient.partialUpdateFood(this.this_item.id, food).then(result => {
          this.refreshCard(this.this_item.id)
        }).catch((err) => {
          console.log(err)
        })
      }
      this.this_item = {...this.blank_item}
    },
    moveFood: function (source_id, target_id) {
      let apiClient = new ApiApiFactory()
      apiClient.moveFood(String(source_id), String(target_id)).then(result => {
        if (target_id === 0) {
          let food = this.findCard(this.foods, source_id) || this.findCard(this.foods2, source_id)
          food.parent = null
          this.foods = [food].concat(this.destroyCard(source_id, this.foods))
          this.foods2 = [...food].concat(this.destroyCard(source_id, this.foods2)) // order matters, destroy old card before adding it back in at root

        } else {
          this.foods = this.destroyCard(source_id, this.foods)
          this.foods2 = this.destroyCard(source_id, this.foods2)
          this.refreshCard(target_id)
        }
      }).catch((err) => {
        // TODO none of the error checking works because the openapi generated functions don't throw an error?  
        // or i'm capturing it incorrectly
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    mergeFood: function (source_id, target_id) {
      let apiClient = new ApiApiFactory()
      apiClient.mergeFood(String(source_id), String(target_id)).then(result => {
        // this.destroyCard(source_id)
        this.refreshCard(target_id)
      }).catch((err) => {
        console.log('Error', err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    // TODO: DRY the listFood functions (refresh, get children, infinityHandler ) can probably all be consolidated into a single function
    getChildren: function(col, food){
      let apiClient = new ApiApiFactory()
      let parent = {}
      let query = undefined
      let page = undefined
      let root = food.id
      let tree = undefined
      let pageSize = 200

      apiClient.listFoods(query, root, tree, page, pageSize).then(result => {
        if (col == 'left') {
          parent = this.findCard(this.foods, food.id)
        } else if (col == 'right'){
          parent = this.findCard(this.foods2, food.id)
        }
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
      let apiClient = new ApiApiFactory()
      let parent = {}
      let pageSize = 200

      apiClient.listRecipes(
          undefined, undefined, String(food.id), undefined, undefined, undefined,
          undefined, undefined, undefined, undefined, undefined, pageSize, undefined
        ).then(result => {
        if (col == 'left') {
          parent = this.findCard(this.foods, food.id)
        } else if (col == 'right'){
          parent = this.findCard(this.foods2, food.id)
        }
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
    refreshCard: function(id){
      let target = {}
      let apiClient = new ApiApiFactory()
      let idx = undefined
      let idx2 = undefined
      apiClient.retrieveFood(id).then(result => {
        target = this.findCard(this.foods, id) || this.findCard(this.foods2, id)
        
        if (target.parent) {
          let parent = this.findCard(this.foods, target.parent)
          let parent2 = this.findCard(this.foods2, target.parent)

          if (parent) {
            if (parent.show_children){
              idx = parent.children.indexOf(parent.children.find(kw => kw.id === target.id))
              Vue.set(parent.children, idx, result.data)
            }
          }
          if (parent2){
            if (parent2.show_children){
              idx2 = parent2.children.indexOf(parent2.children.find(kw => kw.id === target.id))
              // deep copy to force columns to be indepedent
              Vue.set(parent2.children, idx2, JSON.parse(JSON.stringify(result.data)))
            }
          }
        } else {
          idx = this.foods.indexOf(this.foods.find(food => food.id === target.id))
          idx2 = this.foods2.indexOf(this.foods2.find(food => food.id === target.id))
          Vue.set(this.foods, idx, result.data)
          Vue.set(this.foods2, idx2, JSON.parse(JSON.stringify(result.data)))
        }
        
      })
    },
    // this would move with modals with mixin?
    prepareEmoji: function() {
      this.$refs._edit.addText(this.this_item.icon || ''); 
      this.$refs._edit.blur()
      document.getElementById('btn-emoji-default').disabled = true;
    },
    // this would move with modals with mixin?
    setIcon: function(icon) {
      this.this_item.icon = icon
    },
    deleteThis: function(id, model) {
      const result = new Promise((callback) => this.deleteObject(id, model, callback))
      result.then(() => {
        this.foods = this.destroyCard(id, this.foods)
        this.foods2 = this.destroyCard(id, this.foods2)
      })
      
    },
    
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
