<template>
  <div>
    <div class="row">
      <div class="col-md-2 calender-options">
        <b-form>
          <b-form-group id="UomInput"
                        :label="$t('Period')"
                        :description="$t('PeriodToShow')"
                        label-for="UomInput">
            <b-form-select
                id="UomInput"
                v-model="settings.displayPeriodUom"
                :options="options.displayPeriodUom"
            ></b-form-select>
          </b-form-group>
          <b-form-group id="PeriodInput"
                        :label="$t('PeriodCount')"
                        :description="$t('ShowHowManyPeriods')"
                        label-for="PeriodInput">
            <b-form-select
                id="PeriodInput"
                v-model="settings.displayPeriodCount"
                :options="options.displayPeriodCount"
            ></b-form-select>
          </b-form-group>
          <b-form-group id="DaysInput"
                        :label="$t('StartingDay')"
                        :description="$t('StartingDay')"
                        label-for="DaysInput">
            <b-form-select
                id="DaysInput"
                v-model="settings.startingDayOfWeek"
                :options="dayNames"
            ></b-form-select>
          </b-form-group>
        </b-form>
        <recipe-card :recipe="recipe_viewed" v-if="false"></recipe-card>
      </div>
      <div class="col-md-10 calender-parent">
        <calendar-view
            :show-date="showDate" :enable-date-selection="true" class="theme-default"
            @date-selection-finish="createEntryRange" :items="plan_items"
            :display-period-uom="settings.displayPeriodUom"
            :period-changed-callback="refreshData" :enable-drag-drop="true" :item-content-height="item_height"
            @click-item="entryClick" @click-date="createEntryClick" @drop-on-date="moveEntry"
            :display-period-count="settings.displayPeriodCount"
            :starting-day-of-week="settings.startingDayOfWeek"
            :display-week-numbers="settings.displayWeekNumbers">
          <template #item="{ value, weekStartDate, top }">
            <meal-plan-card :value="value" :week-start-date="weekStartDate" :top="top" :detailed="detailed_items"
                            :item_height="item_height"
                            @move-left="moveEntryLeft(value)" @move-right="moveEntryRight(value)"
                            @delete="deleteEntry(value)"/>
          </template>

          <template #header="{ headerProps }">
            <calendar-view-header
                :header-props="headerProps"
                @input="setShowDate"/>
          </template>
        </calendar-view>
      </div>
    </div>
    <meal-plan-edit-modal :entry="entryEditing" :entryEditing_initial="entryEditing_initial"
                          :edit_modal_show="edit_modal_show" @save-entry="editEntry"></meal-plan-edit-modal>
  </div>
</template>

<script>

import "vue-simple-calendar/static/css/default.css"
import {CalendarView, CalendarViewHeader, CalendarMathMixin} from "vue-simple-calendar/src/components/bundle";
import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import {ApiApiFactory} from "../../utils/openapi/api";
import RecipeCard from "../../components/RecipeCard";
import MealPlanCard from "../../components/MealPlanCard";
import moment from 'moment'
import {ApiMixin, StandardToasts} from "../../utils/utils";
import MealPlanEditModal from "../../components/MealPlanEditModal";

Vue.prototype.moment = moment
Vue.use(BootstrapVue)

