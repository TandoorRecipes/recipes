<template>
    <v-table density="compact" v-if="ingredients.length > 0">
        <tbody>
        <IngredientsTableRow v-for="i in ingredients" :ingredient="i" :key="i.id"></IngredientsTableRow>
        </tbody>
    </v-table>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Ingredient, Step} from "@/openapi";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";

export default defineComponent({
    name: "IngredientsTable",
    components: {IngredientsTableRow},
    props: {
        ingredients: {
            type: Array as PropType<Array<Ingredient>>,
            default: [],
        },
    },
    mounted() {

    }
})
</script>


<style scoped>

</style>