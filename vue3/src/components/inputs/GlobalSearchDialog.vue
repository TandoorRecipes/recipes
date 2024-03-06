<template>
    <slot name="activator">
        <v-btn @click="dialog = true" variant="plain" density="default">
            <i class="fas fa-search mr-1"></i>
            <span class="d-none d-sm-block">Search</span>
            <v-chip size="x-small" variant="tonal" class="d-none d-md-flex ml-1" label>Ctrl+K</v-chip>
        </v-btn>
    </slot>

    <v-dialog width="90%" max-width="800px" v-model="dialog" location="id_dialog_anchor"
              location-strategy="connected">

        <v-card>
            <!-- search input -->
            <v-card-text class="pb-0">
                <v-text-field
                    id="id_global_search_input"
                    v-model="search_query"
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
                <v-card :variant="cardVariant(index)" v-for="(item, index) in search_results" hover class="mt-1" @click="selected_result = index" :key="index">
                    <v-card-title @click="goToSelectedRecipe()">
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
                <small class="mr-2">to navigate</small>
                <v-chip size="x-small" class="mr-1" label><i class="fas fa-level-down-alt fa-rotate-90"></i></v-chip>
                <small class="mr-2">to select</small>
                <v-chip size="x-small" class="mr-1" label> esc</v-chip>
                <small>to close</small>


            </v-card-text>
        </v-card>


    </v-dialog>
</template>

<script lang="ts">

import {defineComponent} from 'vue'
import {SearchResult} from "@/types/SearchTypes";
import {ApiApi, Recipe, RecipeFlat} from "@/openapi";

export default defineComponent({
    name: "GlobalSearchDialog",
    props: {},
    watch: {
        dialog: function (newValue) {
            /**
             * since dialog has no opened event watch the variable and focus input after delay (nextTick/directly does not work)
             */
            this.search_query = ""
            setTimeout(() => {
                if (newValue) {
                    let search = document.getElementById('id_global_search_input')
                    if (search != null) {
                        search.focus()
                    }
                }
            }, 20)
        },
        search_query: function (newValue) {
            /**
             * update selected result if search result length changes due to search_query changes
             */
            if (this.selected_result >= this.search_results.length) {
                this.selected_result = this.search_results.length - 1
            }
        },
    },
    data() {
        return {
            dialog: false,
            recipes: [] as Recipe[],
            flat_recipes: [] as RecipeFlat[],
            search_query: null,
            selected_result: 0,
        }
    },
    computed: {
        /**
         * build array of search results
         * uses custom type to be able to incorporate recent items, plans, books, ... at a later stage
         */
        search_results: function () {
            let search_results = [] as Array<SearchResult>

            if (this.search_query != '' && this.search_query != null) {
                search_results.push({name: this.search_query, icon: 'fas fa-search', suffix: 'Advanced Search'} as SearchResult)

                this.flat_recipes.filter(fr => fr.name.toLowerCase().includes(this.search_query.toLowerCase())).slice(0, 10).forEach(r => {
                    search_results.push({name: r.name, image: r.image, recipe_id: r.id} as SearchResult)
                })
            } else {
                // search_results.push({name: 'Recent 1', icon: 'fas fa-history',} as SearchResult)
                // search_results.push({name: 'Recent 2', icon: 'fas fa-history',} as SearchResult)
                // search_results.push({name: 'Recent 3', icon: 'fas fa-history',} as SearchResult)

                this.flat_recipes.slice(0, 5).forEach(r => {
                    search_results.push({name: r.name, image: r.image, recipe_id: r.id} as SearchResult)
                })
            }

            return search_results
        }
    },
    mounted() {
        // add keyhandlers
        window.addEventListener('keydown', (e) => {
            if (this.dialog) {
                if (e.key == 'ArrowUp') {
                    this.selected_result = Math.max(0, this.selected_result - 1)
                }
                if (e.key == 'ArrowDown') {
                    this.selected_result = Math.min(this.search_results.length, this.selected_result + 1)
                }
                if (e.key == 'Enter') {
                    this.goToSelectedRecipe()
                }
                if (e.key == 'k' && e.ctrlKey) {
                    this.dialog = true
                    e.preventDefault()
                }
            }
        })

        const api = new ApiApi()
        api.apiRecipeFlatList().then(r => {
            this.flat_recipes = r
        })
    },
    methods: {
        /**
         * determines the style for selected elements
         * @param index index of card to determine style for
         */
        cardVariant(index: number) {
            if (this.selected_result == index) {
                return 'tonal'
            } else {
                return 'elevated'
            }
        },
        /**
         * open selected recipe
         */
        goToSelectedRecipe() {
            this.dialog = false
            let searchResult = this.search_results[this.selected_result]
            if (searchResult.recipe_id != null) {
                this.$router.push({name: 'view_recipe', params: {'id': searchResult.recipe_id}})
            }
        }
    },
})
</script>


<style scoped>

</style>