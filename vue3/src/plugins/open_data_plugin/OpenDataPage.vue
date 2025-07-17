<template>
    <v-container>
        Welcome to the OpenData Plugin in Tandoor 2
        <model-select model="OpenDataFood" allow-create></model-select>

    </v-container>


</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

onMounted(() => {


})

</script>


<style scoped>

</style>