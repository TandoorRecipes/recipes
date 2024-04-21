<template>
    <v-table density="compact" v-if="props.ingredients.length > 0">

        <tbody>
        <IngredientsTableRow v-for="i in props.ingredients" :ingredient="i" :key="i.id" :show-notes="props.showNotes" :draggable="props.draggable"></IngredientsTableRow>
        </tbody>

    </v-table>
</template>

<script lang="ts" setup>
import {onMounted, PropType, ref} from 'vue'
import {Ingredient} from "@/openapi";
import IngredientsTableRow from "@/components/display/IngredientsTableRow.vue";
import draggable from 'vuedraggable'

const props = defineProps({
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
})

const mutable_ingredients = ref([] as Ingredient[])

onMounted(() => {
    mutable_ingredients.value = props.ingredients
})

</script>


<style scoped>

</style>