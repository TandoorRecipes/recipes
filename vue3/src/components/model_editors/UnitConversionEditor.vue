<template>
    <v-card>
        <v-card-title>
            {{ $t(OBJ_LOCALIZATION_KEY) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
        </v-card-title>

        <v-card-text>
            <v-form>
                <v-row>
                    <v-col>
                        <model-select model="Food" v-model="editingObj.food" :label="$t('Food')" :disabled="disabledFields.includes('food')"></model-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col md="6">
                        <v-number-input :label="$t('Amount')" :step="10" v-model="editingObj.baseAmount" control-variant="stacked"></v-number-input>
                    </v-col>
                    <v-col md="6">
                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                        <model-select :label="$t('Unit')" v-model="editingObj.baseUnit" model="Unit"></model-select>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col class="text-center">
                        <v-icon icon="fa-solid fa-arrows-up-down"></v-icon>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col md="6">
                        <v-number-input :label="$t('Amount')" :step="10" v-model="editingObj.convertedAmount" control-variant="stacked"></v-number-input>
                    </v-col>
                    <v-col md="6">
                        <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
                        <model-select :label="$t('Unit')" v-model="editingObj.convertedUnit" model="Unit"></model-select>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="delete" prepend-icon="$delete" v-if="isUpdate">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName" @delete="deleteObject"></delete-confirm-dialog>
            </v-btn>
            <v-btn color="save" prepend-icon="$save" @click="saveObject">{{ isUpdate ? $t('Save') : $t('Create') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {ApiApi, Property, UnitConversion} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {VNumberInput} from 'vuetify/labs/VNumberInput' //TODO remove once component is out of labs

const {t} = useI18n()

const emit = defineEmits(['create', 'save', 'delete', 'close'])

const props = defineProps({
    item: {type: {} as UnitConversion, required: false},
    itemId: {type: String, required: false},
    dialog: {type: Boolean, default: false},

    disabledFields: {default: []},
})

const OBJ_LOCALIZATION_KEY = 'Conversion'
const editingObj = ref({} as UnitConversion)
const loading = ref(false)

// object specific data (for selects/display)

/**
 * checks if given object has ID property to determine if it needs to be updated or created
 */
const isUpdate = computed(() => {
    return Object.keys(editingObj.value).length > 0
})

/**
 * display name for object in headers/delete dialog/...
 */
const objectName = computed(() => {
    return isUpdate ? `${t(OBJ_LOCALIZATION_KEY)} ${editingObj.value.token}` : `${t(OBJ_LOCALIZATION_KEY)} (${t('New')})`
})

onMounted(() => {
    if (props.item != null) {
        editingObj.value = props.item
    } else if (props.itemId != null) {
        const api = new ApiApi()
        api.apiUnitConversionRetrieve({id: props.itemId}).then(r => {
            editingObj.value = r
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    } else {
        // functions to populate defaults for new item

    }
})

/**
 * saves the edited object in the database
 */
async function saveObject() {
    let api = new ApiApi()
    if (editingObj.value.id) {
        api.apiUnitConversionUpdate({id: editingObj.value.id, unitConversion: editingObj.value}).then(r => {
            editingObj.value = r
            emit('save', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    } else {
        api.apiUnitConversionCreate({unitConversion: editingObj.value}).then(r => {
            editingObj.value = r
            emit('create', r)
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        })
    }
}

/**
 * deletes the editing object from the database
 */
async function deleteObject() {
    if (editingObj.value.id !== undefined) {
        let api = new ApiApi()
        api.apiUnitConversionDestroy({id: editingObj.value.id}).then(r => {
            editingObj.value = {} as UnitConversion
            emit('delete', editingObj.value)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        })
    } else {
        editingObj.value = {} as UnitConversion
        emit('delete', editingObj.value)
    }
}

// ------------------------------------------------------
// object specific functions
// ------------------------------------------------------

</script>

<style scoped>

</style>