<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text>
                        multiple food
                        <model-select model="Food" allow-create clearable></model-select>
                        single food
                        <model-select model="Food" :multiple="false" allow-create clearable></model-select>
                        multiple keyowrd
                        <model-select model="Keyword" allow-create clearable></model-select>

                        <v-autocomplete></v-autocomplete>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col >
                <recipe-card :recipe="recipe" ></recipe-card>
            </v-col>
            <v-col>
                <recipe-card :recipe="recipe_not_loaded" :loading="true"></recipe-card>
            </v-col>
        </v-row>
    </v-container>


</template>

<script lang="ts">
import {defineComponent} from 'vue'
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {ApiApi, Recipe, RecipeOverview} from "@/openapi";


export default defineComponent({
    name: "MealPlanPage",
    components: {ModelSelect, RecipeCard},
    data() {
        return {
            recipe: {} as RecipeOverview,
            recipe_not_loaded: {} as RecipeOverview,
        }
    },
    mounted() {
        const api = new ApiApi()
        api.apiRecipeList({pageSize: 1}).then(r => {
            if(r.results){
                this.recipe = r.results[0]
            }
        })
    },

})
</script>

<style scoped>

</style>