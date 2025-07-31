<template>
    <slot name="activator" >
        <v-btn @click="dialog = true" variant="plain" icon="fa-solid fa-search" class="mr-1 fa-fw d-print-none" v-if="mobile"></v-btn>
        <v-btn @click="dialog = true" variant="plain" class="d-print-none"  v-else>
            <v-icon icon="fa-solid fa-search" class="mr-1 fa-fw"></v-icon>
            <span class="d-none d-sm-block">{{ $t('Search') }}</span>
            <v-chip size="x-small" variant="tonal" class="d-none d-md-flex ml-1" label>{{ $t('Ctrl+K') }}</v-chip>
        </v-btn>
    </slot>

    <v-dialog v-model="dialog" location="id_dialog_anchor"
              location-strategy="connected"
              :max-width="(mobile) ? '100vw': '800px'"
              :fullscreen="mobile"
    >

        <v-card>
            <v-closable-card-title :title="$t('Search')" v-model="dialog"></v-closable-card-title>
            <!-- search input -->
            <v-card-text class="pt-0 pt-md-2">
                <v-text-field
                    id="id_global_search_input"
                    v-model="searchQuery"
                    @update:modelValue="debouncedAsyncSearch"
                    autocomplete="off"
                    clearable
                    placeholder="Search"
                    prepend-inner-icon="fas fa-search"
                    variant="solo"
                ></v-text-field>

                <v-card :variant="cardVariant(index)" v-for="(item, index) in searchResults" hover class="mt-1" @click="selectedResult = index" :key="index">
                    <v-card-title @click="goToSelectedRecipe(index)">
                        <v-avatar v-if="item.image" :image="item.image"></v-avatar>
                        <v-avatar v-else-if="item.recipeId !== undefined" color="tandoor">{{ item.name.charAt(0) }}</v-avatar>
                        <v-icon :icon="item.icon" v-if="item.icon"></v-icon>
                        {{ item.name }}
                    </v-card-title>
                </v-card>
            </v-card-text>

            <v-divider class="d-none d-sm-block"></v-divider>
            <!-- keybind info shown on screens at least sm -->
            <v-card-text class="d-none d-sm-block pt-2">
                <v-chip size="x-small" class="mr-1" label><i class="fas fa-arrow-up"></i></v-chip>
                <v-chip size="x-small" class="mr-1" label><i class="fas fa-arrow-down"></i></v-chip>
                <small class="mr-2">{{ $t('to_navigate') }}</small>
                <v-chip size="x-small" class="mr-1" label><i class="fas fa-level-down-alt fa-rotate-90"></i></v-chip>
                <small class="mr-2">{{ $t('to_select') }}</small>
                <v-chip size="x-small" class="mr-1" label> esc</v-chip>
                <small>{{ $t('to_close') }}</small>

            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialog=false"  :to="{name: 'SearchPage'}" variant="plain" prepend-icon="$search">{{ $t('Advanced') }}</v-btn>
                <v-btn @click="dialog=false" variant="plain">{{ $t('Close') }}</v-btn>
            </v-card-actions>
        </v-card>


    </v-dialog>
</template>

<script setup lang="ts">

import {computed, onMounted, ref, watch} from 'vue'
import {SearchResult} from "@/types/SearchTypes";
import {ApiApi, Recipe, RecipeFlat, RecipeOverview} from "@/openapi";
import {useRouter} from "vue-router";
import {useDisplay} from "vuetify";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {useDebounceFn} from "@vueuse/core";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";
import SearchPage from "@/pages/SearchPage.vue";

const router = useRouter()
const {mobile} = useDisplay()
const {t} = useI18n()

const dialog = ref(false)
const recipes = ref([] as Recipe[])
const flatRecipes = ref([] as RecipeFlat[])
const searchQuery = ref(null as string | null)
const selectedResult = ref(0)
const asyncSearchResults = ref([] as RecipeOverview[])

const flatListLoading = ref(false)
const asyncLoading = ref(false)

/**
 * build array of search results
 * uses custom type to be able to incorporate recent items, plans, books, ... at a later stage
 */
