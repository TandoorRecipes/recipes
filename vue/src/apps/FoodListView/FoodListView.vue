<template>
  <div id="app" style="margin-bottom: 4vh">

    <div class="row">
      <div class="col-md-2 d-none d-md-block">

      </div>
      <div class="col-xl-8 col-12">
        <div class="container-fluid d-flex flex-column flex-grow-1" :class="{'vh-100' : show_split}">
          <!-- expanded options box -->
          <div class="row flex-shrink-0">
            <div class="col col-md-12">
              <b-collapse id="collapse_advanced" class="mt-2" v-model="advanced_visible">
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-3" style="margin-top: 1vh">
                          <div class="btn btn-primary btn-block text-uppercase" @click="startAction({'action':'new'})">
                            {{ this.$t('New_Food') }}
                          </div>
                      </div>

                      <div class="col-md-3" style="margin-top: 1vh">
                        <button class="btn btn-primary btn-block text-uppercase" @click="resetSearch">
                          {{ this.$t('Reset_Search') }}
                        </button>
                      </div>
                      <div class="col-md-3" style="position: relative; margin-top: 1vh">
                        <b-form-checkbox v-model="show_split" name="check-button"
                                        class="shadow-none"
                                        style="position:relative;top: 50%;  transform: translateY(-50%);" switch>
                          {{ this.$t('show_split_screen') }}
                        </b-form-checkbox>
                      </div>
                    </div>

                  </div>
                </div>
              </b-collapse>
            </div>
          </div>

          <div class="row flex-shrink-0">
            <!-- search box -->
            <div class="col col-md">
              <b-input-group class="mt-3">
                <b-input class="form-control" v-model="search_input" 
                        v-bind:placeholder="this.$t('Search')"></b-input>
                <b-input-group-append>
                  <b-button v-b-toggle.collapse_advanced variant="primary" class="shadow-none">
                    <i class="fas fa-caret-down" v-if="!advanced_visible"></i>
                    <i class="fas fa-caret-up"  v-if="advanced_visible"></i>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </div>

            <!-- split side search -->
            <div class="col col-md" v-if="show_split">
              <b-input-group class="mt-3">
                <b-input class="form-control" v-model="search_input2" 
                        v-bind:placeholder="this.$t('Search')"></b-input>
              </b-input-group>
            </div>
          </div>

          <!-- only show scollbars in split mode, but this doesn't interact well with infinite scroll, maybe a different componenet? -->
          <div class="row" :class="{'overflow-hidden' : show_split}" style="margin-top: 2vh">
            <div class="col col-md" :class="{'mh-100 overflow-auto' : show_split}">
              <food-card 
                v-for="f in foods"
                v-bind:key="f.id"
                :food="f" 
                :draggable="true"
                @item-action="startAction($event, 'left')" 
              ></food-card>
              <infinite-loading
                :identifier='left' 
                @infinite="infiniteHandler($event, 'left')" 
                spinner="waveDots">
              </infinite-loading>
            </div>
            <!-- right side food cards -->
            <div class="col col-md mh-100 overflow-auto " v-if="show_split">
              <food-card 
                v-for="f in foods2"
                v-bind:key="f.id"
                :food="f" 
                draggable="true"
                @item-action="startAction($event, 'right')"
              ></food-card>
              <infinite-loading  
                :identifier='right' 
                @infinite="infiniteHandler($event, 'right')" 
                spinner="waveDots">
              </infinite-loading>
            </div>
          </div>
        </div>


      </div>
      <div class="col-md-2 d-none d-md-block">

      </div>
    </div>
    
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
      @ok="delFood(this_item.id)">
      {{this.$t("delete_confimation", {'kw': this_item.name})}} {{this_item.name}}
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
        search_function="listFood" 
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
import _debounce from 'lodash/debounce'

import {ToastMixin} from "@/utils/utils";

import {ApiApiFactory} from "@/utils/openapi/api.ts";
import FoodCard from "@/components/FoodCard";
import GenericMultiselect from "@/components/GenericMultiselect";
import InfiniteLoading from 'vue-infinite-loading';

Vue.use(BootstrapVue)

