<template>
  <div id="app" style="margin-bottom: 4vh">

    <div class="row">
      <div class="col-md-2 d-none d-md-block">

      </div>
      <div class="col-xl-8 col-12">
        <!-- TODO only show scollbars in split mode, but this doesn't interact well with infinite scroll, maybe a different component? -->
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
                            {{ this.$t('New_Keyword') }}
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
              <generic-horizontal-card v-for="kw in keywords" v-bind:key="kw.id"
                :model=kw
                model_name="Keyword"
                :draggable="true"
                :merge="true"
                :move="true"
                @item-action="startAction($event, 'left')" 
              />
              <infinite-loading
                :identifier='left' 
                @infinite="infiniteHandler($event, 'left')" 
                spinner="waveDots">
                <template v-slot:no-more><span/></template>
              </infinite-loading>
            </div>
            <!-- right side keyword cards -->
            <div class="col col-md mh-100 overflow-auto " v-if="show_split">
              <generic-horizontal-card v-for="kw in keywords2" v-bind:key="kw.id"
                :model=kw
                model_name="Keyword"
                :draggable="true"
                :merge="true"
                :move="true"
                @item-action="startAction($event, 'left')" 
              />
              <infinite-loading  
                :identifier='right' 
                @infinite="infiniteHandler($event, 'right')" 
                spinner="waveDots">
                <template v-slot:no-more><span/></template>
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
      :id="'id_modal_keyword_edit'"
      @shown="prepareEmoji"
      :title="this.$t('Edit_Keyword')" 
      :ok-title="this.$t('Save')"
      :cancel-title="this.$t('Cancel')" 
      @ok="saveKeyword">
      <form>
        <label for="id_keyword_name_edit">{{ this.$t('Name') }}</label>
        <input class="form-control" type="text" id="id_keyword_name_edit" v-model="this_item.name">
        <label for="id_keyword_description_edit">{{ this.$t('Description') }}</label>
        <input class="form-control" type="text" id="id_keyword_description_edit" v-model="this_item.description">
        <label for="id_keyword_icon_edit">{{ this.$t('Icon') }}</label>
        <twemoji-textarea 
          id="id_keyword_icon_edit"
          ref="_edit"
          :emojiData="emojiDataAll" 
          :emojiGroups="emojiGroups"
          triggerType="hover" 
          recentEmojisFeat="true"
          recentEmojisStorage="local"
          @contentChanged="setIcon"
           />
      </form>
    </b-modal>
    <!-- delete modal -->
    <b-modal class="modal" 
      :id="'id_modal_keyword_delete'"
      :title="this.$t('Delete_Keyword')" 
      :ok-title="this.$t('Delete')"
      :cancel-title="this.$t('Cancel')" 
      @ok="delKeyword(this_item.id)">
      {{this.$t("delete_confimation", {'kw': this_item.name})}} {{this_item.name}}
    </b-modal>
    <!-- move modal -->
    <b-modal class="modal" 
      :id="'id_modal_keyword_move'"
      :title="this.$t('Move_Keyword')" 
      :ok-title="this.$t('Move')"
      :cancel-title="this.$t('Cancel')" 
      @ok="moveKeyword(this_item.id, this_item.target.id)">
      {{ this.$t("move_selection", {'child': this_item.name}) }}
      <generic-multiselect 
        @change="this_item.target=$event.val"
        label="name"
        :models="models.KEYWORD"
        :multiple="false"
        :sticky_options="[{'id': 0,'name': $t('Root')}]"
        :tree_api="true"
        style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
        :placeholder="this.$t('Search')">
      </generic-multiselect>
    </b-modal>
    <!-- merge modal -->
    <b-modal class="modal" 
      :id="'id_modal_keyword_merge'"
      :title="this.$t('Merge_Keyword')" 
      :ok-title="this.$t('Merge')"
      :cancel-title="this.$t('Cancel')" 
      @ok="mergeKeyword(this_item.id, this_item.target.id)">
      {{ this.$t("merge_selection", {'source': this_item.name, 'type': this.$t('keyword')}) }}
      <generic-multiselect 
        @change="this_item.target=$event.val"
        :model="models.KEYWORD" 
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
import GenericHorizontalCard from "@/components/GenericHorizontalCard";
import GenericMultiselect from "@/components/GenericMultiselect";
import InfiniteLoading from 'vue-infinite-loading';

// would move with modals if made generic
import {TwemojiTextarea} from '@kevinfaguiar/vue-twemoji-picker';
// TODO add localization
import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/en/emoji-all-groups.json';
import EmojiGroups from '@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json';
// end move with generic modals

