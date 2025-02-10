<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-tabs v-model="tab" :disabled="loading" grow>
            <v-tab value="book">{{ $t('Book') }}</v-tab>
            <v-tab value="recipes" :disabled="!isUpdate()">{{ $t('Recipes') }}</v-tab>
        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="tab">

                <v-tabs-window-item value="book">

                    <v-form :disabled="loading">
                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                        <v-textarea :label="$t('Description')" v-model="editingObj.description" rows="3"></v-textarea>
                        <model-select model="User" v-model="editingObj.shared" mode="tags"></model-select>
                        <model-select model="CustomFilter" v-model="editingObj.filter"></model-select>
                        <v-number-input :label="$t('Order')" :hint="$t('OrderInformation')" v-model="editingObj.order"></v-number-input>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="recipes">
                    <model-select model="Recipe" v-model="selectedRecipe">
                        <template #append>
                            <v-btn @click="addRecipeToBook()">
                                <v-icon icon="$create"></v-icon>
                            </v-btn>
                        </template>
                    </model-select>
                    <v-data-table-server
                        @update:options="loadRecipeBookEntries"
                        :items="recipeBookEntries"
                        :headers="tableHeaders"
                        :items-length="itemCount"
                    >

                    </v-data-table-server>
                </v-tabs-window-item>
            </v-tabs-window>


        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">

import {VNumberInput} from 'vuetify/labs/VNumberInput'
import {onMounted, PropType, ref} from "vue";
import {ApiApi, Recipe, RecipeBook, RecipeBookEntry, User} from "@/openapi";
import {VDataTableUpdateOptions} from "@/vuetify";

import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useI18n} from "vue-i18n";

const props = defineProps({
    item: {type: {} as PropType<RecipeBook>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<RecipeBook>('RecipeBook', emit)

const {t} = useI18n()
const tab = ref("book")
const recipeBookEntries = ref([] as RecipeBookEntry[])

const selectedRecipe = ref({} as Recipe)

const tablePage = ref(1)
const itemCount = ref(0)

const tableHeaders = [
    {title: t('Name'), key: 'recipeContent.name', },
    {key: 'action', width: '1%', noBreak: true, align: 'end'},
]

onMounted(() => {
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.shared = [] as User[]
            recipeBookEntries.value = []
        },
        existingItemFunction: () => {
            recipeBookEntries.value = []
        }
    })
})

function addRecipeToBook() {
    let api = new ApiApi()
    // TODO check both for null, handle errors

    api.apiRecipeBookEntryCreate({recipeBookEntry: {book: editingObj.value.id!, recipe: selectedRecipe.value.id!}}).then(r => {
        recipeBookEntries.value.push(r) // TODO or reload ?
        selectedRecipe.value = {} as Recipe
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}


/**
 * load items from API whenever the table calls for it
 * parameters defined by vuetify
 * @param options
 */
function loadRecipeBookEntries(options: VDataTableUpdateOptions) {
    let api = new ApiApi()

    loading.value = true
    window.scrollTo({top: 0, behavior: 'smooth'})

    if (tablePage.value != options.page) {
        tablePage.value = options.page
    }

    useUserPreferenceStore().deviceSettings.general_tableItemsPerPage = options.itemsPerPage

    api.apiRecipeBookEntryList({page: options.page, pageSize: options.itemsPerPage,}).then((r: any) => {
        recipeBookEntries.value = r.results
        itemCount.value = r.count
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>