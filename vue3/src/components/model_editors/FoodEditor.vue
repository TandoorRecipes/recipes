<template>
    <model-editor-base
        :loading="loading"
        :dialog="dialog"
        @save="saveObject(); saveObjectConversions()"
        @delete="deleteObject"
        @close="emit('close')"
        :is-update="isUpdate()"
        :model-class="modelClass"
        :object-name="editingObjName()">

        <v-tabs v-model="tab" :disabled="loading" grow>
            <v-tab value="food">{{ $t('Food') }}</v-tab>
            <v-tab value="properties">{{ $t('Properties') }}</v-tab>
            <v-tab value="conversions">{{ $t('Conversion') }}</v-tab>
            <v-tab value="misc">{{ $t('Miscellaneous') }}</v-tab>
        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="food">
                    <v-form :disabled="loading">
                        <v-text-field :label="$t('Name')" v-model="editingObj.name"></v-text-field>
                        <v-text-field :label="$t('Plural')" v-model="editingObj.pluralName"></v-text-field>
                        <v-textarea :label="$t('Description')" v-model="editingObj.description"></v-textarea>
                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                        <model-select :label="$t('Category')" v-model="editingObj.supermarketCategory" model="SupermarketCategory"></model-select>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="properties">
                    <v-alert icon="$help">{{ $t('PropertiesFoodHelp') }}</v-alert>
                    <v-form :disabled="loading" class="mt-5">
                        <v-number-input :label="$t('Properties_Food_Amount')" v-model="editingObj.propertiesFoodAmount"></v-number-input>
                        <model-select :label="$t('Properties_Food_Unit')" v-model="editingObj.propertiesFoodUnit" model="Unit"></model-select>

                        <v-btn-group density="compact">
                            <v-btn color="create" @click="editingObj.properties.push({} as Property)" prepend-icon="$create">{{ $t('Add') }}</v-btn>
                            <v-btn color="secondary" @click="addAllProperties" prepend-icon="fa-solid fa-list">{{ $t('AddAll') }}</v-btn>
                        </v-btn-group>

                        <v-row class="d-none d-md-flex mt-2" v-for="p in editingObj.properties" dense>
                            <v-col cols="0" md="5">
                                <v-number-input :step="10" v-model="p.propertyAmount" control-variant="stacked">
                                    <template #append-inner v-if="p.propertyType">
                                        <v-chip class="me-4">{{ p.propertyType.unit }} / {{ editingObj.propertiesFoodAmount }} <span v-if="editingObj.propertiesFoodUnit">&nbsp;{{
                                                editingObj.propertiesFoodUnit.name
                                            }}</span>
                                        </v-chip>
                                    </template>
                                </v-number-input>
                            </v-col>
                            <v-col cols="0" md="6">
                                <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                                <model-select :label="$t('Property')" v-model="p.propertyType" model="PropertyType"></model-select>
                            </v-col>
                            <v-col cols="0" md="1">
                                <v-btn color="delete" @click="deleteFoodProperty(p)">
                                    <v-icon icon="$delete"></v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-list class="d-md-none">
                            <v-list-item v-for="p in editingObj.properties" border>
                                <span v-if="p.propertyType">{{ p.propertyAmount }} {{ p.propertyType.unit }} {{ p.propertyType.name }}
                                    <span v-if="editingObj.propertiesFoodUnit"> / {{ editingObj.propertiesFoodAmount }} {{ editingObj.propertiesFoodUnit.name }}</span>
                                </span>
                                <span v-else><i><{{ $t('New') }}></i></span>
                                <template #append>
                                    <v-btn color="edit">
                                        <v-icon icon="$edit"></v-icon>
                                        <model-edit-dialog model="Property" :item="p"></model-edit-dialog>
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="conversions">
                    <v-alert icon="$help">{{ $t('ConversionsHelp') }}</v-alert>
                    <v-form :disabled="loading" class="mt-5">

                        <v-btn color="create" @click="unitConversions.push({food: editingObj} as UnitConversion)" prepend-icon="$create">{{ $t('Add') }}</v-btn>

                        <v-card class="mt-2" border v-for="uc in unitConversions" dense>
                            <v-card-title>
                                <span v-if="uc.baseUnit">{{ uc.baseAmount }} {{ uc.baseUnit.name }}</span>
                                <v-icon size="x-small" icon="fa-solid fa-arrows-left-right" class="me-2 ms-2"></v-icon>
                                <span v-if="uc.convertedUnit">{{ uc.convertedAmount }} {{ uc.convertedUnit.name }}</span>
                                <v-btn color="delete" class="float-right d-none d-md-block" @click="deleteUnitConversion(uc, true)">
                                    <v-icon icon="$delete"></v-icon>
                                </v-btn>
                                <v-btn color="edit" class="float-right d-md-none">
                                    <v-icon icon="$edit"></v-icon>
                                    <model-edit-dialog model="UnitConversion" :item="uc" @delete="deleteUnitConversion(uc, false)" :disabled-fields="['food']"></model-edit-dialog>
                                </v-btn>
                            </v-card-title>
                            <v-card-text class="d-none d-md-block">
                                <v-row>
                                    <v-col md="6">
                                        <v-number-input :label="$t('Amount')" :step="10" v-model="uc.baseAmount" control-variant="stacked"></v-number-input>
                                    </v-col>
                                    <v-col md="6">
                                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                                        <model-select :label="$t('Unit')" v-model="uc.baseUnit" model="Unit"></model-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col md="6">
                                        <v-number-input :label="$t('Amount')" :step="10" v-model="uc.convertedAmount" control-variant="stacked"></v-number-input>
                                    </v-col>
                                    <v-col md="6">
                                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                                        <model-select :label="$t('Unit')" v-model="uc.convertedUnit" model="Unit"></model-select>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                        </v-card>
                    </v-form>
                </v-tabs-window-item>

                <v-tabs-window-item value="misc">
                    <v-form :disabled="loading" class="mt-5">
                        <ModelSelect model="Recipe" v-model="editingObj.recipe" :label="$t('Recipe')"></ModelSelect>
                        <v-text-field :label="$t('Website')" v-model="editingObj.url"></v-text-field>
                        <v-checkbox :label="$t('OnHand')" :hint="$t('OnHand_help')" v-model="editingObj.foodOnhand" persistent-hint></v-checkbox>
                        <v-checkbox :label="$t('Ignore_Shopping')" :hint="$t('ignore_shopping_help')" v-model="editingObj.ignoreShopping" persistent-hint></v-checkbox>
                        <v-divider class="mt-2 mb-2"></v-divider>
                        <ModelSelect model="Food" v-model="editingObj.substitute" :label="$t('Substitutes')" :hint="$t('substitute_help')" mode="tags"></ModelSelect>

                        <v-checkbox :label="$t('substitute_siblings')" :hint="$t('substitute_siblings_help')" v-model="editingObj.substituteSiblings" persistent-hint></v-checkbox>
                        <v-checkbox :label="$t('substitute_children')" :hint="$t('substitute_children_help')" v-model="editingObj.substituteChildren" persistent-hint></v-checkbox>

                        <ModelSelect model="FoodInheritField" v-model="editingObj.inheritFields" :label="$t('InheritFields')" :hint="$t('InheritFields_help')"
                                     mode="tags"></ModelSelect>
                        <ModelSelect model="FoodInheritField" v-model="editingObj.childInheritFields" :label="$t('ChildInheritFields')" :hint="$t('ChildInheritFields_help')"
                                     mode="tags"></ModelSelect>

                        <!-- TODO re-add reset inheritance button/api call /function (previously annotated field on food -->
                        <v-text-field :label="$t('Open_Data_Slug')" :hint="$t('open_data_help_text')" persistent-hint v-model="editingObj.openDataSlug" disabled></v-text-field>
                    </v-form>
                </v-tabs-window-item>
            </v-tabs-window>

        </v-card-text>


    </model-editor-base>

</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {ApiApi, Food, Property, Unit, UnitConversion} from "@/openapi";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput'
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import ModelEditorBase from "@/components/model_editors/ModelEditorBase.vue";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions";


const props = defineProps({
    item: {type: {} as PropType<Food>, required: false, default: null},
    itemId: {type: [Number, String], required: false, default: undefined},
    dialog: {type: Boolean, default: false}
})

const emit = defineEmits(['create', 'save', 'delete', 'close'])
const {setupState, deleteObject, saveObject, isUpdate, editingObjName, loading, editingObj, modelClass} = useModelEditorFunctions<Food>('Food', emit)


// object specific data (for selects/display)
const tab = ref("food")

const unitConversions = ref([] as UnitConversion[])

// load conversions the first time the conversions tab is opened
const stopConversionsWatcher = watch(tab, (value, oldValue, onCleanup) => {
    if (value == 'conversions') {
        loadConversions()
        stopConversionsWatcher()
    }
})


onMounted(() => {
    setupState(props.item, props.itemId, {
        newItemFunction: () => {
            editingObj.value.propertiesFoodAmount = 100
            editingObj.value.propertiesFoodUnit = {name: 'g'} as Unit // TODO properly fetch default unit
        }
    })
})


/**
 * saves the edited object in the database
 */
async function saveObjectConversions() {
    const api = new ApiApi()
    unitConversions.value.forEach((uc) => {
        if (uc.id) {
            api.apiUnitConversionUpdate({id: uc.id, unitConversion: uc}).catch(err => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            })
        } else {
            api.apiUnitConversionCreate({id: uc.id, unitConversion: uc}).catch(err => {
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            })
        }
    })
}

