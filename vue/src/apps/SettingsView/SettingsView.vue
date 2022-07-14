<template>
    <div id="app" class="row">
        <div class="col-md-3 col-12">
            <b-nav vertical>
                <b-nav-item :active="visible_settings === 'cosmetic'" @click="visible_settings = 'cosmetic'"><i
                    class="fas fa-fw fa-eye"></i> Cosmetic
                </b-nav-item>
                <b-nav-item :active="visible_settings === 'account'" @click="visible_settings = 'account'"><i
                    class="fas fa-fw fa-user"></i> Account
                </b-nav-item>
                <b-nav-item :active="visible_settings === 'search'" @click="visible_settings = 'search'"><i
                    class="fas fa-fw fa-search"></i> Search
                </b-nav-item>
                <b-nav-item :active="visible_settings === 'shopping'" @click="visible_settings = 'shopping'"><i
                    class="fas fa-fw fa-shopping-cart"></i> Shopping
                </b-nav-item>
                <b-nav-item :active="visible_settings === 'meal_plan'" @click="visible_settings = 'meal_plan'"><i
                    class="fas fa-fw fa-calendar"></i> Meal Plan
                </b-nav-item>
                <b-nav-item :active="visible_settings === 'api'" @click="visible_settings = 'api'"><i
                    class="fas fa-fw fa-code"></i> API
                </b-nav-item>
            </b-nav>
        </div>
        <div class="col-md-9 col-12">
            Overview
            <cosmetic-settings-component v-if="visible_settings === 'cosmetic'" :user_id="user_id"></cosmetic-settings-component>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiApiFactory} from "@/utils/openapi/api"
import CookbookSlider from "@/components/CookbookSlider"
import LoadingSpinner from "@/components/LoadingSpinner"
import {StandardToasts, ApiMixin} from "@/utils/utils"
import CosmeticSettingsComponent from "@/components/Settings/CosmeticSettingsComponent";

Vue.use(BootstrapVue)

export default {
    name: "ProfileView",
    mixins: [],
    components: {CosmeticSettingsComponent},
    data() {
        return {
            visible_settings: 'cosmetic',
            user_id: window.USER_ID,
        }
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
