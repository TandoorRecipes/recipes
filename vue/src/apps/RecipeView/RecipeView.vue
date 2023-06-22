<template>
    <div id="app">
        <recipe-view-component></recipe-view-component>

        <bottom-navigation-bar></bottom-navigation-bar>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import RecipeViewComponent from "@/components/RecipeViewComponent.vue";

Vue.use(BootstrapVue)

export default {
    name: "RecipeView",
    mixins: [],
    components: {
        RecipeViewComponent
    },
    computed: {},
    data() {
        return {}
    },

    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    methods: {},
}
</script>

<style>

</style>