Vue.use(BootstrapVue)
import {Models} from "@/utils/models";

export default {
  name: 'KeywordListView',
  mixins: [ToastMixin],
  components: {TwemojiTextarea, GenericHorizontalCard, GenericMultiselect, InfiniteLoading},
  computed: {
    // move with generic modals
    emojiDataAll() {
      return EmojiAllData;
    },
    emojiGroups() {
      return EmojiGroups;
    }
    // end move with generic modals
  },
  data() {
    return {
      keywords: [],
      keywords2: [],
      models: Models,
      show_split: false,
      search_input: '',
      search_input2: '',
      advanced_visible: false,
      right_page: 0,
      right: +new Date(),
      isDirtyRight: false,
      left_page: 0,
      left: +new Date(),
      isDirtyLeft: false,
      this_item: {
        'id': -1,
        'name': '',
        'description': '',
        'icon': '',
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
      this.keywords = []
      this.left += 1
    }, 700),
    search_input2: _debounce(function() {
      this.right_page = 0
      this.keywords2 = []
      this.right += 1
    }, 700)
  },
  methods: {
    resetSearch: function () {
      if (this.search_input !== '') {
        this.search_input = ''
      } else {
        this.left_page = 0
        this.keywords =  []
        this.left += 1
      }
      if (this.search_input2 !== '') {
        this.search_input2 = ''
      } else {
        this.right_page = 0
        this.keywords2 = []
        this.right += 1
      }
      
    },
    // TODO should model actions be included with the context menu?  the card? a seperate mixin avaible to all?
    startAction: function(e, col) {
      let target = e.target || null
      let source = e.source || null

      if (e.action == 'delete') {
        this.this_item = source
        this.$bvModal.show('id_modal_keyword_delete')
      } else if (e.action == 'new') {
        this.this_item = {}
        this.$bvModal.show('id_modal_keyword_edit')
      } else if (e.action  == 'edit') {
        this.this_item = source
        this.$bvModal.show('id_modal_keyword_edit')
      } else if (e.action  === 'move') {
        this.this_item = source
        if (target == null) {
          this.$bvModal.show('id_modal_keyword_move')
        } else {
          this.moveKeyword(source.id, target.id)
        }
      } else if (e.action  === 'merge') {
        this.this_item = source
        if (target == null) {
          this.$bvModal.show('id_modal_keyword_merge')
        } else {
          this.mergeKeyword(e.source.id, e.target.id)
        }
      } else if (e.action === 'get-children') {
        if (source.show_children) {
          Vue.set(source, 'show_children', false)
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
    saveKeyword: function () {
      let apiClient = new ApiApiFactory()
      let kw = {
        name: this.this_item.name,
        description: this.this_item.description,
        icon: this.this_item.icon,
      }
      if (!this.this_item.id) { // if there is no item id assume its a new item
        apiClient.createKeyword(kw).then(result => {
          // place all new keywords at the top of the list - could sort instead
          this.keywords = [result.data].concat(this.keywords)
          // this creates a deep copy to make sure that columns stay independent
          if (this.show_split){
            this.keywords2 = [JSON.parse(JSON.stringify(result.data))].concat(this.keywords2)
          } else {
            this.keywords2 = []
          }
          this.this_item={}
        }).catch((err) => {
          console.log(err)
          this.this_item = {}
        })
      } else {
        apiClient.partialUpdateKeyword(this.this_item.id, kw).then(result => {
          this.refreshCard(this.this_item.id)
          this.this_item={}
        }).catch((err) => {
          console.log(err)
          this.this_item = {}
        })
      }
    },
    delKeyword: function (id) {
      let apiClient = new ApiApiFactory()
      
      apiClient.destroyKeyword(id).then(response => {
        this.destroyCard(id)
      }).catch((err) => {
        console.log(err)
        this.this_item = {}
      })
      
    },
    moveKeyword: function (source_id, target_id) {
      let apiClient = new ApiApiFactory()
      apiClient.moveKeyword(String(source_id), String(target_id)).then(result => {
        if (target_id === 0) {
          let kw = this.findKeyword(this.keywords, source_id) || this.findKeyword(this.keywords2, source_id)
          kw.parent = null

          if (this.show_split){
            this.destroyCard(source_id) // order matters, destroy old card before adding it back in at root
            
            this.keywords = [kw].concat(this.keywords)
            this.keywords2 = [JSON.parse(JSON.stringify(kw))].concat(this.keywords2)
          } else {
            this.destroyCard(source_id)
            this.keywords = [kw].concat(this.keywords)
            this.keywords2 = []
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
    mergeKeyword: function (source_id, target_id) {
      let apiClient = new ApiApiFactory()
      apiClient.mergeKeyword(String(source_id), String(target_id)).then(result => {
        this.destroyCard(source_id)
        this.refreshCard(target_id)
      }).catch((err) => {
        console.log('Error', err)
        this.makeToast(this.$t('Error'), err.bodyText, 'danger')
      })
    },
    // TODO: DRY the listKeyword functions (refresh, get children, infinityHandler ) can probably all be consolidated into a single function
    getChildren: function(col, kw){
      let apiClient = new ApiApiFactory()
      let parent = {}
      let query = undefined
      let page = undefined
      let root = kw.id
      let tree = undefined
      let pageSize = 200

      apiClient.listKeywords(query, root, tree, page, pageSize).then(result => {
        if (col == 'left') {
          parent = this.findKeyword(this.keywords, kw.id)
        } else if (col == 'right'){
          parent = this.findKeyword(this.keywords2, kw.id)
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
    getRecipes: function(col, kw){
      let apiClient = new ApiApiFactory()
      let parent = {}
      let pageSize = 200
      let keyword = String(kw.id)
      console.log(apiClient.listRecipes)

      apiClient.listRecipes(
          undefined, keyword, undefined, undefined, undefined, undefined,
          undefined, undefined, undefined, undefined, undefined, pageSize, undefined
        ).then(result => {
        if (col == 'left') {
          parent = this.findKeyword(this.keywords, kw.id)
        } else if (col == 'right'){
          parent = this.findKeyword(this.keywords2, kw.id)
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
      apiClient.retrieveKeyword(id).then(result => {
        target = this.findKeyword(this.keywords, id) || this.findKeyword(this.keywords2, id)
        
        if (target.parent) {
          let parent = this.findKeyword(this.keywords, target.parent)
          let parent2 = this.findKeyword(this.keywords2, target.parent)

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
          idx = this.keywords.indexOf(this.keywords.find(kw => kw.id === target.id))
          idx2 = this.keywords2.indexOf(this.keywords2.find(kw => kw.id === target.id))
          Vue.set(this.keywords, idx, result.data)
          Vue.set(this.keywords2, idx2, JSON.parse(JSON.stringify(result.data)))
        }
        
      })
    },
    findKeyword: function(kw_list, id){
      if (kw_list.length == 0) {
        return false
      }
      let keyword = kw_list.filter(kw => kw.id == id)
      if (keyword.length == 1) {
        return keyword[0]
      } else if (keyword.length == 0) {
        for (const k of kw_list.filter(kw => kw.show_children == true)) {
          keyword = this.findKeyword(k.children, id)
          if (keyword) {
            return keyword
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

      apiClient.listKeywords(query, root, tree, page, pageSize).then(result => {
        if (result.data.results.length){
          if (col ==='left') {
            this.left_page+=1
            this.keywords = this.keywords.concat(result.data.results)
            $state.loaded();
            if (this.keywords.length >= result.data.count) {
              $state.complete();
            }
          } else if (col ==='right') {
            this.right_page+=1
            this.keywords2 = this.keywords2.concat(result.data.results)
            $state.loaded();
            if (this.keywords2.length >= result.data.count) {
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
      let kw = this.findKeyword(this.keywords, id)
      let kw2 = this.findKeyword(this.keywords2, id)
      let p_id = undefined
      p_id = kw?.parent ?? kw2.parent

      if (p_id) {
        let parent = this.findKeyword(this.keywords, p_id)
        let parent2 = this.findKeyword(this.keywords2, p_id)
        if (parent){
          Vue.set(parent, 'numchild', parent.numchild - 1)
          if (parent.show_children) {
            let idx = parent.children.indexOf(parent.children.find(kw => kw.id === id))
            Vue.delete(parent.children, idx)
          }
        }
        if (parent2){
          Vue.set(parent2, 'numchild', parent2.numchild - 1)
          if (parent2.show_children) {
            let idx = parent2.children.indexOf(parent2.children.find(kw => kw.id === id))
            Vue.delete(parent2.children, idx)
          }
        }
      }
      this.keywords = this.keywords.filter(kw => kw.id != id)
      this.keywords2 = this.keywords2.filter(kw => kw.id != id)
    }
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
