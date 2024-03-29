<template>
<v-container>

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

})
</script>

<style scoped>

</style>