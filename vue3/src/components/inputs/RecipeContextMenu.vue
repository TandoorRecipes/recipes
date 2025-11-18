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
                <v-list-item @click.stop="duplicateRecipe()" prepend-icon="$copy" :disabled="duplicateLoading">
                    {{ $t('Duplicate') }}
                    <template #append>
                        <v-progress-circular v-if="duplicateLoading" indeterminate size="small"></v-progress-circular>
                    </template>
                </v-list-item>
                <v-list-item :to="{ name: 'RecipeViewPage', params: { id: recipe.id}, query: {print: 'true'} }" :active="false" target="_blank" prepend-icon="fa-solid fa-print">
                    {{ $t('Print') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>

    <model-edit-dialog model="MealPlan" :itemDefaults="{recipe: recipe, servings: recipe.servings}" :close-after-create="false" :close-after-save="false"
                       v-model="mealPlanDialog"></model-edit-dialog>

</template>

<script setup lang="ts">
import {nextTick, PropType, ref} from 'vue'
import {ApiApi, Recipe, RecipeFlat, RecipeOverview} from "@/openapi";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import RecipeShareDialog from "@/components/dialogs/RecipeShareDialog.vue";
import AddToShoppingDialog from "@/components/dialogs/AddToShoppingDialog.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {useFileApi} from "@/composables/useFileApi.ts";

const router = useRouter()
const {updateRecipeImage} = useFileApi()

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeOverview>, required: true},
    size: {type: String, default: 'medium'},
})

const mealPlanDialog = ref(false)
const duplicateLoading = ref(false)

function openPrintView() {
    print()
}

/**
 * create a duplicate of the recipe by pulling its current data and creating a new recipe with the same data
 */
function duplicateRecipe() {
    let api = new ApiApi()
    duplicateLoading.value = true
    api.apiRecipeRetrieve({id: props.recipe.id!}).then(originalRecipe => {
        api.apiRecipeCreate({recipe: originalRecipe}).then(newRecipe => {

            if (originalRecipe.image) {
                updateRecipeImage(newRecipe.id!, null, originalRecipe.image).then(r => {
                    router.push({name: 'RecipeViewPage', params: {id: newRecipe.id!}})
                }).catch(err => {
                    useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                    duplicateLoading.value = false
                })
            } else {
                router.push({name: 'RecipeViewPage', params: {id: newRecipe.id!}})
            }
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            duplicateLoading.value = false
        })
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        duplicateLoading.value = false
    })
}

</script>


<style scoped>

</style>