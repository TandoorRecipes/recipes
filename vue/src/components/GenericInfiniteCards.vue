<template>
    <div id="app" style="margin-bottom: 4vh">
        <div class="row flex-shrink-0">
            <div class="col col-md">
            <!-- search box -->
                <b-input-group class="mt-3">
                    <b-input class="form-control" type="search" v-model="search" 
                            v-bind:placeholder="this.text.search"></b-input>
                </b-input-group>
            </div>
        </div>
        <div class="row" :class="{'vh-100 mh-100 overflow-auto' : scroll}">
            <div class="col col-md">
                <slot name="cards"></slot>
                <infinite-loading
                    :identifier='column' 
                    @infinite="infiniteHandler" 
                    spinner="waveDots">
                    <template v-slot:no-more><span/></template>
                    <template v-slot:no-results><span>{{$t('No_Results')}}</span></template>
                </infinite-loading>
            </div>
        </div>
    </div>

</template>

<script>
import 'bootstrap-vue/dist/bootstrap-vue.css'
import _debounce from 'lodash/debounce'
import InfiniteLoading from 'vue-infinite-loading';

export default {
  name: 'GenericInfiniteCards',
  components: {InfiniteLoading},
  props: {
    card_list: {type: Array, default(){return []}},
    card_counts: {type: Object},
    scroll: {type:Boolean, default: false}
  },
  data() {
    return {
      search: '',
      page: 0,
      state: undefined,
      column: +new Date(),
      text: {
          'new': '',
          'search': this.$t('Search')
      },
    }
  },
  mounted() {

  },
  watch: {
    search: _debounce(function() {
      this.page = 0
      this.$emit('reset')
      this.column += 1
    }, 700),

    card_counts: {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal.current > 0) {
          this.state.loaded()
        }
        if (newVal.current >= newVal.max) {
          this.state.complete()
        }
      }
    },
  },
  methods: {
    infiniteHandler: function($state, col) { 
        let params = {
            'query': this.search,
            'page': this.page + 1
        }
        this.state = $state
        this.$emit('search', params)
        this.page+= 1
    },
  }
}

</script>

<style>

</style>
