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
            <cosmetic-settings-component v-if="visible_settings === 'cosmetic'"
                                         :user_id="user_id"></cosmetic-settings-component>
            <account-settings-component v-if="visible_settings === 'account'"
                                        :user_id="user_id"></account-settings-component>
            <search-settings-component v-if="visible_settings === 'search'"
                                       :user_id="user_id"></search-settings-component>
            <shopping-settings-component v-if="visible_settings === 'shopping'"
                                         :user_id="user_id"></shopping-settings-component>
            <meal-plan-settings-component v-if="visible_settings === 'meal_plan'"
                                         :user_id="user_id"></meal-plan-settings-component>
            <a-p-i-settings-component v-if="visible_settings === 'api'" :user_id="user_id"></a-p-i-settings-component>

        </div>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import CosmeticSettingsComponent from "@/components/Settings/CosmeticSettingsComponent";
import AccountSettingsComponent from "@/components/Settings/AccountSettingsComponent";
import SearchSettingsComponent from "@/components/Settings/SearchSettingsComponent";
import ShoppingSettingsComponent from "@/components/Settings/ShoppingSettingsComponent";
import MealPlanSettingsComponent from "@/components/Settings/MealPlanSettingsComponent";
import APISettingsComponent from "@/components/Settings/APISettingsComponent";

Vue.use(BootstrapVue)

export default {
    name: "ProfileView",
    mixins: [],
    components: {
        CosmeticSettingsComponent,
        AccountSettingsComponent,
        SearchSettingsComponent,
        ShoppingSettingsComponent,
        MealPlanSettingsComponent,
        APISettingsComponent
    },
    data() {
        return {
            visible_settings: 'cosmetic',
            user_id: window.USER_ID,
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    methods: {},
}
</script>

<style>

</style>
