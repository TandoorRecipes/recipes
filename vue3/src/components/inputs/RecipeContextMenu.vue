<template>

    <v-menu location="start">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="fas fa-ellipsis-v" variant="plain"></v-btn>
        </template>

        <v-list>
            <v-list-item :to="{ name: 'ModelEditPage', params: {model: 'recipe', id: recipe.id} }" prepend-icon="fas fa-edit">
                {{$t('Edit')}}
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

</script>


<style scoped>

</style>