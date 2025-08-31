<template>

    <v-row v-if=" props.importLog.importedRecipes != undefined && props.importLog.totalRecipes != undefined">
        <v-col>
            <v-progress-linear :model-value="(props.importLog.importedRecipes/props.importLog.totalRecipes)*100" height="24" color="primary">
                {{ props.importLog.importedRecipes }} / {{ props.importLog.totalRecipes }}
            </v-progress-linear>
        </v-col>
    </v-row>

    <v-row>
        <v-col>
            <v-textarea :model-value="importLog.msg" max-rows="25" auto-grow></v-textarea>
        </v-col>
    </v-row>


</template>

<script setup lang="ts">

import {ImportLog} from "@/openapi";
import {PropType} from "vue";

const props = defineProps({
    importLog: {type: {} as PropType<ImportLog>, required: true}
})

</script>


<style scoped>

</style>