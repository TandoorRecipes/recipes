<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col>{{ step.name }}</v-col>
                <v-col class="text-right">
                    <v-btn-group density="compact" variant="tonal">
                        <v-btn size="small" color="info" v-if="step.time != undefined && step.time > 0" @click="timerRunning = true"><i class="fas fa-stopwatch mr-1"></i> {{ step.time }}</v-btn>
                        <v-btn size="small" color="success"><i class="fas fa-check"></i></v-btn>
                    </v-btn-group>
                </v-col>
            </v-row>
        </v-card-title>

        <timer :seconds="step.time != undefined ? step.time*60 : 0" @stop="timerRunning = false" v-if="timerRunning"></timer>

        <IngredientsTable :ingredients="step.ingredients"></IngredientsTable>

        <v-card-text v-if="step.instructionsMarkdown.length > 0">
            <instructions :instructions_html="step.instructionsMarkdown" :ingredient_factor="ingredient_factor"></instructions>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import {Step} from "@/openapi";
import {DateTime, Duration, Interval} from "luxon";

import Instructions from "@/components/display/Instructions.vue";
import Timer from "@/components/display/Timer.vue";

export default defineComponent({
    name: "Step",
    computed: {

    },
    components: {Timer, Instructions, IngredientsTable},
    props: {
        step: {
            type: {} as PropType<Step>,
            required: true,
        },
        ingredient_factor: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            timerRunning: false,
        }
    },
    mounted() {

    },
    methods: {

    }
})
</script>

<style scoped>

</style>