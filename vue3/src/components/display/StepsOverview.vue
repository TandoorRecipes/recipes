<template>
    <v-container>

        <v-row v-for="(s, i) in steps" >
            <v-col class="pa-1">
                <b v-if="s.showAsHeader">{{i}}. {{ s.name }} </b>
                <IngredientsTable :ingredients="s.ingredients"></IngredientsTable>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Step} from "@/openapi";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import IngredientsTable from "@/components/display/IngredientsTable.vue";

export default defineComponent({
    name: "StepsOverview",
    components: {IngredientsTable, IngredientsTableRow},
    props: {
        steps: {
            type: [] as PropType<Array<Step>>,
            default: [],
        },
    }
})
</script>


<style scoped>

</style>