import {useI18n} from "vue-i18n";
import {VDivider, VListItem} from "vuetify/components";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";
import {TANDOOR_PLUGINS} from "@/types/Plugins.ts";
import {plugin} from "@/plugins/open_data_plugin/plugin.ts";

/**
 * manages configuration and loading of navigation entries for tandoor main app and plugins
 */
export function useNavigation() {
    const {t} = useI18n()

    function getNavigationDrawer() {
        let navigation = [
            {component: VListItem, prependIcon: '$recipes', title: 'Home', to: {name: 'StartPage', params: {}}},
            {component: VListItem, prependIcon: '$search', title: t('Search'), to: {name: 'SearchPage', params: {}}},
            {component: VListItem, prependIcon: '$mealplan', title: t('Meal_Plan'), to: {name: 'MealPlanPage', params: {}}},
            {component: VListItem, prependIcon: '$shopping', title: t('Shopping_list'), to: {name: 'ShoppingListPage', params: {}}},
            {component: VListItem, prependIcon: 'fas fa-globe', title: t('Import'), to: {name: 'RecipeImportPage', params: {}}},
            {component: VListItem, prependIcon: '$books', title: t('Books'), to: {name: 'BooksPage', params: {}}},
            {component: VListItem, prependIcon: 'fa-solid fa-folder-tree', title: t('Database'), to: {name: 'DatabasePage', params: {}}},
        ]

        TANDOOR_PLUGINS.forEach(plugin => {
            plugin.navigationDrawer.forEach(navEntry => {
                let navEntryCopy = Object.assign({}, navEntry)
                if ('title' in navEntryCopy) {
                    navEntryCopy.title = t(navEntryCopy.title)
                }
                navigation.push(navEntryCopy)
            })
        })

        return navigation
    }

    function getBottomNavigation() {
        let navigation = [
            {component: VListItem, prependIcon: 'fa-solid fa-sliders', title: t('Settings'), to: {name: 'SettingsPage', params: {}}},
            {component: VListItem, prependIcon: 'fas fa-globe', title: t('Import'), to: {name: 'RecipeImportPage', params: {}}},
            {component: VListItem, prependIcon: 'fa-solid fa-folder-tree', title: t('Database'), to: {name: 'DatabasePage', params: {}}},
            {component: VListItem, prependIcon: '$books', title: t('Books'), to: {name: 'BooksPage', params: {}}},
        ]

        TANDOOR_PLUGINS.forEach(plugin => {
            plugin.bottomNavigation.forEach(navEntry => {
                let navEntryCopy = Object.assign({}, navEntry)
                if ('title' in navEntryCopy) {
                    navEntryCopy.title = t(navEntryCopy.title)
                }
                navigation.push(navEntryCopy)
            })
        })

        return navigation
    }

    function getUserNavigation() {
        let navigation = []

        navigation.push({component: VListItem, prependIcon: 'fa-solid fa-sliders', title: t('Settings'), to: {name: 'SettingsPage', params: {}}})
        navigation.push({component: VListItem, prependIcon: 'fa-solid fa-question', title: t('Help'), to: {name: 'HelpPage', params: {}}})

        if (useUserPreferenceStore().userSettings.user.isSuperuser) {
            navigation.push({component: VListItem, prependIcon: 'fa-solid fa-shield', title: t('Admin'), href: useDjangoUrls().getDjangoUrl('admin')})
        }

        if (useUserPreferenceStore().spaces.length > 1) {
            navigation.push({component: VDivider})
            useUserPreferenceStore().spaces.forEach(space => {
                navigation.push({
                    component: VListItem,
                    prependIcon: (useUserPreferenceStore().activeSpace.id == space.id) ? 'fa-solid fa-circle-dot' : 'fa-solid fa-circle',
                    title: space.name,
                    onClick: () => {
                        useUserPreferenceStore().switchSpace(space)
                    }
                })
            })
            navigation.push({component: VDivider})
        }

        TANDOOR_PLUGINS.forEach(plugin => {
            plugin.userNavigation.forEach(navEntry => {
                let navEntryCopy = Object.assign({}, navEntry)
                if ('title' in navEntryCopy) {
                    navEntryCopy.title = t(navEntryCopy.title)
                }
                navigation.push(navEntryCopy)
            })
        })

        navigation.push({component: VListItem, prependIcon: 'fa-solid fa-arrow-right-from-bracket', title: t('Logout'), href: useDjangoUrls().getDjangoUrl('accounts/logout')})

        return navigation
    }

    return {getNavigationDrawer, getBottomNavigation, getUserNavigation}
}