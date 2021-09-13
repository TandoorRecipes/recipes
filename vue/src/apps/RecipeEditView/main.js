import Vue from 'vue'
import App from './RecipeEditView'
import i18n from '@/i18n'

Vue.config.productionTip = false

new Vue({
    i18n,
    render: h => h(App),
}).$mount('#app')
