<template>
    <v-btn icon="fa-solid fa-ellipsis-v" variant="plain" :size="props.size" class="d-print-none" :aria-label="$t('Actions')">
        <v-icon icon="fa-solid fa-ellipsis-v"></v-icon>
        <v-menu activator="parent" close-on-content-click>
            <v-list density="compact" class="pt-1 pb-1">
                <v-list-item v-if="isVisible('edit')"
                             :to="{ name: 'ModelEditPage', params: {model: 'recipe', id: recipe.id} }" prepend-icon="$edit">
                    {{ $t('Edit') }}
                </v-list-item>
                <v-list-item v-if="isVisible('plan')"
                             prepend-icon="$mealplan" @click="mealPlanDialog = true">
                    {{ $t('Add_to_Plan') }}
                </v-list-item>
                <v-list-item v-if="isVisible('shopping')"
                             prepend-icon="$shopping" link>
                    {{ $t('Add_to_Shopping') }}
                    <add-to-shopping-dialog :recipe="props.recipe"></add-to-shopping-dialog>
                </v-list-item>
                <v-list-item v-if="isVisible('book')"
                             prepend-icon="fa-solid fa-book-bookmark" @click="addToBookDialog = true">
                    {{ $t('Add_to_Book') }}
                </v-list-item>
                <v-list-item v-if="isVisible('cooklog') && props.context === 'card'"
                             prepend-icon="fa-solid fa-utensils" @click="logCookingDialog = true">
                    {{ $t('Log_Cooking') }}
                </v-list-item>
                <v-list-item v-if="isVisible('photo')"
                             prepend-icon="fa-solid fa-image" @click="openPhotoEditor">
                    {{ $t('Edit_Photo') }}
                </v-list-item>
                <v-list-item v-if="isVisible('properties')"
                             :to="{ name: 'PropertyEditorPage', query: {recipe: recipe.id} }" prepend-icon="fa-solid fa-table" link>
                    {{ $t('Property_Editor') }}
                </v-list-item>
                <v-list-item v-if="isVisible('share')"
                             prepend-icon="fa-solid fa-share-nodes" link>
                    {{ $t('Share') }}
                    <recipe-share-dialog :recipe="props.recipe"></recipe-share-dialog>
                </v-list-item>
                <v-list-item v-if="isVisible('export')"
                             prepend-icon="fa-solid fa-file-export" @click="exportRecipe()" :disabled="exportLoading">
                    {{ $t('Export') }}
                    <template #append>
                        <v-progress-circular v-if="exportLoading" indeterminate size="small"></v-progress-circular>
                    </template>
                </v-list-item>
                <v-list-item v-if="isVisible('duplicate')"
                             @click.stop="duplicateRecipe()" prepend-icon="$copy" :disabled="duplicateLoading">
                    {{ $t('Duplicate') }}
                    <template #append>
                        <v-progress-circular v-if="duplicateLoading" indeterminate size="small"></v-progress-circular>
                    </template>
                </v-list-item>
                <v-list-item v-if="isVisible('print')"
                             :to="{ name: 'RecipeViewPage', params: { id: recipe.id}, query: {print: 'true', servings: props.servings} }" :active="false" target="_blank" prepend-icon="fa-solid fa-print">
                    {{ $t('Print') }}
                </v-list-item>
                <v-divider v-if="isVisible('delete')"></v-divider>
                <v-list-item v-if="isVisible('delete')"
                             prepend-icon="fa-solid fa-trash-can" class="text-error" @click="deleteDialog = true">
                    {{ $t('Delete') }}
                </v-list-item>
                <v-divider v-if="isOnRecipeView" />
                <v-list-item v-if="isOnRecipeView" prepend-icon="fa-solid fa-gear" @click="recipeSettingsOpen = true">
                    {{ $t('DisplaySettings') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>

    <model-edit-dialog model="MealPlan" :itemDefaults="{recipe: recipe, servings: recipe.servings}" :close-after-create="false" :close-after-save="false"
                       v-model="mealPlanDialog"></model-edit-dialog>

    <add-to-book-dialog v-if="addToBookDialog" :recipe="props.recipe" v-model="addToBookDialog"></add-to-book-dialog>
    <log-cooking-dialog v-if="logCookingDialog" :recipe="props.recipe" v-model="logCookingDialog"></log-cooking-dialog>
    <delete-confirm-dialog v-if="deleteDialog" :object-name="props.recipe.name" model-name="Recipe"
                           @delete="confirmDelete" v-model="deleteDialog"></delete-confirm-dialog>

    <v-dialog v-model="photoEditorDialog" max-width="800">
        <v-card>
            <v-closable-card-title :title="$t('Edit_Photo')" v-model="photoEditorDialog" />
            <v-card-text>
                <recipe-image-editor v-if="photoEditorDialog" :recipe-id="props.recipe.id!" v-model:images="photoEditorImages" />
            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">
import {computed, nextTick, PropType, ref} from 'vue'
import {ApiApi, Recipe, RecipeFlat, RecipeOverview} from "@/openapi";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import RecipeShareDialog from "@/components/dialogs/RecipeShareDialog.vue";
import AddToShoppingDialog from "@/components/dialogs/AddToShoppingDialog.vue";
import AddToBookDialog from "@/components/dialogs/AddToBookDialog.vue";
import LogCookingDialog from "@/components/dialogs/LogCookingDialog.vue";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import RecipeImageEditor from "@/components/inputs/RecipeImageEditor.vue";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter, useRoute} from "vue-router";
import {useFileApi} from "@/composables/useFileApi.ts";
import {useI18n} from "vue-i18n";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useRecipeViewSettings} from '@/composables/useRecipeViewSettings'

