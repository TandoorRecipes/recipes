<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col>{{ step.name }}</v-col>
                <v-col class="text-right">
                    <v-btn-group density="compact" variant="tonal">
                        <v-btn size="small" color="info" v-if="step.time > 0"><i class="fas fa-stopwatch mr-1"></i> {{ step.time }}</v-btn>
                        <v-btn size="small" color="success" ><i class="fas fa-check"></i></v-btn>
                    </v-btn-group>
                </v-col>
            </v-row>
        </v-card-title>

        <IngredientsTable :ingredients="step.ingredients"></IngredientsTable>

        <v-card-text v-if="step.instruction?.length > 0">
            {{ step.instruction }}
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import IngredientsTable from "@/components/display/IngredientsTable.vue";
import {Step} from "@/openapi";

export default defineComponent({
    name: "Step",
    components: {IngredientsTable},
    props: {
        step: {
            type: {} as PropType<Step>,
            required: true,
        }
    }
})
</script>

<style scoped>

</style>