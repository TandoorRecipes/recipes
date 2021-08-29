<template>
  <div id="app" style="margin-bottom: 4vh">
    <generic-modal-form 
    :model="this_model.name"
    :action="this_action"/>
    <generic-split-lists
      :list_name="this_model.name"
      @reset="resetList"
      @get-list="getFoods"
      @item-action="startAction" 
    >
      <template v-slot:cards-left>
        <generic-horizontal-card 
          v-for="f in foods" v-bind:key="f.id"
          :model=f
          :model_name="this_model.name"
          :draggable="true"
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
          :model_name="this_model.name"
          :draggable="true"
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
      @ok="deleteThis(this_item.id)">
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

import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {ApiMixin, CardMixin, ToastMixin} from "@/utils/utils";
import {Models, Actions} from "@/utils/models";
import {StandardToasts} from "@/utils/utils";

import GenericSplitLists from "@/components/GenericSplitLists";
import GenericHorizontalCard from "@/components/GenericHorizontalCard";
import GenericMultiselect from "@/components/GenericMultiselect";
import GenericModalForm from "@/components/Modals/GenericModalForm";

Vue.use(BootstrapVue)

export default {
  name: 'FoodListView',
  mixins: [ApiMixin, CardMixin, ToastMixin],
  components: {GenericHorizontalCard, GenericMultiselect, GenericSplitLists, GenericModalForm},
  data() {
    return {
      this_model: Models.FOOD, 
      this_action:'',
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
      let column = params?.column ?? 'left'

      this.genericAPI(this.this_model, Actions.LIST, params).then((result) => {
        if (result.data.results.length){
          if (column ==='left') {
            this.foods = this.foods.concat(result.data.results)            
          } else if (column ==='right') {
            this.foods2 = this.foods2.concat(result.data.results)
          }
          // are the total elements less than the length of the array? if so, stop loading
          callback(result.data.count > (column==="left" ? this.foods.length : this.foods2.length))
        } else {
          callback(false) // stop loading
          console.log('no data returned')
        }
        // return true if total objects are still less than the length of the list
        callback(result.data.count < (column==="left" ? this.foods.length : this.foods2.length)) 
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    getThis: function(id, callback){
      return this.genericAPI(this.this_model, Actions.FETCH, {'id': id}) 
    },
    saveFood: function () {
      let food = {...this.this_item}
      food.supermarket_category = this.this_item.supermarket_category?.id ?? null
      food.recipe = this.this_item.recipe?.id ?? null
      if (!food?.id) { // if there is no item id assume it's a new item
        this.genericAPI(this.this_model, Actions.CREATE, food).then((result) => {
          // place all new foods at the top of the list - could sort instead
          this.foods = [result.data].concat(this.foods)
          // this creates a deep copy to make sure that columns stay independent
          if (this.show_split){
            this.foods2 = [...this.foods]
          } else {
            this.foods2 = []
          }
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
        }).catch((err) => {
          console.log(err)
          StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
        })
      } else {
        this.genericAPI(this.this_model, Actions.UPDATE, food).then((result) => {
          this.refreshObject(food.id)
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
        }).catch((err) => {
          console.log(err)
          StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
        })
      }
      this.this_item = {...this.blank_item}
    },
    moveFood: function (source_id, target_id) {
      this.genericAPI(this.this_model, Actions.MOVE, {'source': source_id, 'target': target_id}).then((result) => {
        if (target_id === 0) {
          let food = this.findCard(source_id, this.foods) || this.findCard(source_id, this.foods2)
          this.foods = [food].concat(this.destroyCard(source_id, this.foods)) // order matters, destroy old card before adding it back in at root
          this.foods2 = [...[food]].concat(this.destroyCard(source_id, this.foods2)) // order matters, destroy old card before adding it back in at root
          food.parent = null
        } else {
          this.foods = this.destroyCard(source_id, this.foods)
          this.foods2 = this.destroyCard(source_id, this.foods2)
          this.refreshObject(target_id)
        }
        // TODO make standard toast
        this.makeToast(this.$t('Success'), 'Succesfully moved food', 'success')
      }).catch((err) => {
        // TODO none of the error checking works because the openapi generated functions don't throw an error?  
        // or i'm capturing it incorrectly
        console.log(err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    mergeFood: function (source_id, target_id) {
      this.genericAPI(this.this_model, Actions.MERGE, {'source': source_id, 'target': target_id}).then((result) => {
        this.foods = this.destroyCard(source_id, this.foods)
        this.foods2 = this.destroyCard(source_id, this.foods2)
        this.refreshObject(target_id)
      }).catch((err) => {
        console.log('Error', err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
      // TODO make standard toast
        this.makeToast(this.$t('Success'), 'Succesfully merged food', 'success')
    },
    getChildren: function(col, food){
      let parent = {}
      let options = {
        'root': food.id,
        'pageSize': 200
      }
      this.genericAPI(this.this_model, Actions.LIST, options).then((result) => {
        parent = this.findCard(food.id, col === 'left' ? this.foods : this.foods2)
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
      let options = {
        'foods': food.id,
        'pageSize': 200
      }

      this.genericAPI(Models.RECIPE, Actions.LIST, options).then((result) => {
        parent = this.findCard(food.id, col === 'left' ? this.foods : this.foods2)
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
    refreshObject: function(id){
      console.log('refresh object', id)
      this.getThis(id).then(result => {
        this.refreshCard(result.data, this.foods)
        this.refreshCard({...result.data}, this.foods2)
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
      this.genericAPI(this.this_model, Actions.DELETE, {'id': id}).then((result) => {
        this.foods = this.destroyCard(id, this.foods)
        this.foods2 = this.destroyCard(id, this.foods2)
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
      }) 
    },
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
