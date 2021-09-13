<template>
  <div>
    <h3>{{ $t('Edit') }} {{ $t('Recipe') }}</h3>

    <loading-spinner :size="25" v-if="!recipe"></loading-spinner>

    <div v-if="recipe !== undefined">

      <div class="row">
        <div class="col-md-12">
          <label for="id_name"> {{ $t('Name') }}</label>
          <input class="form-control" id="id_name" v-model="recipe.name">
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <label for="id_description">
            {{ $t('Description') }}
          </label>
          <textarea id="id_description" class="form-control" v-model="recipe.description"
                    maxlength="512"></textarea>

        </div>
      </div>
      <br/>

      <div class="row">
        <div class="col-md-6">
          <img :src="recipe.image.url" id="id_image"
               class="img img-fluid img-responsive"
               style="max-height: 20vh" v-if="recipe.image.url">
          <input class="mt-2" type="file" @change="imageChanged">
        </div>
        <div class="col-md-6">
          <label for="id_name"> {{ $t('Preparation') }} {{ $t('Time') }}</label>
          <input class="form-control" id="id_prep_time" v-model="recipe.working_time">
          <br/>
          <label for="id_name"> {{ $t('Waiting') }} {{ $t('Time') }}</label>
          <input class="form-control" id="id_wait_time" v-model="recipe.waiting_time">
          <br/>
          <label for="id_name"> {{ $t('Servings') }}</label>
          <input class="form-control" id="id_servings" v-model="recipe.servings">
          <br/>
          <label for="id_name"> {{ $t('Servings') }} {{ $t('Text') }}</label>
          <input class="form-control" id="id_servings_text" v-model="recipe.servings_text" maxlength="32">
          <br/>
          <label for="id_name"> {{ $t('Keywords') }}</label>
          <multiselect
              v-model="recipe.keywords"
              :options="keywords"
              :close-on-select="false"
              :clear-on-select="true"
              :hide-selected="true"
              :preserve-search="true"
              placeholder="Select Keyword"
              tag-placeholder="Add Keyword"
              :taggable="true"
              @tag="addKeyword"
              label="label"
              track-by="id"
              id="id_keywords"
              :multiple="true"
              :loading="keywords_loading"
              @search-change="searchKeywords">
          </multiselect>
        </div>
      </div>

      <template v-if="recipe !== undefined">
        <div class="row" v-if="recipe.nutrition" style="margin-top: 1vh">
          <div class="col-md-12">
            <div class="card border-grey">
              <div class="card-body">
                <h4 class="card-title">{{ $t('Nutrition') }}</h4>
                <div class="dropdown-menu dropdown-menu-right"
                     aria-labelledby="dropdownMenuLink">
                  <button class="dropdown-item" @click="removeStep(step)"><i
                      class="fa fa-trash fa-fw"></i> {{ $t('Delete') }}
                  </button>

                </div>

                <label for="id_name"> {{ $t('Calories') }}</label>
                <input class="form-control" id="id_calories" v-model="recipe.nutrition.calories">

                <label for="id_name"> {{ $t('Carbohydrates') }}</label>
                <input class="form-control" id="id_carbohydrates" v-model="recipe.nutrition.carbohydrates">

                <label for="id_name"> {{ $t('Fats') }}</label>
                <input class="form-control" id="id_fats" v-model="recipe.nutrition.fats">
                <label for="id_name"> {{ $t('Proteins') }}</label>
                <input class="form-control" id="id_proteins" v-model="recipe.nutrition.proteins">
                <br/>
              </div>
            </div>
          </div>
        </div>
      </template>


      <draggable :list="recipe.steps" group="steps"
                 :empty-insert-threshold="10" handle=".handle" @sort="sortSteps()">

        <div v-for="[step, step_index] in recipe.steps" style="margin-top: 1vh" class="card" v-bind:key="step_index">

          <div class="card-body" :id="`id_card_step_${step_index}`">
            <div class="row">
              <div class="col-11">
                <h4 class="handle" :id="'id_step_' + step_index">
                  <i class="fas fa-paragraph" v-if="step.type == 'TEXT'"></i>
                  <i class="fas fa-clock" v-if="step.type == 'TIME'"></i>
                  <template v-if="step.name !== ''">{{ step.name }}</template>
                  <template v-else>{{ $t('Step') }} {{ step_index + 1 }}</template>

                </h4>
              </div>
              <div class="col-1" style="text-align: right">
                <a class="btn shadow-none btn-lg" href="#" role="button"
                   id="dropdownMenuLink"
                   data-toggle="dropdown" aria-haspopup="true"
                   aria-expanded="false">
                  <i class="fas fa-ellipsis-v text-muted"></i>
                </a>


                <div class="dropdown-menu dropdown-menu-right"
                     aria-labelledby="dropdownMenuLink">
                  <button class="dropdown-item" @click="removeStep(step)"><i
                      class="fa fa-trash fa-fw"></i> {{ $t('Delete') }}
                  </button>

                  <button type="button" class="dropdown-item"
                          v-if="!step.show_as_header"
                          @click="step.show_as_header = true"><i
                      class="fas fa-eye fa-fw"></i> {{ $t('Show_as_header') }}
                  </button>

                  <button type="button" class="dropdown-item"
                          v-if="step.show_as_header"
                          @click="step.show_as_header = false"><i
                      class="fas fa-eye-slash fa-fw"></i> {{ $t('Hide_as_header') }}
                  </button>

                  <button class="dropdown-item" @click="moveStep(step, (step_index - 1))"
                          v-if="step_index > 0">
                    <i class="fa fa-arrow-up fa-fw"></i> {{ $t('Move_Up') }}
                  </button>
                  <button class="dropdown-item"
                          @click="moveStep(step, (step_index + 1))"
                          v-if="step_index !== (recipe.steps.length - 1)">
                    <i class="fa fa-arrow-down fa-fw"></i> {{ $t('Move_Down') }}
                  </button>
                </div>

              </div>
            </div>

            <div class="row">
              <div class="col-md-8">
                <label :for="'id_step_' + step.id + 'name'">{{ $t('Step_Name') }}</label>
                <input class="form-control" v-model="step.name" :id="'id_step_' + step.id + 'name'">
              </div>
              <div class="col-md-4">
                <label for="id_type"> {{ $t('Step_Type') }}</label>
                <select class="form-control" id="id_type" v-model="step.type">
                  <option value="TEXT">{{ $t('Text') }}</option>
                  <option value="TIME">{{ $t('Time') }}</option>
                  <option value="FILE">{{ $t('File') }}</option>
                  <option value="RECIPE">{{ $t('Recipe') }}</option>
                </select>
              </div>
            </div>


            <div class="row" style="margin-top: 12px">
              <div class="col-md-3">
                <label :for="'id_step_' + step.id + '_time'">{{ $t('step_time_minutes') }}</label>
                <input class="form-control" v-model="step.time"
                       :id="'id_step_' + step.id + '_time'">
              </div>

              <div class="col-md-9" v-if="step.type === 'FILE'">
                <label :for="'id_step_' + step.id + '_file'">{{ $t('File') }}</label>
                <multiselect
                    v-tabindex
                    ref="file"
                    v-model="step.file"
                    :options="files"
                    :close-on-select="true"
                    :clear-on-select="true"
                    :allow-empty="true"
                    :preserve-search="true"
                    placeholder="Select File"
                    select-label="Select"
                    :id="'id_step_' + step.id + '_file'"
                    label="name"
                    track-by="name"
                    :multiple="false"
                    :loading="files_loading"
                    @search-change="searchFiles">
                </multiselect>
              </div>

              <div class="col-md-9" v-if="step.type === 'RECIPE'">
                <label :for="'id_step_' + step.id + '_recipe'">{{ $t('Recipe') }}</label>
                <multiselect
                    v-tabindex
                    ref="step_recipe"
                    v-model="step.step_recipe"
                    :options="recipes.map(recipe => recipe.id)"
                    :close-on-select="true"
                    :clear-on-select="true"
                    :allow-empty="true"
                    :preserve-search="true"
                    placeholder="Select Recipe"
                    select-label="Select"
                    :id="'id_step_' + step.id + '_recipe'"
                    :custom-label="opt => recipes.find(x => x.id === opt).name"
                    :multiple="false"
                    :loading="recipes_loading"
                    @search-change="searchRecipes">
                </multiselect>
              </div>
            </div>

            <template v-if="step.type === 'TEXT'">
              <div class="row" style="margin-top: 12px">
                <div class="col-md-12">
                  <div class="jumbotron" style="padding: 16px">
                    <div class="row">
                      <div class="col-md-12">
                        <h4>{{ $t('Ingredients') }}</h4>
                      </div>

                    </div>
                    <div class="row">
                      <div class="col-md-12" style="margin-top: 8px">
                        <draggable :list="step.ingredients" group="ingredients"
                                   :empty-insert-threshold="10" handle=".handle"
                                   @sort="sortIngredients(step)">
                          <div v-for="[ingredient, index] in step.ingredients"
                               :key="ingredient.id">

                            <hr class="d-md-none"/>
                            <div class="d-flex">
                              <div class="flex-grow-0 handle align-self-start">
                                <button type="button" class="btn btn-lg shadow-none"><i
                                    class="fas fa-arrows-alt-v "></i></button>
                              </div>

                              <div class="flex-fill row"
                                   style="margin-left: 4px; margin-right: 4px">
                                <div class="col-lg-2 col-md-6 small-padding"
                                     v-if="!ingredient.is_header">
                                  <input class="form-control"
                                         v-model="ingredient.amount"
                                         type="number" step="any"
                                         v-if="!ingredient.no_amount"
                                         :id="`amount_${step_index}_${index}`">
                                </div>

                                <div class="col-lg-2 col-md-6 small-padding"
                                     v-if="!ingredient.is_header">
                                  <multiselect
                                      v-if="!ingredient.no_amount"
                                      v-tabindex
                                      ref="unit"
                                      v-model="ingredient.unit"
                                      :options="units"
                                      :close-on-select="true"
                                      :clear-on-select="true"
                                      :allow-empty="true"
                                      :preserve-search="true"
                                      placeholder="Select Unit"
                                      tag-placeholder="Create"
                                      select-label="Select"
                                      :taggable="true"
                                      @tag="addUnitType"
                                      :id="`unit_${step_index}_${index}`"
                                      label="name"
                                      track-by="name"
                                      :multiple="false"
                                      :loading="units_loading"
                                      @search-change="searchUnits">
                                  </multiselect>
                                </div>
                                <div class="col-lg-4 col-md-6 small-padding"
                                     v-if="!ingredient.is_header">
                                  <multiselect
                                      v-tabindex
                                      ref="food"
                                      v-model="ingredient.food"
                                      :options="foods"
                                      :close-on-select="true"
                                      :clear-on-select="true"
                                      :allow-empty="true"
                                      :preserve-search="true"
                                      placeholder="Select Food"
                                      tag-placeholder="Create"
                                      select-label="Select"
                                      :taggable="true"
                                      @tag="addFoodType"
                                      :id="`ingredient_${step_index}_${index}`"
                                      label="name"
                                      track-by="name"
                                      :multiple="false"
                                      :loading="foods_loading"
                                      @search-change="searchFoods">
                                  </multiselect>
                                </div>
                                <div class="small-padding"
                                     v-bind:class="{ 'col-lg-4 col-md-6': !ingredient.is_header, 'col-lg-12 col-md-12': ingredient.is_header }">
                                  <input class="form-control"
                                         v-model="ingredient.note"
                                         v-bind:placeholder="$t('Note')">
                                </div>
                              </div>

                              <div class="flex-grow-0 small-padding">
                                <a class="btn shadow-none btn-lg" href="#" role="button"
                                   id="dropdownMenuLink2"
                                   data-toggle="dropdown" aria-haspopup="true"
                                   aria-expanded="false">
                                  <i class="fas fa-ellipsis-v text-muted"></i>
                                </a>

                                <div class="dropdown-menu dropdown-menu-right"
                                     aria-labelledby="dropdownMenuLink2">
                                  <button type="button" class="dropdown-item"
                                          @click="removeIngredient(step, ingredient)">
                                    <i
                                        class="fa fa-trash fa-fw"></i> {{ $t('Delete') }}
                                  </button>

                                  <button type="button" class="dropdown-item"
                                          v-if="!ingredient.is_header "
                                          @click="ingredient.is_header = true"><i
                                      class="fas fa-heading fa-fw"></i> {{ $t('Make_header') }}
                                  </button>

                                  <button type="button" class="dropdown-item"
                                          v-if="ingredient.is_header "
                                          @click="ingredient.is_header = false"><i
                                      class="fas fa-leaf fa-fw"></i> {{ $t('Make_Ingredient') }}
                                  </button>

                                  <button type="button" class="dropdown-item"
                                          v-if="!ingredient.no_amount "
                                          @click="ingredient.no_amount = true"><i
                                      class="fas fa-balance-scale-right fa-fw"></i> {{ $t('Disable_Amount') }}
                                  </button>

                                  <button type="button" class="dropdown-item"
                                          v-if="ingredient.no_amount "
                                          @click="ingredient.no_amount = false"><i
                                      class="fas fa-balance-scale-right fa-fw"></i> {{ $t('Enable_Amount') }}
                                  </button>
                                  <button type="button" class="dropdown-item"
                                          @click="copyTemplateReference(index, ingredient)">
                                    <i class="fas fa-code"></i> {{ $t('Copy_template_reference') }}
                                  </button>
                                </div>

                              </div>
                            </div>
                          </div>

                        </draggable>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-2 offset-md-5"
                           style="text-align: center; margin-top: 8px;">
                        <button class="btn btn-success btn-block" @click="addIngredient(step)"><i
                            class="fa fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div class="row">
              <div class="col-md-12">
                <label :for="'id_instruction_' + step.id">{{ $t('Instructions') }}</label>
                <b-form-textarea class="form-control" rows="2" max-rows="20" v-model="step.instruction"
                                 :id="'id_instruction_' + step.id"></b-form-textarea>
                <!-- TODO markdown DOCS link and markdown editor -->
              </div>
            </div>
          </div>
        </div>
      </draggable>

      <div class="row" style="margin-top: 1vh; margin-bottom: 8vh" v-if="recipe !== undefined">
        <div class="col-12">
          <button type="button" @click="updateRecipe(true)"
                  class="btn btn-success shadow-none">{{ $t('Save_and_View') }}
          </button>
          <button type="button" @click="updateRecipe(false)"
                  class="btn btn-info shadow-none">{{ $t('Save') }}
          </button>
          <button type="button" @click="addStep()"
                  class="btn btn-primary shadow-none">{{ $t('Add_Step') }}
          </button>
          <button type="button" @click="addNutrition()"
                  class="btn btn-primary shadow-none"
                  v-if="recipe.nutrition === null">{{ $t('Nutrition') }}
          </button>
          <button type="button" @click="removeNutrition()" v-if="recipe.nutrition !== null"
                  class="btn btn-warning shadow-none">{{ $t('Nutrition') }}
          </button>
          <a :href="resolveDjangoUrl('view_recipe', recipe.id)" @click="addStep()"
             class="btn btn-secondary shadow-none">{{ $t('View') }}</a>
          <a :href="resolveDjangoUrl('delete_recipe', recipe.id)"
             class="btn btn-danger shadow-none">{{ $t('Delete') }}</a>
        </div>

      </div>

    </div>


  </div>
