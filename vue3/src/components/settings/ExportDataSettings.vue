<template>
    <p class="text-h6">{{ $t('Export') }}</p>
    <v-divider></v-divider>

    <v-form class="mt-2">
        <v-select :items="exportFormats" :label="$t('Type')" v-model="exportType"></v-select>

        <v-checkbox :label="$t('AllRecipes')" v-model="allRecipes" :disabled="selectedRecipes.length > 0 || selectedFilter != null"></v-checkbox>
        <ModelSelect model="Recipe" mode="tags" v-model="selectedRecipes" :disabled="allRecipes || selectedFilter != null"></ModelSelect>
        <ModelSelect model="CustomFilter" mode="single" v-model="selectedFilter" :disabled="selectedRecipes.length > 0 || allRecipes"></ModelSelect>

        <v-btn @click="doExport()" :loading="loading" :disabled="selectedRecipes.length == 0 && selectedFilter == null && !allRecipes">{{ $t('Export') }}</v-btn>

        <template v-if="exportLog.id">
            <v-divider class="mt-4 mb-4"></v-divider>
            <h4>{{ $t('Export') }} #{{ exportLog.id }}</h4>
            <p>
                {{ $t('Recipes') }}: {{ exportLog.exportedRecipes }}
            </p>

            <v-btn color="success" :href="useDjangoUrls().getDjangoUrl(`export-file/${exportLog.id!}`)" class="mt-2" :disabled="exportLog.running">{{ $t('Download') }}</v-btn>

            <v-textarea :label="$t('Messages')" auto-grow readonly max-rows="20" v-model="exportLog.msg" class="mt-2"></v-textarea>

        </template>
    </v-form>
</template>

<script setup lang="ts">

import {computed, ref} from "vue";
import {INTEGRATIONS} from "@/utils/integration_utils.ts";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ApiApi, CustomFilter, ExportLog, Recipe} from "@/openapi";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const exportType = ref('DEFAULT')
const allRecipes = ref(false)
const selectedRecipes = ref([] as Recipe[])
const selectedFilter = ref<null|CustomFilter>(null)

const exportLog = ref({} as ExportLog)
const loading = ref(false)

/**
 * show export option for all types that have export marked as true in integration list
 */
const exportFormats = computed(() => {
    let formats = []

    INTEGRATIONS.forEach(integration => {
        if (integration.export) {
            formats.push({title: integration.name, value: integration.id})
        }
    })

    return formats
})

function doExport() {
    let api = new ApiApi()
    exportLog.value = {} as ExportLog
    loading.value = true

    api.apiExportCreate({exportRequest: {all: allRecipes.value, type: exportType.value, recipes: selectedRecipes.value, customFilter: selectedFilter.value}}).then(r => {
        exportLog.value = r
        recRefreshExportLog()
    }).catch(err => {
        loading.value = false
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {

    })
}

function recRefreshExportLog() {
    let api = new ApiApi()

    api.apiExportLogRetrieve({id: exportLog.value.id!}).then(r => {
        exportLog.value = r
        if (exportLog.value.running) {
            setTimeout(() => recRefreshExportLog(), 1000)
        } else {
            loading.value = false
        }
    })
}

</script>


<style scoped>

</style>