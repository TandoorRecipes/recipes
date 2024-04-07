<template>

    <v-row class="h-100">
        <v-col >
            <CalendarView
                class="theme-default ">

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

export default defineComponent({
    name: "MealPlanPage",
    components: {VCalendar, CalendarView, CalendarViewHeader},
    computed: {},
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