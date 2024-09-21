<template>
    <v-card>
        <v-card-title>
            {{ $t(OBJ_LOCALIZATION_KEY) }}
            <v-btn class="float-right" icon="$close" variant="plain" @click="emit('close')" v-if="dialog"></v-btn>
        </v-card-title>
        <v-card-text>
            <v-form>
                <v-text-field v-model="editingObj.name" :label="$t('Name')"></v-text-field>

                <v-text-field
                    max-width="200px"
                    v-model="editingObj.time"
                    :active="timePickerMenu"
                    :focus="timePickerMenu"
                    :label="$t('Time')"
                    prepend-icon="fa-solid fa-clock"
                    readonly>
                    <v-menu
                    v-model="timePickerMenu"
                    :close-on-content-click="false"
                    activator="parent"
                    transition="scale-transition">
                    <v-time-picker v-if="timePickerMenu" format="24hr" v-model="editingObj.time"></v-time-picker>
                </v-menu>
                </v-text-field>


                <v-color-picker v-model="editingObj.color" mode="hex" :modes="['hex']" show-swatches
                                :swatches="[['#ddbf86'],['#b98766'],['#b55e4f'],['#82aa8b'],['#385f84']]"></v-color-picker>

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
import {ApiApi, MealType} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useClipboard} from "@vueuse/core";
import {VTimePicker} from 'vuetify/labs/VTimePicker'
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore"; // TODO remove once out of labs


const {t} = useI18n()
const {copy} = useClipboard()

const emit = defineEmits(['create', 'save', 'delete', 'close'])

const props = defineProps({
    item: {type: {} as MealType, required: true},
    dialog: {type: Boolean, default: false}
})

const OBJ_LOCALIZATION_KEY = 'Meal_Type'
const editingObj = ref({} as MealType)
const loading = ref(false)

// object specific data (for selects/display)
const timePickerMenu = ref(false)

/**
 * checks if given object has ID property to determine if it needs to be updated or created
 */
const isUpdate = computed(() => {
    return editingObj.value.id !== undefined
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
    } else {

    }
})

/**
 * saves the edited object in the database
 */
async function saveObject() {
    let api = new ApiApi()
    if (isUpdate.value) {
        api.apiMealTypeUpdate({id: editingObj.value.id, mealType: editingObj.value}).then(r => {
            editingObj.value = r
            emit('save', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    } else {
        api.apiMealTypeCreate({mealType: editingObj.value}).then(r => {
            editingObj.value = r
            emit('create', r)
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    }
}

/**
 * deletes the editing object from the database
 */
async function deleteObject() {
    let api = new ApiApi()
    api.apiMealTypeDestroy({id: editingObj.value.id}).then(r => {
        editingObj.value = {} as MealType
        emit('delete', editingObj.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
    })
}

</script>

<style scoped>

</style>