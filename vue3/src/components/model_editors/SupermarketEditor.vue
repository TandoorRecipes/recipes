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
        :object-name="editingObjName()"
        :editing-object="editingObj">

        <v-card-text class="pa-0">
            <v-tabs v-model="tab" :disabled="loading" grow>
                <v-tab value="supermarket">{{ $t('Supermarket') }}</v-tab>
                <v-tab value="categories" :disabled="!isUpdate()">{{ $t('Categories') }}</v-tab>
            </v-tabs>
        </v-card-text>

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

                            <vue-draggable class="mt-4" v-model="availableCategories" handle=".drag-handle" group="categories"
                            >
                                    <v-list-item v-for="element in availableCategories" :key="element.category.id" border>
                                        <template #prepend>
                                            <v-icon class="drag-handle cursor-grab" icon="$dragHandle"></v-icon>
                                        </template>
                                        {{ element.category.name }}
                                        <template #append>
                                            <v-btn color="create" size="small" @click="addCategoryRelation(element)">
                                                <i class="fa-solid fa-plus"></i>
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                            </vue-draggable>
                            <v-list-item class="cursor-pointer" border prepend-icon="$create" variant="tonal" base-color="create">
                                {{ $t('New_Supermarket_Category') }}
                                <model-edit-dialog model="SupermarketCategory"
                                                   @create="(args: SupermarketCategory) => supermarketCategories.push(args)"></model-edit-dialog>
                            </v-list-item>

                        </v-col>
                        <v-col cols="12" md="6">
                            <h3> {{ $t('SelectedCategories') }} </h3>
                            <vue-draggable
                                v-model="editingObjectSupermarketCategoriesRelations"
                                handle=".drag-handle" group="categories"
                                :empty-insert-threshold="20"
                                :on-sort="() => sortCategoryRelations()"
                                :on-add="onCategoryAdded"
                                :on-remove="onCategoryRemoved"
                            >
                                    <v-list-item v-for="element in editingObjectSupermarketCategoriesRelations" :key="element.category.id" border>
                                        <template #prepend>
                                            <v-icon class="drag-handle cursor-grab" icon="$dragHandle"></v-icon>
                                        </template>
                                        {{ element.category.name }}
                                        <v-chip>{{ element.order }}</v-chip>

                                        <template #append>
                                            <v-btn color="warning" size="small" @click="removeCategoryRelation(element)">
                                                <i class="fa-solid fa-minus"></i>
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                            </vue-draggable>
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

