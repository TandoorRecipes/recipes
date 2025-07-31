<template>
    <v-container >
        <v-row>
            <v-col cols="12" md="6" offset-md="3">
                <v-text-field>
                    <template #append>
                        <v-btn icon color="create">
                            <v-icon icon="$create"></v-icon>
                            <model-edit-dialog model="RecipeBook" @create="(arg: RecipeBook) => {books.push(arg)}"></model-edit-dialog>
                        </v-btn>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="3" v-for="(b, i) in books">
                <v-card>
                    <v-card-title>
                        <v-icon icon="$books" size="small"></v-icon>
                        {{ b.name }}
                    </v-card-title>
                    <v-card-subtitle>{{ b.createdBy.displayName }}</v-card-subtitle>
                    <v-card-text>
                        {{ b.description }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn>
                            {{ $t('Edit') }}
                            <model-edit-dialog model="RecipeBook" :item="books[i]"
                                               @delete="(arg: RecipeBook) => { books.splice(books.findIndex((value: RecipeBook) => value.id == arg.id!),1)}"></model-edit-dialog>
                        </v-btn>
                        <v-btn :to="{name: 'BookViewPage', params: {bookId: b.id}}">
                            {{ $t('View') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import {onMounted, ref} from "vue";
import {ApiApi, RecipeBook, RecipeBookEntry} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";

const loading = ref(false)

const viewingBook = ref<null | RecipeBook>(null)
const viewingBookEntries = ref([] as RecipeBookEntry[])

const books = ref([] as RecipeBook[])

onMounted(() => {
    loadBooks()
})

function loadBooks() {
    const api = new ApiApi()
    loading.value = true
    api.apiRecipeBookList().then(r => {
        books.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR)
    }).finally(() => {
        loading.value = false
    })
}

function loadBookEntries(recipeBook : RecipeBook){
    const api = new ApiApi()
    loading.value = true
    api.apiRecipeBookEntryList({})
}

</script>

<style scoped></style>
