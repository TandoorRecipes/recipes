<template>
    <v-dialog activator="parent">
        <template v-slot:default="{ isActive }">
            <v-card style="overflow: auto">
                <v-card-title>Meal Plan Edit <i class="mt-2 float-right fas fa-times" @click="isActive.value = false"></i></v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    {{mutableMealPlan}}
                    {{props.mealPlan}}
                    <Vueform v-model="mutableMealPlan">
                        <TextElement name="title" :columns="{ sm: 12, md : 6}" label="Title"></TextElement>
                        <SelectElement name="recipe" :columns="{ sm: 12, md : 6}" label="Recipe"></SelectElement>
                        <DateElement name="fromDate" :columns="{ sm: 12, md : 6}" label="From Date">
                            <template #addon-after>
                                <v-btn-group style="border-radius: 0">
                                    <v-btn color="secondary">-</v-btn>
                                    <v-btn color="primary">+</v-btn>
                                </v-btn-group>
                            </template>
                        </DateElement>
                        <DateElement name="toDate" :columns="{ sm: 12, md : 6}" label="To Date">
                            <template #addon-after>
                                <v-btn-group style="border-radius: 0">
                                    <v-btn color="secondary">-</v-btn>
                                    <v-btn color="primary">+</v-btn>
                                </v-btn-group>
                            </template>
                        </DateElement>
                        <GroupElement name="container_1">
                            <GroupElement name="container_1_col_1" :columns="{ sm: 12, md : 6}">
                                <TextElement name="mealType" label="Meal Type"></TextElement>
                                <TextElement name="servings" label="Servings"></TextElement>
                                <TextElement name="share" label="Share"></TextElement>
                            </GroupElement>
                            <GroupElement name="container_1_col_1" :columns="{ sm: 12, md : 6}">
                                <recipe-card :recipe="mutableMealPlan.recipe" v-if="mutableMealPlan.recipe"></recipe-card>
                            </GroupElement>
                        </GroupElement>
                        <TextareaElement name="note" label="Note"></TextareaElement>
                    </Vueform>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="error">
                        Delete
                    </v-btn>
                    <v-btn color="success" class="ml-auto">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import {onMounted, PropType, ref} from "vue";
import {MealPlan} from "@/openapi";
import {DateTime} from "luxon";
import RecipeCard from "@/components/display/RecipeCard.vue";

const props = defineProps(
    {
        mealPlan: {type: Object as PropType<MealPlan>, required: false},
    }
)

let mutableMealPlan = ref({} as MealPlan)

onMounted(() => {
    if (props.mealPlan != undefined) {
        console.log('got prop', props.mealPlan)
        mutableMealPlan.value = props.mealPlan
    } else {
        console.log('loading default')
        mutableMealPlan.value = {
            fromDate: DateTime.now().toJSDate(),
            toDate: DateTime.now().toJSDate(),
        } as MealPlan
    }
})


</script>

<style scoped>

</style>