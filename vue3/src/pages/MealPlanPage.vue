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
    </v-container>


</template>

<script lang="ts">
import {defineComponent} from 'vue'
import ModelSelect from "@/components/inputs/ModelSelect.vue";


export default defineComponent({
    name: "MealPlanPage",
    components: {ModelSelect},
    data() {
        return {}
    }
})
</script>

<style scoped>

</style>