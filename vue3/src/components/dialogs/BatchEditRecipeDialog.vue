<template>
    <v-dialog max-width="1200px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title
                :title="$t('BatchEdit')"
                :sub-title="$t('BatchEditUpdatingItemsCount', {type: $t('Recipes'), count: updateItems.length})"
                :icon="TRecipe.icon"
                v-model="dialog"
            ></v-closable-card-title>
            <v-divider></v-divider>

            <v-card-text>

                <v-form>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card :title="$t('Keywords')" :prepend-icon="TKeyword.icon" variant="plain">
                                <v-card-text>
                                    <model-select model="Keyword" v-model="batchUpdateRequest.recipeBatchUpdate.keywordsAdd" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-add"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="Keyword" v-model="batchUpdateRequest.recipeBatchUpdate.keywordsRemove" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-minus"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="Keyword" v-model="batchUpdateRequest.recipeBatchUpdate.keywordsSet" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>
                                    <v-checkbox :label="$t('RemoveAllType', {type: $t('Keywords')})" hide-details v-model="batchUpdateRequest.recipeBatchUpdate.keywordsRemoveAll"></v-checkbox>
                                </v-card-text>
                            </v-card>

                              <v-card :title="$t('Private_Recipe')" :subtitle="$t('Private_Recipe_Help')" prepend-icon="fa-solid fa-eye-slash" variant="plain">
                                <v-card-text>

                                    <v-select :items="boolUpdateOptions" :label="$t('Private_Recipe')" clearable v-model="batchUpdateRequest.recipeBatchUpdate._private"></v-select>

                                    <model-select model="User" v-model="batchUpdateRequest.recipeBatchUpdate.sharedAdd" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-add"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="User" v-model="batchUpdateRequest.recipeBatchUpdate.sharedRemove" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-minus"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="User" v-model="batchUpdateRequest.recipeBatchUpdate.sharedSet" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>
                                    <v-checkbox :label="$t('RemoveAllType', {type: $t('Users')})" hide-details v-model="batchUpdateRequest.recipeBatchUpdate.sharedRemoveAll"></v-checkbox>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card :title="$t('Miscellaneous')" prepend-icon="fa-solid fa-list" variant="plain">
                                <v-card-text>
                                    <v-number-input :label="$t('WorkingTime')" v-model="batchUpdateRequest.recipeBatchUpdate.workingTime" :step="5">

                                    </v-number-input>
                                    <v-number-input :label="$t('WaitingTime')" v-model="batchUpdateRequest.recipeBatchUpdate.waitingTime" :step="5">

                                    </v-number-input>
                                    <v-number-input :label="$t('Serving')" v-model="batchUpdateRequest.recipeBatchUpdate.servings">

                                    </v-number-input>
                                    <v-text-field :label="$t('ServingsText')" v-model="batchUpdateRequest.recipeBatchUpdate.servingsText" @update:model-value="updateServings = true">
                                        <template #append>
                                            <v-checkbox v-model="updateServings" hide-details></v-checkbox>
                                        </template>
                                    </v-text-field>
                                    <v-select :items="boolUpdateOptions" :label="$t('show_ingredient_overview')" clearable v-model="batchUpdateRequest.recipeBatchUpdate.showIngredientOverview"></v-select>
                                    <v-checkbox hide-details :label="$t('DeleteSomething', {item: $t('Description')})" v-model="batchUpdateRequest.recipeBatchUpdate.clearDescription"></v-checkbox>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>


                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn :disabled="loading" @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="warning" :loading="loading" @click="batchUpdateRecipes()" :disabled="updateItems.length < 1">{{ $t('Update') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {EditorSupportedModels, EditorSupportedTypes, getGenericModelFromString, TKeyword, TRecipe} from "@/types/Models.ts";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {useI18n} from "vue-i18n";
import {ApiApi, ApiRecipeBatchUpdateUpdateRequest, Recipe, RecipeOverview} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const emit = defineEmits(['change'])

const props = defineProps({
    items: {type: Array as PropType<Array<RecipeOverview>>, required: true},
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const updateItems = ref([] as RecipeOverview[])
const batchUpdateRequest = ref({recipeBatchUpdate: {servingsText: ''}} as ApiRecipeBatchUpdateUpdateRequest)

const updateServings = ref(false)

const boolUpdateOptions = ref([
    {value: true, title: t('Yes')},
    {value: false, title: t('No')},
])

/**
 * copy prop when dialog opens so that items remain when parent is updated after change is emitted
 */
watch(dialog, (newValue, oldValue) => {
    if (!oldValue && newValue && props.items != undefined) {
        batchUpdateRequest.value.recipeBatchUpdate.recipes = props.items.flatMap(r => r.id!)
        updateItems.value = JSON.parse(JSON.stringify(props.items))
    }
})

/**
 * perform batch request to update recipes
 */
function batchUpdateRecipes() {
    let api = new ApiApi()
    loading.value = true

    // prevent accidentally clearing the field with extra checkbox
    if (!updateServings.value) {
        batchUpdateRequest.value.recipeBatchUpdate.servingsText = undefined
    }

    api.apiRecipeBatchUpdateUpdate(batchUpdateRequest.value).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        emit('change')
        loading.value = false
    })
}

</script>


<style scoped>

</style>