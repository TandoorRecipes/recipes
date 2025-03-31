<template>
    <v-container>

        <v-row>
            <v-col>
                <v-text-field v-model="dateTest1" label="Test 1 - text field type date" type="date"></v-text-field>
            </v-col>
            <v-col>
                {{ dateTest1 }}
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-date-input v-model="dateTest2" label="Test 2 - date input"></v-date-input>
            </v-col>
            <v-col> {{ dateTest2 }}</v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-date-input v-model="dateTest3" label="Test 3 - date input with routeQueryModel"></v-date-input>
            </v-col>
            <v-col> {{ dateTest3 }}</v-col>
        </v-row>


    </v-container>
</template>

<script setup lang="ts">

import {computed, ref, toRaw, watch,} from "vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useRouteQuery} from "@vueuse/router";
import {DateTime} from "luxon";


const dateTest1 = ref(null)
const dateTest2 = ref(null)

const dateTest3 = useRouteQuery('cookedonGte', null, {
    transform: {
        get: (value: string | null | Date) => {

            if (value == null) {
                console.log('get null')
                return null
            } else {
                console.log('get', new Date(value), (new Date(value)).getMonth())
                return new Date(value)
            }
        },
        set: value => {

            if (value == null) {
                console.log('-- set null')
                return null
            } else {
                console.log('-- set', DateTime.fromJSDate(new Date(value)).toISODate())
                return DateTime.fromJSDate(new Date(value)).toISODate()
            }
        }
    }
})

const typeOfDateTest1 = computed(() => {
    return dateTest1 instanceof Date
})

const typeOfDateTest2 = computed(() => {
    return dateTest2 instanceof Date
})

watch(dateTest1, () => {
    console.log(dateTest1.value, dateTest1.value.getMonth())
})

watch(dateTest2, () => {
    console.log(dateTest2.value, dateTest2.value.getMonth())
})

</script>


<style scoped>

</style>