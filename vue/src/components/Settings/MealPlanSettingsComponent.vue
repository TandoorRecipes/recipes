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

        <hr/>

        <b-form v-if="settings">
            <b-form-group id="UomInput" :label="$t('Period')" :description="$t('Plan_Period_To_Show')"
                          label-for="UomInput">
                <b-form-select id="UomInput" v-model="settings.displayPeriodUom"
                               :options="calendar_options.displayPeriodUom"></b-form-select>
            </b-form-group>
            <b-form-group id="PeriodInput" :label="$t('Periods')"
                          :description="$t('Plan_Show_How_Many_Periods')" label-for="PeriodInput">
                <b-form-select id="PeriodInput" v-model="settings.displayPeriodCount"
                               :options="calendar_options.displayPeriodCount"></b-form-select>
            </b-form-group>
            <b-form-group id="DaysInput" :label="$t('Starting_Day')" :description="$t('Starting_Day')"
                          label-for="DaysInput">
                <b-form-select id="DaysInput" v-model="settings.startingDayOfWeek"
                               :options="dayNames()"></b-form-select>
            </b-form-group>
            <b-form-group id="WeekNumInput" :label="$t('Week_Numbers')">
                <b-form-checkbox v-model="settings.displayWeekNumbers" name="week_num">
                    {{ $t("Show_Week_Numbers") }}
                </b-form-checkbox>
            </b-form-group>
        </b-form>

        <hr/>

        <h5>{{ $t("Meal_Types") }}
            <button type="button" class="btn btn-success shadow-none float-right" @click="generic_action = Actions.CREATE;"><i class="fas fa-plus"></i></button>
        </h5>

        <draggable :list="meal_types" group="meal_types" :empty-insert-threshold="10" class="mt-4"
                   @sort="sortMealTypes()" ghost-class="ghost" handle=".handle">
            <b-list-group-item v-for="mt in meal_types" v-bind:key="mt.id">

                <button type="button" class="btn handle shadow-none"><i class="fas fa-arrows-alt-v"></i></button>

                <b-badge :style="{'background-color': mt.color}"><i class="fas fa-palette"></i> </b-badge>
                <span> {{ mt.name }} </span>

                <b-badge v-if="mt.default">{{ $t('Default') }}</b-badge>
                <div class="btn-group  float-right">
                    <button type="button" class="btn btn-primary shadow-none" @click="generic_action = Actions.UPDATE; editing_meal_type=mt;"><i class="fas fa-edit"></i></button>
                    <button type="button" class="btn btn-danger shadow-none" @click="generic_action = Actions.DELETE; editing_meal_type=mt;"><i class="fas fa-trash-alt"></i></button>
                </div>

            </b-list-group-item>
        </draggable>
        <b-list-group>


        </b-list-group>

        <generic-modal-form :model="Models.MEAL_TYPE" :action="generic_action" :show="generic_action !== null"
                            :item1="editing_meal_type"
                            @finish-action="finishGenericAction"/>
    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ApiMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";
import GenericMultiselect from "@/components/GenericMultiselect";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import {CalendarMathMixin} from "vue-simple-calendar/src/components/bundle";
import draggable from "vuedraggable"
import GenericModalForm from "@/components/Modals/GenericModalForm.vue";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "MealPlanSettingsComponent",
    mixins: [ApiMixin, CalendarMathMixin],
    components: {GenericModalForm, draggable, GenericMultiselect},
    props: {
        user_id: Number,
    },
    data() {
        return {
            user_preferences: undefined,
            languages: [],
            settings: undefined,
            calendar_options: {
                displayPeriodUom: [
                    {text: this.$t("Week"), value: "week"},
                    {text: this.$t("Month"), value: "month",},
                    {text: this.$t("Year"), value: "year"},
                ],
                displayPeriodCount: [1, 2, 3, 4],
            },
            meal_types: [],
            generic_action: null,
            editing_meal_type: null,

        }
    },
    watch: {
        settings: {
            handler() {
                useMealPlanStore().updateClientSettings(this.settings)
            },
            deep: true,
        },
    },
    mounted() {
        this.user_preferences = this.preferences
        this.languages = window.AVAILABLE_LANGUAGES
        this.loadSettings()

        this.settings = useMealPlanStore().client_settings
        

        this.loadMealTypes()
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
        loadMealTypes: function () {
            let apiClient = new ApiApiFactory()
            apiClient.listMealTypes().then(result => {
                this.meal_types = result.data
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        sortMealTypes() {
            this.meal_types.forEach(function (element, index) {
                element.order = index
            })

            this.meal_types.forEach((meal_type) => {
                let apiClient = new ApiApiFactory()

                apiClient.updateMealType(meal_type.id, meal_type).then((e) => {

                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            })
        },
        finishGenericAction: function (e) {
            if (e !== 'cancel') {
                this.loadMealTypes()
            }
            this.editing_meal_type = null;
            this.generic_action = null;
        }
    }
}
</script>

<style scoped>

</style>