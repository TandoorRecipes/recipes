<template>
  <div class="cv-header">
    <div class="cv-header-nav">
      <button
          :disabled="!headerProps.previousPeriod"
          class="previousPeriod"
          aria-label="Previous Period"
          @click.prevent="onInput(headerProps.previousPeriod)"
          v-b-tooltip.hover.top
          :title="$t('Previous_Period')"
          v-html="previousYearLabel"/>
      <button
          class="previousDay"
          aria-label="Previous Day"
          @click.prevent="onDayBack"
          v-b-tooltip.hover.top
          :title="$t('Previous_Day')"
          v-html="previousPeriodLabel"/>
      <button
          class="currentPeriod"
          aria-label="Current Period"
          @click.prevent="onInput(headerProps.currentPeriod)">
        {{ headerProps.currentPeriodLabel }}
      </button>
      <button
          class="nextDay"
          aria-label="Next Day"
          @click.prevent="onDayForward"
          v-b-tooltip.hover.top
          :title="$t('Next_Day')"
          v-html="nextPeriodLabel"/>
      <button
          :disabled="!headerProps.nextPeriod"
          class="nextPeriod"
          aria-label="Next Period"
          v-b-tooltip.hover.top
          :title="$t('Next_Period')"
          @click.prevent="onInput(headerProps.nextPeriod)"
          v-html="nextYearLabel"/>
    </div>
    <div class="periodLabel">
      <slot name="label">{{ headerProps.periodLabel }}</slot>
    </div>
    <div class="actionArea">
      <button class="btn btn-secondary ical-button pt-1 pb-1 pl-3 pr-3 text-body" @click="exportiCal" v-b-tooltip.hover :title="$t('Export_As_ICal')"><i class="fas fa-calendar"></i></button>
      <button class="btn btn-success plus-button pt-1 pb-1 pl-3 pr-3 mr-1 ml-1 text-body" @click="$emit('create-new')" v-b-tooltip.hover :title="$t('Create_Meal_Plan_Entry')"><i class="fas fa-plus"></i></button>
      <span class="delete-area text-danger p-1 mr-2 ml-1 d-none d-sm-flex" @drop.prevent="onDeleteDrop($event)"
            @dragenter.prevent="onDeleteDragEnter($event)" @dragleave.prevent="onDeleteDragLeave($event)" @dragover.prevent="onDeleteDragEnter"><i class="fas fa-trash"></i> {{ $t('Drag_Here_To_Delete') }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "MealPlanCalenderHeader",
  props: {
    headerProps: {
      type: Object,
      required: true,
    },
    previousYearLabel: {type: String, default: "<<"},
    previousPeriodLabel: {type: String, default: "<"},
    nextPeriodLabel: {type: String, default: ">"},
    nextYearLabel: {type: String, default: ">>"},
    iCalUrl: {type: String, default: ""},
  },
  methods: {
    onDayForward() {
      this.$emit("set-starting-day-forward")
    },
    onDayBack() {
      this.$emit("set-starting-day-back")
    },
    exportiCal() {
      window.open(this.iCalUrl)
    },
    onInput(d) {
      this.$emit("input", d)
    },
    onDeleteDragEnter(e) {
      e.currentTarget.classList.add("draghover")
    },
    onDeleteDragLeave(e) {
      e.currentTarget.classList.remove("draghover")
    },
    onDeleteDrop(e) {
      e.currentTarget.classList.remove("draghover")
      this.$emit("delete-dragged")
    },
  },
}
</script>
<style>
.cv-header {
  display: flex;
  flex: 0 1 auto;
  flex-flow: row nowrap;
  align-items: center;
  min-height: 2.5em;
  border-width: 1px 1px 0 1px;
}

.cv-header .periodLabel {
  display: flex;
  flex: 1 1 auto;
  flex-flow: row nowrap;
  min-height: 1.5em;
  line-height: 1;
  font-size: 1.5em;
}

.cv-header .actionArea {
  display: flex;
  flex: 1 1 auto;
  flex-flow: row nowrap;
  min-height: 1.5em;
  line-height: 1;
  font-size: 1.5em;
}

.ical-button {
  margin-left: auto;
  order: 1;
  user-select: none
}

.plus-button {
  order: 2;
  user-select: none
}

.delete-area {
  border-style: dotted;
  order: 3;
  user-select: none
}

.delete-area.draghover {
  box-shadow: inset 0 0 0.1em 0.1em #A7240E !important;
}

.cv-header,
.cv-header button {
  border-style: solid;
  border-color: #ddd;
}

.cv-header-nav,
.cv-header .periodLabel {
  margin: 0.1em 0.6em;
}

.cv-header-nav button,
.cv-header .periodLabel {
  padding: 0.4em 0.6em;
}

.cv-header button {
  box-sizing: border-box;
  line-height: 1em;
  font-size: 1em;
  border-width: 1px;
}
</style>
