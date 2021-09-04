<template>
  <div row style="margin: 4px">
    <b-card no-body d-flex flex-column :class="{'border border-primary' : over, 'shake': isError}"
      style="height: 10vh;" :style="{'cursor:grab' : draggable}"
      @dragover.prevent
      @dragenter.prevent
      :draggable="draggable"
      @dragstart="handleDragStart($event)"
      @dragenter="handleDragEnter($event)"
      @dragleave="handleDragLeave($event)"
      @drop="handleDragDrop($event)">
      <b-row no-gutters style="height:inherit;">  
        <b-col no-gutters md="3" style="height:inherit;">
          <b-card-img-lazy style="object-fit: cover; height: 10vh;" :src="item_image" v-bind:alt="$t('Recipe_Image')"></b-card-img-lazy>
        </b-col>
        <b-col no-gutters md="9" style="height:inherit;">
            <b-card-body class="m-0 py-0" style="height:inherit;">
              <b-card-text class=" h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                    <h5 class="m-0 mt-1 text-truncate">{{ item[title] }}</h5>
                    <div class= "m-0 text-truncate">{{ item[subtitle] }}</div>
                    <div class="mt-auto mb-1 d-flex flex-row justify-content-end">
                      <div v-if="item[child_count] !=0" class="mx-2 btn btn-link btn-sm" 
                        style="z-index: 800;" v-on:click="$emit('item-action',{'action':'get-children','source':item})">
                          <div v-if="!item.show_children">{{ item[child_count] }} {{ item_type }}</div>
                          <div v-else>{{ text.hide_children }}</div>
                      </div>
                      <div v-if="item[recipe_count]" class="mx-2 btn btn-link btn-sm" style="z-index: 800;"
                        v-on:click="$emit('item-action',{'action':'get-recipes','source':item})">
                        <div v-if="!item.show_recipes">{{ item[recipe_count] }} {{$t('Recipes')}}</div>
                        <div v-else>{{$t('Hide_Recipes')}}</div>
                      </div>
                    </div>
              </b-card-text>
            </b-card-body>
        </b-col>
        <div class="card-img-overlay justify-content-right h-25 m-0 p-0 text-right">
          <slot name="upper-right"></slot>
          <generic-context-menu  class="p-0"
            :show_merge="merge"
            :show_move="move"
            @item-action="$emit('item-action', {'action': $event, 'source': item})">
          </generic-context-menu>
        </div>
      </b-row> 
    </b-card>
    <!-- recursively add child cards -->
    <div class="row" v-if="item.show_children">
      <div class="col-md-11 offset-md-1">
        <generic-horizontal-card v-for="child in item[children]" v-bind:key="child.id"
          :draggable="draggable"
          :item="child"
          :item_type="item_type"
          :title="title"
          :subtitle="subtitle"
          :child_count="child_count"
          :children="children"
          :recipe_count="recipe_count"
          :recipes="recipes"
          :merge="merge"
          :move="move"
          @item-action="$emit('item-action', $event)">
        </generic-horizontal-card>
      </div>
    </div>
    <!-- conditionally view recipes -->
    <div class="row" v-if="item.show_recipes">
      <div class="col-md-11 offset-md-1">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));grid-gap: 1rem;">
          <recipe-card v-for="r in item[recipes]" 
            v-bind:key="r.id"
            :recipe="r">
          </recipe-card>
        </div>
      </div>
    </div>
    <!-- this should be made a generic component, would also require mixin for functions that generate the popup and put in parent container-->  
    <b-list-group ref="tooltip" variant="light" v-show="show_menu" v-on-clickaway="closeMenu" style="z-index:9999; cursor:pointer">
      <b-list-group-item v-if="move" action v-on:click="$emit('item-action',{'action': 'move', 'target': item, 'source': source}); closeMenu()">
        <i class="fas fa-expand-arrows-alt fa-fw"></i> {{$t('Move')}}: {{$t('move_confirmation', {'child': source.name,'parent':item.name})}}
      </b-list-group-item>
      <b-list-group-item v-if="merge" action v-on:click="$emit('item-action',{'action': 'merge', 'target': item, 'source': source}); closeMenu()">
        <i class="fas fa-compress-arrows-alt fa-fw"></i> {{$t('Merge')}}: {{ $t('merge_confirmation', {'source': source.name,'target':item.name}) }}
      </b-list-group-item>
      <b-list-group-item action v-on:click="closeMenu()">
        {{$t('Cancel')}}
      </b-list-group-item>
      <!-- TODO add to shopping list -->
      <!-- TODO add to and/or manage pantry -->
    </b-list-group>
  </div>
</template>

<script>
import GenericContextMenu from "@/components/GenericContextMenu";
import RecipeCard from "@/components/RecipeCard";
import { mixin as clickaway } from 'vue-clickaway';
import { createPopper } from '@popperjs/core';

export default {
  name: "GenericHorizontalCard",
  components: { GenericContextMenu, RecipeCard },
  mixins: [clickaway],
  props: {
    item: Object,
    item_type: {type: String, default: 'Blank Item Type'},  // TODO update translations to handle plural translations
    draggable: {type: Boolean, default: false},
    title: {type: String, default: 'name'},
    subtitle: {type: String, default: 'description'},
    child_count: {type: String, default: 'numchild'},
    children: {type: String, default: 'children'},
    recipe_count: {type: String, default: 'numrecipe'},
    recipes: {type: String, default: 'recipes'},
    move: {type: Boolean, default: false},
    merge: {type: Boolean, default: false},
  },
  data() {
    return {
      item_image: '',
      over: false,
      show_menu: false,
      dragMenu: undefined,
      isError: false,
      source: {'id': undefined, 'name': undefined},
      target: {'id': undefined, 'name': undefined},
      text: {
        'hide_children': '',
      },
    }
  },
  mounted() {
    this.item_image = this.item?.image ?? window.IMAGE_PLACEHOLDER
    this.dragMenu = this.$refs.tooltip
    this.text.hide_children = this.$t('Hide_' + this.item_type)
  },
  methods: {
    handleDragStart: function(e) {
      this.isError = false
      e.dataTransfer.setData('source', JSON.stringify(this.item))
    },
    handleDragEnter: function(e) {
      if (!e.currentTarget.contains(e.relatedTarget) && e.relatedTarget != null) {
        this.over = true
      }
    },
    handleDragLeave: function(e) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        this.over = false
      }
    },
    handleDragDrop: function(e) {
      let source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.id != this.item.id){
        this.source = source
        let menuLocation = {getBoundingClientRect: this.generateLocation(e.clientX, e.clientY),}
        this.show_menu = true
        let popper = createPopper(
          menuLocation, 
          this.dragMenu, 
          {
            placement: 'bottom-start',
            modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    rootBoundary: 'document',
                  },
                },
                {
                  name: 'flip',
                  options: {
                    fallbackPlacements: ['bottom-end', 'top-start', 'top-end', 'left-start', 'right-start'],
                    rootBoundary: 'document',
                  },
                },
            ],
        })
        popper.update()
        this.over = false
        this.$emit({'action': 'drop', 'target': this.item, 'source': this.source})
      } else {
        this.isError = true
      }
    },
    generateLocation: function (x = 0, y = 0) {
      return () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
      });
    },
    closeMenu: function(){
      this.show_menu = false
    },
  }
}
</script>

<style scoped>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>