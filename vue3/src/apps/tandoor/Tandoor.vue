<template>
    <v-app>
        <v-app-bar color="tandoor" flat density="comfortable" v-if="!useUserPreferenceStore().isAuthenticated">

        </v-app-bar>
        <v-app-bar :color="useUserPreferenceStore().activeSpace.navBgColor ? useUserPreferenceStore().activeSpace.navBgColor : useUserPreferenceStore().userSettings.navBgColor"
                   flat density="comfortable" v-if="useUserPreferenceStore().isAuthenticated" :scroll-behavior="useUserPreferenceStore().userSettings.navSticky ? '' : 'hide'">
            <router-link :to="{ name: 'StartPage', params: {} }">
                <v-img src="../../assets/brand_logo.svg" width="140px" class="ms-2"
                       v-if="useUserPreferenceStore().userSettings.navShowLogo && !useUserPreferenceStore().activeSpace.navLogo"></v-img>
                <v-img :src="useUserPreferenceStore().activeSpace.navLogo.preview" width="140px" class="ms-2"
                       v-if="useUserPreferenceStore().userSettings.navShowLogo && useUserPreferenceStore().activeSpace.navLogo != undefined"></v-img>
            </router-link>


            <v-spacer></v-spacer>
            <global-search-dialog></global-search-dialog>
            <v-btn icon="$add" class="d-print-none">
                <v-icon icon="$add" class="fa-fw"></v-icon>
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item prepend-icon="$add" :to="{ name: 'ModelEditPage', params: {model: 'recipe'} }">{{ $t('Create Recipe') }}</v-list-item>
                        <v-list-item prepend-icon="fa-solid fa-globe" :to="{ name: 'RecipeImportPage', params: {} }">{{ $t('Import Recipe') }}</v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-avatar color="primary" class="me-2 cursor-pointer d-print-none">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}
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

                        <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getUserNavigation()"></component>
                    </v-list>
                </v-menu>
            </v-avatar>

        </v-app-bar>
        <v-app-bar color="info" density="compact"
                   v-if="useUserPreferenceStore().isAuthenticated && useUserPreferenceStore().activeSpace.maxRecipes == 10 && useUserPreferenceStore().serverSettings.hosted">
            <p class="text-center w-100">
                {{ $t('HostedFreeVersion') }}
                <v-btn color="success" variant="flat" href="https://tandoor.dev/manage">{{ $t('UpgradeNow') }}</v-btn>
            </p>
        </v-app-bar>
        <v-app-bar color="warning" density="compact" v-if="useUserPreferenceStore().isAuthenticated && isSpaceAboveLimit(useUserPreferenceStore().activeSpace)">
            <p class="text-center w-100">
                {{ $t('SpaceLimitExceeded') }}
                <v-btn color="success" variant="flat" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
            </p>
        </v-app-bar>

        <v-app-bar color="info" density="compact" v-if="useUserPreferenceStore().isAuthenticated && useUserPreferenceStore().activeSpace.message != ''">
            <p class="text-center w-100">
                {{ useUserPreferenceStore().activeSpace.message }}
            </p>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <!-- completely hide in print mode because setting d-print-node keeps layout -->
        <v-navigation-drawer v-if="lgAndUp && useUserPreferenceStore().isAuthenticated && !isPrintMode">
            <v-list nav>
                <v-list-item :to="{ name: 'SettingsPage', params: {} }">
                    <template #prepend>
                        <v-avatar color="primary">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}</v-avatar>
                    </template>
                    <v-list-item-title>{{ useUserPreferenceStore().userSettings.user.displayName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ useUserPreferenceStore().activeSpace.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider></v-divider>
                <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getNavigationDrawer()"></component>

                <navigation-drawer-context-menu></navigation-drawer-context-menu>
            </v-list>

            <template #append>
                <v-list nav>
                    <v-list-item prepend-icon="fas fa-sliders" :title="$t('Settings')" :to="{ name: 'SettingsPage', params: {} }"></v-list-item>
                    <v-list-item prepend-icon="fa-solid fa-heart" link>
                        Tandoor {{ useUserPreferenceStore().serverSettings.version }}
                        <help-dialog></help-dialog>
                    </v-list-item>
                </v-list>
            </template>

        </v-navigation-drawer>

        <v-bottom-navigation grow v-if="useUserPreferenceStore().isAuthenticated && !lgAndUp">
            <v-btn value="recent" :to="{ name: 'StartPage', params: {} }">
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
                        <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getBottomNavigation()"></component>
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
import NavigationDrawerContextMenu from "@/components/display/NavigationDrawerContextMenu.vue";
import {useDjangoUrls} from "@/composables/useDjangoUrls";
import {nextTick, onMounted} from "vue";
import {isSpaceAboveLimit} from "@/utils/logic_utils";
import {useMediaQuery, useTitle} from "@vueuse/core";
import HelpDialog from "@/components/dialogs/HelpDialog.vue";
import {NAVIGATION_DRAWER} from "@/utils/navigation.ts";
import {useNavigation} from "@/composables/useNavigation.ts";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const {lgAndUp} = useDisplay()
const {getDjangoUrl} = useDjangoUrls()
const {t} = useI18n()

const title = useTitle()
const router = useRouter()

const isPrintMode = useMediaQuery('print')

onMounted(() => {
    useUserPreferenceStore()
})

/**
 * global title update handler, might be overridden by page specific handlers
 */
router.afterEach((to, from) => {
    nextTick(() => {
        if (to.meta.title) {
            title.value = t(to.meta.title)
        } else {
            title.value = 'Tandoor'
        }
    })
})

</script>

<style>

.v-theme--dark {

    a:not([class]) {
        color: #b98766;
        text-decoration: none;
        background-color: transparent
    }

    a:hover {
        color: #fff;
        text-decoration: none
    }

    a:not([href]):not([tabindex]), a:not([href]):not([tabindex]):focus, a:not([href]):not([tabindex]):hover {
        color: inherit;
        text-decoration: none
    }

    a:not([href]):not([tabindex]):focus {
        outline: 0
    }

    /* Meal-Plan */

    .cv-header {
        background-color: #303030 !important;
    }

    .cv-weeknumber, .cv-header-day {
        background-color: #303030 !important;
        color: #fff !important;
    }

    .cv-day.past {
        background-color: #333333 !important;
    }

    .cv-day.today {
        background-color: rgba(185, 135, 102, 0.2) !important;
    }

    .cv-day.outsideOfMonth {
        background-color: #0d0d0d !important;
    }

    .cv-item {
        background-color: #4E4E4E !important;
    }

    .d01 .cv-day-number {
        background-color: #b98766 !important;
    }
}

.v-theme--light {
    a:not([class]) {
        color: #b98766;
        text-decoration: none;
        background-color: transparent
    }

    a:hover {
        color: #000;
        text-decoration: none
    }

    a:not([href]):not([tabindex]), a:not([href]):not([tabindex]):focus, a:not([href]):not([tabindex]):hover {
        color: inherit;
        text-decoration: none
    }

    a:not([href]):not([tabindex]):focus {
        outline: 0
    }

}

/* vueform/multiselect */

.multiselect-option.is-pointed {
    background: #b98766 !important;
}

.multiselect-option.is-selected {
    background: #b55e4f !important;
}

</style>
