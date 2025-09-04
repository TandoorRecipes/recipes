<template>
    <v-btn v-bind="props" icon="fa-solid fa-ellipsis-v" variant="plain" :size="props.size" class="d-print-none">
        <v-icon icon="fa-solid fa-ellipsis-v"></v-icon>
        <v-menu activator="parent" close-on-content-click>
            <v-list density="compact" class="pt-1 pb-1">
                <v-list-item :to="{ name: 'ModelEditPage', params: {model: 'recipe', id: recipe.id} }" prepend-icon="$edit">
                    {{ $t('Edit') }}
                </v-list-item>
                <v-list-item prepend-icon="$mealplan" @click="mealPlanDialog = true">
                    {{ $t('Add_to_Plan') }}
                </v-list-item>
                <v-list-item prepend-icon="$shopping" link>
                    {{ $t('Add_to_Shopping') }}
                    <add-to-shopping-dialog :recipe="props.recipe"></add-to-shopping-dialog>
                </v-list-item>
                <v-list-item :to="{ name: 'PropertyEditorPage', query: {recipe: recipe.id} }" prepend-icon="fa-solid fa-table" link>
                    {{ $t('Property_Editor') }}
                </v-list-item>
                <v-list-item prepend-icon="fa-solid fa-share-nodes" link>
                    {{ $t('Share') }}
                    <recipe-share-dialog :recipe="props.recipe"></recipe-share-dialog>
                </v-list-item>

                <!-- TODO when calling print() some timing or whatever issue makes it so the useMediaQuery does not work and the sidebar is still shown -->
<!--                <v-list-item prepend-icon="fa-solid fa-print" @click="openPrintView()">-->
<!--                    {{ $t('Print') }}-->
<!--                </v-list-item>-->
            </v-list>
        </v-menu>
    </v-btn>

    <model-edit-dialog model="MealPlan" :itemDefaults="{recipe: recipe, servings: recipe.servings}" :close-after-create="false" :close-after-save="false" v-model="mealPlanDialog"></model-edit-dialog>

</template>

<script setup lang="ts">
import {nextTick, PropType, ref} from 'vue'
import {Recipe, RecipeFlat, RecipeOverview} from "@/openapi";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import RecipeShareDialog from "@/components/dialogs/RecipeShareDialog.vue";
import AddToShoppingDialog from "@/components/dialogs/AddToShoppingDialog.vue";


const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeOverview>, required: true},
    size: {type: String, default: 'medium'},
})

const mealPlanDialog = ref(false)

function openPrintView() {
    print()
}

</script>


<style scoped>

</style>