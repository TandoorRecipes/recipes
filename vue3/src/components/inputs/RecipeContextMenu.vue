<template>
    <v-btn v-bind="props" icon="fa-solid fa-ellipsis-v" variant="plain" :size="props.size">
        <v-icon icon="fa-solid fa-ellipsis-v"></v-icon>
            <v-menu  activator="parent" close-on-content-click>
                <v-list density="compact" class="pt-1 pb-1">
                    <v-list-item :to="{ name: 'ModelEditPage', params: {model: 'recipe', id: recipe.id} }" prepend-icon="$edit">
                        {{ $t('Edit') }}
                    </v-list-item>
                    <v-list-item prepend-icon="$mealplan" link>
                        {{ $t('Add_to_Plan') }}
                        <model-edit-dialog model="MealPlan" :itemDefaults="{recipe: recipe}"></model-edit-dialog>
                    </v-list-item>
                    <v-list-item prepend-icon="fa-solid fa-share-nodes" link>
                        {{ $t('Share') }}
                        <recipe-share-dialog :recipe="props.recipe"></recipe-share-dialog>
                    </v-list-item>
                </v-list>
            </v-menu>
    </v-btn>


</template>

<script setup lang="ts">
import {PropType} from 'vue'
import {Recipe, RecipeFlat, RecipeOverview} from "@/openapi";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import RecipeShareDialog from "@/components/dialogs/RecipeShareDialog.vue";


const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeFlat | RecipeOverview>, required: true},
    size: {type: String, default: 'medium'},
})

</script>


<style scoped>

</style>