<template>
  <b-modal :id="modal_id" size="lg" :title="modal_title" hide-footer aria-label="">
    <div class="row">
      <div class="col col-md-12">
        <div class="row">
          <div class="col-6 col-lg-9">
            <b-input-group>
              <b-form-input id="TitleInput" v-model="entryEditing.title"
                            :placeholder="entryEditing.title_placeholder"></b-form-input>
              <b-input-group-append class="d-none d-lg-block">
                <b-button variant="primary" @click="entryEditing.title = ''"><i class="fa fa-eraser"></i></b-button>
              </b-input-group-append>
            </b-input-group>
            <small tabindex="-1" class="form-text text-muted">{{ $t("Title") }}</small>
          </div>
          <div class="col-6 col-lg-3">
            <input type="date" id="DateInput" class="form-control" v-model="entryEditing.date">
            <small tabindex="-1" class="form-text text-muted">{{ $t("Date") }}</small>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12 col-lg-6 col-xl-6">
            <b-form-group>
              <generic-multiselect
                  @change="selectRecipe"
                  :initial_selection="entryEditing_initial_recipe"
                  :label="'name'"
                  :model="Models.RECIPE"
                  style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                  v-bind:placeholder="$t('Recipe')" :limit="10"
                  :multiple="false"></generic-multiselect>
              <small tabindex="-1" class="form-text text-muted">{{ $t("Recipe") }}</small>
            </b-form-group>
            <b-form-group class="mt-3">
              <generic-multiselect required
                                   @change="selectMealType"
                                   :label="'name'"
                                   :model="Models.MEAL_TYPE"
                                   style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                   v-bind:placeholder="$t('MealType')" :limit="10"
                                   :multiple="false"
                                   :initial_selection="entryEditing_initial_meal_type"></generic-multiselect>
              <small tabindex="-1" class="form-text text-muted">{{ $t("MealType") }}</small>
            </b-form-group>
            <b-form-group
                label-for="NoteInput"
                :description="$t('Note')" class="mt-3">
              <textarea class="form-control" id="NoteInput" v-model="entryEditing.note"
                        :placeholder="$t('Note')"></textarea>
            </b-form-group>
            <b-input-group>
              <b-form-input id="ServingsInput" v-model="entryEditing.servings"
                            :placeholder="$t('Servings')"></b-form-input>
            </b-input-group>
            <small tabindex="-1" class="form-text text-muted">{{ $t("Servings") }}</small>
          </div>
          <div class="col-lg-6 d-none d-lg-block d-xl-block">
            <recipe-card :recipe="entryEditing.recipe" v-if="entryEditing.recipe != null"></recipe-card>
          </div>
        </div>
        <div class="row mt-3 mb-3">
          <div class="col-12">
            <b-button variant="danger" @click="deleteEntry" v-if="allow_delete">{{ $t('Delete') }}
            </b-button>
            <b-button class="float-right" variant="primary" @click="editEntry">{{ $t('Save') }}</b-button>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import GenericMultiselect from "./GenericMultiselect";
import {ApiMixin} from "../utils/utils";

Vue.use(BootstrapVue)

export default {
  name: "MealPlanEditModal",
  props: {
    entry: Object,
    entryEditing_initial_recipe: Array,
    entryEditing_initial_meal_type: Array,
    modal_title: String,
    modal_id: {
      type: String,
      default: "edit-modal"
    },
    allow_delete: {
      type: Boolean,
      default: true
    },
  },
  mixins: [ApiMixin],
  components: {
    GenericMultiselect,
    RecipeCard: () => import('./RecipeCard.vue')
  },
  data() {
    return {
      entryEditing: {}
    }
  },
  watch: {
    entry: {
      handler() {
        this.entryEditing = Object.assign({}, this.entry)
      },
      deep: true
    }
  },
  methods: {
    editEntry() {
      if (this.entryEditing.meal_type == null) {
        alert("Need Meal type")
        return
      }
      if (this.entryEditing.recipe == null && this.entryEditing.title === '') {
        alert("Need title or recipe")
        return
      }
      this.$bvModal.hide(`edit-modal`);
      this.$emit('save-entry', this.entryEditing)
    },
    deleteEntry() {
      this.$bvModal.hide(`edit-modal`);
      this.$emit('delete-entry', this.entryEditing)
    },
    selectMealType(event) {
      if (event.val != null) {
        this.entryEditing.meal_type = event.val;
      } else {
        this.entryEditing.meal_type = null;
      }
    },
    selectRecipe(event) {
      if (event.val != null) {
        this.entryEditing.recipe = event.val;
        this.entryEditing.title_placeholder = this.entryEditing.recipe.name
        this.entryEditing.servings = this.entryEditing.recipe.servings
      } else {
        this.entryEditing.recipe = null;
        this.entryEditing.title_placeholder = ""
        this.entryEditing.servings = 1
      }
    },
  }
}
</script>

<style scoped>

</style>