import {createApp} from "vue";
import {createRouter, createWebHashHistory} from 'vue-router'
import {createPinia} from 'pinia'
// @ts-ignore
import App from './Tandoor.vue'


import 'vite/modulepreload-polyfill';
import vuetify from "@/vuetify";
import ShoppingListPage from "@/pages/ShoppingListPage.vue";
import RecipeSearchPage from "@/pages/RecipeSearchPage.vue";
import RecipeViewPage from "@/pages/RecipeViewPage.vue";

const routes = [
    {path: '/', redirect: '/search', name: 'index'},
    {path: '/search', component: RecipeSearchPage, name: 'view_search'},
    {path: '/shopping', component: ShoppingListPage, name: 'view_shopping'},
    {path: '/recipe/:id', component: RecipeViewPage, name: 'view_recipe', props: true},
    {path: '/recipe/edit/:id', component: RecipeViewPage, name: 'view_recipe', props: true},
]

const router = createRouter({
    // 4. Provide the history implementation to use. We
    // are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes,
})

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.use(router)

app.mount('#app')
