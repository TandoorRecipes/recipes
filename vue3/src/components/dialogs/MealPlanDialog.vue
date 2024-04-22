<template>
    <v-dialog activator="parent" v-model="dialog">
        <template v-slot:default="{ isActive }">
            <v-card style="overflow: auto">
                <v-card-title>Meal Plan Edit <i class="mt-2 float-right fas fa-times" @click="isActive.value = false"></i></v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-form>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field label="Title"></v-text-field>
                                <v-text-field label="From Date" type="date"></v-text-field>
                                <v-text-field label="Meal Type"></v-text-field>
                                <v-number-input control-variant="split" :min="0"></v-number-input>
                                <v-text-field label="Share"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <Multiselect
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
                                ></Multiselect>
                                <v-text-field label="To Date" type="date"></v-text-field>
                                <recipe-card :recipe="mutableMealPlan.recipe" v-if="mutableMealPlan && mutableMealPlan.recipe"></recipe-card>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-textarea label="Note"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
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
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {VNumberInput} from 'vuetify/labs/VNumberInput' //TODO remove once component is out of labs
import Multiselect from '@vueform/multiselect'

const props = defineProps(
    {
        mealPlan: {type: Object as PropType<MealPlan>, required: false},
    }
)

const dialog = ref(false)
let mutableMealPlan = ref(props.mealPlan)

watchEffect(() => {
    if (props.mealPlan != undefined) {
        mutableMealPlan.value = props.mealPlan

    } else {
        mutableMealPlan.value = newMealPlan()
    }
});

function saveMealPlan() {

    if (mutableMealPlan.value != undefined) {
        mutableMealPlan.value.recipe = mutableMealPlan.value.recipe as RecipeOverview
        console.log('calling save method')
        useMealPlanStore().createOrUpdate(mutableMealPlan.value).catch(err => {
            // TODO handle error
        }).finally(() => {
            dialog.value = false
        })
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

<style src="@vueform/multiselect/themes/default.css"></style>

<style scoped>

</style>