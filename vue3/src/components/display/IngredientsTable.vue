<template>
    <v-table density="compact" v-if="ingredients.length > 0">

        <tbody>
        <ingredients-table-row v-for="(ing, i) in ingredients" v-model="ingredients[i]" :key="ing.id" :show-notes="props.showNotes"
                               :ingredient-factor="ingredientFactor"></ingredients-table-row>
        </tbody>

    </v-table>
</template>

<script lang="ts" setup>
import {onMounted, PropType, ref} from 'vue'
import {Ingredient} from "@/openapi";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import draggable from 'vuedraggable'

const ingredients = defineModel<Ingredient[]>({required: true})

const props = defineProps({
    showNotes: {
        type: Boolean,
        default: true
    },
    ingredientFactor: {
        type: Number,
        required: true,
    },
})

const mutable_ingredients = ref([] as Ingredient[])

onMounted(() => {
    mutable_ingredients.value = ingredients.value
})

</script>


<style scoped>

</style>