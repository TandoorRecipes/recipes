<template>
  <div id="shopping_line_item">
    <b-row align-h="start">
      <b-col cols="3" md="2" class="justify-content-start align-items-center d-flex d-md-none pr-0"
             v-if="settings.left_handed">
        <input type="checkbox" class="form-control form-control-sm checkbox-control-mobile" :checked="formatChecked"
               @change="updateChecked"
               :key="entries[0].id"/>
        <b-button size="sm" @click="showDetails = !showDetails" class="d-inline-block d-md-none p-0" variant="link">
          <div class="text-nowrap"><i class="fa fa-chevron-right rotate" :class="showDetails ? 'rotated' : ''"></i>
          </div>
        </b-button>
      </b-col>
      <b-col cols="1" class="align-items-center d-flex">
        <div class="dropdown b-dropdown position-static inline-block" data-html2canvas-ignore="true"
             @click.stop="$emit('open-context-menu', $event, entries)">
          <button
              aria-haspopup="true"
              aria-expanded="false"
              type="button"
              :class="settings.left_handed ? 'dropdown-spacing' : ''"
              class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret">
            <i class="fas fa-ellipsis-v fa-lg"></i>
          </button>
        </div>
      </b-col>
      <b-col cols="1" class="justify-content-center align-items-center d-none d-md-flex">
        <input type="checkbox" class="form-control form-control-sm checkbox-control" :checked="formatChecked"
               @change="updateChecked"
               :key="entries[0].id"/>
      </b-col>
      <b-col cols="8" md="9">
        <b-row class="d-flex h-100">
          <b-col cols="5" md="3" class="d-flex align-items-center" v-if="Object.entries(formatAmount).length == 1">
            <strong class="mr-1">{{ Object.entries(formatAmount)[0][1] }}</strong> {{
              Object.entries(formatAmount)[0][0]
            }}
          </b-col>
          <b-col cols="5" md="3" class="d-flex flex-column" v-if="Object.entries(formatAmount).length != 1">
            <div class="small" v-for="(x, i) in Object.entries(formatAmount)" :key="i">{{ x[1] }} &ensp;
              {{ x[0] }}
            </div>
          </b-col>

          <b-col cols="7" md="6" class="align-items-center d-flex pl-0 pr-0 pl-md-2 pr-md-2">
            {{ formatFood }}
          </b-col>
          <b-col cols="3" data-html2canvas-ignore="true"
                 class="align-items-center d-none d-md-flex justify-content-end">
            <b-button size="sm" @click="showDetails = !showDetails" class="p-0 mr-0 mr-md-2 p-md-2 text-decoration-none"
                      variant="link">
              <div class="text-nowrap"><i class="fa fa-chevron-right rotate"
                                          :class="showDetails ? 'rotated' : ''"></i> <span
                  class="d-none d-md-inline-block">{{ $t('Details') }}</span>
              </div>
            </b-button>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="3" md="2" class="justify-content-start align-items-center d-flex d-md-none"
             v-if="!settings.left_handed">
        <b-button size="sm" @click="showDetails = !showDetails" class="d-inline-block d-md-none p-0" variant="link">
          <div class="text-nowrap"><i class="fa fa-chevron-right rotate" :class="showDetails ? 'rotated' : ''"></i>
          </div>
        </b-button>
        <input type="checkbox" class="form-control form-control-sm checkbox-control-mobile" :checked="formatChecked"
               @change="updateChecked"
               :key="entries[0].id"/>
      </b-col>
    </b-row>
    <b-row align-h="center" class="d-none d-md-flex">
      <b-col cols="12">
        <div class="small text-muted text-truncate">{{ formatHint }}</div>
      </b-col>
    </b-row>
    <!-- detail rows -->
    <div class="card no-body mb-1 pt-2 align-content-center shadow-sm" v-if="showDetails">
      <div v-for="(e, x) in entries" :key="e.id">
        <b-row class="small justify-content-around">
          <b-col cols="auto" md="4" class="overflow-hidden text-nowrap">
            <button
                aria-haspopup="true"
                aria-expanded="false"
                type="button"
                class="btn btn-link btn-sm m-0 p-0 pl-2"
                style="text-overflow: ellipsis"
                @click.stop="openRecipeCard($event, e)"
                @mouseover="openRecipeCard($event, e)">
              {{ formatOneRecipe(e) }}
            </button>
          </b-col>
          <b-col cols="auto" md="4" class="text-muted">{{ formatOneMealPlan(e) }}</b-col>
          <b-col cols="auto" md="4" class="text-muted text-right overflow-hidden text-nowrap pr-4">
            {{ formatOneCreatedBy(e) }}
            <div v-if="formatOneCompletedAt(e)">{{ formatOneCompletedAt(e) }}</div>
          </b-col>
        </b-row>
        <b-row align-h="start">
          <b-col cols="3" md="2" class="justify-content-start align-items-center d-flex d-md-none pr-0"
                 v-if="settings.left_handed">
            <input type="checkbox" class="form-control form-control-sm checkbox-control-mobile"
                   :checked="formatChecked"
                   @change="updateChecked"
                   :key="entries[0].id"/>
          </b-col>
          <b-col cols="1" class="align-items-center d-flex">
            <div class="dropdown b-dropdown position-static inline-block" data-html2canvas-ignore="true"
                 @click.stop="$emit('open-context-menu', $event, e)">
              <button
                  aria-haspopup="true"
                  aria-expanded="false"
                  type="button"
                  :class="settings.left_handed ? 'dropdown-spacing' : ''"
                  class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret">
                <i class="fas fa-ellipsis-v fa-lg"></i>
              </button>
            </div>
          </b-col>
          <b-col cols="1" class="justify-content-center align-items-center d-none d-md-flex">
            <input type="checkbox" class="form-control form-control-sm checkbox-control" :checked="formatChecked"
                   @change="updateChecked"
                   :key="entries[0].id"/>
          </b-col>
          <b-col cols="8" md="9">
            <b-row class="d-flex align-items-center h-100">
              <b-col cols="5" md="3" class="d-flex align-items-center">
                <strong class="mr-1">{{ formatOneAmount(e) }}</strong> {{ formatOneUnit(e) }}
              </b-col>
              <b-col cols="7" md="6" class="align-items-center d-flex pl-0 pr-0 pl-md-2 pr-md-2">
                {{ formatOneFood(e) }}
              </b-col>
              <b-col cols="12" class="d-flex d-md-none">
                <div class="small text-muted text-truncate" v-for="(n, i) in formatOneNote(e)" :key="i">{{ n }}</div>
              </b-col>
            </b-row>
          </b-col>
          <b-col cols="3" md="2" class="justify-content-start align-items-center d-flex d-md-none"
                 v-if="!settings.left_handed">
            <input type="checkbox" class="form-control form-control-sm checkbox-control-mobile"
                   :checked="formatChecked"
                   @change="updateChecked"
                   :key="entries[0].id"/>
          </b-col>
        </b-row>
        <hr class="w-75" v-if="x !== entries.length -1"/>
        <div class="pb-4" v-if="x === entries.length -1"></div>
      </div>
    </div>
    <hr class="m-1" v-if="!showDetails"/>
    <ContextMenu ref="recipe_card" triggers="click, hover" :title="$t('Filters')" style="max-width: 300">
      <template #menu="{ contextData }" v-if="recipe">
        <ContextMenuItem>
          <RecipeCard :recipe="contextData" :detail="false"></RecipeCard>
        </ContextMenuItem>
        <ContextMenuItem @click="$refs.menu.close()">
          <b-form-group label-cols="9" content-cols="3" class="text-nowrap m-0 mr-2">
            <template #label>
              <a class="dropdown-item p-2" href="#"><i class="fas fa-pizza-slice"></i> {{ $t("Servings") }}</a>
            </template>
            <div @click.prevent.stop>
              <b-form-input class="mt-2" min="0" type="number" v-model="servings"></b-form-input>
            </div>
          </b-form-group>
        </ContextMenuItem>
      </template>
    </ContextMenu>
  </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import ContextMenu from "@/components/ContextMenu/ContextMenu"
