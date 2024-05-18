import {createApp} from "vue";
import {createRouter, createWebHashHistory} from 'vue-router'
import {createPinia} from 'pinia'
// @ts-ignore
import App from './Tandoor.vue'

import mavonEditor from 'mavon-editor'
import 'vite/modulepreload-polyfill';
import vuetify from "@/vuetify";
import ShoppingListPage from "@/pages/ShoppingListPage.vue";
import StartPage from "@/pages/StartPage.vue";
import RecipeViewPage from "@/pages/RecipeViewPage.vue";
import luxonPlugin from "@/plugins/luxonPlugin";
import RecipeEditPage from "@/pages/RecipeEditPage.vue";
import MealPlanPage from "@/pages/MealPlanPage.vue";
import SearchPage from "@/pages/SearchPage.vue";
import TestPage from "@/pages/TestPage.vue";

const routes = [
    {path: '/', component: StartPage, name: 'view_home'},
    {path: '/test', component: TestPage, name: 'view_test'},
    {path: '/search', component: SearchPage, name: 'view_search'},
    {path: '/shopping', component: ShoppingListPage, name: 'view_shopping'},
    {path: '/mealplan', component: MealPlanPage, name: 'view_mealplan'},
    {path: '/books', component: ShoppingListPage, name: 'view_books'},
    {path: '/recipe/:id', component: RecipeViewPage, name: 'view_recipe', props: true},
    {path: '/recipe/edit/:recipe_id', component: RecipeEditPage, name: 'edit_recipe', props: true},
]

const router = createRouter({
    // TODO configure proper history mode
    history: createWebHashHistory(),
    routes,
})

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.use(router)
app.use(luxonPlugin)
app.use(mavonEditor) // TODO only use on pages that need it

app.mount('#app')
