<template>
    <v-container>
        <v-row>
            <v-col>
                <p>Test P1</p>
                <p>Test 2P</p>
                <ol>
                    <li>Test 1</li>
                    <li>Test 2</li>
                    <li>Test 3</li>
                </ol>
                <p>Text Bla Bla3</p>
            </v-col>
        </v-row>


    </v-container>
</template>

<script setup lang="ts">

import {computed, ref, toRaw, watch,} from "vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useRouteQuery} from "@vueuse/router";
import {DateTime} from "luxon";


</script>


<style scoped>

</style>