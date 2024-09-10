<template>
    <v-card>
        <v-card-title>{{ $t(OBJ_LOCALIZATION_KEY) }}</v-card-title>
        <v-card-text>
            <v-form>
                <v-text-field label="Token" v-model="editingObj.token" :disabled="isUpdate"></v-text-field>
                <v-text-field label="Scope" v-model="editingObj.scope"></v-text-field>
                <v-date-input :label="$t('Valid Until')" v-model="editingObj.scope"></v-date-input>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="save" prepend-icon="$save">{{ isUpdate ? $t('Save') : $t('Create') }}</v-btn>
            <v-btn color="delete" prepend-icon="$delete">{{ $t('Delete') }}
                <delete-confirm-dialog :object-name="objectName"></delete-confirm-dialog>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">

import {VDateInput} from 'vuetify/labs/VDateInput' //TODO remove once component is out of labs
import {computed, onMounted, ref} from "vue";
import {AccessToken, ApiApi} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    accessToken: {type: {} as AccessToken, required: false}
})

const OBJ_LOCALIZATION_KEY = 'Access_Token'
const editingObj = ref({} as AccessToken)
const loading = ref(false)

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
    if (props.accessToken != null) {
        editingObj.value = props.accessToken
    }
})

/**
 * saves the edited object in the database
 */
function saveObject() {
    let api = new ApiApi()
    if (isUpdate.value) {

    } else {

    }
}

/**
 * test
 */
function deleteObject() {

}

</script>

<style scoped>

</style>