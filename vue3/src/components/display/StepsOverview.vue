<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-title><i class="far fa-list-alt fa-fw me-2"></i> Steps Overview</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-container>
                    <v-row v-for="(s, i) in props.steps">
                        <v-col class="pa-1">
                            <b v-if="s.showAsHeader">{{ i + 1 }}. {{ s.name }} </b>
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