</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {resolveDjangoUrl, ResolveUrlMixin, StandardToasts} from "@/utils/utils";
import Multiselect from "vue-multiselect";
import {ApiApiFactory} from "@/utils/openapi/api";
import LoadingSpinner from "@/components/LoadingSpinner";

Vue.use(BootstrapVue)

export default {
  name: 'RecipeSearchView',
  mixins: [ResolveUrlMixin],
  components: {Multiselect, LoadingSpinner},
  data() {
    return {
      recipe_id: window.RECIPE_ID,
      recipe: undefined,
      recipe_changed: undefined,
      keywords: [],
      keywords_loading: false,
      foods: [],
      foods_loading: false,
      units: [],
      units_loading: false,
      files: [],
      files_loading: false,
      recipes: [],
      recipes_loading: false,
      message: '',
    }

  },
  computed: {},
  mounted() {

    this.loadRecipe()
    this.searchUnits('')
    this.searchFoods('')
    this.searchKeywords('')
    this.searchFiles('')
    this.searchRecipes('')


    //TODO find out what this did and fix it
    // this._keyListener = function (e) {
    //   if (e.code === "Space" && e.ctrlKey) {
    //     e.preventDefault(); // present "Save Page" from getting triggered.
    //
    //     for (el of e.path) {
    //       if (el.id !== undefined && el.id.includes('id_card_step_')) {
    //         let step = this.recipe.steps[el.id.replace('id_card_step_', '')]
    //         this.addIngredient(step)
    //       }
    //     }
    //   }
    // };
    // document.addEventListener('keydown', this._keyListener.bind(this));

    this.$i18n.locale = window.CUSTOM_LOCALE
  },
  created() {
    window.addEventListener('beforeunload', this.warnPageLeave)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._keyListener);
  },
  watch: {
    recipe: {
      deep: true,
      handler() {
        this.recipe_changed = this.recipe_changed !== undefined;
      }
    }
  },
  methods: {
    warnPageLeave: function (event) {
      if (this.recipe_changed) {
        event.returnValue = ''
        return ''
      }
    },
    loadRecipe: function () {
      let apiFactory = new ApiApiFactory()

      apiFactory.retrieveRecipe(this.recipe_id).then(response => {
        this.recipe = response.data;
        this.loading = false


        //TODO workaround function until view is properly refactored, loads name of selected sub recipe so the input can find its label
        this.recipe.steps.forEach(s => {
          if (s.step_recipe != null) {
            this.recipes.push(s.step_recipe_data)
          }
        })
        console.log('after step loop')
      }).catch((err) => {
        this.loading = false
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    updateRecipe: function (view_after) {
      let apiFactory = new ApiApiFactory()

      this.sortSteps()
      for (let s of this.recipe.steps) {
        this.sortIngredients(s)

      }
      apiFactory.updateRecipe(this.recipe_id, this.recipe,
          {}).then((response) => {
        console.log(response)
        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
        this.recipe_changed = false
        if (view_after) {
          location.href = resolveDjangoUrl('view_recipe', this.recipe_id)
        }
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
      })
    },
    imageChanged: function (event) {
      let apiFactory = new ApiApiFactory()

      if (event.target.files && event.target.files[0]) {
        let fd = new FormData()
        fd.append('image', event.target.files[0])
        apiFactory.imageRecipe("{% url 'api:recipe-detail' recipe.pk %}" + 'image/', fd, {headers: {'Content-Type': 'multipart/form-data'}}).then((response) => {

          console.log(response)
          StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
        }).catch((err) => {
          console.log(err)
          StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
        })

        let reader = new FileReader();
        reader.onload = function (e) {
          //TODO load new image to view
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    },
    addStep: function () { //TODO see if default can be generated from options request
      this.recipe.steps.push(
          {'instruction': '', ingredients: [], type: 'TEXT', show_as_header: true}
      )
    },
    sortSteps: function () {
      this.recipe.steps.forEach(function (element, index) {
        element.order = index
      });
    },
    sortIngredients: function (step) {
      step.ingredients.forEach(function (element, index) {
        element.order = index
      });
    },
    addIngredient: function (step) { //TODO see if default can be generated from options request
      step.ingredients.push({
        'food': null,
        'unit': {
          'name': '{{request.user.userpreference.default_unit}}'
        },
        'amount': 0,
        'note': '',
        'order': 0,
        'is_header': false,
        'no_amount': false
      })
      this.sortIngredients(step)
      this.$nextTick(() => document.getElementById(`amount_${this.recipe.steps.indexOf(step)}_${step.ingredients.length - 1}`).focus())

    },
    removeIngredient: function (step, ingredient) {
      if (confirm(this.$t('confirm_delete', {object: this.$t('Ingredient')}))) {
        step.ingredients = step.ingredients.filter(item => item !== ingredient)
      }
    },
    removeStep: function (step) {
      if (confirm(this.$t('confirm_delete', {object: this.$t('Step')}))) {
        this.recipe.steps = this.recipe.steps.filter(item => item !== step)
      }
    },
    moveStep: function (step, new_index) {
      this.recipe.steps.splice(this.recipe.steps.indexOf(step), 1);
      this.recipe.steps.splice((new_index < 0 ? 0 : new_index), 0, step);
      this.sortSteps()
    },
    addFoodType: function (tag, index) {
      let [tmp, step, id] = index.split('_')

      let new_food = this.recipe.steps[step].ingredients[id]
      new_food.food = {'name': tag}
      this.foods.push(new_food.food)
      this.recipe.steps[step].ingredients[id] = new_food
    },
    addUnitType: function (tag, index) {
      let [tmp, step, id] = index.split('_')

      let new_unit = this.recipe.steps[step].ingredients[id]
      new_unit.unit = {'name': tag}
      this.units.push(new_unit.unit)
      this.recipe.steps[step].ingredients[id] = new_unit
    },
    addKeyword: function (tag) {
      let new_keyword = {'label': tag, 'name': tag}
      this.recipe.keywords.push(new_keyword)
    },
    searchKeywords: function (query) {
      let apiFactory = new ApiApiFactory()

      this.keywords_loading = true
      apiFactory.listKeywords({query: {query: query}}).then((response) => {
        this.keywords = response.data.results;
        this.keywords_loading = false
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    searchFiles: function (query) {
      let apiFactory = new ApiApiFactory()

      this.files_loading = true
      apiFactory.listUserFiles({query: {query: query}}).then((response) => {
        this.files = response.data
        this.files_loading = false
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    searchRecipes: function (query) {
      let apiFactory = new ApiApiFactory()

      this.recipes_loading = true
      apiFactory.listRecipes({query: {query: query}}).then((response) => {
        this.recipes = response.data.results
        this.recipes_loading = false
      }).catch((err) => {
        console.log(err)
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    searchUnits: function (query) {
      let apiFactory = new ApiApiFactory()

      this.units_loading = true
      apiFactory.listUnits({query: {query: query}}).then((response) => {
        this.units = response.data.results;

        if (this.recipe !== undefined) {
          for (let s of this.recipe.steps) {
            for (let i of s.ingredients) {
              if (i.unit !== null && i.unit.id === undefined) {
                this.units.push(i.unit)
              }
            }
          }
        }
        this.units_loading = false
      }).catch((err) => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    searchFoods: function (query) {
      let apiFactory = new ApiApiFactory()

      this.foods_loading = true
      apiFactory.listFoods({query: {query: query}}).then((response) => {
        this.foods = response.data.results

        if (this.recipe !== undefined) {
          for (let s of this.recipe.steps) {
            for (let i of s.ingredients) {
              if (i.food !== null && i.food.id === undefined) {
                this.foods.push(i.food)
              }
            }
          }
        }

        this.foods_loading = false
      }).catch((err) => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
      })
    },
    scrollToStep: function (step_index) {
      document.getElementById('id_step_' + step_index).scrollIntoView({behavior: 'smooth'});
    },
    addNutrition: function () {
      this.recipe.nutrition = {}
    },
    removeNutrition: function () {
      this.recipe.nutrition = null
    },
    copyTemplateReference: function (index, ingredient) {
      const el = document.createElement('textarea');

      let tag = `\u007B\u007B ingredients[${index}] \u007D\u007D`;
      if (ingredient.food !== null) {
        tag += `\u007B# ${ingredient.food.name} #\u007D`
      }
      el.value = tag
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

  }
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

</style>
