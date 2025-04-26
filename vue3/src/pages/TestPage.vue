<template>
    <v-container>
        Form
        <v-form>
            <ModelSelect model="Food"></ModelSelect>
        </v-form>

        Non Form
        <ModelSelect model="Food"></ModelSelect>


        <v-text-field :label="$t('Name')" :max-length="128" counter></v-text-field>
        <v-number-input :label="$t('Servings')" :precision="2"></v-number-input>
        <v-text-field :label="$t('ServingsText')" :max-length="32" counter></v-text-field>
        <v-textarea :label="$t('Description')" :rules="[rules.maxLength(512)]" counter clearable></v-textarea>

    </v-container>
</template>

<script setup lang="ts">

import {computed, ref, toRaw, watch,} from "vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import {useRouteQuery} from "@vueuse/router";
import {DateTime} from "luxon";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useRules} from 'vuetify/labs/rules'

const rules = useRules()

</script>


<style scoped>

</style>