import i18n from "@/i18n"
import Vue from "vue"
import App from "./ShoppingListView"

Vue.config.productionTip = false

new Vue({
    i18n,
    render: (h) => h(App),
}).$mount("#app")
