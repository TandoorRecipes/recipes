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
                            @move-left="moveLeft(value)" @move-right="moveRight(value)"/>
          </template>

          <template #header="{ headerProps }">
            <calendar-view-header
                :header-props="headerProps"
                @input="setShowDate"/>
          </template>
        </calendar-view>
      </div>
    </div>
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
import {StandardToasts} from "../../utils/utils";

Vue.prototype.moment = moment
Vue.use(BootstrapVue)

export default {
  name: "MealPlanView",
  components: {
    MealPlanCard,
    RecipeCard,
    CalendarView,
    CalendarViewHeader
  },
  mixins: [CalendarMathMixin],
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
      }
    }
  },
  computed: {
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
    setShowDate(d) {
      this.showDate = d;
    },
    createEntryRange(data) {
      console.log(data)
    },
    createEntryClick(data) {

      console.log(data)
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
    moveLeft(data) {
      this.plan_entries.forEach((entry) => {
        if (entry.id === data.id) {
          entry.date = moment(entry.date).subtract(1, 'd')
          this.saveEntry(entry)
        }
      })
    },
    moveRight(data) {
      this.plan_entries.forEach((entry) => {
        if (entry.id === data.id) {
          entry.date = moment(entry.date).add(1, 'd')
          this.saveEntry(entry)
        }
      })
    },
    entryClick(data) {
      console.log(data)
      let entry = this.findEntry(data.id)
      this.recipe_viewed = entry.recipe
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
</style>