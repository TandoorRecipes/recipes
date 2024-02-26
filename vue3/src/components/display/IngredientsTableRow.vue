<template>
    <tr>
        <template v-if="ingredient.isHeader">
            <td colspan="4">{{ ingredient.note }}</td>
        </template>
        <td>{{ ingredient.amount }}</td>
        <td><span v-if="ingredient.unit != null">{{ ingredient.unit.name }}</span></td>
        <td ><span v-if="ingredient.food != null">{{ ingredient.food.name }}</span></td>
        <td>
            <v-icon class="far fa-comment" v-if="ingredient.note != ''" @click="show_tooltip = !show_tooltip">
                <v-tooltip v-model="show_tooltip" activator="parent" location="start">{{ ingredient.note }}</v-tooltip>
            </v-icon>
        </td>
    </tr>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Ingredient} from "@/openapi";

export default defineComponent({
    name: "IngredientsTableRow",
    props: {
        ingredient: {
            type: {} as PropType<Ingredient>,
            required: true
        }
    },
    data(){
      return {
          show_tooltip: false,
      }
    },
})
</script>

<style scoped>

</style>