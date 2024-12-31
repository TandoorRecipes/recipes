<template>
    <tr>
        <template v-if="ingredient.isHeader">
            <td colspan="4"><b>{{ ingredient.note }}</b></td>
        </template>
        <template v-else>
            <td>
                <v-checkbox-btn v-model="ingredient.checked" color="success"></v-checkbox-btn>
            </td>
            <td @click="ingredient.checked = !ingredient.checked">{{ ingredient.amount * props.ingredientFactor }}</td>
            <td @click="ingredient.checked = !ingredient.checked"><span v-if="ingredient.unit != null">{{ ingredient.unit.name }}</span></td>
            <td @click="ingredient.checked = !ingredient.checked"><span v-if="ingredient.food != null">{{ ingredient.food.name }}</span></td>
            <td v-if="props.showNotes">
                <v-icon class="far fa-comment float-right" v-if="ingredient.note != '' && ingredient.note != undefined" @click="showTooltip = !showTooltip">
                    <v-tooltip v-model="showTooltip" activator="parent" location="start">{{ ingredient.note }}</v-tooltip>
                </v-icon>
            </td>
        </template>

    </tr>
</template>

<script setup lang="ts">
import {PropType, ref} from 'vue'
import {Ingredient} from "@/openapi";

const ingredient = defineModel<Ingredient>({required: true})

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

const showTooltip = ref(false)

</script>

<style scoped>

</style>