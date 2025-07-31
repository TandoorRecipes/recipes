<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{ book.name }}
                        <v-btn class="float-right" variant="flat" :to="{name: 'BooksPage'}" prepend-icon="$books" v-if="mdAndUp">{{ $t('Books') }}</v-btn>
                    </v-card-title>
                    <v-card-text v-if="book.shared && book.shared.length > 0">
                        <v-chip-group>
                            <v-label class="me-2">{{ $t('shared_with') }}</v-label>
                            <v-chip v-for="u in book.shared">{{ u.displayName }}</v-chip>
                        </v-chip-group>
                    </v-card-text>
                    <v-card-text class="text-disabled">
                        {{ book.description }}
                    </v-card-text>
                    <v-expansion-panels v-model="toc">
                        <v-expansion-panel>
                            <v-expansion-panel-title>{{ $t('Table_of_Contents') }}</v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-list>
                                    <v-list-item v-for="(entry, i) in recipes" :key="entry.id" @click="page = i; toc = false">
                                        {{ entry.name }}
                                    </v-list-item>
                                </v-list>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col class="text-center">
                <v-pagination :model-value="page + 1"
                              @update:model-value="value => page = Math.max(value - 1, 0)"
                              :length="totalItems"
                              @next="page = Math.min(page + (mdAndUp ? 1 : 0), totalItems - 1)"
                              @prev="page = Math.max(page - (mdAndUp ? 1 : 0), 0)"
                ></v-pagination>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-window v-model="page" show-arrows>
                    <template #next>
                        <v-btn icon="fa-solid fa-chevron-right" variant="plain" @click="page = page + (mdAndUp ? 2 : 1)"></v-btn>
                    </template>
                    <template #prev>
                        <v-btn icon="fa-solid fa-chevron-left" variant="plain" @click="page = page - (mdAndUp ? 2 : 1)"></v-btn>
                    </template>

                    <v-window-item v-for="(entry, i) in recipes" :key="entry.id">
                        <v-row>
                            <v-col cols="12" md="6">
                                <book-entry-card :recipe-overview="recipes[i]"></book-entry-card>
                                <div class="text-center mt-1">
                                    <span class="text-disabled">{{ i + 1 }}</span>
                                </div>
                            </v-col>
                            <v-col cols="6" v-if="mdAndUp && recipes.length > i + 1">
                                <book-entry-card :recipe-overview="recipes[i + 1]"></book-entry-card>
                                <div class="text-center mt-1">
                                    <span class="text-disabled">{{ i + 2 }}</span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import {computed, onMounted, ref} from "vue";
import {ApiApi, RecipeBook, RecipeBookEntry, RecipeOverview} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useRouter} from "vue-router";
import RecipeImage from "@/components/display/RecipeImage.vue";
import {useDisplay} from "vuetify";
import BookEntryCard from "@/components/display/BookEntryCard.vue";

const props = defineProps({
    bookId: {type: String, required: true},
})

const {mdAndUp} = useDisplay()
const router = useRouter()

const loading = ref(false)
const loadingEntries = ref(false)
const toc = ref(false)
const page = ref(0)

const manualItems = ref(0)
const filterItems = ref(0)
const totalItems = computed(() => {
    return manualItems.value + filterItems.value
})

const book = ref({} as RecipeBook)
const entries = ref([] as RecipeBookEntry[])
const recipes = ref([] as RecipeOverview[])

onMounted(() => {
    loadBook()
})

/**
 * load the given book and trigger loading its entries
 */
function loadBook() {
    const api = new ApiApi()
    loading.value = true

    api.apiRecipeBookRetrieve({id: props.bookId}).then(r => {
        book.value = r

        entries.value = []
        recLoadEntries(1)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

/**
 * recursively load the book entries and trigger loading all entries from a saved custom filter
 * @param page
 */
function recLoadEntries(page: number) {
    const api = new ApiApi()
    loadingEntries.value = true

    api.apiRecipeBookEntryList({book: props.bookId, page: page, pageSize: 50}).then(r => {
        r.results.forEach(rBE => {
            recipes.value.push(rBE.recipeContent)
        })
        manualItems.value = r.count
        if (r.next) {
            recLoadEntries(page + 1)
        } else {
            if (book.value.filter) {
                recLoadFilter(book.value.filter.id, 1)
            } else {
                loadingEntries.value = false
            }
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        loadingEntries.value = false
    })
}

/**
 * recursively load the recipes matched by the custom filter configured in the book
 * @param filterId filter id to look for
 * @param page page to load
 */
function recLoadFilter(filterId: number, page: number) {
    let api = new ApiApi()

    api.apiRecipeList({filter: filterId, page: page, pageSize: 50}).then(r => {
        recipes.value = recipes.value.concat(r.results)
        manualItems.value = r.count
        if (r.next) {
            recLoadFilter(filterId, page + 1)
        } else {
            loadingEntries.value = false
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        loadingEntries.value = false
    })
}

</script>

<style scoped></style>