import ContextMenuItem from "@/components/ContextMenu/ContextMenuItem"
import {ApiMixin} from "@/utils/utils"
import RecipeCard from "./RecipeCard.vue"

Vue.use(BootstrapVue)

export default {
  // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available
  // or i'm capturing it incorrectly
  name: "ShoppingLineItem",
  mixins: [ApiMixin],
  components: {RecipeCard, ContextMenu, ContextMenuItem},
  props: {
    entries: {
      type: Array,
    },
    settings: Object,
    groupby: {type: String},
  },
  data() {
    return {
      showDetails: false,
      recipe: undefined,
      servings: 1,
    }
  },
  computed: {
    formatAmount: function () {
      let amount = {}
      this.entries.forEach((entry) => {
        let unit = entry?.unit?.name ?? "----"
        if (entry.amount) {
          if (amount[unit]) {
            amount[unit] += entry.amount
          } else {
            amount[unit] = entry.amount
          }
        }
      })
      for (const [k, v] of Object.entries(amount)) {
        amount[k] = Math.round(v * 100 + Number.EPSILON) / 100 // javascript hack to force rounding at 2 places
      }
      return amount
    },
    formatCategory: function () {
      return this.formatOneCategory(this.entries[0]) || this.$t("Undefined")
    },
    formatChecked: function () {
      return this.entries.map((x) => x.checked).every((x) => x === true)
    },
    formatHint: function () {
      if (this.groupby == "recipe") {
        return this.formatCategory
      } else {
        return this.formatRecipe
      }
    },
    formatFood: function () {
      return this.formatOneFood(this.entries[0])
    },
    formatUnit: function () {
      return this.formatOneUnit(this.entries[0])
    },
    formatRecipe: function () {
      if (this.entries?.length == 1) {
        return this.formatOneMealPlan(this.entries[0]) || ""
      } else {
        let mealplan_name = this.entries.filter((x) => x?.recipe_mealplan?.name)
        // return [this.formatOneMealPlan(mealplan_name?.[0]), this.$t("CountMore", { count: this.entries?.length - 1 })].join("  ")

        return mealplan_name
            .map((x) => {
              return this.formatOneMealPlan(x)
            })
            .join(" - ")
      }
    },
    formatNotes: function () {
      if (this.entries?.length == 1) {
        return this.formatOneNote(this.entries[0]) || ""
      }
      return ""
    },
  },
  watch: {},
  mounted() {
    this.servings = this.entries?.[0]?.recipe_mealplan?.servings ?? 0
  },
  methods: {
    // this.genericAPI inherited from ApiMixin

    formatDate: function (datetime) {
      if (!datetime) {
        return
      }
      return Intl.DateTimeFormat(window.navigator.language, {
        dateStyle: "short",
        timeStyle: "short"
      }).format(Date.parse(datetime))
    },
    formatOneAmount: function (item) {
      return item?.amount ?? 1
    },
    formatOneUnit: function (item) {
      return item?.unit?.name ?? ""
    },
    formatOneCategory: function (item) {
      return item?.food?.supermarket_category?.name
    },
    formatOneCompletedAt: function (item) {
      if (!item.completed_at) {
        return false
      }
      return [this.$t("Completed"), "@", this.formatDate(item.completed_at)].join(" ")
    },
    formatOneFood: function (item) {
      return item.food.name
    },
    formatOneDelayUntil: function (item) {
      if (!item.delay_until || (item.delay_until && item.checked)) {
        return false
      }
      return [this.$t("DelayUntil"), "-", this.formatDate(item.delay_until)].join(" ")
    },
    formatOneMealPlan: function (item) {
      return item?.recipe_mealplan?.name ?? ""
    },
    formatOneRecipe: function (item) {
      return item?.recipe_mealplan?.recipe_name ?? ""
    },
    formatOneNote: function (item) {
      if (!item) {
        item = this.entries[0]
      }
      return [item?.recipe_mealplan?.mealplan_note, item?.ingredient_note].filter(String)
    },
    formatOneCreatedBy: function (item) {
      return [this.$t("Added_by"), item?.created_by.username, "@", this.formatDate(item.created_at)].join(" ")
    },
    openRecipeCard: function (e, item) {
      this.genericAPI(this.Models.RECIPE, this.Actions.FETCH, {id: item.recipe_mealplan.recipe}).then((result) => {
        let recipe = result.data
        recipe.steps = undefined
        this.recipe = true
        this.$refs.recipe_card.open(e, recipe)
      })
    },
    updateChecked: function (e, item) {
      let update = undefined
      if (!item) {
        update = {entries: this.entries.map((x) => x.id), checked: !this.formatChecked}
      } else {
        update = {entries: [item], checked: !item.checked}
      }
      this.$emit("update-checkbox", update)
    },
  },
}
</script>

<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->

<style>
/* table           { border-collapse:collapse } /* Ensure no space between cells   */
/* tr.strikeout td { position:relative        } /* Setup a new coordinate system   */
/* tr.strikeout td:before {                     /* Create a new element that       */
/*   content: " ";                              /* …has no text content            */
/*   position: absolute;                        /* …is absolutely positioned       */
/*   left: 0; top: 50%; width: 100%;            /* …with the top across the middle */
/*   border-bottom: 1px solid #000;             /* …and with a border on the top   */
/* }   */
.checkbox-control {
  font-size: 0.6rem
}

.checkbox-control-mobile {
  font-size: 1rem
}

.rotate {
  -moz-transition: all 0.25s linear;
  -webkit-transition: all 0.25s linear;
  transition: all 0.25s linear;
}

.rotated {
  -moz-transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}

.unit-badge-lg {
  font-size: 1rem !important;
  font-weight: 500 !important;
}

@media (max-width: 768px) {
  .dropdown-spacing {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
