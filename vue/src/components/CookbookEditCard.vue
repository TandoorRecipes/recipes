<template>
  <b-card no-body v-hover>
    <b-card-header class="p-4">
      <h5>{{ book_copy.icon }}&nbsp;{{ book_copy.name }}
        <span class="float-right text-primary" @click="editOrSave"><i
            class="fa" v-bind:class="{ 'fa-pen': !editing, 'fa-save': editing }"
            aria-hidden="true"></i></span></h5>
    </b-card-header>
    <b-card-body class="p-4">
      <div class="form-group" v-if="editing">
        <label for="inputName1">{{ $t('Name') }}</label>
        <input class="form-control" id="inputName1"
               placeholder="Name" v-model="book_copy.name">
      </div>
      <div class="form-group" v-if="editing">
        <emoji-input :field="'icon'" :label="$t('Icon')" :value="book_copy.icon"></emoji-input>
      </div>
      <div class="form-group" v-if="editing">
        <label for="inputDesc1">{{ $t('Description') }}</label>
        <textarea class="form-control" id="inputDesc1" rows="3" v-model="book_copy.description">

        </textarea>
      </div>
      <div class="form-group" v-if="editing">
        <label for="inputDesc1">{{ $t('Share') }}</label>
        <generic-multiselect @change="book_copy.shared = $event.val" parent_variable="book.shared"
                             :initial_selection="book.shared" :label="'username'"
                             :model="Models.USER_NAME"
                             style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                             v-bind:placeholder="$t('Share')" :limit="50"></generic-multiselect>
      </div>
      <button v-if="editing" class="btn btn-danger" @click="deleteBook">{{ $t('Delete') }}</button>
      <button v-if="editing" class="btn btn-primary float-right" @click="editOrSave">{{ $t('Save') }}</button>
      <b-card-text style="text-overflow: ellipsis;" v-if="!editing">
        {{ book_copy.description }}
      </b-card-text>
    </b-card-body>
  </b-card>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ApiMixin, StandardToasts} from "@/utils/utils";
import EmojiInput from "./Modals/EmojiInput";
import GenericMultiselect from "@/components/GenericMultiselect";

export default {
  name: "CookbookEditCard",
  components: {EmojiInput, GenericMultiselect},
  mixins: [ApiMixin],
  props: {
    book: Object
  },
  data() {
    return {
      editing: false,
      book_copy: {},
      users: []
    }
  },
  mounted() {
    this.book_copy = this.book
    this.$root.$on('change', this.updateEmoji);
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
  },
  methods: {
    editOrSave: function () {
      if (!this.editing) {
        this.editing = true
        this.$emit("editing", true)
      } else {
        this.editing = false
        this.saveData()
        this.$emit("editing", false)
      }
    },
    updateEmoji: function (item, value) {
      if (item === 'icon') {
        this.book_copy.icon = value
      }
    },
    saveData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.updateRecipeBook(this.book_copy.id, this.book_copy).then(result => {
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
      }).catch(error => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
      })
    },
    refreshData: function () {
      let apiClient = new ApiApiFactory()

      apiClient.listUsers().then(result => {
        this.users = result.data
      })
    },
    deleteBook: function () {
      if (confirm(this.$t('delete_confirmation', {source: this.book.name}))) {
        let apiClient = new ApiApiFactory()

        apiClient.destroyRecipeBook(this.book.id).then(result => {
          this.$emit('refresh')
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
        }).catch(error => {
          StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
        })
      }
    },
  }
}
</script>


<style scoped>

</style>