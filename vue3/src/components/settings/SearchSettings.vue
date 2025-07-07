<template>
    <v-form>
        <p class="text-h6">{{ $t('Search') }}</p>
        <v-divider class="mb-3"></v-divider>

        <v-alert variant="tonal" color="warning" :text="$t('SearchSettingsWarning')"></v-alert>

        <p class="mt-2 mb-2"> {{ $t('SearchSettingsOverview') }}</p>
        <v-card :title="$t('Fuzzy') +' (' + $t('Default') + ')'" :subtitle="$t('FuzzySearchHelp')">
            <template #append>
                <v-btn color="success" @click="applyFuzzyPreset()">{{ $t('Apply') }}</v-btn>
            </template>
        </v-card>
        <v-card :title="$t('Precision')" :subtitle="$t('PrecisionSearchHelp')" class="mt-2">
            <template #append>
                <v-btn color="success" @click="applyPrecisePreset()">{{ $t('Apply') }}</v-btn>
            </template>
        </v-card>

        <p class="text-h6 mt-4">{{ $t('Advanced Search Settings') }}</p>
        <v-divider class="mb-3"></v-divider>

        <v-form v-if="searchPreferences">

            <v-select v-model="searchPreferences.search" :items="searchMethods" :label="$t('Method')"></v-select>

            <v-checkbox v-model="searchPreferences.lookup" :label="$t('Fuzzy')" persistent-hint :hint="$t('FuzzySearchHelp')" class="mb-4"></v-checkbox>
            <v-number-input v-model="searchPreferences.trigramThreshold" :precision="2" :min="0.01" :max="1" :step="0.1" :label="$t('TrigramThreshold')" persistent-hint
                            :hint="$t('TrigramThresholdHelp')"></v-number-input>

            <ModelSelect model="SearchFields" mode="tags" v-model="searchPreferences.unaccent" :label="$t('IgnoreAccents')" :hint="$t('IgnoreAccentsHelp')"></ModelSelect>
            <ModelSelect model="SearchFields" mode="tags" v-model="searchPreferences.icontains" :label="$t('PartialMatch')" :hint="$t('PartialMatchHelp')"></ModelSelect>
            <ModelSelect model="SearchFields" mode="tags" v-model="searchPreferences.istartswith" :label="$t('StartsWith')" :hint="$t('StartsWithHelp')"></ModelSelect>
            <ModelSelect model="SearchFields" mode="tags" v-model="searchPreferences.fulltext" :label="$t('Fulltext')" :hint="$t('FulltextHelp')"></ModelSelect>
            <ModelSelect model="SearchFields" mode="tags" v-model="searchPreferences.trigram" :label="$t('Fuzzy')" :hint="$t('FuzzySearchHelp')"></ModelSelect>

            <v-btn class="mt-3" color="success" @click="updateSearchSettings()" prepend-icon="$save" :loading="loading">
                {{ $t('Save') }}
            </v-btn>
        </v-form>
    </v-form>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, SearchFields, SearchPreference} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const searchMethods = ref([
    {title: 'Simple', value: 'plain'},
    {title: 'Phrase', value: 'phrase'},
    {title: 'Web', value: 'websearch'},
    {title: 'Raw', value: 'raw'},
])

const loading = ref(false)
const searchPreferences = ref<undefined | SearchPreference>(undefined)
const searchFields = ref<SearchFields[]>([])

onMounted(() => {
    loadSearchSettings()
    loadSearchFields()
})

/**
 * load search preferences from DB
 */
function loadSearchSettings() {
    let api = new ApiApi()
    loading.value = true
    api.apiSearchPreferenceList().then(r => {
        if (r.length == 1) {
            searchPreferences.value = r[0]
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })

}

/**
 * update search preferences in DB
 */
function updateSearchSettings() {
    let api = new ApiApi()

    loading.value = true
    if (searchPreferences.value != undefined) {

        api.apiSearchPreferencePartialUpdate({patchedSearchPreference: searchPreferences.value, user: useUserPreferenceStore().userSettings.user.id}).then(r => {
            searchPreferences.value = r
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }
}

function loadSearchFields() {
    let api = new ApiApi()

    api.apiSearchFieldsList().then(r => {
        searchFields.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

/**
 * apply recommended values for a fuzzy behaving search
 */
function applyFuzzyPreset() {
    let nameSearchField = getSearchFieldByName('Name')

    if (searchPreferences.value && nameSearchField) {
        searchPreferences.value.search = 'plain'
        searchPreferences.value.unaccent = [nameSearchField]
        searchPreferences.value.icontains = [nameSearchField]
        searchPreferences.value.istartswith = []
        searchPreferences.value.fulltext = []
        searchPreferences.value.trigram = [nameSearchField]
        searchPreferences.value.trigramThreshold = 0.2
        searchPreferences.value.lookup = true

        updateSearchSettings()
    }
}

/**
 * apply recommended values for a precise behaving search
 */
function applyPrecisePreset() {
    let nameSearchField = getSearchFieldByName('Name')
    let ingredientsSearchField = getSearchFieldByName('Ingredients')

    if (searchPreferences.value && nameSearchField && ingredientsSearchField) {
        searchPreferences.value.search = 'websearch'
        searchPreferences.value.unaccent = []
        searchPreferences.value.icontains = [nameSearchField]
        searchPreferences.value.istartswith = [nameSearchField]
        searchPreferences.value.fulltext = [ingredientsSearchField]
        searchPreferences.value.trigram = []
        searchPreferences.value.trigramThreshold = 0.2
        searchPreferences.value.lookup = true

        updateSearchSettings()
    }
}

/**
 * small helper method to get a search field by its name
 * @param sfName name of the search field to find
 */
function getSearchFieldByName(sfName: string) {
    let searchField: undefined | SearchFields = undefined
    searchFields.value.forEach(sf => {
        if (sf.name == sfName) {
            searchField = sf
        }
    })
    return searchField
}

</script>

<style scoped>

</style>