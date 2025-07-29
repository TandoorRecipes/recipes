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
                <v-tab value="food">{{ $t('Food') }}</v-tab>
                <v-tab value="properties">{{ $t('Properties') }}</v-tab>
            </v-tabs>
        </v-card-text>

        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="food">
                    <v-form :disabled="loading">
                        <v-number-input :label="$t('FDC_ID')" v-model="editingObj.fdcId" :precision="0" control-variant="hidden" clearable>
                            <template #append-inner>
                                <v-btn icon="$search" size="small" density="compact" variant="plain" v-if="editingObj.fdcId == undefined"
                                       @click="fdcDialog = true"></v-btn>
                                <v-btn @click="updateFoodFdcData()" icon="fa-solid fa-arrows-rotate" size="small" density="compact" variant="plain"
                                       v-if="editingObj.fdcId"></v-btn>
                                <v-btn @click="openFdcPage(editingObj.fdcId)" :href="`https://fdc.nal.usda.gov/food-details/${editingObj.fdcId}/nutrients`" target="_blank"
                                       icon="fa-solid fa-arrow-up-right-from-square"
                                       size="small" variant="plain" v-if="editingObj.fdcId"></v-btn>
                            </template>

                        </v-number-input>

                        <model-select model="OpenDataVersion" v-model="editingObj.version"></model-select>
                        <v-text-field :label="$t('Open_Data_Slug')" v-model="editingObj.slug"></v-text-field>
                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                        <v-text-field :label="$t('Plural')" v-model="editingObj.pluralName"></v-text-field>
                        <model-select model="OpenDataCategory" v-model="editingObj.storeCategory"></model-select>

                        <v-textarea :label="$t('Comment')" v-model="editingObj.comment"></v-textarea>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="properties">
                    <v-form :disabled="loading" class="mt-5">
                        <v-number-input :label="$t('Properties_Food_Amount')" v-model="editingObj.propertiesFoodAmount" :precision="2"></v-number-input>
                        <model-select v-model="editingObj.propertiesFoodUnit" model="OpenDataUnit"></model-select>

                        <v-row dense v-for="p in editingObj.properties">
                            <v-col>
                                <model-select model="OpenDataProperty" v-model="p.property" hide-details></model-select>
                            </v-col>
                            <v-col>
                                <v-number-input v-model="p.propertyAmount" hide-details>
                                    <template #append>
                                        <v-btn icon="$delete" color="delete" @click="editingObj.properties?.splice(editingObj.properties?.indexOf(p),1)"></v-btn>
                                    </template>
                                </v-number-input>
                            </v-col>
                        </v-row>
                        <v-btn prepend-icon="$create" color="create" class="mt-2 mb-2" @click="editingObj.properties?.push({property: null, propertyAmount: 0})">{{$t('Add')}}</v-btn>

                        <v-textarea :label="$t('Source')" v-model="editingObj.propertiesSource" rows="1" auto-grow></v-textarea>
                    </v-form>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>

        <fdc-search-dialog v-model="fdcDialog"
                           @selected="(fdcId:number) => {editingObj.fdcId = fdcId;}"></fdc-search-dialog>
    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, OpenDataFood} from "@/openapi";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {openFdcPage} from "@/utils/fdc.ts";
import PropertiesEditor from "@/components/inputs/PropertiesEditor.vue";
import FdcSearchDialog from "@/components/dialogs/FdcSearchDialog.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const props = defineProps({
    item: {type: {} as PropType<OpenDataFood>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    itemDefaults: {type: {} as PropType<OpenDataFood>, required: false, default: {} as OpenDataFood},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close', 'changedState'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, editingObjChanged, modelClass} = useModelEditorFunctions<OpenDataFood>('OpenDataFood', emit)

/**
 * watch prop changes and re-initialize editor
 * required to embed editor directly into pages and be able to change item from the outside
 */
watch([() => props.item, () => props.itemId], () => {
    initializeEditor()
})

// object specific data (for selects/display)

const tab = ref("food")
const fdcDialog = ref(false)

onMounted(() => {
    initializeEditor()
})

/**
 * component specific state setup logic
 */
function initializeEditor() {
    setupState(props.item, props.itemId, {itemDefaults: props.itemDefaults})
}

/**
 * Update the food FDC data on the server and update the editing object
 */
function updateFoodFdcData() {
    let api = new ApiApi()
    if (editingObj.value.fdcId) {
        saveObject().then(() => {

            loading.value = true
            api.apiOpenDataFoodFdcCreate({openDataFood: editingObj.value, id: editingObj.value.id}).then(r => {
                editingObj.value = r
            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }).finally(() => {
                loading.value = false
                editingObjChanged.value = false
            })
        })
    }
}

</script>

<style scoped>

</style>