const searchResults = computed(() => {
    let searchResults = [] as Array<SearchResult>

    if (searchQuery.value != '' && searchQuery.value != null) {
        flatRecipes.value.filter(fr => fr.name.toLowerCase().includes(searchQuery.value.toLowerCase())).slice(0, 10).forEach(r => {
            searchResults.push({name: r.name, image: r.image, recipeId: r.id, type: "recipe"} as SearchResult)
        })

        if (searchResults.length < 3) {
            asyncSearchResults.value.slice(0, 5).forEach(r => {
                if (searchResults.findIndex(x => x.recipeId == r.id) == -1) {
                    searchResults.push({name: r.name, image: r.image, recipeId: r.id, type: "recipe"})
                }
            })
        }

        searchResults.push({name: searchQuery.value, icon: 'fas fa-search', type: "link_advanced_search"} as SearchResult)

    } else {
        // show first 5 recipes by default

        // TODO special "quick links" if applicable
        // searchResults.push({name: 'Recent 1', icon: 'fas fa-history',} as SearchResult)
        // searchResults.push({name: 'Recent 2', icon: 'fas fa-history',} as SearchResult)
        // searchResults.push({name: 'Recent 3', icon: 'fas fa-history',} as SearchResult)

        searchResults.push({name: t('AllRecipes'), icon: 'fas fa-search', type: "link_advanced_search"} as SearchResult)

        flatRecipes.value.slice(0, 5).forEach(r => {
            searchResults.push({name: r.name, image: r.image, recipeId: r.id} as SearchResult)
        })
    }

    return searchResults
})

watch(dialog, (newValue) => {
    /**
     * since dialog has no opened event watch the variable and focus input after delay (nextTick/directly does not work)
     */
    searchQuery.value = ""
    setTimeout(() => {
        if (newValue) {
            let search = document.getElementById('id_global_search_input')
            if (search != null) {
                search.focus()
            }
        }
    }, 20)
})

watch(searchQuery, () => {
    /**
     * update selected result if search result length changes due to search_query changes
     */
    if (selectedResult.value >= searchResults.value.length) {
        selectedResult.value = searchResults.value.length - 1
    }
})

onMounted(() => {
    window.addEventListener('keydown', (e) => {
        if (dialog.value) {
            if (e.key == 'ArrowUp') {
                selectedResult.value = Math.max(0, selectedResult.value - 1)
            }
            if (e.key == 'ArrowDown') {
                selectedResult.value = Math.min(searchResults.value.length, selectedResult.value + 1)
            }
            if (e.key == 'Enter') {
                goToSelectedRecipe(selectedResult.value)
            }
        } else {
            if (e.key == 'k' && e.ctrlKey) {
                e.preventDefault();
                dialog.value = true
            }
        }
    })

    flatListLoading.value = true
    const api = new ApiApi()
    api.apiRecipeFlatList().then(r => {
        flatRecipes.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        flatListLoading.value = false
    })
})

/**
 * search for query on server but debounce search so its not searched on every keypress
 */
const debouncedAsyncSearch = useDebounceFn(() => {
    if (searchQuery.value != null && searchQuery.value != '') {
        let api = new ApiApi()
        asyncLoading.value = true
        api.apiRecipeList({query: searchQuery.value}).then(r => {
            asyncSearchResults.value = r.results
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        }).finally(() => {
            asyncLoading.value = false
        })
    }
}, 300)

/**
 * determines the style for selected elements
 * @param index index of card to determine style for
 */
function cardVariant(index: number) {
    if (selectedResult.value == index) {
        return 'tonal'
    } else {
        return 'elevated'
    }
}

/**
 * open selected recipe
 */
function goToSelectedRecipe(index: number) {
    dialog.value = false
    let searchResult = searchResults.value[index]

    if (searchResult.type == 'link_advanced_search') {
        router.push({name: 'SearchPage', query: {'query': searchQuery.value}})
    } else {
        console.log('going to', searchResult.recipeId)
        if (searchResult.recipeId != null) {
            router.push({name: 'RecipeViewPage', params: {'id': searchResult.recipeId}})
        }
    }


}
</script>


<style scoped>

</style>