const router = useRouter()
const route = useRoute()
const {t} = useI18n()
const {isOpen: recipeSettingsOpen} = useRecipeViewSettings()
const {updateRecipeImage} = useFileApi()
const deviceSettings = useUserPreferenceStore().deviceSettings

const isOnRecipeView = computed(() => route.name === 'RecipeViewPage')

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeOverview>, required: true},
    servings: {type: Number, default: undefined},
    size: {type: String, default: 'medium'},
    context: {type: String as PropType<'card' | 'view'>, default: 'card'},
})

const mealPlanDialog = ref(false)
const addToBookDialog = ref(false)
const logCookingDialog = ref(false)
const deleteDialog = ref(false)
const photoEditorDialog = ref(false)
const photoEditorImages = ref<any[]>([])
const duplicateLoading = ref(false)
const exportLoading = ref(false)

function isVisible(key: string): boolean {
    return deviceSettings.card_visibleMenuItems.includes(key)
}

function openPhotoEditor() {
    const api = new ApiApi()
    api.apiRecipeRetrieve({id: props.recipe.id!}).then(r => {
        photoEditorImages.value = r.images ?? []
        photoEditorDialog.value = true
    }).catch(() => {
        photoEditorImages.value = []
        photoEditorDialog.value = true
    })
}

/**
 * create a duplicate of the recipe by pulling its current data and creating a new recipe with the same data
 */
function duplicateRecipe() {
    let api = new ApiApi()
    duplicateLoading.value = true
    api.apiRecipeRetrieve({id: props.recipe.id!}).then(originalRecipe => {

        let recipe = {...originalRecipe, name: originalRecipe.name + `(${t('Copy')})`}
        delete recipe.id
        recipe.steps = recipe.steps.map((step) => {
            const s = {
                ...step,
                ingredients: step.ingredients.map((ingredient) => {
                    const ing = {...ingredient}
                    delete ing.id
                    return ing
                }),
            }
            delete s.id
            return s
        })

        if (recipe.properties != null) {
            recipe.properties = recipe.properties.map((p) => {
                const prop = {...p}
                delete prop.id
                return prop
            })
        }

        api.apiRecipeCreate({recipe: recipe}).then(newRecipe => {
            // TODO: copy RecipeImage records server-side during recipe duplication
            router.push({name: 'RecipeViewPage', params: {id: newRecipe.id!}})
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            duplicateLoading.value = false
        })
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        duplicateLoading.value = false
    })
}

function exportRecipe() {
    let api = new ApiApi()
    exportLoading.value = true
    api.apiExportCreate({
        exportRequest: {
            type: 'DEFAULT',
            recipes: [{id: props.recipe.id!, name: props.recipe.name}],
        }
    }).then(() => {
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        exportLoading.value = false
    })
}

function confirmDelete() {
    let api = new ApiApi()
    api.apiRecipeDestroy({id: props.recipe.id!}).then(() => {
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
        router.push({name: 'SearchPage'})
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

</script>


<style scoped>

</style>
