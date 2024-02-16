<template>
    <div v-if="useUserPreferenceStore().user_settings !== undefined">
        <b-form-group :label="$t('shopping_share')" :description="$t('shopping_share_desc')">
            <generic-multiselect
                @change="useUserPreferenceStore().user_settings.shopping_share = $event.val; updateSettings(false)"
                :model="Models.USER"
                :initial_selection="useUserPreferenceStore().user_settings.shopping_share"
                label="display_name"
                :multiple="true"
                :placeholder="$t('User')"
            ></generic-multiselect>
        </b-form-group>

        <b-form-group :label="$t('shopping_auto_sync')" :description="$t('shopping_auto_sync_desc')">
            <b-form-input type="range" :min="SHOPPING_MIN_AUTOSYNC_INTERVAL" max="60" step="1" v-model="useUserPreferenceStore().user_settings.shopping_auto_sync"
                          @change="updateSettings(false)" :disabled="useUserPreferenceStore().user_settings.shopping_auto_sync < 1"></b-form-input>
            <div class="text-center">
                <span v-if="useUserPreferenceStore().user_settings.shopping_auto_sync > 0">
                    {{ Math.round(useUserPreferenceStore().user_settings.shopping_auto_sync) }}
                    <span v-if="useUserPreferenceStore().user_settings.shopping_auto_sync === 1">{{ $t('Second') }}</span>
                    <span v-else> {{ $t('Seconds') }}</span>
                </span>

                <span v-if="useUserPreferenceStore().user_settings.shopping_auto_sync < 1">{{ $t('Disable') }}</span>
            </div>
            <br/>
                <b-button class="btn btn-sm" @click="useUserPreferenceStore().user_settings.shopping_auto_sync = 0; updateSettings(false)"
                v-if="useUserPreferenceStore().user_settings.shopping_auto_sync > 0">{{ $t('Disable') }}</b-button>
                <b-button class="btn btn-sm btn-success" @click="useUserPreferenceStore().user_settings.shopping_auto_sync = SHOPPING_MIN_AUTOSYNC_INTERVAL; updateSettings(false)"
                v-if="useUserPreferenceStore().user_settings.shopping_auto_sync < 1">{{ $t('Enable') }}</b-button>
        </b-form-group>

        <b-form-group :description="$t('mealplan_autoadd_shopping_desc')">
            <b-form-checkbox v-model="useUserPreferenceStore().user_settings.mealplan_autoadd_shopping"
                             @change="updateSettings(false)">{{ $t('mealplan_autoadd_shopping') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('mealplan_autoexclude_onhand_desc')">
            <b-form-checkbox v-model="useUserPreferenceStore().user_settings.mealplan_autoexclude_onhand"
                             @change="updateSettings(false)">{{ $t('mealplan_autoexclude_onhand') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('mealplan_autoinclude_related_desc')">
            <b-form-checkbox v-model="useUserPreferenceStore().user_settings.mealplan_autoinclude_related"
                             @change="updateSettings(false)">{{ $t('mealplan_autoinclude_related') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('shopping_add_onhand_desc')">
            <b-form-checkbox v-model="useUserPreferenceStore().user_settings.shopping_add_onhand"
                             @change="updateSettings(false)">{{ $t('shopping_add_onhand') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :label="$t('default_delay')" :description="$t('default_delay_desc')">
            <b-form-input type="range" min="1" max="72" step="1" v-model="useUserPreferenceStore().user_settings.default_delay"
                          @change="updateSettings(false)"></b-form-input>
            <div class="text-center">
                <span>{{ Math.round(useUserPreferenceStore().user_settings.default_delay) }}
                    <span v-if="useUserPreferenceStore().user_settings.default_delay === 1">{{ $t('Hour') }}</span>
                    <span v-else> {{ $t('Hours') }}</span>
                </span>
            </div>
        </b-form-group>

        <b-form-group :description="$t('filter_to_supermarket_desc')">
            <b-form-checkbox v-model="useUserPreferenceStore().user_settings.filter_to_supermarket"
                             @change="updateSettings(false)">{{ $t('filter_to_supermarket') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :label="$t('shopping_recent_days')" :description="$t('shopping_recent_days_desc')">
            <b-form-input type="range" min="0" max="14" step="1" v-model="useUserPreferenceStore().user_settings.shopping_recent_days"
                          @change="updateSettings(false)"></b-form-input>
            <div class="text-center">
                <span>{{ Math.round(useUserPreferenceStore().user_settings.shopping_recent_days) }}
                    <span v-if="useUserPreferenceStore().user_settings.shopping_recent_days === 1">{{ $t('Day') }}</span>
                    <span v-else> {{ $t('Days') }}</span>
                </span>
            </div>
        </b-form-group>

        <b-form-group :label="$t('csv_delim_label')" :description="$t('csv_delim_help')">
            <b-form-input v-model="useUserPreferenceStore().user_settings.csv_delim" @change="updateSettings(false)"></b-form-input>
        </b-form-group>

        <b-form-group :label="$t('csv_prefix_label')" :description="$t('csv_prefix_help')">
            <b-form-input v-model="useUserPreferenceStore().user_settings.csv_prefix" @change="updateSettings(false)"></b-form-input>
        </b-form-group>

    </div>
</template>

<script>
import {ApiMixin, StandardToasts} from "@/utils/utils";

import GenericMultiselect from "@/components/GenericMultiselect";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

export default {
    name: "ShoppingSettingsComponent",
    mixins: [ApiMixin],
    components: {GenericMultiselect},
    props: { },
    data() {
        return {
            user_preferences: undefined,
            SHOPPING_MIN_AUTOSYNC_INTERVAL: window.SHOPPING_MIN_AUTOSYNC_INTERVAL,
            languages: [],
        }
    },
    mounted() {
        this.languages = window.AVAILABLE_LANGUAGES

        useUserPreferenceStore().loadUserSettings(false)
    },
    methods: {
        useUserPreferenceStore,
        updateSettings: function (reload) {
            this.$emit('updated', this.user_preferences)
            useUserPreferenceStore().updateUserSettings()
        },
    }
}
</script>

<style scoped>

</style>