import Vue from 'vue'
import App from './ProfileView.vue'
import i18n from '@/i18n'
import {createPinia, PiniaVuePlugin} from "pinia";

Vue.config.productionTip = false

// TODO move this and other default stuff to centralized JS file (verify nothing breaks)
let publicPath = localStorage.STATIC_URL + 'vue/'
if (process.env.NODE_ENV === 'development') {
    publicPath = 'http://localhost:8080/'
}
export default __webpack_public_path__ = publicPath // eslint-disable-line

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

new Vue({
    pinia,
    i18n,
    render: h => h(App),
}).$mount('#app')
