<template>
    <v-app>
        <v-app-bar color="tandoor" flat density="comfortable">
            <router-link :to="{ name: 'view_home', params: {} }">
                <v-img src="../../assets/brand_logo.svg" width="140px" class="ms-2"></v-img>
            </router-link>
            <v-spacer></v-spacer>
            <global-search-dialog></global-search-dialog>
            <v-btn icon="$add">
                <v-icon icon="$add" class="fa-fw"></v-icon>
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
                        <template v-if="spaces.length > 1">
                            <v-divider></v-divider>
                            <v-list-subheader>{{ $t('YourSpaces') }}</v-list-subheader>
                            <v-list-item v-for="s in spaces" :key="s.id" @click="useUserPreferenceStore().switchSpace(s)">
                                <template #prepend>
                                    <v-icon icon="fa-solid fa-circle-dot" v-if="s.id == useUserPreferenceStore().activeSpace.id"></v-icon>
                                    <v-icon icon="fa-solid fa-circle" v-else></v-icon>
                                </template>
                                {{ s.name }}
                            </v-list-item>
                        </template>

                        <v-divider></v-divider>
                        <v-list-item link>
                            <template #prepend>
                                <v-icon icon="fa-solid fa-database"></v-icon>
                            </template>
                            {{ $t('Messages') }}
                            <message-list-dialog></message-list-dialog>
                        </v-list-item>
                        <v-list-item :href="getDjangoUrl('admin')" target="_blank" v-if="useUserPreferenceStore().userSettings.user.isSuperuser">
                            <template #prepend>
                                <v-icon icon="fa-solid fa-shield"></v-icon>
                            </template>
                            {{ $t('Admin') }}
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
        <v-app-bar color="info" density="compact" v-if="useUserPreferenceStore().activeSpace.maxRecipes == 10 && useUserPreferenceStore().serverSettings.hosted">
            <p class="text-center w-100">
                {{ $t('HostedFreeVersion') }}
                <v-btn color="success" variant="flat" href="https://tandoor.dev/manage">{{ $t('UpgradeNow') }}</v-btn>
            </p>
        </v-app-bar>
        <v-app-bar color="warning" density="compact" v-if="isSpaceAboveLimit(useUserPreferenceStore().activeSpace)">
            <p class="text-center w-100">
                {{ $t('SpaceLimitExceeded') }}
                <v-btn color="success" variant="flat" :to="{name: 'view_settings_space'}">{{ $t('SpaceSettings') }}</v-btn>
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
            <v-list nav>
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
                <v-list-item prepend-icon="fa-solid fa-folder-tree" :title="$t('Database')" :to="{ name: 'ModelListPage', params: {model: 'food'} }"></v-list-item>

                <navigation-drawer-context-menu></navigation-drawer-context-menu>
            </v-list>


            <template #append>
                <v-list nav>
                    <v-list-item prepend-icon="fas fa-sliders" :title="$t('Settings')" :to="{ name: 'view_settings', params: {} }"></v-list-item>
                    <v-list-item prepend-icon="fa-solid fa-heart" href="https://tandoor.dev" target="_blank">
                        Tandoor {{ useUserPreferenceStore().serverSettings.version }}
                    </v-list-item>
                </v-list>
            </template>

        </v-navigation-drawer>

        <v-bottom-navigation grow v-if="!lgAndUp">
            <v-btn value="recent" :to="{ name: 'view_home', params: {} }">
                <v-icon icon="fa-fw fas fa-book "/>
            </v-btn>

            <v-btn value="favorites" to="/mealplan">
                <v-icon icon="fa-fw fas fa-calendar-alt"></v-icon>
            </v-btn>

            <v-btn value="nearby" to="/shopping">
                <v-icon icon="fa-fw fas fa-shopping-cart"></v-icon>
            </v-btn>

            <v-btn value="nearby">
                <v-icon icon="fa-fw fas fa-bars"></v-icon>
                <v-bottom-sheet activator="parent" close-on-content-click>
                    <v-list nav>
                        <v-list-item prepend-icon="fa-solid fa-sliders" :to="{ name: 'view_settings', params: {} }" :title="$t('Settings')"></v-list-item>
                        <v-list-item prepend-icon="fas fa-globe" :title="$t('Import')" :to="{ name: 'RecipeImportPage', params: {} }"></v-list-item>
                        <v-list-item prepend-icon="fa-solid fa-folder-tree" :to="{ name: 'ModelListPage', params: {model: 'food'} }" :title="$t('Database')"></v-list-item>
                    </v-list>
                </v-bottom-sheet>
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
import {onMounted, ref} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore";
import {ApiApi, Space} from "@/openapi";
import {isSpaceAboveLimit, isSpaceAtLimit} from "@/utils/logic_utils";

const {lgAndUp} = useDisplay()
const {getDjangoUrl} = useDjangoUrls()

const spaces = ref([] as Space[])

onMounted(() => {
    let api = new ApiApi()

    useUserPreferenceStore()

    api.apiSpaceList().then(r => {
        spaces.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

</script>

<style scoped>


</style>
