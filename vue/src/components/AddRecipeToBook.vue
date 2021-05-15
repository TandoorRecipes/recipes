<template>

  <div>
    <b-modal class="modal" id="id_modal_add_book" :title="$t('Add_to_Book')" :ok-title="$t('Add')"
             :cancel-title="$t('Close')" @ok="addToBook()">

      <multiselect
          v-model="selected_book"
          :options="books"

          :preserve-search="true"
          :placeholder="$t('Select_Book')"
          label="name"
          track-by="id"
          id="id_books"
          :multiple="false"

          @search-change="loadBook">
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
import {apiAddRecipeBookEntry, apiLoadCookBooks, apiLogCooking} from "@/utils/api";

Vue.use(BootstrapVue)

export default {
  name: 'AddRecipeToBook',
  components: {
    Multiselect
  },
  props: {
    recipe: Object,
  },
  data() {
    return {
      books: [],
      selected_book: null,
    }
  },
  mounted() {
    this.loadBook('')
  },
  methods: {
    loadBook: function (query) {
      apiLoadCookBooks(query).then(results => {
        this.books = results
      })
    },
    addToBook() {
      apiAddRecipeBookEntry({'recipe': this.recipe.id, 'book': this.selected_book.id})
    },
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>