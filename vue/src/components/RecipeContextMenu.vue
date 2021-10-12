<template>
  <div>

    <div class="dropdown d-print-none">
      <a class="btn shadow-none" href="#" role="button" id="dropdownMenuLink"
         data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <i class="fas fa-ellipsis-v fa-lg"></i>
      </a>

      <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">

        <a class="dropdown-item" :href="resolveDjangoUrl('edit_recipe', recipe.id)"><i
            class="fas fa-pencil-alt fa-fw"></i> {{ $t('Edit') }}</a>

        <a class="dropdown-item" :href="resolveDjangoUrl('edit_convert_recipe', recipe.id)" v-if="!recipe.internal"><i
            class="fas fa-exchange-alt fa-fw"></i> {{ $t('convert_internal') }}</a>

        <a href="#">
          <button class="dropdown-item" @click="$bvModal.show(`id_modal_add_book_${modal_id}`)">
            <i class="fas fa-bookmark fa-fw"></i> {{ $t('Manage_Books') }}
          </button>
        </a>

        <a class="dropdown-item" :href="`${resolveDjangoUrl('view_shopping') }?r=[${recipe.id},${servings_value}]`"
           v-if="recipe.internal" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-shopping-cart fa-fw"></i> {{ $t('Add_to_Shopping') }}
        </a>

        <a class="dropdown-item" @click="createMealPlan" href="#"><i
            class="fas fa-calendar fa-fw"></i> {{ $t('Add_to_Plan') }}
        </a>

        <a href="#">
          <button class="dropdown-item" @click="$bvModal.show(`id_modal_cook_log_${modal_id}`)"><i
              class="fas fa-clipboard-list fa-fw"></i> {{ $t('Log_Cooking') }}
          </button>
        </a>

        <a href="#">
          <button class="dropdown-item" onclick="window.print()"><i
              class="fas fa-print fa-fw"></i> {{ $t('Print') }}
          </button>
        </a>

        <a class="dropdown-item" :href="resolveDjangoUrl('view_export') + '?r=' + recipe.id" target="_blank"
           rel="noopener noreferrer"><i class="fas fa-file-export fa-fw"></i> {{ $t('Export') }}</a>

        <a href="#">
          <button class="dropdown-item" @click="createShareLink()" v-if="recipe.internal"><i
              class="fas fa-share-alt fa-fw"></i> {{ $t('Share') }}
          </button>
        </a>
      </div>


    </div>

    <cook-log :recipe="recipe" :modal_id="modal_id"></cook-log>
    <add-recipe-to-book :recipe="recipe" :modal_id="modal_id"></add-recipe-to-book>

    <b-modal :id="`modal-share-link_${modal_id}`" v-bind:title="$t('Share')" hide-footer>
      <div class="row">
        <div class="col col-md-12">
          <label v-if="recipe_share_link !== undefined">{{ $t('Public share link') }}</label>
          <input ref="share_link_ref" class="form-control" v-model="recipe_share_link"/>
          <b-button class="mt-2 mb-3 d-none d-md-inline" variant="secondary"
                    @click="$bvModal.hide(`modal-share-link_${modal_id}`)">{{ $t('Close') }}
          </b-button>
          <b-button class="mt-2 mb-3 ml-md-2" variant="primary" @click="copyShareLink()">{{ $t('Copy') }}</b-button>
          <b-button class="mt-2 mb-3 ml-2 float-right" variant="success" @click="shareIntend()">{{ $t('Share') }} <i
              class="fa fa-share-alt"></i></b-button>
        </div>
      </div>
    </b-modal>

    <meal-plan-edit-modal :entry="entryEditing" :entryEditing_initial_recipe="[recipe]"
                          :entry-editing_initial_meal_type="[]" @save-entry="saveMealPlan"
                          :modal_id="`modal-meal-plan_${modal_id}`" :allow_delete="false" :modal_title="$t('Create_Meal_Plan_Entry')"></meal-plan-edit-modal>
  </div>
</template>

<script>

import {makeToast, resolveDjangoUrl, ResolveUrlMixin, StandardToasts} from "@/utils/utils";
import CookLog from "@/components/CookLog";
import axios from "axios";
import AddRecipeToBook from "./AddRecipeToBook";
import MealPlanEditModal from "@/components/MealPlanEditModal";
import moment from "moment";
import Vue from "vue";
import {ApiApiFactory} from "@/utils/openapi/api";

Vue.prototype.moment = moment

export default {
  name: 'RecipeContextMenu',
  mixins: [
    ResolveUrlMixin
  ],
  components: {
    AddRecipeToBook,
    CookLog,
    MealPlanEditModal
  },
  data() {
    return {
      servings_value: 0,
      recipe_share_link: undefined,
      modal_id: this.recipe.id + Math.round(Math.random() * 100000),
      options: {
        entryEditing: {
          date: null,
          id: -1,
          meal_type: null,
          note: "",
          note_markdown: "",
          recipe: null,
          servings: 1,
          shared: [],
          title: '',
          title_placeholder: this.$t('Title')
        }
      },
      entryEditing: {},
    }
  },
  props: {
    recipe: Object,
    servings: {
      type: Number,
      default: -1
    }
  },
  mounted() {
    this.servings_value = ((this.servings === -1) ? this.recipe.servings : this.servings)
  },
  methods: {
    saveMealPlan: function (entry) {
      entry.date = moment(entry.date).format("YYYY-MM-DD")

      let apiClient = new ApiApiFactory()

      apiClient.createMealPlan(entry).then(result => {
        this.$bvModal.hide(`modal-meal-plan_${this.modal_id}`)
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
      }).catch(error => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
      })
    },
    createMealPlan(data) {
      this.entryEditing = this.options.entryEditing
      this.entryEditing.recipe = this.recipe
      this.entryEditing.date = moment(new Date()).format('YYYY-MM-DD')
      this.$bvModal.show(`modal-meal-plan_${this.modal_id}`)
    },
    createShareLink: function () {
      axios.get(resolveDjangoUrl('api_share_link', this.recipe.id)).then(result => {
        this.$bvModal.show(`modal-share-link_${this.modal_id}`)
        this.recipe_share_link = result.data.link
      }).catch(err => {

        if (err.response.status === 403) {
          makeToast(this.$t('Share'), this.$t('Sharing is not enabled for this space.'), 'danger')
        }
      })

    },
    copyShareLink: function () {
      let share_input = this.$refs.share_link_ref;
      share_input.select();
      document.execCommand("copy");
    },
    shareIntend: function () {
      let shareData = {
        title: this.recipe.name,
        text: `${this.$t('Check out this recipe: ')} ${this.recipe.name}`,
        url: this.recipe_share_link
      }
      navigator.share(shareData)
    }
  }
}
</script>
