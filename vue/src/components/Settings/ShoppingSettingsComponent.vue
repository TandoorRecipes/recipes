<template>
    <div v-if="user_preferences !== undefined">

        <generic-multiselect
            @change="updateSettings(false)"
            :model="Models.USER"
            :initial_selection="user_preferences.shopping_share"
            label="display_name"
            :multiple="true"
            :placeholder="$t('User')"
        ></generic-multiselect>

        <!--TODO load min autosync time from env -->
          <b-form-input type="range" min="0" max="60" step="1" v-model="user_preferences.shopping_auto_sync"
                      @change="updateSettings(false)"></b-form-input>

         <b-form-checkbox v-model="user_preferences.mealplan_autoadd_shopping" @change="updateSettings(false)"></b-form-checkbox>
         <b-form-checkbox v-model="user_preferences.mealplan_autoexclude_onhand" @change="updateSettings(false)"></b-form-checkbox>
         <b-form-checkbox v-model="user_preferences.mealplan_autoinclude_related" @change="updateSettings(false)"></b-form-checkbox>
         <b-form-checkbox v-model="user_preferences.shopping_add_onhand" @change="updateSettings(false)"></b-form-checkbox>

        <b-form-input type="number" v-model="user_preferences.default_delay" @change="updateSettings(false)"></b-form-input>
        <b-form-checkbox v-model="user_preferences.filter_to_supermarket" @change="updateSettings(false)"></b-form-checkbox>
        <b-form-input type="range" min="0" max="14" step="1" v-model="user_preferences.shopping_recent_days"
                      @change="updateSettings(false)"></b-form-input>

        
        <b-form-input v-model="user_preferences.csv_delim" @change="updateSettings(false)"></b-form-input>
        <b-form-input v-model="user_preferences.csv_prefix" @change="updateSettings(false)"></b-form-input>
    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ApiMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";
import GenericMultiselect from "@/components/GenericMultiselect";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "ShoppingSettingsComponent",
    mixins: [ApiMixin],
    components: {GenericMultiselect},
    props: {
        user_id: Number,
    },
    data() {
        return {
            user_preferences: undefined,
            languages: [],
        }
    },
    mounted() {
        this.user_preferences = this.preferences
        this.languages = window.AVAILABLE_LANGUAGES
        this.loadSettings()
    },
    methods: {
        loadSettings: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.retrieveUserPreference(this.user_id.toString()).then(result => {
                this.user_preferences = result.data
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        updateSettings: function (reload) {
            let apiFactory = new ApiApiFactory()
            apiFactory.partialUpdateUserPreference(this.user_id.toString(), this.user_preferences).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                if (reload !== undefined) {
                    location.reload()
                }
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
    }
}
</script>

<style scoped>

</style>