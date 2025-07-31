<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close'); editingObjChanged = false"
        :is-update="isUpdate()"
        :is-changed="editingObjChanged"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-card-text class="pa-0">
            <v-tabs v-model="tab" :disabled="loading" grow>
                <v-tab value="book">{{ $t('Book') }}</v-tab>
                <v-tab value="recipes" :disabled="!isUpdate()">{{ $t('Recipes') }}</v-tab>
            </v-tabs>
        </v-card-text>

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
                            <v-btn icon color="create" @click="addRecipeToBook()">
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
                        <template #item.action="{item}">
                            <v-btn icon="$delete" color="delete" @click="removeRecipeFromBook(item)"></v-btn>
                        </template>

                    </v-data-table-server>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </model-editor-base>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, Recipe, RecipeBook, RecipeBookEntry, User} from "@/openapi";
import {VDataTableUpdateOptions} from "@/vuetify";

import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ErrorMessageType, MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useI18n} from "vue-i18n";

const props = defineProps({
    item: {type: {} as PropType<RecipeBook>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<RecipeBook>, required: false, default: {} as RecipeBook},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<RecipeBook>('RecipeBook', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

const {t} = useI18n()
const tab = ref("book")
const recipeBookEntries = ref([] as RecipeBookEntry[])

const selectedRecipe = ref({} as Recipe)

const tablePage = ref(1)
const itemCount = ref(0)

const tableHeaders = [
    {title: t('Name'), key: 'recipeContent.name',},
    {key: 'action', width: '1%', noBreak: true, align: 'end'},
]

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor() {
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.shared = [] as User[]
            recipeBookEntries.value = []
        },
        existingItemFunction: () => {
            recipeBookEntries.value = []
        },
        itemDefaults: props.itemDefaults
    })
}

/**
 * add selected recipe into the book and client list
 */
function addRecipeToBook() {
    let api = new ApiApi()

    if (Object.keys(selectedRecipe.value).length > 0) {
        let duplicateFound = false

        recipeBookEntries.value.forEach(rBE => {
            if (rBE.recipe == selectedRecipe.value.id) {
                duplicateFound = true
            }
        })

        if (!duplicateFound) {
            api.apiRecipeBookEntryCreate({recipeBookEntry: {book: editingObj.value.id!, recipe: selectedRecipe.value.id!}}).then(r => {
                recipeBookEntries.value.push(r)
                selectedRecipe.value = {} as Recipe
            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            })
        } else {
            selectedRecipe.value = {} as Recipe
            useMessageStore().addMessage(MessageType.WARNING, $t('WarningRecipeBookEntryDuplicate'), 5000)
        }
    }
}

/**
 * remove the given entry from the book both in the database and on the frontend
 * @param recipeBookEntry
 */
function removeRecipeFromBook(recipeBookEntry: RecipeBookEntry) {
    let api = new ApiApi()

    api.apiRecipeBookEntryDestroy({id: recipeBookEntry.id!}).then((r) => {
        recipeBookEntries.value.splice(recipeBookEntries.value.findIndex(rBE => rBE.id! == recipeBookEntry.id!), 1)
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
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

    api.apiRecipeBookEntryList({page: options.page, pageSize: options.itemsPerPage, book: editingObj.value.id}).then((r: any) => {
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