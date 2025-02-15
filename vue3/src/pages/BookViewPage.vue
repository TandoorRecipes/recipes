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
                                    <v-list-item v-for="(entry, i) in entries" :key="entry.id" @click="page = i; toc = false">
                                        {{ entry.recipeContent.name }}
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
                <v-pagination :model-value="page + 1" @update:model-value="value => page = value - 1" :length="totalItems" @next="page = page + (mdAndUp ? 2 : 1)"
                              @prev="page = page - (mdAndUp ? 2 : 1)"></v-pagination>
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

                    <v-window-item v-for="(entry, i) in entries" :key="entry.id">
                        <v-row>
                            <v-col cols="12" md="6">
                                <book-entry-card :recipe-overview="entries[i].recipeContent"></book-entry-card>
                                <div class="text-center mt-1">
                                    <span class="text-disabled">{{ i + 1 }}</span>
                                </div>
                            </v-col>
                            <v-col cols="6" v-if="mdAndUp && entries.length > i + 1">
                                <book-entry-card :recipe-overview="entries[i + 1].recipeContent"></book-entry-card>
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


import {onMounted, ref} from "vue";
import {ApiApi, RecipeBook, RecipeBookEntry} from "@/openapi";
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
const toc = ref(false)
const page = ref(0)
const totalItems = ref(0)

const book = ref({} as RecipeBook)
const entries = ref([] as RecipeBookEntry[])

onMounted(() => {
    loadBook()

    entries.value = []
    loadEntries(1)
})

/**
 * load the given book
 */
function loadBook() {
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

function loadEntries(page: number) {
    const api = new ApiApi()

    api.apiRecipeBookEntryList({book: props.bookId, page: page}).then(r => {
        entries.value = entries.value.concat(r.results)
        totalItems.value = r.count
        if (r.next) {
            loadEntries(page + 1)
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

</script>

<style scoped></style>
