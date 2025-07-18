import {useI18n} from "vue-i18n";
import {VDivider, VListItem} from "vuetify/components";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";

/**
 * manages configuration and loading of navigation entries for tandoor main app and plugins
 */
export function useNavigation() {
    const {t} = useI18n()

    let NAVIGATION_DRAWER = [
        {component: VListItem, prependIcon: '$recipes', title: 'Home', to: {name: 'StartPage', params: {}}},
        {component: VListItem, prependIcon: '$search', title: t('Search'), to: {name: 'SearchPage', params: {}}},
        {component: VListItem, prependIcon: '$mealplan', title: t('Meal_Plan'), to: {name: 'MealPlanPage', params: {}}},
        {component: VListItem, prependIcon: '$shopping', title: t('Shopping_list'), to: {name: 'ShoppingListPage', params: {}}},
        {component: VListItem, prependIcon: 'fas fa-globe', title: t('Import'), to: {name: 'RecipeImportPage', params: {}}},
        {component: VListItem, prependIcon: '$books', title: t('Books'), to: {name: 'BooksPage', params: {}}},
        {component: VListItem, prependIcon: 'fa-solid fa-folder-tree', title: t('DatabasePage'), to: {name: 'SearchPage', params: {}}},
    ]

    let BOTTOM_NAVIGATION = [
        {component: VListItem, prependIcon: 'fa-solid fa-sliders', title: t('Settings'), to: {name: 'SettingsPage', params: {}}},
        {component: VListItem, prependIcon: 'fas fa-globe', title: t('Import'), to: {name: 'RecipeImportPage', params: {}}},
        {component: VListItem, prependIcon: 'fa-solid fa-folder-tree', title: t('Database'), to: {name: 'DatabasePage', params: {}}},
        {component: VListItem, prependIcon: '$books', title: t('Books'), to: {name: 'BooksPage', params: {}}},
    ]

    let USER_NAVIGATION = [
        {component: VListItem, prependIcon: 'fa-solid fa-sliders', title: t('Settings'), to: {name: 'SettingsPage', params: {}}},
        {component: VListItem, prependIcon: 'fa-solid fa-question', title: t('Settings'), to: {name: 'HelpPage', params: {}}},
    ]

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

        navigation.push({component: VListItem, prependIcon: 'fa-solid fa-arrow-right-from-bracket', title: t('Logout'), href: useDjangoUrls().getDjangoUrl('accounts/logout')})

        return navigation
    }

    return {NAVIGATION_DRAWER, BOTTOM_NAVIGATION, USER_NAVIGATION, getUserNavigation}
}


//

// <v-list-item :href="getDjangoUrl('admin')" target="_blank" v-if="useUserPreferenceStore().userSettings.user.isSuperuser">
//     <template #prepend>
//         <v-icon icon="fa-solid fa-shield"></v-icon>
//     </template>
//     {{ $t('Admin') }}
// </v-list-item>
// <v-list-item :href="getDjangoUrl('accounts/logout')" link>
//     <template #prepend>
//         <v-icon icon="fa-solid fa-arrow-right-from-bracket"></v-icon>
//     </template>
//     {{ $t('Logout') }}
// </v-list-item>