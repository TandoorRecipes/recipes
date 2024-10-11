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
                            <h3>{{ $t('AvailableCategories') }}
                                <v-btn class="float-right" color="create" prepend-icon="$create">{{ $t('New') }}
                                    <model-edit-dialog model="SupermarketCategory" @create="args => supermarketCategories.push(args)"></model-edit-dialog>
                                </v-btn>
                            </h3>

                            <draggable class="mt-4" tag="VList" v-model="unusedSupermarketCategories" handle=".drag-handle" item-key="id" group="categories"
                            >
                                <template #item="{element}">
                                    <v-list-item border :key="element.id">
                                        <template #prepend>
                                            <v-icon class="drag-handle cursor-grab" icon="$dragHandle"></v-icon>
                                        </template>
                                        {{ element.name }}
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
                                @add="addTest"
                                @remove="removeTest"
                            >
                                <template #item="{element}">
                                    <v-list-item border :key="element.id">
                                        <template #prepend>
                                            <v-icon class="drag-handle" icon="$dragHandle"></v-icon>
                                        </template>
                                        {{ element.name }}

                                        <template #append>
                                            <v-btn color="warning">
                                                <i class="fa-solid fa-link-slash"></i>
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

const supermarketCategories = ref([] as SupermarketCategory[])
const editingObjSupermarketCategories = ref([] as SupermarketCategory[])

const unusedSupermarketCategories = computed(() => {
    return supermarketCategories.value.filter(e => !editingObjSupermarketCategories.value.includes(e))
})

onMounted(() => {
    const api = new ApiApi()

    api.apiSupermarketCategoryList({pageSize: 100}).then(r => {
        supermarketCategories.value = r.results

        setupState(props.item, props.itemId, {
            existingItemFunction: () => {
                editingObj.value.categoryToSupermarket.forEach(cTS => {
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

function addTest(operation: any) {
    let api = new ApiApi()

    if (typeof operation.newIndex == "number" && editingObjSupermarketCategories.value.length >= operation.newIndex) {
        let sC = {
            category: editingObjSupermarketCategories.value[operation.newIndex],
            order: operation.newIndex,
            supermarket: editingObj.value.id,
        } as SupermarketCategoryRelation

        api.apiSupermarketCategoryRelationCreate({supermarketCategoryRelation: sC}).then(r => {

        }).catch((err: any) => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    }
}

function removeTest(operation: any) {
    console.log('remove', operation)
}

</script>

<style scoped>

</style>