<template>
    <v-table density="compact" v-if="ingredients.length > 0">

        <tbody>
        <IngredientsTableRow v-for="i in ingredients" :ingredient="i" :key="i.id" :show-notes="showNotes" :draggable="draggable"></IngredientsTableRow>
        </tbody>

    </v-table>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Ingredient, Step} from "@/openapi";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import draggable from 'vuedraggable'

export default defineComponent({
    name: "IngredientsTable",
    components: {IngredientsTableRow, draggable},
    props: {
        ingredients: {
            type: Array as PropType<Array<Ingredient>>,
            default: [],
        },
        showNotes: {
            type: Boolean,
            default: true
        },
        draggable: {
            type: Boolean,
        },
    },
    data() {
        return {
            mutable_ingredients: [] as Ingredient[]
        }
    },
    mounted() {
        this.mutable_ingredients = this.ingredients
    }
})
</script>


<style scoped>

</style>