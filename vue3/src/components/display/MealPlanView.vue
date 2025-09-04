<template>
    <v-row class="h-100">
        <v-col class="pb-0">
            <v-card class="h-100" :loading="useMealPlanStore().loading">
                <!-- TODO add hint about CTRL key while drag/drop -->
                <!-- TODO multi selection? date range selection ? -->
                <calendar-view
                    :show-date="calendarDate"
                    :items="planItems"
                    class="theme-default"
                    :item-content-height="calendarItemHeight"
                    :enable-drag-drop="true"
                    @dropOnDate="dropCalendarItemOnDate"
                    :display-period-uom="useUserPreferenceStore().deviceSettings.mealplan_displayPeriod"
                    :display-period-count="useUserPreferenceStore().deviceSettings.mealplan_displayPeriodCount"
                    :starting-day-of-week="useUserPreferenceStore().deviceSettings.mealplan_startingDayOfWeek"
                    :display-week-numbers="useUserPreferenceStore().deviceSettings.mealplan_displayWeekNumbers"
                    :current-period-label="$t('Today')"
                    @click-date="(date : Date, calendarItems: [], windowEvent: any) => { newPlanDialogDefaultItem.fromDate = date; newPlanDialogDefaultItem.toDate = date; newPlanDialog = true }">
                    <template #header="{ headerProps }">
                        <calendar-view-header :header-props="headerProps" @input="(d:Date) => calendarDate = d"></calendar-view-header>
                    </template>
                    <template #item="{ value, weekStartDate, top }">
                        <meal-plan-calendar-item
                            :item-height="calendarItemHeight"
                            :value="value"
                            :item-top="top"
                            @onDragStart="currentlyDraggedMealplan = value"
                            @delete="(arg: MealPlan) => {useMealPlanStore().plans.delete(arg.id)}"
                            :detailed-items="lgAndUp"
                        ></meal-plan-calendar-item>
                    </template>
                </calendar-view>
            </v-card>


            <model-edit-dialog model="MealPlan" v-model="newPlanDialog" :itemDefaults="newPlanDialogDefaultItem" :close-after-create="false"
                               @create="(arg: any) => useMealPlanStore().plans.set(arg.id, arg)"></model-edit-dialog>
        </v-col>
    </v-row>
</template>


<script setup lang="ts">
import {CalendarView, CalendarViewHeader} from "vue-simple-calendar"
import "vue-simple-calendar/dist/style.css"
import "vue-simple-calendar/dist/css/default.css"

import MealPlanCalendarItem from "@/components/display/MealPlanCalendarItem.vue";
import {IMealPlanCalendarItem, IMealPlanNormalizedCalendarItem} from "@/types/MealPlan";
import {computed, onMounted, ref, watch} from "vue";
import {DateTime, Duration} from "luxon";
import {useDisplay} from "vuetify";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {MealPlan} from "@/openapi";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const {lgAndUp} = useDisplay()

const calendarDate = ref(new Date())

const currentlyDraggedMealplan = ref({} as IMealPlanNormalizedCalendarItem)

const newPlanDialog = ref(false)
const newPlanDialogDefaultItem = ref({} as MealPlan)

/**
 * computed property that converts array of MealPlan object to
 * array of CalendarItems (format required/extended from vue-simple-calendar)
 */
const planItems = computed(() => {
    let items = [] as IMealPlanCalendarItem[]
    useMealPlanStore().planList.forEach(mp => {
        let startDate = mp.fromDate
        let endDate = mp.toDate ? mp.toDate : mp.fromDate

        if (mp.mealType.time) {
            let hour = parseInt(mp.mealType.time.split(':')[0])
            let minutes = parseInt(mp.mealType.time.split(':')[1])
            let seconds = parseInt(mp.mealType.time.split(':')[2])
            startDate.setHours(hour, minutes, seconds)
            endDate.setHours(hour, minutes, seconds)
        }

        items.push({
            startDate: startDate,
            endDate: endDate,
            id: mp.id,
            mealPlan: mp,
        } as IMealPlanCalendarItem)
    })
    return items
})

/**
 * determine item height (one or two rows) based on how much space is available and how many days are shown
 */
const calendarItemHeight = computed(() => {
    if (lgAndUp.value && useUserPreferenceStore().deviceSettings.mealplan_displayPeriod == 'week') {
        return '2.6rem'
    } else {
        return '1.3rem'
    }
})

/**
 * watch calendar date and load entries accordingly
 */
watch(calendarDate, () => {
    refreshVisiblePeriod(false)
})

onMounted(() => {
    refreshVisiblePeriod(true)
})

/**
 * refresh data for the currently visible period
 * @param startDateUnknown when the calendar initially loads the date is set to today but the visible period might be larger. If set loads the period day count for the past as well
 */