import {computed, onMounted, PropType, ref, watch} from "vue";
import {ApiApi, Supermarket, SupermarketCategory, SupermarketCategoryRelation} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {VueDraggable} from "vue-draggable-plus";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const props = defineProps({
    item: {type: {} as PropType<Supermarket>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<Supermarket>, required: false, default: {} as Supermarket},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<Supermarket>('Supermarket', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)
const tab = ref("supermarket")

// all available supermarket categories
const supermarketCategories = ref([] as SupermarketCategory[])

// all relations existing on the editing obj (internal datastructure, UI works with computed/manual list of categories)
const editingObjectSupermarketCategoriesRelations = ref([] as SupermarketCategoryRelation[])


// variable to prevent sorting while some other operation is currently running that would conflict / would make sorting unnecessary (e.g. adding item)
const preventSort = ref(false)

// available categories as a ref (not computed) so vue-draggable-plus can mutate it during drag
const availableCategories = ref([] as SupermarketCategoryRelation[])

/**
 * Recompute available categories whenever the source data changes.
 * This replaces the old computed property with a writable ref that
 * vue-draggable-plus can bind to via v-model.
 */
function updateAvailableCategories() {
    availableCategories.value = supermarketCategories.value
        .filter(sc => editingObjectSupermarketCategoriesRelations.value.findIndex(e => e.category.id == sc.id) == -1)
        .map(sc => ({supermarket: editingObj.value.id, category: sc, order: 0} as SupermarketCategoryRelation))
}

watch([supermarketCategories, editingObjectSupermarketCategoriesRelations], updateAvailableCategories, {deep: true})

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor(){
    const api = new ApiApi()

    api.apiSupermarketCategoryList({pageSize: 100}).then(r => {
        supermarketCategories.value = r.results

        setupState(props.item, props.itemId, {
            existingItemFunction: () => {
                // initialize list of supermarket category relations
                editingObjectSupermarketCategoriesRelations.value = editingObj.value.categoryToSupermarket
            },
            itemDefaults: props.itemDefaults,
        })
    })
}

/**
 * Called when an item is dragged into the selected list.
 * vue-draggable-plus already spliced the item into editingObjectSupermarketCategoriesRelations,
 * so we just need to persist it to the server.
 */
function onCategoryAdded(evt: any) {
    const sCR = editingObjectSupermarketCategoriesRelations.value[evt.newIndex]
    if (sCR) {
        addCategoryRelation(sCR)
    }
}

/**
 * Called when an item is dragged out of the selected list.
 * vue-draggable-plus already removed it from editingObjectSupermarketCategoriesRelations,
 * so we just need to delete it from the server.
 */
function onCategoryRemoved(evt: any) {
    // The item was already removed from the array by vue-draggable-plus.
    // We need to find it in the available list where it was moved to.
    const sCR = availableCategories.value[evt.newIndex]
    if (sCR) {
        removeCategoryRelation(sCR)
    }
}

function sortCategoryRelations(startIndex: number = 0) {
    const api = new ApiApi()
    console.log('sort called start index: ', startIndex)

    if (!preventSort.value) {
        editingObjectSupermarketCategoriesRelations.value.forEach((sc, index) => {
            if (index >= startIndex) {
                if (index == 0) {
                    sc.order = 0
                } else {
                    sc.order = editingObjectSupermarketCategoriesRelations.value[index - 1].order! + 1
                }
                api.apiSupermarketCategoryRelationUpdate({id: sc.id!, supermarketCategoryRelation: sc}).catch((err: any) => {
                    useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
                })
            }
        })
    }
}

/**
 * add category relation to client list (if not already done by draggable) and to the server
 * if required re-order existing client items so newly inserted items stays at correct order
 * @param sCR SupermarketCategoryRelation to add
 */
function addCategoryRelation(sCR: SupermarketCategoryRelation) {
    let api = new ApiApi()

    preventSort.value = true

    let relationIndex = editingObjectSupermarketCategoriesRelations.value.findIndex(e => e.category.id == sCR.category.id)
    if (relationIndex != -1) {
        if (relationIndex != 0 && editingObjectSupermarketCategoriesRelations.value[relationIndex - 1]) {
            sCR.order = editingObjectSupermarketCategoriesRelations.value[relationIndex - 1].order! + 1
        } else {
            sCR.order = 0
        }
    } else if (editingObjectSupermarketCategoriesRelations.value.length > 0) {
        // item will be added last to list so give it the highest order
        sCR.order = editingObjectSupermarketCategoriesRelations.value[editingObjectSupermarketCategoriesRelations.value.length - 1].order! + 1
    }

    api.apiSupermarketCategoryRelationCreate({supermarketCategoryRelation: sCR}).then(r => {

        // add to / update in client list
        if (relationIndex != -1) {
            // replace with sCR from API response
            editingObjectSupermarketCategoriesRelations.value.splice(relationIndex, 1, r)
        } else {
            // add new to end of the list
            editingObjectSupermarketCategoriesRelations.value.push(r)
        }

        preventSort.value = false
        sortCategoryRelations(relationIndex)
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        preventSort.value = false
    })
}

/**
 * remove SupermarketCategoryRelation from client list (if not already done by draggable) and from server
 * @param sCR SupermarketCategoryRelation to remove
 */
function removeCategoryRelation(sCR: SupermarketCategoryRelation) {
    let api = new ApiApi()

    // remove from client list
    let relationIndex = editingObjectSupermarketCategoriesRelations.value.findIndex(e => e.category.id == sCR.category.id)
    if (relationIndex != -1) {
        editingObjectSupermarketCategoriesRelations.value.splice(relationIndex, 1)
    }

    // delete on server if ID is present (should always be)
    if (sCR.id) {
        api.apiSupermarketCategoryRelationDestroy({id: sCR.id}).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }
}

</script>

<style scoped>

</style>
