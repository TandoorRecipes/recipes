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
                       <div class="btn btn-primary btn-block text-uppercase" @click="$emit('item-action', {'action':'new'})">
                            {{ this.text.new }}
                          </div>
                      </div>

                      <div class="col-md-3" style="margin-top: 1vh">
                        <button class="btn btn-primary btn-block text-uppercase" @click="resetSearch">
                          {{ this.text.reset }}
                        </button>
                      </div>
                      <div class="col-md-3" style="position: relative; margin-top: 1vh">
                        <b-form-checkbox v-model="show_split" name="check-button"
                                        class="shadow-none"
                                        style="position:relative;top: 50%;  transform: translateY(-50%);" switch>
                          {{ this.text.split }}
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
                <b-input class="form-control" v-model="search_right" 
                        v-bind:placeholder="this.text.search"></b-input>
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
                <b-input class="form-control" v-model="search_left" 
                        v-bind:placeholder="this.text.search"></b-input>
              </b-input-group>
            </div>
          </div>

          <!-- only show scollbars in split mode -->
          <!-- weird behavior when switching to split mode, infinite scoll doesn't trigger if 
                bottom of page is in viewport can trigger by scrolling page (not column) up  -->
          <div class="row" :class="{'overflow-hidden' : show_split}">
            <div class="col col-md" :class="{'mh-100 overflow-auto' : show_split}">
              <slot name="cards-left"></slot>
              <infinite-loading
                :identifier='left' 
                @infinite="infiniteHandler($event, 'left')" 
                spinner="waveDots">
                <template v-slot:no-more><span/></template>
              </infinite-loading>
            </div>
            <!-- right side food cards -->
            <div class="col col-md mh-100 overflow-auto" v-if="show_split">
              <slot name="cards-right"></slot>
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
  </div>
</template>

<script>
import Vue from 'vue' // maybe not needed?
import 'bootstrap-vue/dist/bootstrap-vue.css'
import _debounce from 'lodash/debounce'
import InfiniteLoading from 'vue-infinite-loading';

export default {
  name: 'GenericSplitLists',
  components: {InfiniteLoading},
  props: {
    list_name: {type: String, default: 'Blank List'},  // TODO update translations to handle plural translations
    left_list: {type:Array, default(){return []}},
    right_list: {type:Array, default(){return []}},
    load_more_left: {type: Boolean, default: false},
    load_more_right: {type: Boolean, default: false},
    //merge: {type: Boolean, default: false},
    //move: {type: Boolean, default: false},
    //action: Object
  },
  data() {
    return {
      advanced_visible: false,
      show_split: false,
      search_right: '',
      search_left: '',
      right_page: 1,
      left_page: 1,
      right: +new Date(),
      left: +new Date(),
      isDirtyright: false,
      isDirtyleft: false,
      text: {
          'new': '',
          'name': '',
          'reset': this.$t('Reset_Search'),
          'split': this.$t('show_split_screen'),
          'search': this.$t('Search')
      },
    }
  },
  mounted() {
    this.dragMenu = this.$refs.tooltip
    this.text.new = this.$t('New_' + this.list_name)
    this.text.name = this.$t(this.list_name)
  },
  watch: {
    search_right: _debounce(function() {
      this.left_page = 0
      this.$emit('reset', {'column':'left'})
      this.left += 1
    }, 700),
    search_left: _debounce(function() {
      this.right_page = 0
      this.$emit('reset', {'column':'right'})
      this.right += 1
    }, 700),
  },
  methods: {
    resetSearch: function () {
      if (this.search_right !== '') {
        this.search_right = ''
      } else {
        this.left_page = 1
        this.$emit('reset', {'column':'left'})
        this.left += 1
      }
      if (this.search_left !== '') {
        this.search_left = ''
      } else {
        this.right_page = 1
        this.$emit('reset', {'column':'right'})
        this.right += 1
      }
    },
    infiniteHandler: function($state, col) { 
        let params = {
            'query': (col==='left') ? this.search_right : this.search_left,
            'page': (col==='left') ? this.left_page + 1 : this.right_page + 1,
            'column': col
        }
        const result = new Promise((callback) => this.$emit('get-list', params, callback))
        result.then((result) => {
            console.log(result)
            this[col+'_page']+=1
            $state.loaded();
            if (!this['load_more_' + col]) {
                $state.complete();
            }
        }).catch(() => {
            $state.complete();
        })
    },
    findCard: function(card_list, id){
      let card_length = card_list?.length ?? 0
      if (card_length == 0) {
        return false
      }
      let cards = card_list.filter(obj => obj.id == id)
      if (cards.length == 1) {
        return cards[0]
      } else if (cards.length == 0) {
        for (const o of card_list.filter(o => o.show_children == true)) {
          cards = this.findCard(o.children, id)
          if (cards) {
            return cards
          }
        }
      } else {
        console.log('something terrible happened')
      }
    },
    destroyCard: function(id, cardList) {
      let card = this.findCard(cardList, id)
      let card_id = undefined
      let p_id = card?.parent ?? undefined

      if (p_id) {
        let parent = this.findCard(cardList, p_id)
        if (parent){
          Vue.set(parent, 'numchild', parent.numchild - 1)
          if (parent.show_children) {
            let idx = parent.children.indexOf(parent.children.find(x => x.id === id))
            Vue.delete(parent.children, idx)
          }
        }
      }
      return cardList.filter(kw => kw.id != id)
    },
  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
