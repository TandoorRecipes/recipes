<template>
  <div id="app" class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1 offset">
    <div class="mb-3" v-for="book in cookbooks" v-bind:key="book.id">
      <div class="row">
        <div class="col-md-12">
          <b-card class="d-flex flex-column" v-hover
                v-on:click="openBook(book.id)">
          <b-row no-gutters style="height:inherit;">
            <b-col no-gutters md="2" style="height:inherit;">
              <h3>{{book.icon}}</h3>
            </b-col>
            <b-col no-gutters md="10" style="height:inherit;">
              <b-card-body class="m-0 py-0" style="height:inherit;">
                <b-card-text class="h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                  <h5 class="m-0 mt-1 text-truncate">{{ book.name }} <span class="float-right"><i class="fa fa-book"></i></span> </h5>
                  <div class="m-0 text-truncate">{{ book.description }}</div>
                  <div class="mt-auto mb-1 d-flex flex-row justify-content-end">
                  </div>
                </b-card-text>
              </b-card-body>
            </b-col>
          </b-row>
        </b-card>
        </div>
      </div>

      <loading-spinner v-if="current_book === book.id && loading" ></loading-spinner>
      <transition name="slide-fade">
        <cookbook-slider :recipes="recipes" :book="book" v-if="current_book === book.id && !loading"></cookbook-slider>
      </transition>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'
import {ApiApiFactory} from "../../utils/openapi/api";
import CookbookSlider from "../../components/CookbookSlider";
import LoadingSpinner from "../../components/LoadingSpinner";

Vue.use(BootstrapVue)

export default {
  name: 'CookbookView',
  mixins: [],
  components: {LoadingSpinner, CookbookSlider},
  data() {
    return {
      cookbooks: [],
      book_background: window.IMAGE_BOOK,
      recipes: [],
      current_book: undefined,
      loading: false,
    }
  },
  mounted() {
    this.refreshData()
    this.$i18n.locale = window.CUSTOM_LOCALE
  },
  methods: {
    refreshData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.listRecipeBooks().then(result => {
        this.cookbooks = result.data
      })
    },
    openBook: function (book) {
      if(book === this.current_book) {
        this.current_book = undefined
        this.recipes = []
        return
      }
      this.loading = true
      let apiClient = new ApiApiFactory()

      this.current_book = book
      apiClient.listRecipeBookEntrys({query: {book: book}}).then(result => {
        this.recipes = result.data
        this.loading = false
      })
    }
  },
  directives: {
    hover: {
      inserted: function (el) {
        el.addEventListener('mouseenter', () => {
          el.classList.add("shadow")
        });
        el.addEventListener('mouseleave', () => {
          el.classList.remove("shadow")
        });
      }
    }
  }
}

</script>

<style>
.slide-fade-enter-active {
  transition: all .6s ease;
}

.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */
{
  transform: translateX(10px);
  opacity: 0;
}
</style>
