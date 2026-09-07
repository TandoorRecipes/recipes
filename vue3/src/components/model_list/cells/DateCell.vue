<template>
    {{ DateTime.fromJSDate(obj).toLocaleString(DateTime.DATE_FULL) }}
</template>

<script setup lang="ts">
import {DateTime} from "luxon";

const obj = defineModel<Date>({required: true})
</script>

<style scoped>

</style>