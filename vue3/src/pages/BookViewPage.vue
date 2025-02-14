<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <h2>{{ book.name }}</h2>
                <p class="text-disabled">{{ book.description }}</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <v-data-iterator :items="entries" :items-per-page="recipesPerPage" :page="page" @update:page="loadRecipe">
                    <template #default="{items}">
                        <v-card v-for="i in items">
                            <v-card-title>{{i.raw.recipeContent.name}}</v-card-title>
                            <v-card-subtitle>{{i.raw.recipeContent.desciption}}</v-card-subtitle>

                        </v-card>
                    </template>
                </v-data-iterator>
                <v-pagination v-model="page" :length="totalItems / recipesPerPage"></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import {onMounted, ref} from "vue";
import {ApiApi, RecipeBook, RecipeBookEntry} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {VDataTableUpdateOptions} from "@/vuetify";
import {useRouter} from "vue-router";

const props = defineProps({
    bookId: {type: String, required: true},
})

const router = useRouter()

const loading = ref(false)
const page = ref(1)
const recipesPerPage = ref(1)
const totalItems = ref(0)

const book = ref({} as RecipeBook)
const entries = ref([] as RecipeBookEntry[])

onMounted(() => {
    loadBook()
    loadEntries({page: 1})
})

/**
 * load the given book
 */
function loadBook(){
    const api = new ApiApi()
    loading.value = true

    api.apiRecipeBookRetrieve({id: props.bookId}).then(r => {
        book.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

function loadEntries(options: VDataTableUpdateOptions){
    const api = new ApiApi()

    api.apiRecipeBookEntryList({book: props.bookId, page: options.page}).then(r => {
        entries.value = r.results
        totalItems.value = r.count
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

</script>

<style scoped></style>
