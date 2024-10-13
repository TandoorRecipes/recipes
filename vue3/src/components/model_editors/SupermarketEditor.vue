<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-tabs v-model="tab" :disabled="loading" grow>
            <v-tab value="supermarket">{{ $t('Supermarket') }}</v-tab>
            <v-tab value="categories">{{ $t('Categories') }}</v-tab>
        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="supermarket">
                    <v-form :disabled="loading">
                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                        <v-textarea :label="$t('Description')" v-model="editingObj.description"></v-textarea>
                        <v-text-field :label="$t('Open_Data_Slug')" :hint="$t('open_data_help_text')" persistent-hint v-model="editingObj.openDataSlug" disabled></v-text-field>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="categories">
                    <v-row>
                        <v-col cols="0" md="6">
                            <h3>{{ $t('AvailableCategories') }}</h3>

                            <draggable class="mt-4" tag="VList" v-model="unusedSupermarketCategories" handle=".drag-handle" item-key="id" group="categories"
                                       :move="trackMovedItem"
                            >
                                <template #item="{element}">
                                    <v-list-item border :key="element.id">
                                        <template #prepend>
                                            <v-icon class="drag-handle cursor-grab" icon="$dragHandle"></v-icon>
                                        </template>
                                        {{ element.name }}
                                        <template #append>
                                            <v-btn color="create" size="small" @click="addCategory(element)">
                                                <i class="fa-solid fa-plus"></i>
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                                </template>
                                <template #footer>
                                    <v-list-item class="cursor-pointer" border prepend-icon="$create" variant="tonal" base-color="create">
                                        {{ $t('New_Supermarket_Category') }}
                                        <model-edit-dialog model="SupermarketCategory" @create="args => supermarketCategories.push(args)"></model-edit-dialog>
                                    </v-list-item>
                                </template>
                            </draggable>

                        </v-col>
                        <v-col cols="12" md="6">
                            <h3> {{ $t('SelectedCategories') }} </h3>
                            <draggable
                                tag="VList"
                                v-model="editingObjSupermarketCategories"
                                handle=".drag-handle" item-key="id" group="categories"
                                :empty-insert-threshold="20"
                                @sort="updateEditingObjectSupermarketCategoryRelation"
                                :move="trackMovedItem"
                                @add="addCategory(lastMovedCategory)"
                                @remove="removeCategory(lastMovedCategory)"
                            >
                                <template #item="{element}">
                                    <v-list-item border :key="element.id">
                                        <template #prepend>
                                            <v-icon class="drag-handle" icon="$dragHandle"></v-icon>
                                        </template>
                                        {{ element.name }}

                                        <template #append>
                                            <v-btn color="warning" size="small" @click="removeCategory(element)">
                                                <i class="fa-solid fa-minus"></i>
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                                </template>
                            </draggable>
                            <v-list class="mt-4">

                            </v-list>
                        </v-col>
                    </v-row>


                </v-tabs-window-item>
            </v-tabs-window>

        </v-card-text>
    </model-editor-base>

</template>

<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import {ApiApi, Supermarket, SupermarketCategory, SupermarketCategoryRelation} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import draggable from "vuedraggable";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    item: {type: {} as PropType<Supermarket>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<Supermarket>('Supermarket', emit)

// object specific data (for selects/display)
const tab = ref("categories")

// all available supermarket categories
const supermarketCategories = ref([] as SupermarketCategory[])

// all relations existing on the editing obj (internal datastructure, UI works with computed/manual list of categories)
const editingObjectSupermarketCategoriesRelations = ref([] as SupermarketCategoryRelation[])

// categories used by the selected supermarket
const editingObjSupermarketCategories = ref([] as SupermarketCategory[])

// track the last moved item in the draggable list to use in add/remove functions
const lastMovedCategory = ref({} as SupermarketCategory)

// computed: categories not yet used in editing supermarket
const unusedSupermarketCategories = computed(() => {
    return supermarketCategories.value.filter(e => editingObjSupermarketCategories.value.findIndex(sc => sc.id == e.id) == -1)
})

onMounted(() => {
    const api = new ApiApi()

    api.apiSupermarketCategoryList({pageSize: 100}).then(r => {
        supermarketCategories.value = r.results

        setupState(props.item, props.itemId, {
            existingItemFunction: () => {
                // initialize list of supermarket category relations
                editingObjectSupermarketCategoriesRelations.value = editingObj.value.categoryToSupermarket

                // load categories from relation list
                editingObjectSupermarketCategoriesRelations.value.forEach(cTS => {
                    editingObjSupermarketCategories.value.push(cTS.category)
                })
            }
        })
    })
})

function updateEditingObjectSupermarketCategoryRelation(operation: any) {
    if (operation.to == operation.from) {
        console.log('sort', operation)
    }
}

/**
 * called whenever something in the list is moved to track the last moved element (to be used in add/remove functions)
 * @param operation
 */
function trackMovedItem(operation: any) {
    lastMovedCategory.value = operation.draggedContext.element
    console.log('LAST MOVED', lastMovedCategory.value)
}

/**
 * create supermarket category relation from given category and save it
 * @param sc SupermarketCategory to create relation from
 */
function addCategory(sc: SupermarketCategory) {
    let api = new ApiApi()

    let sC = {
        category: sc,
        order: editingObjSupermarketCategories.value.length + 1,
        supermarket: editingObj.value.id,
    } as SupermarketCategoryRelation

    api.apiSupermarketCategoryRelationCreate({supermarketCategoryRelation: sC}).then(r => {
        editingObjectSupermarketCategoriesRelations.value.push(r)

        // if the category has not been added already (by draggable) add it to the end of the list
        if(editingObjSupermarketCategories.value.findIndex(e => e.id == sc.id) == -1){
            editingObjSupermarketCategories.value.push(sc)
        }
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })

}

/**
 * remove category from supermarket category relation
 * finds relation by looking through relation list for given category
 * @param sc SupermarketCategory to remove from relation
 */
function removeCategory(sc: SupermarketCategory) {
    let api = new ApiApi()

    // find relation and delete it / remove it from frontend list
    let relationIndex = editingObjectSupermarketCategoriesRelations.value.findIndex(e => e.category.id == sc.id)
    if (relationIndex > -1) {
        api.apiSupermarketCategoryRelationDestroy({id: editingObjectSupermarketCategoriesRelations.value[relationIndex].id!}).then(r => {
            editingObjectSupermarketCategoriesRelations.value.splice(relationIndex, 1)

            // remove category from list (might have already been done by draggable)
            editingObjSupermarketCategories.value = editingObjSupermarketCategories.value.filter(e => e.id != sc.id)
        }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }

}

</script>

<style scoped>

</style>