export default {
  name: 'FoodListView',
  mixins: [ToastMixin],
  components: {FoodCard, GenericMultiselect, InfiniteLoading},
  data() {
    return {
      foods: [],
      foods2: [],
      show_split: false,
      search_input: '',
      search_input2: '',
      advanced_visible: false,
      right_page: 0,
      right: +new Date(),
      isDirtyRight: false,
      left_page: 0,
      update_recipe: [],
      left: +new Date(),
      isDirtyLeft: false,
      this_item: {
        'id': -1,
        'name': '',
        'description': '',
        'recipe': null,
        'recipe_full': undefined, 
        'ignore_shopping': false,
        'supermarket_category': undefined,
        'target': {
          'id': -1,
          'name': ''
        },
      },
    }
  },
  watch: {
    search_input: _debounce(function() {
      this.left_page = 0
      this.foods = []
      this.left += 1
    }, 700),
    search_input2: _debounce(function() {
      this.right_page = 0
      this.foods2 = []
      this.right += 1
    }, 700)
  },
  methods: {
    resetSearch: function () {
      if (this.search_input !== '') {
        this.search_input = ''
      } else {
        this.left_page = 0
        this.foods =  []
        this.left += 1
      }
      if (this.search_input2 !== '') {
        this.search_input2 = ''
      } else {
        this.right_page = 0
        this.foods2 = []
        this.right += 1
      }
      
    },
    // TODO should model actions be included with the context menu?  the card? a seperate mixin avaible to all?
    startAction: function(e, col) {
      let target = e.target || null
      let source = e.source || null

      if (e.action == 'delete') {
        this.this_item = source
        this.$bvModal.show('id_modal_food_delete')
      } else if (e.action == 'new') {
        this.this_item = {}
        this.$bvModal.show('id_modal_food_edit')
      } else if (e.action  == 'edit') {
        this.this_item = source
        console.log('start edit', this.this_item)
        this.$bvModal.show('id_modal_food_edit')
      } else if (e.action  === 'move') {
        this.this_item = source
        if (target == null) {
          this.$bvModal.show('id_modal_food_move')
        } else {
          this.moveFood(source.id, target.id)
        }
      } else if (e.action  === 'merge') {
        this.this_item = source
        if (target == null) {
          this.$bvModal.show('id_modal_food_merge')
        } else {
          this.mergeFood(e.source.id, e.target.id)
        }
      } else if (e.action === 'get-children') {
        if (source.expanded) {
          Vue.set(source, 'expanded', false)
        } else {
          this.this_item = source
          this.getChildren(col, source)
        }
      } else if (e.action === 'get-recipes') {
        if (source.show_recipes) {
          Vue.set(source, 'show_recipes', false)
        } else {
          this.this_item = source
          this.getRecipes(col, source)
        }
      }

    },
    saveFood: function () {
      let apiClient = new ApiApiFactory()
      console.log('this item', this.this_item.supermarket_category?.id, this.this_item.supermarket_category?.id ?? null)
      let food = {
        name: this.this_item.name,
        description: this.this_item.description,
        recipe: this.this_item.recipe?.id ?? null,
        ignore_shopping: this.this_item.ignore_shopping,
        supermarket_category: this.this_item.supermarket_category?.id ?? null,
      }
      console.log('food', food)
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
          this.this_item={}
        }).catch((err) => {
          console.log(err)
          this.this_item = {}
        })
      } else {
        apiClient.partialUpdateFood(this.this_item.id, food).then(result => {
          this.refreshCard(this.this_item.id)
          this.this_item={}
        }).catch((err) => {
          console.log(err)
          this.this_item = {}
        })
      }
    },
    delFood: function (id) {
      let apiClient = new ApiApiFactory()
      
      apiClient.destroyFood(id).then(response => {
        this.destroyCard(id)
      }).catch((err) => {
        console.log(err)
        this.this_item = {}
      })
      
    },
    moveFood: function (source_id, target_id) {
      let apiClient = new ApiApiFactory()
      apiClient.moveFood(String(source_id), String(target_id)).then(result => {
        if (target_id === 0) {
          let food = this.findFood(this.foods, source_id) || this.findFood(this.foods2, source_id)
          food.parent = null

          if (this.show_split){
            this.destroyCard(source_id) // order matters, destroy old card before adding it back in at root
            
            this.foods = [food].concat(this.foods)
            this.foods2 = [JSON.parse(JSON.stringify(food))].concat(this.foods2)
          } else {
            this.destroyCard(source_id)
            this.foods = [food].concat(this.foods)
            this.foods2 = []
          }
        } else {
          this.destroyCard(source_id)
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
        this.destroyCard(source_id)
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
          parent = this.findFood(this.foods, food.id)
        } else if (col == 'right'){
          parent = this.findFood(this.foods2, food.id)
        }
        if (parent) {
          Vue.set(parent, 'children', result.data.results)
          Vue.set(parent, 'expanded', true)
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
          parent = this.findFood(this.foods, food.id)
        } else if (col == 'right'){
          parent = this.findFood(this.foods2, food.id)
        }
        if (parent) {
          Vue.set(parent, 'recipes', result.data.results)
          Vue.set(parent, 'show_recipes', true)
          Vue.set(parent, 'expanded', false)
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
        target = this.findFood(this.foods, id) || this.findFood(this.foods2, id)
        
        if (target.parent) {
          let parent = this.findFood(this.foods, target.parent)
          let parent2 = this.findFood(this.foods2, target.parent)

          if (parent) {
            if (parent.expanded){
              idx = parent.children.indexOf(parent.children.find(kw => kw.id === target.id))
              Vue.set(parent.children, idx, result.data)
            }
          }
          if (parent2){
            if (parent2.expanded){
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
    findFood: function(food_list, id){
      if (food_list.length == 0) {
        return false
      }
      let food = food_list.filter(fd => fd.id == id)
      if (food.length == 1) {
        return food[0]
      } else if (food.length == 0) {
        for (const f of food_list.filter(fd => fd.expanded == true)) {
          food = this.findFood(f.children, id)
          if (food) {
            return food
          }
        }
        
      } else {
        console.log('something terrible happened')
      }
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
    infiniteHandler: function($state, col) {
      let apiClient = new ApiApiFactory()
      let query = (col==='left') ? this.search_input : this.search_input2
      let page = (col==='left') ? this.left_page + 1 : this.right_page + 1 
      let root = undefined
      let tree = undefined
      let pageSize = undefined

      if (query === '') {
        query = undefined
        root = 0
      }

      apiClient.listFoods(query, root, tree, page, pageSize).then(result => {
        if (result.data.results.length){
          if (col ==='left') {
            this.left_page+=1
            this.foods = this.foods.concat(result.data.results)
            $state.loaded();
            if (this.foods.length >= result.data.count) {
              $state.complete();
            }
          } else if (col ==='right') {
            this.right_page+=1
            this.foods2 = this.foods2.concat(result.data.results)
            $state.loaded();
            if (this.foods2.length >= result.data.count) {
              $state.complete();
            }
          }
        } else {
          console.log('no data returned')
          $state.complete();
        }
      }).catch((err) => {
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
        $state.complete();
      })
    },
    destroyCard: function(id) {
      let fd = this.findFood(this.foods, id)
      let fd2 = this.findFood(this.foods2, id)
      let p_id = undefined
      if (fd) {
        p_id = fd.parent
      } else if (fd2) {
        p_id = fd2.parent
      }

      if (p_id) {
        let parent = this.findFood(this.foods, p_id)
        let parent2 = this.findFood(this.v2, p_id)
        if (parent){
          Vue.set(parent, 'numchild', parent.numchild - 1)
          if (parent.expanded) {
            let idx = parent.children.indexOf(parent.children.find(kw => kw.id === id))
            Vue.delete(parent.children, idx)
          }
        }
        if (parent2){
          Vue.set(parent2, 'numchild', parent2.numchild - 1)
          if (parent2.expanded) {
            let idx = parent2.children.indexOf(parent2.children.find(kw => kw.id === id))
            Vue.delete(parent2.children, idx)
          }
        }
      }
      this.foods = this.foods.filter(kw => kw.id != id)
      this.foods2 = this.foods2.filter(kw => kw.id != id)
    },
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
