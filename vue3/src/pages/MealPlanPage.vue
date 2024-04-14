<template>

    <v-row class="h-100">
        <v-col>
            <CalendarView
                :items="planItems"
                class="theme-default ">
                <template #item="{ value, weekStartDate, top }">
                    <meal-plan-calendar-item :value="value"></meal-plan-calendar-item>
                </template>
            </CalendarView>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

import {VCalendar} from 'vuetify/labs/VCalendar'
import {ApiApi, MealPlan} from "@/openapi";

import {CalendarView, CalendarViewHeader} from "vue-simple-calendar"
import "vue-simple-calendar/dist/style.css"
import "vue-simple-calendar/dist/css/default.css"
import MealPlanCalendarItem from "@/components/display/MealPlanCalendarItem.vue";
import {IMealPlanCalendarItem, IMealPlanNormalizedCalendarItem} from "@/types/MealPlan";


export default defineComponent({
    name: "MealPlanPage",
    components: {MealPlanCalendarItem,  VCalendar, CalendarView, CalendarViewHeader},
    computed: {
        planItems: function(){
            let items = [] as IMealPlanCalendarItem[]
            this.mealPlans.forEach(mp => {
                items.push({
                    startDate: mp.fromDate,
                    endDate: mp.toDate,
                    id: mp.id,
                    mealPlan: mp,
                } as IMealPlanCalendarItem)
            })
            return items
        }
    },
    data() {
        return {
            mealPlans: [] as MealPlan[]
        }
    },
    mounted() {
        let api = new ApiApi()
        api.apiMealPlanList().then(r => {
            this.mealPlans = r
        })
    },
    methods: {}

})
</script>

<style scoped>

</style>