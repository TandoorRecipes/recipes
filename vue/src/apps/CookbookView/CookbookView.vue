<template>
  <div id="app" class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1 offset">
    <div class="mb-3" v-for="book in cookbooks" v-bind:key="book.id">
      <div class="row mb-3">
        <b-card class="d-flex flex-column" v-hover
                v-on:click="openBook(book.id)">
          <b-row no-gutters style="height:inherit;">
            <b-col no-gutters md="3" style="height:inherit;">
              <b-card-img-lazy style="object-fit: cover; height: 10vh;" :src="item_image"
                               v-bind:alt="$t('Recipe_Image')"></b-card-img-lazy>
            </b-col>
            <b-col no-gutters md="9" style="height:inherit;">
              <b-card-body class="m-0 py-0" style="height:inherit;">
                <b-card-text class=" h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                  <h5 class="m-0 mt-1 text-truncate">{{ book.name }}</h5>
                  <div class="m-0 text-truncate">{{ book.description }}</div>
                  <div class="mt-auto mb-1 d-flex flex-row justify-content-end">
                  </div>
                </b-card-text>
              </b-card-body>
            </b-col>
          </b-row>
        </b-card>
      </div>

      <cookbook-slider :recipes="recipes"></cookbook-slider>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'
import {ApiApiFactory} from "../../utils/openapi/api";
import CookbookSlider from "../../components/CookbookSlider";

Vue.use(BootstrapVue)

export default {
  name: 'CookbookView',
  mixins: [],
  components: {CookbookSlider},
  data() {
    return {
      cookbooks: [],
      book_background: window.IMAGE_BOOK,
      recipes: []
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
      let apiClient = new ApiApiFactory()

      apiClient.listRecipeBookEntrys({options: {book: book.id}}).then(result => {
        this.recipes = result.data
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


</style>
