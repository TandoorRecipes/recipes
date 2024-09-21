<template>
    <v-container>
        <v-row>
            <v-col>
                <v-text-field prepend-inner-icon="$search" :label="$t('Search')" v-model="searchQuery"></v-text-field>
                <v-data-table-server
                    @update:options="loadItems"
                    :items="items"
                    :items-length="itemCount"
                    :loading="loading"
                    :search="searchQuery"

                    :headers="tableHeaders"
                    :items-per-page-options="itemsPerPageOptions"
                    :show-select="tableShowSelect"
                >
                <template v-slot:item.action="{ item }">
                    <v-btn color="edit" :to="{name: 'ModelEditPage', params: {id: item.id}}"><v-icon icon="$edit"></v-icon></v-btn>
                </template>
                </v-data-table-server>
            </v-col>
        </v-row>

    </v-container>


</template>

<script setup lang="ts">

import {ApiApi, Food} from "@/openapi";
import {ref} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    model: {type: String, default: 'Food'},
})

// table config
const itemsPerPageOptions = [
    {value: 10, title: '10'},
    {value: 25, title: '25'},
    {value: 50, title: '50'},
]

const tableHeaders = [
    {title: t('Name'), key: 'name'},
    {title: t('Category'), key: 'supermarketCategory.name'},
    {title: t('Edit'), key: 'action', align: 'end'},
]

const tableShowSelect = ref(true)

// data
const loading = ref(false);
const items = ref([] as Food[])
const itemCount = ref(0)
const searchQuery = ref('')

function loadItems({page, itemsPerPage, search, sortBy, groupBy}) {
    const api = new ApiApi()
    loading.value = true
    api.apiFoodList({page: page, pageSize: itemsPerPage, query: search}).then(r => {
        items.value = r.results
        itemCount.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>