<template>
    <v-dialog activator="parent">
        <template v-slot:default="{ isActive }">
            <v-card style="overflow: auto">
                <v-card-title>Meal Plan Edit <i class="mt-2 float-right fas fa-times" @click="isActive.value = false"></i></v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <Vueform v-model="mutableMealPlan" sync>
                        <HiddenElement meta input-type="number" name="id"></HiddenElement>
                        <TextElement name="title" :columns="{ sm: 12, md : 6}" label="Title"></TextElement>
                        <SelectElement
                            name="recipe"
                            :columns="{ sm: 12, md : 6}"
                            label="Recipe"
                            label-prop="name"
                            value-prop="id"
                            :object="true"
                            :strict="false"
                            :search="true"
                            :items="recipeSearch"
                            :delay="300"
                            rules="required"

                        ></SelectElement>
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
                                    label="Meal Type"
                                    label-prop="name"
                                    value-prop="id"
                                    :object="true"
                                    :strict="false"
                                    :search="true"
                                    :items="mealTypeSearch"
                                    :delay="300"
                                    rules="required"
                                >
                                </SelectElement>
                                <TextElement name="servings" label="Servings"></TextElement>
                                <TagsElement
                                    name="share"
                                    label="Share"
                                    label-prop="displayName"
                                    value-prop="id"
                                    :object="true"
                                    :strict="false"
                                    :search="true"
                                    :items="shareUserSearch"
                                    :delay="300"
                                ></TagsElement>
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
                    <v-btn color="success" class="ml-auto" @click="saveMealPlan">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import {onMounted, PropType, ref, watchEffect} from "vue";
import {ApiApi, MealPlan, RecipeOverview} from "@/openapi";
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

function saveMealPlan() {
    const api = new ApiApi()
    if (mutableMealPlan.value) {
        console.log('UPDATING ', mutableMealPlan.value)
        mutableMealPlan.value.recipe = mutableMealPlan.value.recipe as RecipeOverview
        api.apiMealPlanUpdate({id: mutableMealPlan.value.id, mealPlan: mutableMealPlan.value})
    }
}

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

async function shareUserSearch(searchQuery: string) {
    console.log('called su search')
    const api = new ApiApi()
    return await api.apiUserList()
}

async function recipeSearch(searchQuery: string) {
    console.log('called recipe search')
    const api = new ApiApi()
    return (await api.apiRecipeList({query: searchQuery})).results
}

</script>

<style scoped>

</style>