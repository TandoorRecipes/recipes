<template>

    <v-calendar view-mode="month" :events="calendarEvents" show-adjacent-months>

    </v-calendar>

</template>

<script lang="ts">
import {defineComponent} from 'vue'

import {VCalendar} from 'vuetify/labs/VCalendar'
import {ApiApi, MealPlan} from "@/openapi";


export default defineComponent({
    name: "MealPlanPage",
    components: {VCalendar},
    computed: {
        calendarEvents: function(){
            let events = []
            this.mealPlans.forEach(mp => {
                events.push({start: mp.fromDate, end: mp.toDate, title: (mp.recipe != undefined) ? mp.recipe.name : mp.title})
            })
            return events
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