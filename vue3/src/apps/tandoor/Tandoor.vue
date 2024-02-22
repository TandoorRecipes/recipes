<template>
    <v-app>
        <v-layout>
            <v-navigation-drawer v-model="drawer"
                                 :rail="rail"
                                 permanent
                                 @click="rail = false">
                <v-list-item @click="drawer = false">
                    <v-img src="../../assets/logo_color.svg" height="48px" v-if="rail"></v-img>
                    <v-img src="../../assets/brand_logo.svg" max-height="64px" v-if="!rail"></v-img>
                </v-list-item>
                <v-divider></v-divider>
                <v-list density="compact" nav>
                    <v-list-item prepend-icon="fas fa-book" title="Home" value="home"></v-list-item>
                    <v-list-item prepend-icon="fas fa-calendar-alt" title="My Account" value="account"></v-list-item>
                    <v-list-item prepend-icon="fas fa-shopping-cart" title="Users" value="users"></v-list-item>
                    <v-list-item prepend-icon="fas fa-book-open" title="Users" value="users"></v-list-item>
                </v-list>
                <v-divider></v-divider>
            </v-navigation-drawer>

            <v-app-bar color="tandoor" flat>
                <template v-slot:prepend>
                    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
                </template>


            </v-app-bar>


            <v-main>
                <v-container fluid class="pa-0 ma-0">
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
        </v-layout>


    </v-app>
</template>

<script lang="ts">

import {defineComponent} from 'vue'

export default defineComponent({
    components: {},
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
