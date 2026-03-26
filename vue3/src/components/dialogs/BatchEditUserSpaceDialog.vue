<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title
                :title="$t('BatchEdit')"
                :sub-title="$t('BatchEditUpdatingItemsCount', {type: TUserSpace.localizationKey, count: updateItems.length})"
                :icon="TUserSpace.icon"
                v-model="dialog"
            ></v-closable-card-title>
            <v-divider></v-divider>

            <v-card-text>

                <v-form>
                    <v-row>

                        <v-col cols="12">


                                    <model-select model="Household" v-model="batchUpdateRequest.userSpaceBatchUpdate.household" :object="false" allow-create mode="single">
                                    </model-select>

                                    <model-select model="Group" v-model="batchUpdateRequest.userSpaceBatchUpdate.groupSet" :object="false" mode="tags">
                                        <template #prepend>
                                            <v-icon icon="fa-solid fa-equals"></v-icon>
                                        </template>
                                    </model-select>

                                    <v-spacer class="mt-10"></v-spacer>
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
import {EditorSupportedModels, EditorSupportedTypes, getGenericModelFromString, TFood, TKeyword, TRecipe, TUserSpace} from "@/types/Models.ts";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {useI18n} from "vue-i18n";
import {ApiApi, ApiFoodBatchUpdateUpdateRequest, ApiRecipeBatchUpdateUpdateRequest, ApiUserSpaceBatchUpdateUpdateRequest, Food, Recipe, RecipeOverview, UserSpace} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const emit = defineEmits(['change'])

const props = defineProps({
    items: {type: Array as PropType<Array<UserSpace>>, required: true},
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const updateItems = ref([] as UserSpace[])
const batchUpdateRequest = ref({userSpaceBatchUpdate: {}} as ApiUserSpaceBatchUpdateUpdateRequest)


/**
 * copy prop when dialog opens so that items remain when parent is updated after change is emitted
 */
watch(dialog, (newValue, oldValue) => {
    if (!oldValue && newValue && props.items != undefined) {
        batchUpdateRequest.value.userSpaceBatchUpdate.userSpaces = props.items.flatMap(r => r.id!)
        updateItems.value = JSON.parse(JSON.stringify(props.items))
    }
})

/**
 * perform batch request to update recipes
 */
function batchUpdateFoods() {
    let api = new ApiApi()
    loading.value = true

    api.apiUserSpaceBatchUpdateUpdate(batchUpdateRequest.value).then(r => {

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