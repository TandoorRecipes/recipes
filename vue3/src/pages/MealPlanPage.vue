<template>

  <model-select model="Food" allow-create clearable></model-select>


  <model-select model="Food" :multiple="false" allow-create clearable></model-select>

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