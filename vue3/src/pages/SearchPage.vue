<template>


</template>

<script lang="ts">
import {defineComponent} from 'vue'
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import RecipeCard from "@/components/display/RecipeCard.vue";
import {ApiApi, Recipe, RecipeOverview} from "@/openapi";


export default defineComponent({
    name: "SearchPage",
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

    }

})
</script>

<style scoped>

</style>