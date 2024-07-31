<template>
    <v-app>
        <v-app-bar color="tandoor" flat density="comfortable">
            <router-link :to="{ name: 'view_home', params: {} }">
                <v-img src="../../assets/brand_logo.svg" width="140px" class="ms-2"></v-img>
            </router-link>
            <v-spacer></v-spacer>
            <global-search-dialog></global-search-dialog>


            <v-avatar color="cyan" class="me-2">V
                <v-menu activator="parent">

                    <v-list density="compact">
                        <v-list-item class="pb-2">
                            <v-card>
                                <v-avatar color="cyan" class="me-2">V</v-avatar> vabene1111
                            </v-card>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-sliders"></v-icon></template>Settings</v-list-item>
                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-server"></v-icon></template>System</v-list-item>
                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-user-shield"></v-icon></template>Admin</v-list-item>
                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-question"></v-icon></template>Help</v-list-item>
                        <v-divider></v-divider>
                        <v-list-subheader>Spaces</v-list-subheader>
                        <v-list-item>Space 1</v-list-item>
                        <v-list-item>Space 2</v-list-item>
                        <v-list-item>Space 3</v-list-item>
                        <v-divider></v-divider>
                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-database"></v-icon></template>Messages<message-list-dialog></message-list-dialog></v-list-item>
                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-arrow-right-from-bracket"></v-icon></template>Logout</v-list-item>
                    </v-list>
                </v-menu>
            </v-avatar>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-navigation-drawer v-if="lgAndUp">
            <v-list-item title="My Application" subtitle="Vuetify"></v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="fas fa-book" title="Home" :to="{ name: 'view_home', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-calendar-alt" title="Mealplan" :to="{ name: 'view_mealplan', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-shopping-cart" title="Shopping" :to="{ name: 'view_shopping', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-bars" title="More" :to="{ name: 'view_books', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-bars" title="Test" :to="{ name: 'view_test', params: {} }"></v-list-item>
            <!-- TODO link -->
        </v-navigation-drawer>

        <v-bottom-navigation grow v-if="!lgAndUp">
            <v-btn value="recent" :to="{ name: 'view_home', params: {} }">
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
            <v-btn value="nearby" to="/books">
                <!-- TODO link -->
                <v-icon icon="fa-fw fas fa-bars"></v-icon>

                <span>More</span>
            </v-btn>
        </v-bottom-navigation>

        <v-snackbar-queued
            :vertical="true"
            location="top center"
        ></v-snackbar-queued>

    </v-app>
</template>

<script lang="ts" setup>
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue"

import {useDisplay} from "vuetify"
import VSnackbarQueued from "@/components/display/VSnackbarQueued.vue";
import MessageListDialog from "@/components/dialogs/MessageListDialog.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const {lgAndUp} = useDisplay()

useUserPreferenceStore()

</script>

<style scoped>


</style>
