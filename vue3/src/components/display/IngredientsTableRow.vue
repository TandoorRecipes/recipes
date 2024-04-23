<template>
    <tr>
        <template v-if="props.ingredient.isHeader">
            <td colspan="4"><b>{{ props.ingredient.note }}</b></td>
        </template>
        <template v-else>
            <td>{{ props.ingredient.amount }}</td>
            <td><span v-if="props.ingredient.unit != null">{{ props.ingredient.unit.name }}</span></td>
            <td><span v-if="props.ingredient.food != null">{{ props.ingredient.food.name }}</span></td>
            <td v-if="props.showNotes">
                <v-icon class="far fa-comment float-right" v-if="props.ingredient.note != '' && props.ingredient.note != undefined" @click="showTooltip = !showTooltip">
                    <v-tooltip v-model="showTooltip" activator="parent" location="start">{{ props.ingredient.note }}</v-tooltip>
                </v-icon>
            </td>
            <td v-if="props.draggable">
                <i class="fas fa-grip-lines drag-handle cursor-move"></i>
            </td>
        </template>

    </tr>
</template>

<script setup lang="ts">
import {PropType, ref} from 'vue'
import {Ingredient} from "@/openapi";

const props = defineProps({
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
})

const showTooltip = ref(false)

</script>

<style scoped>

</style>