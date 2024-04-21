<template>
    <v-app>

        <v-app-bar color="tandoor" flat density="comfortable">
            <router-link :to="{name: 'view_home', params: {}}">
                <v-img src="../../assets/brand_logo.svg" width="140px" class="ms-2"></v-img>
            </router-link>
            <v-spacer></v-spacer>
            <global-search-dialog></global-search-dialog>
            <v-avatar color="cyan" class="me-2">V</v-avatar>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-navigation-drawer v-if="lgAndUp">
            <v-list-item title="My Application" subtitle="Vuetify"></v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="fas fa-book" title="Home" :to="{name: 'view_home', params: {}}"></v-list-item>
            <v-list-item prepend-icon="fas fa-calendar-alt" title="Mealplan" :to="{name: 'view_mealplan', params: {}}"></v-list-item>
            <v-list-item prepend-icon="fas fa-shopping-cart" title="Shopping" :to="{name: 'view_shopping', params: {}}"></v-list-item>
            <v-list-item prepend-icon="fas fa-bars" title="More" :to="{name: 'view_books', params: {}}"></v-list-item> <!-- TODO link -->
        </v-navigation-drawer>

        <v-bottom-navigation grow v-if="!lgAndUp">
            <v-btn value="recent" :to="{name: 'view_home', params: {}}">
                <v-icon icon="fa-fw fas fa-book "/>
                <span>Recipes</span>
            </v-btn>

            <v-btn value="favorites" to="/mealplan">
                <v-icon icon="fa-fw fas fa-calendar-alt"></v-icon>

                <span>MealPlan</span>
            </v-btn>

            <v-btn value="nearby" to="/shopping">
                <v-icon icon="fa-fw fas fa-shopping-cart"></v-icon>

                <span>Shopping</span>
            </v-btn>
            <v-btn value="nearby" to="/books"> <!-- TODO link -->
                <v-icon icon="fa-fw fas fa-bars"></v-icon>

                <span>More</span>
            </v-btn>
        </v-bottom-navigation>


    </v-app>
</template>

<script lang="ts" setup>

import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue";
import {ref} from "vue";
import {useDisplay} from "vuetify";

const {lgAndUp} = useDisplay()

const drawer = ref(true)
const rail = ref(true)
const overlay = ref(false)


</script>

<style scoped>


</style>
