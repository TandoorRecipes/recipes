<template>
    <v-dialog activator="parent">
        <template v-slot:default="{ isActive }">
            <v-card style="overflow: auto">
                <v-card-title>Meal Plan Edit <i class="mt-2 float-right fas fa-times" @click="isActive.value = false"></i></v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <Vueform v-model="mutableMealPlan" sync>
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
                                <SelectElement
                                    name="mealType"
                                    :default="mealPlan?.mealType"
                                    label="Meal Type"
                                    label-prop="name"
                                    value-prop="id"
                                    :strict="false"
                                    :search="true"
                                    :items="mealTypeSearch"
                                    :delay="300"
                                    rules="required"

                                >
                                </SelectElement>
                                <TextElement name="servings" label="Servings"></TextElement>
                                <TextElement name="share" label="Share"></TextElement>
                            </GroupElement>
                            <GroupElement name="container_1_col_2" :columns="{ sm: 12, md : 6}">
                                <StaticElement name="static_1" :remove-class="['vf-contains-link']">
                                    <recipe-card :recipe="mutableMealPlan.recipe" v-if="mutableMealPlan && mutableMealPlan.recipe"></recipe-card>
                                </StaticElement>
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
import {onMounted, PropType, ref, watchEffect} from "vue";
import {ApiApi, MealPlan} from "@/openapi";
import {DateTime} from "luxon";
import RecipeCard from "@/components/display/RecipeCard.vue";

const props = defineProps(
    {
        mealPlan: {type: Object as PropType<MealPlan>, required: false},
    }
)

let mutableMealPlan = ref(props.mealPlan)

watchEffect(() => {
    if (props.mealPlan != undefined) {
        mutableMealPlan.value = props.mealPlan

    } else {
        mutableMealPlan.value = newMealPlan()
    }
});

function newMealPlan() {
    return {
        fromDate: DateTime.now().toJSDate(),
        toDate: DateTime.now().toJSDate(),
    } as MealPlan
}

async function mealTypeSearch(searchQuery: string) {
    console.log('called search')
    const api = new ApiApi()
    return await api.apiMealTypeList()
}

</script>

<style scoped>

</style>