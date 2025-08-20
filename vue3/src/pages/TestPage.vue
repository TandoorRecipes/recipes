<template>
    <v-container>
        <v-btn @click="loadRecipes()" :loading="loading">Load</v-btn>
        <v-row>
            <v-col>
                Recipe 1 - {{ recipe1.name }}
                <keywords-bar :keywords="recipe1.keywords"></keywords-bar>
            </v-col>
            <v-col>
                Recipe 2 - {{ recipe2.name }}
                <keywords-bar :keywords="recipe2.keywords"></keywords-bar>
            </v-col>
        </v-row>

        <model-select model="Keyword" allow-create mode="tags" v-model="keywords"></model-select>

        <v-btn @click="batchUpdate()" :loading="loading">Add to recipes</v-btn>
        <v-btn @click="batchRemove()" :loading="loading">Remove to recipes</v-btn>
    </v-container>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, Keyword, Recipe} from "@/openapi";
import KeywordsBar from "@/components/display/KeywordsBar.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const loading = ref(false)

const recipe1 = ref({} as Recipe)
const recipe2 = ref({} as Recipe)
const keywords = ref([] as Keyword[])

onMounted(() => {
    loadRecipes()
})

function loadRecipes() {
    let api = new ApiApi()
    loading.value = true
    api.apiRecipeRetrieve({id: 231}).then(r => {
        recipe1.value = r
    })
    api.apiRecipeRetrieve({id: 232}).then(r => {
        recipe2.value = r
    }).finally(() => {
        loading.value = false
    })
}

function batchUpdate() {
    let api = new ApiApi()
    loading.value = true

    api.apiRecipeBatchUpdateUpdate({recipeBatchUpdate: {recipes: [recipe1.value.id!, recipe2.value.id!], keywordsAdd: keywords.value.flatMap(x => x.id!)}}).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        loadRecipes()
    })
}

function batchRemove() {
    let api = new ApiApi()
    loading.value = true

    api.apiRecipeBatchUpdateUpdate({recipeBatchUpdate: {recipes: [recipe1.value.id!, recipe2.value.id!], keywordsRemove: keywords.value.flatMap(x => x.id!)}}).then(r => {

    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }).finally(() => {
        loadRecipes()
    })
}

</script>


<style scoped>

</style>