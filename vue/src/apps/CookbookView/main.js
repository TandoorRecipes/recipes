import Vue from 'vue'
import App from './CookbookView.vue'
import i18n from '@/i18n'

Vue.config.productionTip = false

export default __webpack_public_path__ = localStorage.STATIC_URL + 'vue/' // eslint-disable-line

new Vue({
    i18n,
    render: h => h(App),
}).$mount('#app')
