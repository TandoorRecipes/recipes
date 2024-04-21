<template>

    <v-menu open-on-hover open-delay="0" :open-on-click="true" location="start">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="fas fa-ellipsis-v" variant="plain"></v-btn>
        </template>

        <v-list>
            <v-list-item>
                <v-list-item-title @click="openRecipe()"><i class="fas fa-edit fa-fw mr-2"></i> Edit</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>

</template>

<script setup lang="ts">
import {PropType} from 'vue'
import {Recipe, RecipeFlat, RecipeOverview} from "@/openapi";
import {useRouter} from "vue-router";

const router = useRouter()
const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true}
})

function openRecipe() {
    router.push({name: 'edit_recipe', params: {recipe_id: props.recipe.id}})
}
</script>


<style scoped>

</style>