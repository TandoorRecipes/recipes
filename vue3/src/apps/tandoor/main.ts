import {createApp} from "vue";
import {createRouter, createWebHistory} from 'vue-router'
import {createPinia} from 'pinia'
// @ts-ignore
import App from './Tandoor.vue'

import vuetify from "@/vuetify";
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'vite/modulepreload-polyfill';
import { createRulesPlugin } from 'vuetify/labs/rules'

import {setupI18n} from "@/i18n";
import MealPlanPage from "@/pages/MealPlanPage.vue";
import {TANDOOR_PLUGINS, TandoorPlugin} from "@/types/Plugins.ts";

let routes = [
    {path: '/', component: () => import("@/pages/StartPage.vue"), name: 'StartPage'},
    {path: '/search', redirect: {name: 'StartPage'}},
    {path: '/test', component: () => import("@/pages/TestPage.vue"), name: 'view_test'},
    {path: '/help', component: () => import("@/pages/HelpPage.vue"), name: 'HelpPage'},
    {
        path: '/settings', component: () => import("@/pages/SettingsPage.vue"), name: 'SettingsPage', redirect: '/settings/account',
        children: [
            {path: 'account', component: () => import("@/components/settings/AccountSettings.vue"), name: 'AccountSettings'},
            {path: 'cosmetic', component: () => import("@/components/settings/CosmeticSettings.vue"), name: 'CosmeticSettings'},
            {path: 'shopping', component: () => import("@/components/settings/ShoppingSettings.vue"), name: 'ShoppingSettings'},
            {path: 'meal-plan', component: () => import("@/components/settings/MealPlanSettings.vue"), name: 'MealPlanSettings'},
            {path: 'search', component: () => import("@/components/settings/SearchSettings.vue"), name: 'SearchSettings'},
            {path: 'space', component: () => import("@/components/settings/SpaceSettings.vue"), name: 'SpaceSettings'},
            {path: 'space-members', component: () => import("@/components/settings/SpaceMemberSettings.vue"), name: 'SpaceMemberSettings'},
            {path: 'user-space', component: () => import("@/components/settings/UserSpaceSettings.vue"), name: 'UserSpaceSettings'},
            {path: 'open-data-import', component: () => import("@/components/settings/OpenDataImportSettings.vue"), name: 'OpenDataImportSettings'},
            {path: 'export', component: () => import("@/components/settings/ExportDataSettings.vue"), name: 'ExportDataSettings'},
            {path: 'api', component: () => import("@/components/settings/ApiSettings.vue"), name: 'ApiSettings'},
        ]
    },
    //{path: '/settings/:page', component: SettingsPage, name: 'view_settings_page', props: true},
    {path: '/advanced-search', component: () => import("@/pages/SearchPage.vue"), name: 'SearchPage'},
    {path: '/shopping', component: () => import("@/pages/ShoppingListPage.vue"), name: 'ShoppingListPage'},
    {path: '/mealplan', component: MealPlanPage, name: 'MealPlanPage'},
    {path: '/books', component: () => import("@/pages/BooksPage.vue"), name: 'BooksPage'},
    {path: '/book/:bookId', component: () => import("@/pages/BookViewPage.vue"), name: 'BookViewPage', props: true},
    {path: '/recipe/import', component: () => import("@/pages/RecipeImportPage.vue"), name: 'RecipeImportPage'},

    {path: '/recipe/:id', component: () => import("@/pages/RecipeViewPage.vue"), name: 'RecipeViewPage', props: true},
    {path: '/view/recipe/:id', redirect: {name: 'RecipeViewPage'}}, // old Tandoor v1 url pattern

    {path: '/list/:model?', component: () => import("@/pages/ModelListPage.vue"), props: true, name: 'ModelListPage'},
    {path: '/edit/:model/:id?', component: () => import("@/pages/ModelEditPage.vue"), props: true, name: 'ModelEditPage'},
    {path: '/database', component: () => import("@/pages/DatabasePage.vue"), props: true, name: 'DatabasePage'},

    {path: '/ingredient-editor', component: () => import("@/pages/IngredientEditorPage.vue"), name: 'IngredientEditorPage'},
    {path: '/property-editor', component: () => import("@/pages/PropertyEditorPage.vue"), name: 'PropertyEditorPage'},

    {path: '/space-setup', component: () => import("@/pages/SpaceSetupPage.vue"), name: 'SpaceSetupPage'},

    {path: '/:pathMatch(.*)*', component: () => import("@/pages/404Page.vue"), name: '404Page'},
]

// load plugin routes into routing table
TANDOOR_PLUGINS.forEach(plugin => {
    routes = routes.concat(plugin.routes)
})

const basePath = localStorage.getItem("BASE_PATH")
const pathname = basePath?.startsWith("http") ? new URL(basePath).pathname : undefined
const base = pathname === "/" ? undefined : pathname

const router = createRouter({
    history: createWebHistory(base),
    routes,
})

let i18n = setupI18n()

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.use(createRulesPlugin({ /* options */ }, vuetify.locale))
app.use(router)
app.use(i18n)
app.use(mavonEditor) // TODO only use on pages that need it

app.mount('#app')
