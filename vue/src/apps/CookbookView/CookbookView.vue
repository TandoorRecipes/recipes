<template>
  <div id="app" class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1 offset">
    <div class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1">
      <div class="row">
        <div class="col col-md-12">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-10 col-xl-8 mt-3 mb-3">
              <b-input-group>
                <b-input class="form-control form-control-lg form-control-borderless form-control-search"
                         v-model="search"
                         v-bind:placeholder="$t('Search')"></b-input>
                <b-input-group-append>
                  <b-button variant="primary"
                            v-b-tooltip.hover :title="$t('Create')"
                            @click="createNew">
                    <i class="fas fa-plus"></i>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3" v-for="book in filteredBooks" :key="book.id">
      <div class="row">
        <div class="col-md-12">
          <b-card class="d-flex flex-column" v-hover
                  v-on:click="openBook(book.id)">
            <b-row no-gutters style="height:inherit;">
              <b-col no-gutters md="2" style="height:inherit;">
                <h3>{{ book.icon }}</h3>
              </b-col>
              <b-col no-gutters md="10" style="height:inherit;">
                <b-card-body class="m-0 py-0" style="height:inherit;">
                  <b-card-text class="h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                    <h5 class="m-0 mt-1 text-truncate">{{ book.name }} <span class="float-right"><i
                        class="fa fa-book"></i></span></h5>
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

      <loading-spinner v-if="current_book === book.id && loading"></loading-spinner>
      <transition name="slide-fade">
        <cookbook-slider :recipes="recipes" :book="book" :key="`slider_${book.id}`"
                         v-if="current_book === book.id && !loading" v-on:refresh="refreshData"></cookbook-slider>
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
import {StandardToasts} from "../../utils/utils";

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
      search: ''
    }
  },
  computed: {
    filteredBooks: function () {
      return this.cookbooks.filter(book => {
        return book.name.toLowerCase().includes(this.search.toLowerCase())
      })
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
      if (book === this.current_book) {
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
    },
    createNew: function () {
      let apiClient = new ApiApiFactory()

      apiClient.createRecipeBook({name: 'New Book', description: '', icon: '', shared: []}).then(result => {
        let new_book = result.data
        this.refreshData()
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
      }).catch(error => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
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
