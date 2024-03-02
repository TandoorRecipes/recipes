<template>
    <slot name="activator">
        <v-btn @click="dialog = true"><i class="fas fa-search mr-1"></i> Search</v-btn>
    </slot>

    <v-dialog width="90%" max-width="800px" v-model="dialog" location="id_dialog_anchor"
              location-strategy="connected">

        <v-card>
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
            <v-card-text>

                <v-card :variant="cardVariant(index)" v-for="(item, index) in search_results" hover class="mt-1" @click="selected_result = index">
                    <v-card-title @click="goToSelectedRecipe()">
                        <v-avatar v-if="item.image" :image="item.image"></v-avatar>
                        <v-icon :icon="item.icon" v-if="item.icon"></v-icon>
                        {{ item.name }}
                    </v-card-title>
                </v-card>
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
        window.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowUp') {
                this.selected_result = Math.max(0, this.selected_result - 1)
            }
            if (e.key == 'ArrowDown') {
                this.selected_result = Math.min(this.search_results.length, this.selected_result + 1)
            }
            if (e.key == 'Enter') {
                this.goToSelectedRecipe()
            }
        })

        const api = new ApiApi()
        api.apiRecipeFlatList().then(r => {
            this.flat_recipes = r
        })
    },
    methods: {
        cardVariant(index: number) {
            if (this.selected_result == index) {
                return 'tonal'
            } else {
                return 'elevated'
            }
        },
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