<template>
    <v-container>
       Form
        <v-form>
            <ModelSelect model="Food"></ModelSelect>
        </v-form>

        Non Form
        <ModelSelect model="Food"></ModelSelect>


    </v-container>
</template>

<script setup lang="ts">

import {computed, ref, toRaw, watch,} from "vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useRouteQuery} from "@vueuse/router";
import {DateTime} from "luxon";
import ModelSelect from "@/components/inputs/ModelSelect.vue";


</script>


<style scoped>

</style>