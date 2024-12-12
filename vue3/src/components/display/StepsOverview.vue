<template>
<!--  You can write about anything for model-value & value here. This is so that the panel opens by defualt.-->
    <v-expansion-panels model-value="sus">
        <v-expansion-panel value="sus">
            <v-expansion-panel-title><i class="far fa-list-alt fa-fw me-2"></i> Ingredients Overview</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-container>
                    <v-row v-for="(s, i) in props.steps">
                        <v-col class="pa-1" v-if="s.ingredients?.length">
                            <b v-if="s.showAsHeader">Step {{ i + 1 }}</b> {{ s.name }}
                            <IngredientsTable :ingredients="s.ingredients"></IngredientsTable>
                        </v-col>
                    </v-row>
                </v-container>
            </v-expansion-panel-text>
        </v-expansion-panel>

    </v-expansion-panels>

</template>

<script setup lang="ts">
import {PropType} from 'vue'
import {Step} from "@/openapi";
import IngredientsTable from "@/components/display/IngredientsTable.vue";

const props = defineProps({
    steps: {
        type: Array as PropType<Array<Step>>,
        default: [],
    },
})

</script>


<style scoped>

</style>