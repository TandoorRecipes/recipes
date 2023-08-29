<template>
    <div v-if="user_preferences !== undefined">

        <b-form-group :label="$t('Share')" :description="$t('plan_share_desc')">
            <generic-multiselect
                @change="user_preferences.plan_share = $event.val;updateSettings(false)"
                :model="Models.USER"
                :initial_selection="user_preferences.plan_share"
                label="display_name"
                :multiple="true"
                :placeholder="$t('User')"
            ></generic-multiselect>
        </b-form-group>

        <b-form v-if="meal_plan_store">
            <b-form-group id="UomInput" :label="$t('Period')" :description="$t('Plan_Period_To_Show')"
                          label-for="UomInput">
                <b-form-select id="UomInput" v-model="meal_plan_store.client_settings.displayPeriodUom"
                               :options="calendar_options.displayPeriodUom"></b-form-select>
            </b-form-group>
            <b-form-group id="PeriodInput" :label="$t('Periods')"
                          :description="$t('Plan_Show_How_Many_Periods')" label-for="PeriodInput">
                <b-form-select id="PeriodInput" v-model="meal_plan_store.client_settings.displayPeriodCount"
                               :options="calendar_options.displayPeriodCount"></b-form-select>
            </b-form-group>
            <b-form-group id="DaysInput" :label="$t('Starting_Day')" :description="$t('Starting_Day')"
                          label-for="DaysInput">
                <b-form-select id="DaysInput" v-model="meal_plan_store.client_settings.startingDayOfWeek"
                               :options="dayNames()"></b-form-select>
            </b-form-group>
            <b-form-group id="WeekNumInput" :label="$t('Week_Numbers')">
                <b-form-checkbox v-model="meal_plan_store.client_settings.displayWeekNumbers" name="week_num">
                    {{ $t("Show_Week_Numbers") }}
                </b-form-checkbox>
            </b-form-group>
        </b-form>
    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ApiMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";
import GenericMultiselect from "@/components/GenericMultiselect";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {CalendarMathMixin} from "vue-simple-calendar/src/components/bundle";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

let SETTINGS_COOKIE_NAME = "mealplan_settings"

export default {
    name: "MealPlanSettingsComponent",
    mixins: [ApiMixin, CalendarMathMixin],
    components: {GenericMultiselect},
    props: {
        user_id: Number,
    },
    data() {
        return {
            user_preferences: undefined,
            languages: [],
            meal_plan_store: undefined,
            calendar_options: {
                displayPeriodUom: [
                    {text: this.$t("Week"), value: "week"},
                    {text: this.$t("Month"), value: "month",},
                    {text: this.$t("Year"), value: "year"},
                ],
                displayPeriodCount: [1, 2, 3, 4],
            },
        }
    },
    mounted() {
        this.user_preferences = this.preferences
        this.languages = window.AVAILABLE_LANGUAGES
        this.loadSettings()

        this.meal_plan_store = useMealPlanStore()
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
                if (reload) {
                    location.reload()
                }
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        dayNames: function () {
            let options = []
            this.getFormattedWeekdayNames(this.getDefaultBrowserLocale(), "long", 0).forEach((day, index) => {
                options.push({text: day, value: index})
            })
            return options
        },
    }
}
</script>

<style scoped>

</style>