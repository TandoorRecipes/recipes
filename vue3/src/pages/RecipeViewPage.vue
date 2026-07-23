<template>
    <v-container :class="{'ps-0 pe-0 pt-0': mobile}">
        <v-defaults-provider :defaults="(useUserPreferenceStore().isPrintMode ? {VCard: {variant: 'flat'}} : {})">


           <template v-if="!loadError">
               <recipe-view v-model="recipe" :servings="servings"></recipe-view>

               <div class="mt-2" v-if="isShared && Object.keys(recipe).length > 0">
                   <import-tandoor-dialog></import-tandoor-dialog>
               </div>
           </template>

           <v-card v-else data-test="recipe-not-found" variant="flat" class="mt-md-4 text-center pa-8">
               <div class="text-h6 mb-4">{{ loadError === 'notfound' ? $t('NotFound') : $t('err_fetching_resource') }}</div>
               <v-btn :to="{name: 'SearchPage'}" color="primary" variant="tonal">{{ $t('Recipes') }}</v-btn>
           </v-card>
        </v-defaults-provider>

    </v-container>

</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {ApiApi, ApiRecipeRetrieveRequest, Recipe, ViewLog} from "@/openapi";
import RecipeView from "@/components/display/RecipeView.vue";
import {useDisplay} from "vuetify";
import {useTitle, useUrlSearchParams} from "@vueuse/core";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import ImportTandoorDialog from "@/components/dialogs/ImportTandoorDialog.vue";

const props = defineProps({
    id: {type: String, required: true}
})

const params = useUrlSearchParams('history')
const {mobile} = useDisplay()
const title = useTitle()
const messageStore = useMessageStore()

const isShared = computed(() => {
    return params.share && typeof params.share == "string"
})

const servings = computed(() => {
    const value = params.servings
    if (!value) return undefined
    const parsed = parseInt(value as string, 10)
    return parsed > 0 ? parsed : undefined
})

const recipe = ref({} as Recipe)
const loadError = ref<null | 'notfound' | 'error'>(null)

watch(() => props.id, () => {
    refreshData(props.id)
})

onMounted(() => {
    refreshData(props.id)
})

function refreshData(recipeId: string) {
    const api = new ApiApi()
    recipe.value = {} as Recipe
    loadError.value = null

    let requestParameters: ApiRecipeRetrieveRequest = {id: props.id}
    if (isShared.value) {
        requestParameters.share = params.share
    }

    api.apiRecipeRetrieve(requestParameters).then(r => {
        recipe.value = r
        title.value = recipe.value.name

        setTimeout(() => {
            if (useUserPreferenceStore().isPrintMode) {
                window.print()
            }
        }, 500)

        if (useUserPreferenceStore().isAuthenticated) {
            api.apiViewLogCreate({viewLog: {recipe: Number(recipeId)} as ViewLog})
        }
    }).catch(err => {
        if (err.response.status == 403) {
            // TODO maybe redirect to login if fails with 403? or conflict with group/sapce system?
        } else if (err.response.status == 404) {
            loadError.value = 'notfound'
            messageStore.addPreparedMessage(PreparedMessage.NOT_FOUND)
        } else {
            loadError.value = 'error'
            messageStore.addError(ErrorMessageType.FETCH_ERROR, err)
        }
    })
}

</script>

<style scoped>

</style>