// ------------------------------------------------------
// object specific functions
// ------------------------------------------------------

/**
 * load list of property types from server and add all types that are not yet linked
 * to the given food to its properties
 */
function addAllProperties() {
    const api = new ApiApi()
    api.apiPropertyTypeList().then(r => {
        r.results.forEach(pt => {
            if (editingObj.value.properties.findIndex(x => x.propertyType.name == pt.name) == -1) {
                editingObj.value.properties.push({propertyAmount: 0, propertyType: pt} as Property)
            }
        })
    })
}

/**
 * remove property from food
 * //TODO also delete relation in database
 * @param property property to delete
 */
function deleteFoodProperty(property: Property) {
    editingObj.value.properties = editingObj.value.properties.filter(p => p !== property)
}

/**
 * load conversions for currently editing food from API
 */
function loadConversions() {
    const api = new ApiApi()
    api.apiUnitConversionList({foodId: editingObj.value.id}).then(r => {
        unitConversions.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * delete unit conversion from local list and if parameter is true also from database
 * @param unitConversion UnitConversion to delete
 * @param database if UnitConversion should also be deleted from database
 */
function deleteUnitConversion(unitConversion: UnitConversion, database = false) {
    unitConversions.value = unitConversions.value.filter(uc => uc !== uc)
    if (database && unitConversion.id) {
        const api = new ApiApi()
        api.apiUnitConversionDestroy({id: unitConversion.id}).catch(err => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    }
}

</script>

<style scoped>

</style>