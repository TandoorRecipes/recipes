<template>
    <tr>
        <template v-if="ingredient.isHeader">
            <td colspan="4"><b>{{ ingredient.note }}</b></td>
        </template>
        <template v-else>
            <td>{{ ingredient.amount }}</td>
            <td><span v-if="ingredient.unit != null">{{ ingredient.unit.name }}</span></td>
            <td><span v-if="ingredient.food != null">{{ ingredient.food.name }}</span></td>
            <td v-if="showNotes">
                <v-icon class="far fa-comment float-right" v-if="ingredient.note != '' && ingredient.note != undefined" @click="show_tooltip = !show_tooltip">
                    <v-tooltip v-model="show_tooltip" activator="parent" location="start">{{ ingredient.note }}</v-tooltip>
                </v-icon>
            </td>
            <td v-if="draggable">
                <i class="fas fa-grip-lines drag-handle cursor-move"></i>
            </td>
        </template>

    </tr>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Ingredient} from "@/openapi";

export default defineComponent({
    name: "IngredientsTableRow",
    components: {},
    props: {
        ingredient: {
            type: {} as PropType<Ingredient>,
            required: true
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
            show_tooltip: false,
        }
    },
})
</script>

<style scoped>

</style>