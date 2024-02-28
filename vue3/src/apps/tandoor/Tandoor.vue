<template>
    <v-app>


            <v-app-bar color="tandoor" flat density="comfortable" >
                <v-img class="ms-2" src="../../assets/brand_logo.svg"></v-img>
                <global-search-dialog></global-search-dialog>
                <v-spacer></v-spacer>
                <v-btn density="compact" icon="fas fa-ellipsis-v"></v-btn>
            </v-app-bar>


            <v-main>
                <v-container class="pa-0 ma-0 mb-2">
                    <router-view></router-view>
                </v-container>
            </v-main>

            <v-bottom-navigation>
                <v-btn value="recent" to="/search">
                    <v-icon icon="fas fa-book"/>
                    <span>Recipes</span>
                </v-btn>

                <v-btn value="favorites" to="/mealplan">
                    <v-icon icon="fas fa-calendar-alt"></v-icon>

                    <span>MealPlan</span>
                </v-btn>

                <v-btn value="nearby" to="/shopping">
                    <v-icon icon="fas fa-shopping-cart"></v-icon>

                    <span>Shopping</span>
                </v-btn>
                <v-btn value="nearby" to="/books">
                    <v-icon icon="fas fa-book-open"></v-icon>

                    <span>Books</span>
                </v-btn>
            </v-bottom-navigation>



    </v-app>
</template>

<script lang="ts">

import {defineComponent} from 'vue'
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue";

export default defineComponent({
    components: {GlobalSearchDialog},
    mixins: [],
    data() {
        return {
            drawer: true,
            rail: true,
        }
    },
    mounted() {

    },
    methods: {},
})

</script>

<style scoped>


</style>
