<template>
    <v-app>
        <v-app-bar color="tandoor" flat density="comfortable">
            <router-link :to="{ name: 'view_home', params: {} }">
                <v-img src="../../assets/brand_logo.svg" width="140px" class="ms-2"></v-img>
            </router-link>
            <v-spacer></v-spacer>
            <global-search-dialog></global-search-dialog>
            <v-btn icon="$add">
                <v-icon icon="$add"></v-icon>
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item prepend-icon="$add" :to="{ name: 'ModelEditPage', params: {model: 'recipe'} }">{{ $t('Create Recipe') }}</v-list-item>
                        <v-list-item prepend-icon="fa-solid fa-globe" :to="{ name: 'RecipeImportPage', params: {} }">{{ $t('Import Recipe') }}</v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-avatar color="primary" class="me-2 cursor-pointer">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}
                <v-menu activator="parent">

                    <v-list density="compact">
                        <v-list-item class="mb-1">
                            <template #prepend>
                                <v-avatar color="primary">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}</v-avatar>
                            </template>
                            <v-list-item-title>{{ useUserPreferenceStore().userSettings.user.displayName }}</v-list-item-title>
                            <v-list-item-subtitle>{{ useUserPreferenceStore().activeSpace.name }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item :to="{ name: 'view_settings', params: {} }">
                            <template #prepend>
                                <v-icon icon="fa-solid fa-sliders"></v-icon>
                            </template>
                            {{ $t('Settings') }}
                        </v-list-item>
                        <v-list-item :to="{ name: 'ModelListPage', params: {model: 'food'} }">
                            <template #prepend>
                                <v-icon icon="fa-solid fa-folder-tree"></v-icon>
                            </template>
                            {{ $t('Database') }}
                        </v-list-item>
                        <!--                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-user-shield"></v-icon></template>Admin</v-list-item>-->
                        <!--                        <v-list-item><template #prepend><v-icon icon="fa-solid fa-question"></v-icon></template>Help</v-list-item>-->
                        <v-divider></v-divider>
                        <v-list-subheader>Spaces</v-list-subheader>
                        <v-list-item>Space 1</v-list-item>
                        <v-list-item>Space 2</v-list-item>
                        <v-list-item>Space 3</v-list-item>
                        <v-divider></v-divider>
                        <v-list-item link>
                            <template #prepend>
                                <v-icon icon="fa-solid fa-database"></v-icon>
                            </template>
                            {{ $t('Messages') }}
                            <message-list-dialog></message-list-dialog>
                        </v-list-item>
                        <v-list-item :href="getDjangoUrl('accounts/logout')" link>
                            <template #prepend>
                                <v-icon icon="fa-solid fa-arrow-right-from-bracket"></v-icon>
                            </template>
                            {{ $t('Logout') }}
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-avatar>
        </v-app-bar>
        <v-app-bar color="warning" density="compact" v-if="useUserPreferenceStore().activeSpace.maxRecipes == 10 && useUserPreferenceStore().serverSettings.hosted">
            <p class="text-center w-100">
                {{ $t('HostedFreeVersion') }}
                <v-btn color="success" variant="flat" href="https://tandoor.dev/manage">{{ $t('UpgradeNow') }}</v-btn>
            </p>
        </v-app-bar>

        <v-app-bar color="info" density="compact" v-if="useUserPreferenceStore().activeSpace.message != ''">
            <p class="text-center w-100">
                {{ useUserPreferenceStore().activeSpace.message }}
            </p>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-navigation-drawer v-if="lgAndUp">
            <v-list-item :to="{ name: 'view_settings', params: {} }">
                <template #prepend>
                    <v-avatar color="primary">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}</v-avatar>
                </template>
                <v-list-item-title>{{ useUserPreferenceStore().userSettings.user.displayName }}</v-list-item-title>
                <v-list-item-subtitle>{{ useUserPreferenceStore().activeSpace.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="fas fa-book" title="Home" :to="{ name: 'view_home', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-calendar-alt" :title="$t('Meal_Plan')" :to="{ name: 'view_mealplan', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-shopping-cart" :title="$t('Shopping_list')" :to="{ name: 'view_shopping', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-globe" :title="$t('Import')" :to="{ name: 'RecipeImportPage', params: {} }"></v-list-item>
            <v-list-item prepend-icon="fas fa-bars" title="Test" :to="{ name: 'view_test', params: {} }"></v-list-item>

            <navigation-drawer-context-menu></navigation-drawer-context-menu>

            <template #append>
                <v-list-item prepend-icon="fas fa-sliders" :title="$t('Settings')" :to="{ name: 'view_settings', params: {} }"></v-list-item>
                <v-list-item prepend-icon="fa-solid fa-heart" href="https://tandoor.dev" target="_blank">
                    Tandoor {{ useUserPreferenceStore().serverSettings.version }}
                </v-list-item>
            </template>
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
import {TAutomation, TCookLog, TFood, TKeyword, TPropertyType, TSupermarket, TSupermarketCategory, TUnit, TUnitConversion, TUserFile, TViewLog} from "@/types/Models";
import NavigationDrawerContextMenu from "@/components/display/NavigationDrawerContextMenu.vue";
import {useDjangoUrls} from "@/composables/useDjangoUrls";

const {lgAndUp} = useDisplay()
const {getDjangoUrl} = useDjangoUrls()

useUserPreferenceStore()

</script>

<style scoped>


</style>
