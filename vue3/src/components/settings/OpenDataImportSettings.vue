<template>
    <p class="text-h4">{{ $t('Open_Data_Import') }}</p>
    <v-divider></v-divider>
    <p class="text-subtitle-1">{{ $t('Data_Import_Info') }} <a href="https://github.com/TandoorRecipes/open-tandoor-data" target="_blank" rel="noreferrer nofollow">{{ $t('Learn_More') }}</a></p>

    <v-select :items="metadata.versions" :label="$t('Language')" class="mt-4" v-model="requestData.selectedVersion" :loading="loading"></v-select>

    <v-row v-if="requestData.selectedVersion">
        <v-col>
            <v-checkbox :label="$t('Update_Existing_Data')" v-model="requestData.updateExisting" hide-details></v-checkbox>
            <v-checkbox :label="$t('Use_Metric')" v-model="requestData.useMetric" hide-details></v-checkbox>

            <v-table>
                <thead>
                <tr>
                    <th>{{ $t('Import') }}</th>
                    <th>{{ $t('Datatype') }}</th>
                    <th>{{ $t('Number of Objects') }}</th>
                    <th>{{ $t('Imported') }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="d in metadata.datatypes">
                    <td>
                        <v-checkbox hide-details density="compact" :loading="loading" v-model="importDatatype[d]"></v-checkbox>
                    </td>
                    <td>{{ $t(d.charAt(0).toUpperCase() + d.slice(1)) }}</td>
                    <td>{{ metadata[requestData.selectedVersion][d] }}</td>
                    <td>
                        <template v-if="responseData[d]">
                            <p v-if="responseData[d].totalCreated > 0" ><i class="fas fa-plus-circle"></i> {{ responseData[d].totalCreated }} {{ $t('Created') }}</p>
                            <p v-if="responseData[d].totalUpdated > 0"><i class="fas fa-pencil-alt"></i> {{ responseData[d].totalUpdated }} {{ $t('Updated') }}</p>
                            <p v-if="responseData[d].totalUntouched > 0"><i class="fas fa-forward"></i> {{ responseData[d].totalUntouched }} {{ $t('Unchanged') }}</p>
                            <p v-if="responseData[d].totalErrored > 0"><i class="fas fa-exclamation-circle"></i> {{ responseData[d].totalErrored }} {{ $t('Error') }}</p>
                        </template>
                    </td>
                </tr>
                </tbody>
            </v-table>
            <v-btn @click="importOpenData()" class="mt-2 float-right" color="success" :loading="loading">{{ $t('Import') }}</v-btn>
        </v-col>
    </v-row>


</template>

<script setup lang="ts">

import {ApiApi, ImportOpenData, ImportOpenDataMetaData, ImportOpenDataResponse} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {onMounted, ref} from "vue";

let loading = ref(false)
let metadata = ref({} as ImportOpenDataMetaData)
let requestData = ref({useMetric: true, updateExisting: true} as ImportOpenData)
let responseData = ref({} as ImportOpenDataResponse)

let importDatatype = ref({
    food: true,
    unit: true,
    category: true,
    property: true,
    store: false,
    conversion: true
})

onMounted(() => {
    loadMetadata()
})

/**
 * perform request to metadata endpoint to load available versions and their statistics
 */
function loadMetadata() {
    let api = new ApiApi()
    loading.value = true
    api.apiImportOpenDataRetrieve().then(r => {
        metadata.value = r

        let locale = document.querySelector('html')!.getAttribute('lang')
        if (locale != null && metadata.value.versions.includes(locale)) {
            requestData.value.selectedVersion = locale
        }

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function importOpenData() {
    let api = new ApiApi()
    loading.value = true

    requestData.value.selectedDatatypes = []
    Object.keys(importDatatype.value).forEach(key => {
        if (importDatatype.value[key]) {
            requestData.value.selectedDatatypes.push(key)
        }
    })

    api.apiImportOpenDataCreate({importOpenData: requestData.value}).then(r => {
        responseData.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })

}

</script>

<style scoped>

</style>