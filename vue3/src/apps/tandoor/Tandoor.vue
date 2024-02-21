<template>
    <v-app>

            <v-app-bar color="primary">
                <template v-slot:prepend>
                    <v-app-bar-nav-icon></v-app-bar-nav-icon>
                </template>

                <v-app-bar-title>
                    <v-img height="40px" src="../../assets/brand_logo.svg"></v-img>
                </v-app-bar-title>
            </v-app-bar>


            <v-main>
                <v-container>
                    <router-view></router-view>
                </v-container>
            </v-main>

            <v-bottom-navigation>
                <v-btn value="recent" to="/">
                    <v-icon icon="fas fa-book"/>
                    <span>Recipes</span>
                </v-btn>

                <v-btn value="favorites" to="/about">
                    <v-icon icon="fas fa-calendar-alt"></v-icon>

                    <span>MealPlan</span>
                </v-btn>

                <v-btn value="nearby">
                    <v-icon icon="fas fa-shopping-cart"></v-icon>

                    <span>Shopping</span>
                </v-btn>
                <v-btn value="nearby">
                    <v-icon icon="fas fa-book-open"></v-icon>

                    <span>Books</span>
                </v-btn>
            </v-bottom-navigation>

    </v-app>
</template>

<script lang="ts">

import {defineComponent} from 'vue'

export default defineComponent({
    components: {},
    mixins: [],
    data() {
        return {}
    },
    mounted() {

    },
    methods: {},
})

</script>

<style scoped>


</style>
