<template>
    <v-dialog activator="parent" >
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title>Meal Plan Edit</v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="mealPlan.title" label="Title"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="mealPlan.recipe" label="Recipe"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            {{mealPlan.fromDate}}
                            <v-text-field v-model="mealPlan.fromDate" type="date" label="Title"></v-text-field>

                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="mealPlan.recipe" label="Recipe"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>

                <template v-slot:actions>
                    <v-btn
                        class="ml-auto"
                        text="Close"
                        @click="isActive.value = false"
                    ></v-btn>
                </template>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import {PropType, ref} from "vue";
import {MealPlan} from "@/openapi";
import {DateTime} from "luxon";

const props = defineProps(
    {
        mealPlan: {type: Object as PropType<MealPlan>, required: false},
    }
)

let mealPlan = ref({} as MealPlan)

if (props.mealPlan != undefined) {
    mealPlan.value = props.mealPlan
} else {
    mealPlan.value = {
        fromDate: DateTime.now().toJSDate(),
        toDate: DateTime.now().toJSDate(),
    } as MealPlan
}

</script>

<style scoped>

</style>