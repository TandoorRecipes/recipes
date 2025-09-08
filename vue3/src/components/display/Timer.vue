<template>
    <v-progress-linear :model-value="timerProgress" color="primary" height="5"></v-progress-linear>
    <v-alert :color="timerColor" class="rounded-0" variant="tonal">
        <v-alert-title><i class="fas fa-stopwatch mr-1"></i> {{ Duration.fromMillis(durationSeconds * 1000).toFormat('hh:mm:ss') }}</v-alert-title>
        {{$t('FinishedAt')}} {{ formatFinishTime(durationSeconds) }}
        <template #close>
            <v-btn-group divided>
                <v-btn width="40" @click="changeTimer(-60)"><i class="fas fa-minus"></i>1</v-btn>
                <v-btn width="40" @click="changeTimer(+60)"><i class="fas fa-plus"></i>1</v-btn>
                <v-btn width="40" @click="timerRunning = !timerRunning"><i class="fas fa-fw" :class="{'fa-pause': timerRunning, 'fa-play': !timerRunning}"></i></v-btn>
                <v-btn width="40" @click="stopTimer()"><i class="fas fa-stop"></i></v-btn>
            </v-btn-group>
        </template>
    </v-alert>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

const emit = defineEmits(['stop'])

import {computed, onMounted, ref} from "vue";
import {DateTime, Duration} from "luxon";

const props = defineProps({
    seconds: {type: Number, required: true}
})

const {t} = useI18n()

const initialDurationSeconds = ref(props.seconds)
const durationSeconds = ref(initialDurationSeconds.value)
const timerRunning = ref(true)

/**
 * Change timer color based on if the timer has time left or if its finished
 */
let timerColor = computed(() => {
    return (durationSeconds.value > 0) ? 'primary' : 'warning'
})

/**
 * calculate timer progress based on initial time and remaining time
 */
const timerProgress = computed(() => {
    if (initialDurationSeconds.value == 0) {
        return 100
    }
    return (1 - (durationSeconds.value / initialDurationSeconds.value)) * 100
})

/**
 * lifecycle hook onMounted
 * start interval running the timer
 */
onMounted(() => {
    setInterval(() => {
        if (timerRunning.value && durationSeconds.value > 0) {
            durationSeconds.value = durationSeconds.value - 1
        }
    }, 1000)
})

/**
 * utility function to change the timer duration
 * also changes initial duration to keep progress correct
 * @param seconds number of seconds to change (positive to add time, negative to remove time)
 */
function changeTimer(seconds: number) {
    durationSeconds.value = Math.max(0, durationSeconds.value + seconds)
    initialDurationSeconds.value = Math.max(0, initialDurationSeconds.value + seconds)
}

/**
 * stops the timer emitting the stop event and resetting the time to time initially passed via prop so it can be started again
 */
function stopTimer() {
    durationSeconds.value = props.seconds
    initialDurationSeconds.value = props.seconds
    emit('stop')
}

/**
* formats a future time based on a duration in seconds from now
* displays the time in "hh:mm" format and adds a "+Xd" suffix if the target day differs from today
*/
function formatFinishTime(durationSeconds: number): string {
    const now = DateTime.now()
    const target = now.plus({ seconds: durationSeconds })
    let timeString = target.toLocaleString(DateTime.TIME_SIMPLE)
    const daysDifference = Math.floor(
        target.startOf('day').diff(now.startOf('day'), 'days').days
    )
    if (daysDifference >= 1) {
        const label = daysDifference === 1 ? t('Day') : t('Days');
        timeString += ` +${daysDifference} ${label}`;
    }
    return timeString
}

</script>

<style scoped>

</style>
