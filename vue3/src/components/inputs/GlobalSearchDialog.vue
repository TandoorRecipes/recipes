<template>
    <slot name="activator">
        <v-btn @click="dialog = true" variant="plain" density="default" :icon="mobile">
            <v-icon icon="fa-solid fa-search" class="mr-1 fa-fw"></v-icon>
            <span class="d-none d-sm-block">{{$t('Search')}}</span>
            <v-chip size="x-small" variant="tonal" class="d-none d-md-flex ml-1" label>{{$t('Ctrl+K')}}</v-chip>
        </v-btn>
    </slot>

    <v-dialog width="90%" max-width="800px" v-model="dialog" location="id_dialog_anchor"
              location-strategy="connected">

        <v-card>
            <!-- search input -->
            <v-card-text class="pb-0">
                <v-text-field
                    id="id_global_search_input"
                    v-model="searchQuery"
                    autocomplete="off"
                    clearable
                    placeholder="Search"
                    prepend-inner-icon="fas fa-search"
                    variant="solo"
                ></v-text-field>
            </v-card-text>

            <v-divider></v-divider>
            <!-- search results -->
            <v-card-text>
                <v-card :variant="cardVariant(index)" v-for="(item, index) in searchResults" hover class="mt-1" @click="selectedResult = index" :key="index">
                    <v-card-title @click="goToSelectedRecipe(index)">
                        <v-avatar v-if="item.image" :image="item.image"></v-avatar>
                        <v-avatar v-else-if="item.recipe_id !== undefined" color="tandoor">{{ item.name.charAt(0) }}</v-avatar>
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
                <small class="mr-2">{{$t('to_navigate')}}</small>
                <v-chip size="x-small" class="mr-1" label><i class="fas fa-level-down-alt fa-rotate-90"></i></v-chip>
                <small class="mr-2">{{$t('to_select')}}</small>
                <v-chip size="x-small" class="mr-1" label> esc</v-chip>
                <small>{{$t('to_close')}}</small>


            </v-card-text>
        </v-card>


    </v-dialog>
</template>

<script setup lang="ts">

import {computed, defineComponent, onMounted, ref, watch} from 'vue'
import {SearchResult} from "@/types/SearchTypes";
import {ApiApi, Recipe, RecipeFlat} from "@/openapi";
import {useRouter} from "vue-router";
import {useDisplay} from "vuetify";

const router = useRouter()
const {mobile} = useDisplay()

const dialog = ref(false)
const recipes = ref([] as Recipe[])
const flatRecipes = ref([] as RecipeFlat[])
const searchQuery = ref(null as string | null)
const selectedResult = ref(0)

/**
 * build array of search results
 * uses custom type to be able to incorporate recent items, plans, books, ... at a later stage
 */
const searchResults = computed(() => {
    let search_results = [] as Array<SearchResult>

    if (searchQuery.value != '' && searchQuery.value != null) {
        search_results.push({name: searchQuery.value, icon: 'fas fa-search', suffix: 'Advanced Search'} as SearchResult)

        flatRecipes.value.filter(fr => fr.name.toLowerCase().includes(searchQuery.value.toLowerCase())).slice(0, 10).forEach(r => {
            search_results.push({name: r.name, image: r.image, recipe_id: r.id} as SearchResult)
        })
    } else {
        // search_results.push({name: 'Recent 1', icon: 'fas fa-history',} as SearchResult)
        // search_results.push({name: 'Recent 2', icon: 'fas fa-history',} as SearchResult)
        // search_results.push({name: 'Recent 3', icon: 'fas fa-history',} as SearchResult)

        flatRecipes.value.slice(0, 5).forEach(r => {
            search_results.push({name: r.name, image: r.image, recipe_id: r.id} as SearchResult)
        })
    }

    return search_results

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

    const api = new ApiApi()
    api.apiRecipeFlatList().then(r => {
        flatRecipes.value = r
    })
})

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
    console.log('going to', searchResult.recipe_id)
    if (searchResult.recipe_id != null) {
        router.push({name: 'view_recipe', params: {'id': searchResult.recipe_id}})
    }
}
</script>


<style scoped>

</style>