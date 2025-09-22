<template>
    <v-dialog max-width="1200px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title
                :title="$t('BatchEdit')"
                :sub-title="$t('BatchEditUpdatingItemsCount', {type: $t('Foods'), count: updateItems.length})"
                :icon="TFood.icon"
                v-model="dialog"
            ></v-closable-card-title>
            <v-divider></v-divider>

            <v-card-text>

                <v-form>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card :title="$t('Miscellaneous')" prepend-icon="fa-solid fa-list" variant="flat">
                                <v-card-text>
                                    <model-select model="SupermarketCategory" v-model="batchUpdateRequest.foodBatchUpdate.category" :object="false" allow-create mode="single">
                                    </model-select>

                                    <v-select :items="boolUpdateOptions" :label="$t('Ignore_Shopping')" clearable v-model="batchUpdateRequest.foodBatchUpdate.ignoreShopping"></v-select>
                                    <v-select :items="boolUpdateOptions" :label="$t('OnHand')" clearable v-model="batchUpdateRequest.foodBatchUpdate.onHand"></v-select>

                                    <v-spacer></v-spacer>
                                    <v-label :text="$t('Substitutes')"></v-label>
                                    <model-select model="Food" v-model="batchUpdateRequest.foodBatchUpdate.substituteAdd" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-add"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="Food" v-model="batchUpdateRequest.foodBatchUpdate.substituteRemove" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-minus"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="Food" v-model="batchUpdateRequest.foodBatchUpdate.substituteSet" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>
                                    <v-checkbox :label="$t('RemoveAllType', {type: $t('Substitutes')})" hide-details
                                                v-model="batchUpdateRequest.foodBatchUpdate.substituteRemoveAll"></v-checkbox>

                                    <v-select :items="boolUpdateOptions" :label="$t('substitute_siblings')" clearable v-model="batchUpdateRequest.foodBatchUpdate.substituteChildren"></v-select>
                                    <v-select :items="boolUpdateOptions" :label="$t('substitute_children')" clearable v-model="batchUpdateRequest.foodBatchUpdate.substituteSiblings"></v-select>


                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-card :title="$t('Hierarchy')" prepend-icon="fa-solid fa-folder-tree" variant="flat">
                                <v-card-text>
                                    <model-select model="Food" :label="$t('Parent')" :object="false" allow-create clearable v-model="batchUpdateRequest.foodBatchUpdate.parentSet">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>

                                    <v-select :items="boolUpdateOptions" :label="$t('RemoveParent')" clearable v-model="batchUpdateRequest.foodBatchUpdate.parentRemove"></v-select>

                                    <v-spacer></v-spacer>

                                    <v-label :text="$t('InheritFields')"></v-label>
                                    <model-select model="FoodInheritField" v-model="batchUpdateRequest.foodBatchUpdate.inheritFieldsAdd" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-add"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="FoodInheritField" v-model="batchUpdateRequest.foodBatchUpdate.inheritFieldsRemove" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-minus"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="FoodInheritField" v-model="batchUpdateRequest.foodBatchUpdate.inheritFieldsSet" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>
                                    <v-checkbox :label="$t('RemoveAllType', {type: $t('InheritFields')})" hide-details
                                                v-model="batchUpdateRequest.foodBatchUpdate.inheritFieldsRemoveAll"></v-checkbox>


                                    <v-spacer></v-spacer>
                                    <v-label :text="$t('ChildInheritFields')"></v-label>

                                    <model-select model="FoodInheritField" v-model="batchUpdateRequest.foodBatchUpdate.childInheritFieldsAdd" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-add"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="FoodInheritField" v-model="batchUpdateRequest.foodBatchUpdate.childInheritFieldsRemove" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-minus"></v-icon>
                                        </template>
                                    </model-select>
                                    <model-select model="FoodInheritField" v-model="batchUpdateRequest.foodBatchUpdate.childInheritFieldsSet" :object="false" allow-create mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>
                                    <v-checkbox :label="$t('RemoveAllType', {type: $t('ChildInheritFields')})" hide-details
                                                v-model="batchUpdateRequest.foodBatchUpdate.childInheritFieldsRemoveAll"></v-checkbox>

                                </v-card-text>
                            </v-card>
                        </v-col>

                    </v-row>


                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn :disabled="loading" @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="warning" :loading="loading" @click="batchUpdateFoods()" :disabled="updateItems.length < 1">{{ $t('Update') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {EditorSupportedModels, EditorSupportedTypes, getGenericModelFromString, TFood, TKeyword, TRecipe} from "@/types/Models.ts";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {useI18n} from "vue-i18n";
import {ApiApi, ApiFoodBatchUpdateUpdateRequest, ApiRecipeBatchUpdateUpdateRequest, Food, Recipe, RecipeOverview} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const emit = defineEmits(['change'])

const props = defineProps({
    items: {type: Array as PropType<Array<Food>>, required: true},
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const updateItems = ref([] as Food[])
const batchUpdateRequest = ref({foodBatchUpdate: {}} as ApiFoodBatchUpdateUpdateRequest)

const boolUpdateOptions = ref([
    {value: true, title: t('Yes')},
    {value: false, title: t('No')},
])

/**
 * copy prop when dialog opens so that items remain when parent is updated after change is emitted
 */
watch(dialog, (newValue, oldValue) => {
    if (!oldValue && newValue && props.items != undefined) {
        batchUpdateRequest.value.foodBatchUpdate.foods = props.items.flatMap(r => r.id!)
        updateItems.value = JSON.parse(JSON.stringify(props.items))
    }
})

/**
 * perform batch request to update recipes
 */
function batchUpdateFoods() {
    let api = new ApiApi()
    loading.value = true

    api.apiFoodBatchUpdateUpdate(batchUpdateRequest.value).then(r => {

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