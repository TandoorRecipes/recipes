<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col>{{ step.name }}</v-col>
                <v-col class="text-right">
                    <v-btn-group density="compact" variant="tonal">
                        <v-btn size="small" color="info" v-if="step.time != undefined && step.time > 0" @click="startTimer(step.time)"><i class="fas fa-stopwatch mr-1"></i> {{ step.time }}</v-btn>
                        <v-btn size="small" color="success"><i class="fas fa-check"></i></v-btn>
                    </v-btn-group>
                </v-col>
            </v-row>
        </v-card-title>


        <v-progress-linear v-if="timer_end != null" :model-value="timerProgress" color="success" height="5">

        </v-progress-linear>
        <v-alert :color="timer_color" closable @click:close="timer_end = null">
            <v-alert-title><i class="fas fa-stopwatch mr-1"></i> {{ remaining_time }}</v-alert-title>
            Finished at {{ finished_at }}
            <template #close>
                <v-btn-group divided>
                    <v-btn width="40" @click="subTimer"><i class="fas fa-minus"></i>1</v-btn>
                    <v-btn width="40" @click="addTimer"><i class="fas fa-plus"></i>1</v-btn>
                    <v-btn width="40"><i class="fas fa-pause"></i></v-btn>
                    <v-btn width="40"><i class="fas fa-stop"></i></v-btn>
                </v-btn-group>
            </template>
        </v-alert>

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

export default defineComponent({
    name: "Step",
    computed: {
        timer_color: function () {
            if (this.timer_end != null) {
                if (this.time_now > this.timer_end) {
                    return 'warning'
                }
            }
            return ''
        },
        timerProgress: function () {
            if (this.timer_end != null && this.timer_start != null && this.step.time != undefined) {
                return (Interval.fromDateTimes(this.timer_start, this.time_now).length('seconds') / (this.step.time * 60)) * 100
            }
            return 0
        },
        remaining_time: function () {
            if (this.timer_end != null) {
                return Duration.fromMillis(Interval.fromDateTimes(this.time_now, this.timer_end).length()).toFormat('hh:mm:ss')
            }
            return ''
        },
        finished_at: function () {
            if (this.timer_end != null) {
                return this.timer_end.toLocaleString(DateTime.TIME_SIMPLE)
            }
            return ''
        }
    },
    components: {Instructions, IngredientsTable},
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
            timer_end: null as null | DateTime,
            timer_start: null as null | DateTime,
            time_now: DateTime.now(),
        }
    },
    mounted() {
        setInterval(() => {
            this.time_now = DateTime.now()
        }, 500)
    },
    methods: {
        startTimer(minutes: number) {
            this.timer_start = DateTime.now()
            this.timer_end = DateTime.now().plus({minutes: minutes})
        },
        subTimer(){
            if (this.timer_end != null){
                this.timer_end = this.timer_end.minus({minutes: 1})
            }
        },
        addTimer(){
            this.timer_end?.plus({minutes: 1})
        }
    }
})
</script>

<style scoped>

</style>