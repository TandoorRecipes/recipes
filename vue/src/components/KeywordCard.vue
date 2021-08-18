<template>
  <div row>
    <b-card no-body d-flex flex-column :class="{'border border-primary' : over, 'shake': isError}"
      refs="keywordCard" 
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
          <b-card-img-lazy style="object-fit: cover; height: 10vh;" :src="keyword_image" v-bind:alt="$t('Recipe_Image')"></b-card-img-lazy>
        </b-col>
        <b-col no-gutters md="9" style="height:inherit;">
            <b-card-body class="m-0 py-0" style="height:inherit;">
              <b-card-text class=" h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                    <h5 class="m-0 mt-1 text-truncate">{{ keyword.name }}</h5>
                    <div class= "m-0 text-truncate">{{ keyword.description }}</div>
                    <div class="mt-auto mb-1 d-flex flex-row justify-content-end">
                      <div v-if="keyword.numchild !=0" class="mx-2 btn btn-link btn-sm" 
                        style="z-index: 800;" v-on:click="$emit('item-action',{'action':'get-children','source':keyword})">
                          <div v-if="!keyword.expanded">{{keyword.numchild}} {{$t('Keywords')}}</div>
                          <div v-else>{{$t('Hide Keywords')}}</div>
                      </div>
                      <div class="mx-2 btn btn-link btn-sm" style="z-index: 800;"
                        v-on:click="$emit('item-action',{'action':'get-recipes','source':keyword})">
                        <div v-if="!keyword.show_recipes">{{keyword.numrecipe}} {{$t('Recipes')}}</div>
                        <div v-else>{{$t('Hide Recipes')}}</div>
                      </div>
                    </div>
              </b-card-text>
            </b-card-body>
        </b-col>
        <div class="card-img-overlay justify-content-right h-25 m-0 p-0 text-right">
          <generic-context-menu class="p-0"
            :show_merge="true"
            :show_move="true"
            @item-action="$emit('item-action', {'action': $event, 'source': keyword})">
          </generic-context-menu>
        </div>
      </b-row> 
    </b-card>
    <!-- recursively add child keywords -->
    <div class="row" v-if="keyword.expanded">
      <div class="col-md-11 offset-md-1">
        <keyword-card v-for="child in keyword.children" 
          :keyword="child"
          v-bind:key="child.id"
          draggable="true"
          @item-action="$emit('item-action', $event)">
        </keyword-card>
      </div>
    </div>
    <!-- conditionally view recipes -->
    <div class="row" v-if="keyword.show_recipes">
      <div class="col-md-11 offset-md-1">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));grid-gap: 1rem;">
          <recipe-card v-for="r in keyword.recipes" 
            v-bind:key="r.id"
            :recipe="r">
          </recipe-card>
        </div>
      </div>
    </div>
    <!-- this should be made a generic component, would also require mixin for functions that generate the popup  and put in parent container-->  
    <b-list-group ref="tooltip" variant="light" v-show="show_menu" v-on-clickaway="closeMenu" style="z-index:999; cursor:pointer">
      <b-list-group-item action v-on:click="$emit('item-action',{'action': 'move', 'target': keyword, 'source': source}); closeMenu()">
        <i class="fas fa-expand-arrows-alt fa-fw"></i> {{$t('Move')}}: {{$t('move_confirmation', {'child': source.name,'parent':keyword.name})}}
      </b-list-group-item>
      <b-list-group-item action v-on:click="$emit('item-action',{'action': 'merge', 'target': keyword, 'source': source}); closeMenu()">
        <i class="fas fa-compress-arrows-alt fa-fw"></i> {{$t('Merge')}}: {{ $t('merge_confirmation', {'source': source.name,'target':keyword.name}) }}
      </b-list-group-item>
      <b-list-group-item action v-on:click="closeMenu()">
        <i class="fas fa-times fa-fw"></i> {{$t('Cancel')}}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import GenericContextMenu from "@/components/GenericContextMenu";
import RecipeCard from "@/components/RecipeCard";
import { mixin as clickaway } from 'vue-clickaway';
import { createPopper } from '@popperjs/core';

export default {
  name: "KeywordCard",
  components: { GenericContextMenu, RecipeCard },
  mixins: [clickaway],
  props: {
    keyword: Object,
    draggable: {type: Boolean, default: false}
  },
  data() {
    return {
      keyword_image: '',
      over: false,
      show_menu: false,
      dragMenu: undefined,
      isError: false,
      source: {},
      target: {}
    }
  },
  mounted() {
    if (this.keyword == null || this.keyword.image == null) {
      this.keyword_image = window.IMAGE_PLACEHOLDER
    } else {
      this.keyword_image = this.keyword.image
    }
    this.dragMenu = this.$refs.tooltip
  },
  methods: {
    handleDragStart: function(e) {
      this.isError = false
      e.dataTransfer.setData('source', JSON.stringify(this.keyword))
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
      if (source.id != this.keyword.id){
        this.source = source
        let menuLocation = {getBoundingClientRect: this.generateLocation(e.pageX, e.pageY),}
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
        this.$emit({'action': 'drop', 'target': this.keyword, 'source': this.source})
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
    }
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