function refreshVisiblePeriod(startDateUnknown: boolean) {
    let daysInPeriod = 7
    if (useUserPreferenceStore().deviceSettings.mealplan_displayPeriod == 'month') {
        daysInPeriod = 31
    } else if (useUserPreferenceStore().deviceSettings.mealplan_displayPeriod == 'year') {
        daysInPeriod = 365
    }

    let days = useUserPreferenceStore().deviceSettings.mealplan_displayPeriodCount * daysInPeriod

    // load backwards to as on initial
    if (startDateUnknown) {
        useMealPlanStore().refreshFromAPI(DateTime.fromJSDate(calendarDate.value).minus({days: days}).toJSDate(), DateTime.fromJSDate(calendarDate.value).plus({days: days}).toJSDate())
    } else {
        useMealPlanStore().refreshFromAPI(calendarDate.value, DateTime.fromJSDate(calendarDate.value).plus({days: days}).toJSDate())
    }
}

/**
 * handle drop event for calendar items on fields
 * @param undefinedItem
 * @param targetDate
 * @param event
 */
function dropCalendarItemOnDate(undefinedItem: IMealPlanNormalizedCalendarItem, targetDate: Date, event: DragEvent) {
    //The item argument (first) is undefined because our custom calendar item cannot manipulate the calendar state so the item is unknown to the calendar (probably fixable by somehow binding state to the item)
    if (currentlyDraggedMealplan.value.originalItem.mealPlan.id != undefined) {
        let mealPlan = useMealPlanStore().plans.get(currentlyDraggedMealplan.value.originalItem.mealPlan.id)
        if (mealPlan != undefined) {
            let fromToDiff = {days: 0}
            if (mealPlan.toDate && mealPlan.toDate > mealPlan.fromDate) {
                fromToDiff = DateTime.fromJSDate(mealPlan.toDate).diff(DateTime.fromJSDate(mealPlan.fromDate), 'days')
            }
            // create copy of item if control is pressed
            if (event.ctrlKey) {
                let new_entry = Object.assign({}, mealPlan)
                new_entry.fromDate = targetDate
                new_entry.toDate = DateTime.fromJSDate(targetDate).plus(fromToDiff).toJSDate()
                useMealPlanStore().createObject(new_entry)
            } else {
                mealPlan.fromDate = targetDate
                mealPlan.toDate = DateTime.fromJSDate(targetDate).plus(fromToDiff).toJSDate()
                useMealPlanStore().updateObject(mealPlan)
            }
        }
    }
}

</script>


<style scoped>
/* TODO remove unused styles */

.slide-fade-enter-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-active {
    transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

.calender-row {
    height: calc(100vh - 140px);
}

.calender-parent {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: hidden;
    height: 100%
}

.cv-item {
    white-space: inherit !important;
    padding: 0;
    border-radius: 3px !important;
}


.isHovered {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.cv-day.draghover {
    box-shadow: inset 0 0 0.2em 0.2em rgb(221, 191, 134) !important;
}

.modal-backdrop {
    opacity: 0.5;
}

/*
**************************************************************
This theme is the default shipping theme, it includes some
decent defaults, but is separate from the calendar component
to make it easier for users to implement their own themes w/o
having to override as much.
**************************************************************
*/

/* Header */

.theme-default .cv-header,
.theme-default .cv-header-day {
    background-color: #f0f0f0;
}

.theme-default .cv-header .periodLabel {
    font-size: 1.5em;
}

/* Grid */

.theme-default .cv-weeknumber {
    background-color: #e0e0e0;
    border-color: #ccc;
    color: #808080;
}

.theme-default .cv-weeknumber span {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.theme-default .cv-day.past {
    background-color: #fafafa;
}

.theme-default .cv-day.outsideOfMonth {
    background-color: #f7f7f7;
}

.theme-default .cv-day.today {
    background-color: #ffe;
}

.theme-default .cv-day[aria-selected] {
    background-color: #ffc;
}

/* Events */

.theme-default .cv-item {
    border-color: #e0e0f0;
    border-radius: 0.5em;
    background-color: #fff;
    text-overflow: ellipsis;
}

.theme-default .cv-item.purple {
    background-color: #f0e0ff;
    border-color: #e7d7f7;
}

.theme-default .cv-item.orange {
    background-color: #ffe7d0;
    border-color: #f7e0c7;
}

.theme-default .cv-item.continued::before,
.theme-default .cv-item.toBeContinued::after {
    /*
    removed because it breaks a line and would increase item size https://github.com/TandoorRecipes/recipes/issues/2678
    content: " \21e2 ";
    color: #999;
     */
    content: "";
}

.theme-default .cv-item.toBeContinued {
    border-right-style: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.theme-default .cv-item.isHovered.hasUrl {
    text-decoration: underline;
}

.theme-default .cv-item.continued {
    border-left-style: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.cv-item.span3,
.cv-item.span4,
.cv-item.span5,
.cv-item.span6,
.cv-item.span7 {
    text-align: center;
}

/* Event Times */

.theme-default .cv-item .startTime,
.theme-default .cv-item .endTime {
    font-weight: bold;
    color: #666;
}

/* Drag and drop */

.theme-default .cv-day.draghover {
    box-shadow: inset 0 0 0.2em 0.2em yellow;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

@media (max-width: 767.9px) {
    .periodLabel {
        font-size: 18px !important;
    }
}

.b-calendar-grid-help {
    padding: 0.25rem;
}
</style>