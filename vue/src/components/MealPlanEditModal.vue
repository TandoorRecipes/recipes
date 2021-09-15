<template>
  <b-modal id="edit-modal" size="lg" :title="modal_title" hide-footer aria-label="">
    <div class="row">
      <div class="col col-md-12">
        <div class="row">
          <div class="col-md-9">
            <b-input-group>

              <b-form-input id="TitleInput" v-model="entryEditing.title"
                            :placeholder="entryEditing.title_placeholder"></b-form-input>
              <b-input-group-append>
                <b-button variant="primary" @click="entryEditing.title = ''"><i class="fa fa-eraser"></i></b-button>
              </b-input-group-append>
            </b-input-group>
            <small tabindex="-1" class="form-text text-muted">{{ $t("Title") }}</small>
          </div>
          <div class="col-md-3">
            <input type="date" id="DateInput" class="form-control" v-model="entryEditing.date">
            <small tabindex="-1" class="form-text text-muted">{{ $t("Date") }}</small>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12 col-lg-6 col-xl-6">
            <b-form-group>
              <generic-multiselect
                  @change="selectRecipe"
                  :initial_selection="entryEditing_initial"
                  :label="'name'"
                  :model="Models.RECIPE"
                  style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                  v-bind:placeholder="$t('Recipe')" :limit="10"
                  :multiple="false"></generic-multiselect>
              <small tabindex="-1" class="form-text text-muted">{{ $t("Recipe") }}</small>
            </b-form-group>
            <b-input-group>
              <b-form-input id="ServingsInput" v-model="entryEditing.servings"
                            :placeholder="$t('Servings')"></b-form-input>
            </b-input-group>
            <small tabindex="-1" class="form-text text-muted">{{ $t("Servings") }}</small>
            <b-form-group
                label-for="NoteInput"
                :description="$t('Note')" class="mt-3">
              <textarea class="form-control" id="NoteInput" v-model="entryEditing.note"
                        :placeholder="$t('Note')"></textarea>
            </b-form-group>
            <b-form-group>
              <generic-multiselect required
                                   @change="selectMealType"
                                   :label="'name'"
                                   :model="Models.MEAL_TYPE"
                                   style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                   v-bind:placeholder="$t('MealType')" :limit="10"
                                   :multiple="false"></generic-multiselect>
              <small tabindex="-1" class="form-text text-muted">{{ $t("MealType") }}</small>
            </b-form-group>
          </div>
          <div class="col-lg-6 d-none d-lg-block d-xl-block">
            <recipe-card :recipe="entryEditing.recipe" v-if="entryEditing.recipe != null"></recipe-card>
          </div>
        </div>
        <b-button class="mt-2 mb-3 ml-md-2" variant="danger">{{ $t('Delete') }}
        </b-button>
        <b-button class="mt-2 mb-3 ml-2 float-right" variant="primary" @click="editEntry">{{ $t('Save') }}</b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import GenericMultiselect from "./GenericMultiselect";
import RecipeCard from "./RecipeCard";
import {ApiMixin} from "../utils/utils";

Vue.use(BootstrapVue)

export default {
  name: "MealPlanEditModal",
  props: {
    entry: Object,
    entryEditing_initial: Array,
    modal_title: String
  },
  mixins: [ApiMixin],
  components: {
    GenericMultiselect,
    RecipeCard
  },
  data() {
    return {
      entryEditing: {}
    }
  },
  watch: {
    entry: function () {
      this.entryEditing = Object.assign({}, this.entry)
    }
  },
  methods: {
    editEntry() {
      if(this.entryEditing.meal_type == null) {
        alert("Need Meal type")
        return
      }
      if(this.entryEditing.recipe == null && this.entryEditing.title === '') {
        alert("Need title or recipe")
        return
      }
      this.$bvModal.hide(`edit-modal`);
      this.$emit('save-entry', this.entryEditing)
    },
    selectMealType(event) {
      if (event.val != null) {
        this.entryEditing.meal_type = event.val.id;
        this.entryEditing.meal_type_name = event.val.id;
      } else {
        this.entryEditing.meal_type = null;
        this.entryEditing.meal_type_name = ""
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