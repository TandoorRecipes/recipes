<template>

    <div id="app">

    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue)

//import Multiselect from "vue-multiselect"

export default {
    name: "TestView",
    mixins: [],
    components: {
      // Multiselect,
    },
    data() {
        return {

        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

    },
    methods: {

    },
}
</script>

<style></style>
