<template>
    <v-row class="h-100">
        <v-col>
            <CalendarView
                :items="planItems"
                class="theme-default"
                :item-content-height="calendarItemHeight"
                :enable-drag-drop="true"
                @dropOnDate="dropCalendarItemOnDate">
                <template #header="{ headerProps }">
                    <CalendarViewHeader :header-props="headerProps" />
                </template>
                <template #item="{ value, weekStartDate, top }">
                    <meal-plan-calendar-item :item-height="calendarItemHeight" :value="value" :item-top="top" @onDragStart="currentlyDraggedMealplan = value" :detailed-items="lgAndUp"></meal-plan-calendar-item>
                </template>
            </CalendarView>
        </v-col>
    </v-row>
</template>


<script setup lang="ts">

import {CalendarView, CalendarViewHeader} from "vue-simple-calendar"
import "vue-simple-calendar/dist/style.css"
import "vue-simple-calendar/dist/css/default.css"

import MealPlanCalendarItem from "@/components/display/MealPlanCalendarItem.vue";
import {IMealPlanCalendarItem, IMealPlanNormalizedCalendarItem} from "@/types/MealPlan";
import {computed, onMounted, ref} from "vue";
import {ApiApi, MealPlan} from "@/openapi";
import {DateTime} from "luxon";
import {useDisplay} from "vuetify";

const {lgAndUp} = useDisplay()

const mealPlans = ref([] as MealPlan[])
const currentlyDraggedMealplan = ref({} as IMealPlanNormalizedCalendarItem)

const planItems = computed(() => {
    let items = [] as IMealPlanCalendarItem[]
    mealPlans.value.forEach(mp => {
        items.push({
            startDate: mp.fromDate,
            endDate: mp.toDate,
            id: mp.id,
            mealPlan: mp,
        } as IMealPlanCalendarItem)
    })
    return items
})

const calendarItemHeight = computed(() => {
    if (lgAndUp.value) {
        return '2.6rem'
    } else {
        return '1.3rem'
    }
})

onMounted(() => {
    let api = new ApiApi()
    api.apiMealPlanList().then(r => {
        mealPlans.value = r
    })
})

function dropCalendarItemOnDate(undefinedItem: IMealPlanNormalizedCalendarItem, targetDate: Date, event: DragEvent) {
    //The item argument is undefined because our custom calendar item cannot manipulate the calendar state so the item is unknown to the calendar (probably fixable by somehow binding state to the item)
    mealPlans.value.forEach(mealPlan => {
        if (mealPlan.id == currentlyDraggedMealplan.value.originalItem.mealPlan.id) {
            let fromToDiff = DateTime.fromJSDate(mealPlan.toDate).diff(DateTime.fromJSDate(mealPlan.fromDate), 'days')
            if (event.ctrlKey) {
                let new_entry = Object.assign({}, mealPlan)
                new_entry.fromDate = targetDate
                new_entry.toDate = DateTime.fromJSDate(targetDate).plus(fromToDiff).toJSDate()

                //this.createEntry(new_entry) //TODO implement once API works
            } else {
                mealPlan.fromDate = targetDate
                mealPlan.toDate = DateTime.fromJSDate(targetDate).plus(fromToDiff).toJSDate()
                console.log(mealPlan.fromDate, mealPlan.toDate)
                //this.saveEntry(entry) //TODO implement once API works
            }
        }
    })
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