export default {
  name: "MealPlanView",
  components: {
    MealPlanEditModal,
    MealPlanCard,
    RecipeCard,
    CalendarView,
    CalendarViewHeader
  },
  mixins: [CalendarMathMixin, ApiMixin],
  data: function () {
    return {
      showDate: new Date(),
      plan_entries: [],
      recipe_viewed: {},
      settings: {
        displayPeriodUom: 'week',
        displayPeriodCount: 2,
        startingDayOfWeek: 1,
        displayWeekNumbers: true
      },
      meal_types: [],
      options: {
        displayPeriodUom: [{text: this.$t('Week'), value: 'week'}, {
          text: this.$t('Month'),
          value: 'month'
        }, {text: this.$t('Year'), value: 'year'}],
        displayPeriodCount: [1, 2, 3],
        entryEditing: {
          date: null,
          id: -1,
          meal_type: null,
          meal_type_name: null,
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
      edit_modal_show: false
    }
  },
  computed: {
    modal_title: function () {
      if (this.entryEditing_initial.length === 0) {
        return this.$t('CreateMealPlanEntry')
      } else {
        return this.$t('EditMealPlanEntry')
      }
    },
    entryEditing_initial: function () {
      if (this.entryEditing.recipe != null) {
        return [this.entryEditing.recipe]
      } else {
        return []
      }
    },
    plan_items: function () {
      let items = []
      this.plan_entries.forEach((entry) => {
        items.push(this.buildItem(entry))
      })
      return items
    },
    detailed_items: function () {
      return this.settings.displayPeriodUom === 'week';
    },
    dayNames: function () {
      let options = []
      this.getFormattedWeekdayNames(this.userLocale, "long", 0).forEach((day, index) => {
        options.push({text: day, value: index})
      })
      return options
    },
    userLocale: function () {
      return this.getDefaultBrowserLocale
    },
    item_height: function () {
      if (this.settings.displayPeriodUom === 'week') {
        return "10rem"
      } else {
        return "1.6rem"
      }
    },
  },
  methods: {
    editEntry(edit_entry) {
      if (edit_entry.id !== -1) {
        this.plan_entries.forEach((entry, index) => {
          if (entry.id === edit_entry.id) {
            this.$set(this.plan_entries, index, edit_entry)
            this.saveEntry(this.plan_entries[index])
          }
        })
      } else {
        this.createEntry(edit_entry)
      }
    },
    setShowDate(d) {
      this.showDate = d;
    },
    createEntryRange(data) {
      console.log(data)
    },
    createEntryClick(data) {
      this.entryEditing = this.options.entryEditing
      this.entryEditing.date = moment(data).format('YYYY-MM-DD')
      this.$bvModal.show(`edit-modal`)
    },
    findEntry(id) {
      return this.plan_entries.filter(entry => {
        return entry.id === id
      })[0]
    },
    moveEntry(data, target_date) {
      this.plan_entries.forEach((entry) => {
        if (entry.id === data.id) {
          entry.date = target_date
          this.saveEntry(entry)
        }
      })
    },
    moveEntryLeft(data) {
      this.plan_entries.forEach((entry) => {
        if (entry.id === data.id) {
          entry.date = moment(entry.date).subtract(1, 'd')
          this.saveEntry(entry)
        }
      })
    },
    moveEntryRight(data) {
      this.plan_entries.forEach((entry) => {
        if (entry.id === data.id) {
          entry.date = moment(entry.date).add(1, 'd')
          this.saveEntry(entry)
        }
      })
    },
    deleteEntry(data) {
      this.plan_entries.forEach((entry, index, list) => {
        if (entry.id === data.id) {
          let apiClient = new ApiApiFactory()

          apiClient.destroyMealPlan(entry.id).then(e => {
            list.splice(index, 1)
          }).catch(error => {
            StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
          })
        }
      })
    },
    entryClick(data) {
      let entry = this.findEntry(data.id)
      this.$bvModal.show(`edit-modal`)
      this.entryEditing = entry
      this.entryEditing.date = moment(entry.date).format('YYYY-MM-DD')
      if (this.entryEditing.recipe != null) {
        this.entryEditing.title_placeholder = this.entryEditing.recipe.name
      }
    },
    refreshData() {
      let apiClient = new ApiApiFactory()

      apiClient.listMealPlans().then(result => {
        this.plan_entries = result.data
      })
      apiClient.listMealTypes().then(result => {
        this.meal_types = result.data
      })
    },
    saveEntry(entry) {
      entry.date = moment(entry.date).format("YYYY-MM-DD")

      let apiClient = new ApiApiFactory()

      apiClient.updateMealPlan(entry.id, entry).catch(error => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
      })
    },
    createEntry(entry) {
      entry.date = moment(entry.date).format("YYYY-MM-DD")

      let apiClient = new ApiApiFactory()

      apiClient.createMealPlan(entry).catch(error => {
        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
      }).then((entry_result) => {
        this.plan_entries.push(entry_result.data)
      })
    },
    buildItem(plan_entry) {
      return {
        id: plan_entry.id,
        startDate: plan_entry.date,
        endDate: plan_entry.date,
        entry: plan_entry
      }
    }
  }
}
</script>

<style>
.calender-parent {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: hidden;
  max-height: 80vh;
  min-height: 40rem;
}

.cv-item {
  white-space: inherit !important;
}

.isHovered {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.cv-day.draghover {
  box-shadow: inset 0 0 0.2em 0.2em grey !important;
}

.modal-backdrop {
  opacity: 0.5;
}
</style>