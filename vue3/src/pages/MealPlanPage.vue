<template>
    <v-container>
        <v-btn @click="testApi">Test API</v-btn>
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
            test: {
                text: String,
            },
        }
    },
    mounted() {

    },
    methods: {
        testApi: function () {
            const api = new ApiApi()
            api.apiMealPlanList().then(r => {
                if (r.length > 0) {
                    api.apiMealPlanUpdate({id: r[0].id, mealPlan: r[0]})
                }
            })
        }
    }

})
</script>

<style scoped>

</style>