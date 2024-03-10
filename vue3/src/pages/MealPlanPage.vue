<template>

  <model-select model="Food" allow_create></model-select>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import ModelSelect from "@/components/inputs/ModelSelect.vue";

export default defineComponent({
    name: "MealPlanPage",
    components: {ModelSelect},
    data(){
        return {

        }
    }
})
</script>

<style scoped>

</style>