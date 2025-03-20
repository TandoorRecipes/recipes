<template>
    <v-dialog max-width="900" v-model="dialog">
        <v-card>
            <v-closable-card-title :title="$t('Search')" icon="$search" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-text-field v-model="query">
                    <template #append>
                        <v-btn icon="$search" @click="fdcSearch()"></v-btn>
                    </template>
                </v-text-field>

                <v-list>
                    <v-list-item v-for="f in fdcQueryResults?.foods">{{ f}}</v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ref} from "vue";
import {ApiApi, FdcQuery} from "@/openapi";

const dialog = defineModel<boolean>({required: true})

const query = ref("")
const fdcQueryResults = ref<undefined|FdcQuery>(undefined)

function fdcSearch(){
    let api = new ApiApi()

    api.apiFdcSearchRetrieve({query: query.value}).then(r => {
        fdcQueryResults.value = r
    })
}

</script>

<style scoped>

</style>