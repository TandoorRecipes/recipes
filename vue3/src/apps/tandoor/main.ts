import {createApp} from "vue";
import {createRouter, createWebHashHistory} from 'vue-router'
import {createPinia} from 'pinia'
// @ts-ignore
import App from './Tandoor.vue'


import 'vite/modulepreload-polyfill';
import vuetify from "@/vuetify";
import ShoppingListPage from "@/pages/ShoppingListPage.vue";
import RecipeSearchPage from "@/pages/RecipeSearchPage.vue";

const routes = [
    {path: '/', component: RecipeSearchPage},
    {path: '/about', component: ShoppingListPage},
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
