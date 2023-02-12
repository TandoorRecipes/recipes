<template>
    <div v-if="user_preferences !== undefined">
        <b-form-group :label="$t('shopping_share')" :description="$t('shopping_share_desc')">
            <generic-multiselect
                @change="user_preferences.shopping_share = $event.val; updateSettings(false)"
                :model="Models.USER"
                :initial_selection="user_preferences.shopping_share"
                label="display_name"
                :multiple="true"
                :placeholder="$t('User')"
            ></generic-multiselect>
        </b-form-group>

        <b-form-group :label="$t('shopping_auto_sync')" :description="$t('shopping_auto_sync_desc')">
            <b-form-input type="range" :min="SHOPPING_MIN_AUTOSYNC_INTERVAL" max="60" step="1" v-model="user_preferences.shopping_auto_sync"
                          @change="updateSettings(false)"></b-form-input>
            <div class="text-center">
                <span v-if="user_preferences.shopping_auto_sync > 0">
                    {{ Math.round(user_preferences.shopping_auto_sync) }}
                    <span v-if="user_preferences.shopping_auto_sync === 1">{{ $t('Second') }}</span>
                    <span v-else> {{ $t('Seconds') }}</span>
                </span>

                <span v-if="user_preferences.shopping_auto_sync < 1">{{ $t('Disable') }}</span>
            </div>
            <br/>
                <b-button class="btn btn-sm" @click="user_preferences.shopping_auto_sync = 0; updateSettings(false)">{{ $t('Disabled') }}</b-button>
        </b-form-group>

        <b-form-group :description="$t('mealplan_autoadd_shopping_desc')">
            <b-form-checkbox v-model="user_preferences.mealplan_autoadd_shopping"
                             @change="updateSettings(false)">{{ $t('mealplan_autoadd_shopping') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('mealplan_autoexclude_onhand_desc')">
            <b-form-checkbox v-model="user_preferences.mealplan_autoexclude_onhand"
                             @change="updateSettings(false)">{{ $t('mealplan_autoexclude_onhand') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('mealplan_autoinclude_related_desc')">
            <b-form-checkbox v-model="user_preferences.mealplan_autoinclude_related"
                             @change="updateSettings(false)">{{ $t('mealplan_autoinclude_related') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('shopping_add_onhand_desc')">
            <b-form-checkbox v-model="user_preferences.shopping_add_onhand"
                             @change="updateSettings(false)">{{ $t('shopping_add_onhand') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :label="$t('default_delay')" :description="$t('default_delay_desc')">
            <b-form-input type="range" min="1" max="72" step="1" v-model="user_preferences.default_delay"
                          @change="updateSettings(false)"></b-form-input>
            <div class="text-center">
                <span>{{ Math.round(user_preferences.default_delay) }}
                    <span v-if="user_preferences.default_delay === 1">{{ $t('Hour') }}</span>
                    <span v-else> {{ $t('Hours') }}</span>
                </span>
            </div>
        </b-form-group>

        <b-form-group :description="$t('filter_to_supermarket_desc')">
            <b-form-checkbox v-model="user_preferences.filter_to_supermarket"
                             @change="updateSettings(false)">{{ $t('filter_to_supermarket') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :label="$t('shopping_recent_days')" :description="$t('shopping_recent_days_desc')">
            <b-form-input type="range" min="0" max="14" step="1" v-model="user_preferences.shopping_recent_days"
                          @change="updateSettings(false)"></b-form-input>
            <div class="text-center">
                <span>{{ Math.round(user_preferences.shopping_recent_days) }}
                    <span v-if="user_preferences.shopping_recent_days === 1">{{ $t('Day') }}</span>
                    <span v-else> {{ $t('Days') }}</span>
                </span>
            </div>
        </b-form-group>

        <b-form-group :label="$t('csv_delim_label')" :description="$t('csv_delim_help')">
            <b-form-input v-model="user_preferences.csv_delim" @change="updateSettings(false)"></b-form-input>
        </b-form-group>

        <b-form-group :label="$t('csv_prefix_label')" :description="$t('csv_prefix_help')">
            <b-form-input v-model="user_preferences.csv_prefix" @change="updateSettings(false)"></b-form-input>
        </b-form-group>

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
            SHOPPING_MIN_AUTOSYNC_INTERVAL: window.SHOPPING_MIN_AUTOSYNC_INTERVAL,
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
            this.$emit('updated', this.user_preferences)
            apiFactory.partialUpdateUserPreference(this.user_id.toString(), this.user_preferences).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                if (reload) {
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