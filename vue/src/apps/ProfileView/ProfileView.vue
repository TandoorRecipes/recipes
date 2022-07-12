<template>
    <div id="app" class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1 offset">
        <div class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1">

        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import { ApiApiFactory } from "@/utils/openapi/api"
import CookbookSlider from "@/components/CookbookSlider"
import LoadingSpinner from "@/components/LoadingSpinner"
import { StandardToasts, ApiMixin } from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    name: "ProfileView",
    mixins: [ApiMixin],
    components: { },
    data() {
        return {

        }
    },
    computed: {

    },
    mounted() {

        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    methods: {

    },
}
</script>

<style>

</style>
