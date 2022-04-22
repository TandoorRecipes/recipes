<template>

  <div>
    <b-modal class="modal" :id="`id_modal_add_book_${modal_id}`" :title="$t('Manage_Books')" :ok-title="$t('Add')"
             :cancel-title="$t('Close')" @ok="addToBook()" @shown="loadBookEntries">
      <ul class="list-group">
          <li  class="list-group-item d-flex justify-content-between align-items-center" v-for="be in this.recipe_book_list" v-bind:key="be.id">
            {{ be.book_content.name }} <span class="btn btn-sm btn-danger" @click="removeFromBook(be)"><i class="fa fa-trash-alt"></i></span>
          </li>
        </ul>

      <multiselect
          style="margin-top: 1vh"
          v-model="selected_book"
          :options="books_filtered"
          :taggable="true"
          @tag="createBook"
          v-bind:tag-placeholder="$t('Create')"
          :placeholder="$t('Select_Book')"
          label="name"
          track-by="id"
          id="id_books"
          :multiple="false"
          :loading="books_loading"
          @search-change="loadBooks">
      </multiselect>
    </b-modal>
  </div>
</template>

<script>

import Multiselect from 'vue-multiselect'

import moment from 'moment'

Vue.prototype.moment = moment

import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import {ApiApiFactory} from "@/utils/openapi/api";
import {makeStandardToast, StandardToasts} from "@/utils/utils";

Vue.use(BootstrapVue)

export default {
  name: 'AddRecipeToBook',
  components: {
    Multiselect
  },
  props: {
    recipe: Object,
    modal_id: Number
  },
  data() {
    return {
      books: [],
      books_loading: false,
      recipe_book_list: [],
      selected_book: null,
    }
  },
  computed: {
    books_filtered: function () {
      let books_filtered = []

      this.books.forEach(b => {
        if (this.recipe_book_list.filter(e => e.book === b.id).length === 0) {
          books_filtered.push(b)
        }
      })

      return books_filtered
    }
  },
  mounted() {

  },
  methods: {
    loadBooks: function (query) {
      this.books_loading = true
      let apiFactory = new ApiApiFactory()
      apiFactory.listRecipeBooks({query: {query: query}}).then(results => {
        this.books = results.data.filter(e => this.recipe_book_list.indexOf(e) === -1)
        this.books_loading = false
      })
    },
    createBook: function (name) {
      let apiFactory = new ApiApiFactory()
      apiFactory.createRecipeBook({name: name}).then(r => {
        this.books.push(r.data)
        this.selected_book = r.data
        StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_CREATE)
      })
    },
    addToBook: function () {
      let apiFactory = new ApiApiFactory()
      apiFactory.createRecipeBookEntry({book: this.selected_book.id, recipe: this.recipe.id}).then(r => {
        this.recipe_book_list.push(r.data)
        StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_CREATE)
      }).catch(err => {
          StandardToasts.makeStandardToast(this,StandardToasts.FAIL_UPDATE, err)
      })
    },
    removeFromBook: function (book_entry) {
      let apiFactory = new ApiApiFactory()
      apiFactory.destroyRecipeBookEntry(book_entry.id).then(r => {
        this.recipe_book_list = this.recipe_book_list.filter(e => e.id !== book_entry.id)
        StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_DELETE)
      })
    },
    loadBookEntries: function () {

      let apiFactory = new ApiApiFactory()
      apiFactory.listRecipeBookEntrys({query: {recipe: this.recipe.id}}).then(r => {
        this.recipe_book_list = r.data
        this.loadBooks('')
      })
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>