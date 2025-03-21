<template>
    <v-dialog max-width="900" v-model="dialog">
        <v-card>
            <v-closable-card-title :title="$t('Search')" icon="$search" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-text-field v-model="query" :loading="loading" :label="$t('Search')" @keydown.enter="fdcSearch()">
                    <template #append>
                        <v-btn icon="$search" color="success" @click="fdcSearch()"></v-btn>
                    </template>
                </v-text-field>
                <v-select multiple v-model="fdcDataTypeSelection" :items="fdcDataTypeOptions" chips></v-select>

                <v-list>
                    <v-list-item v-for="f in fdcQueryResults?.foods" :title="f.description" @click="dialog = false; emit('selected', f.fdcId)">
                        <v-list-item-subtitle>{{f.dataType}} <v-chip size="small">{{f.fdcId}}</v-chip></v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ref} from "vue";
import {ApiApi, FdcQuery} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";

const emit = defineEmits(['selected'])

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const query = ref("")
const fdcQueryResults = ref<undefined | FdcQuery>(undefined)

const fdcDataTypeOptions = ref(['Branded','Foundation','Survey (FNDDS)','SR Legacy'])
const fdcDataTypeSelection = ref(['Foundation','Survey (FNDDS)','SR Legacy'])

/**
 * perform search in fdc database
 */
function fdcSearch() {
    let api = new ApiApi()
    loading.value = true
    api.apiFdcSearchRetrieve({query: query.value, dataType: fdcDataTypeSelection.value.join(',') }).then(r => {
        fdcQueryResults.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

</script>

<style scoped>

</style>