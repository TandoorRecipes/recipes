<template>
    <v-select :label="$t('BaseUnit')" :hint="$t('BaseUnitHelp')" :items="BASE_UNITS" v-model="model"></v-select>
</template>

<script setup lang="ts">

import {useI18n} from "vue-i18n";

const {t} = useI18n()

const model = defineModel()

const BASE_UNITS = [
    {value: "g", title: t("g")},
    {value: "kg", title: t("kg")},
    {value: "ounce", title: t("ounce")},
    {value: "pound", title: t("pound")},
    {value: "ml", title: t("ml")},
    {value: "l", title: t("l")},
    {value: "fluid_ounce", title: t("fluid_ounce")},
    {value: "us_cup", title: t("us_cup")},
    {value: "pint", title: t("pint")},
    {value: "quart", title: t("quart")},
    {value: "gallon", title: t("gallon")},
    {value: "tbsp", title: t("tbsp")},
    {value: "tsp", title: t("tsp")},
    {value: "imperial_fluid_ounce", title: t("imperial_fluid_ounce")},
    {value: "imperial_pint", title: t("imperial_pint")},
    {value: "imperial_quart", title: t("imperial_quart")},
    {value: "imperial_gallon", title: t("imperial_gallon")},
    {value: "imperial_tbsp", title: t("imperial_tbsp")},
    {value: "imperial_tsp", title: t("imperial_tsp")},
]

</script>

<style scoped>

</style>