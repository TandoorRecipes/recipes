<template>
    <b-modal :id="modal_id" size="lg" :title="modal_title" hide-footer aria-label="" @show="showModal">
        <h5>{{ $t("Meal_Types") }}</h5>
        <div>
            <div>
                <b-card no-body class="mt-1 p-2"
                        v-for="(meal_type, k) in AutoPlan.meal_types" :key="meal_type.id">
                    <b-card-header class="p-2 border-0">
                        <div class="row">
                            <div class="col-10">
                                <h5 class="mt-1 mb-1">
                                    {{ meal_type.icon }} {{
                                        meal_type.name
                                    }}
                                </h5>
                            </div>
                        </div>
                        <div class="col-12">
                            <generic-multiselect
                                @change="genericSelectChanged"
                                :initial_selection="AutoPlan.keywords[meal_type]"
                                :parent_variable="`${k}`"
                                :model="Models.KEYWORD"
                                :placeholder="$t('Keywords, leave blank to exclude meal type')"
                                :limit="50"
                            />
                        </div>
                    </b-card-header>
                </b-card>
            </div>
            <div class="row-cols-1 m-3">
                <b-form-input class="w-25 m-2 mb-0" :type="'number'" v-model="AutoPlan.servings"></b-form-input>
                <small tabindex="-1" class="m-2 mt-0 form-text text-muted">{{ $t("Servings") }}</small>
            </div>
            <b-form-group class="mt-3">
                <generic-multiselect
                    required
                    @change="AutoPlan.shared = $event.val"
                    parent_variable="entryEditing.shared"
                    :label="'display_name'"
                    :model="Models.USER_NAME"
                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                    v-bind:placeholder="$t('Share')"
                    :limit="10"
                    :multiple="true"
                    :initial_selection="AutoPlan.shared"
                ></generic-multiselect>
                <small tabindex="-1" class="form-text text-muted">{{ $t("Share") }}</small>
            </b-form-group>
            <b-input-group v-if="!autoMealPlan">
                <b-form-checkbox id="AddToShopping" v-model="mealplan_settings.addshopping"/>
                <small tabindex="-1" class="form-text text-muted">{{
                        $t("AddToShopping")
                    }}</small>
            </b-input-group>

            <div class="">
                <div class="row m-3 mb-0">
                    <b-form-datepicker class="col" :value-as-date="true" v-model="AutoPlan.startDay"></b-form-datepicker>
                    <div class="col"></div>
                    <b-form-datepicker class="col" :value-as-date="true" v-model="AutoPlan.endDay"></b-form-datepicker>
                </div>
                <div class="row align-top m-3 mt-0">
                    <small tabindex="-1" class="col align-text-top text-muted">{{ $t("Start Day") }}</small>
                    <div class="col"></div>
                    <small tabindex="-1" class="col align-self-end text-muted">{{ $t("End Day") }}</small>
                </div>
            </div>
        </div>

        <div class="row mt-3 mb-3">
            <div class="col-12">
                <b-button class="float-right" variant="primary" @click="createPlan" :disabled="loading">
                    <b-spinner small v-if="loading"></b-spinner>
                    {{ $t("Create Meal Plan") }}
                </b-button>
                <b-button class="" variant="danger" @click="exitPlan">{{ $t("Exit") }}</b-button>
            </div>
        </div>
    </b-modal>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import GenericMultiselect from "@/components/GenericMultiselect"
import {ApiMixin} from "@/utils/utils"
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import VueCookies from "vue-cookies";
import moment from "moment/moment";
import {useMealPlanStore} from "@/stores/MealPlanStore";

const {ApiApiFactory} = require("@/utils/openapi/api")
const {StandardToasts} = require("@/utils/utils")

Vue.use(BootstrapVue)
Vue.use(VueCookies)
let MEALPLAN_COOKIE_NAME = "mealplan_settings"

export default {
    name: "AutoMealPlanModal",
    components: {
        GenericMultiselect
    },
    props: {
        modal_title: String,
        modal_id: {
            type: String,
            default: "autoplan-modal",
        },
        current_period: Object
    },
    mixins: [ApiMixin],
    data() {
        return {
            AutoPlan: {
                meal_types: [],
                keywords: [[]],
                servings: 1,
                date: Date.now(),
                startDay: null,
                endDay: null,
                shared: [],
                addshopping: false
            },
            mealplan_settings: {
                addshopping: false,
            },
            loading: false,
        }
    },
    watch: {
        mealplan_settings: {
            handler(newVal) {
                this.$cookies.set(MEALPLAN_COOKIE_NAME, this.mealplan_settings)
            },
            deep: true,
        },
    },
    mounted: function () {
        useUserPreferenceStore().updateIfStaleOrEmpty()
    },
    computed: {
        autoMealPlan: function () {
            return useUserPreferenceStore().getStaleData()?.mealplan_autoadd_shopping
        },
    },
    methods: {
        genericSelectChanged: function (obj) {
            this.AutoPlan.keywords[obj.var] = obj.val
        },
        showModal() {
            if (this.$cookies.isKey(MEALPLAN_COOKIE_NAME)) {
                this.mealplan_settings = Object.assign({}, this.mealplan_settings, this.$cookies.get(MEALPLAN_COOKIE_NAME))
            }
            this.refreshMealTypes()

            this.AutoPlan.servings = 1
            this.AutoPlan.startDay = new Date()
            this.AutoPlan.endDay = this.current_period.periodEnd
            useUserPreferenceStore().getData().then(userPreference => {
                this.AutoPlan.shared = userPreference.plan_share
            })
            this.AutoPlan.addshopping = this.mealplan_settings.addshopping

            this.loading = false
        },
        sortMealTypes() {
            this.meal_types.forEach(function (element, index) {
                element.order = index
            })
            let updated = 0
            this.meal_types.forEach((meal_type) => {
                let apiClient = new ApiApiFactory()

                apiClient
                    .updateMealType(this.AutoPlan.meal_type, meal_type)
                    .then((e) => {
                        if (updated === this.meal_types.length - 1) {
                            this.periodChangedCallback(this.current_period)
                        } else {
                            updated++
                        }
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            })
        },
        refreshMealTypes() {
            let apiClient = new ApiApiFactory()

            Promise.resolve(apiClient.listMealTypes().then((result) => {
                result.data.forEach((meal_type) => {
                    meal_type.editing = false
                })
                this.AutoPlan.meal_types = result.data
            })).then(() => {
                    let mealArray = this.AutoPlan.meal_types
                    for (let i = 0; i < mealArray.length; i++) {
                        this.AutoPlan.keywords[i] = [];
                    }
                }
            )
        },
        createPlan() {
            if (!this.loading) {
                this.loading = true

                let requests = []
                for (let i = 0; i < this.AutoPlan.meal_types.length; i++) {
                    if (this.AutoPlan.keywords[i].length === 0) continue
                    requests.push(this.autoPlanThread(this.AutoPlan, i))
                }

                Promise.allSettled(requests).then(r => {
                    this.refreshEntries()
                    this.loading = false
                    this.$bvModal.hide(`autoplan-modal`)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                    this.loading = false
                })
            }

        },

        async autoPlanThread(autoPlan, mealTypeIndex) {
            let apiClient = new ApiApiFactory()

            let keyword_ids = []
            for (const index in autoPlan.keywords[mealTypeIndex]){
              let keyword = autoPlan.keywords[mealTypeIndex][index]
              keyword_ids.push(keyword.id)
            }

            let data = {
                "start_date": moment(autoPlan.startDay).format("YYYY-MM-DD"),
                "end_date": moment(autoPlan.endDay).format("YYYY-MM-DD"),
                "meal_type_id": autoPlan.meal_types[mealTypeIndex].id,
                "keyword_ids": keyword_ids,
                "servings": autoPlan.servings,
                "shared": autoPlan.shared,
                "addshopping": autoPlan.addshopping
            }
            return apiClient.createAutoPlanViewSet(data)

        },
        refreshEntries() { //TODO move properly to MealPLanStore (save period for default refresh)
            let date = this.current_period
            useMealPlanStore().refreshFromAPI(moment(date.periodStart).format("YYYY-MM-DD"), moment(date.periodEnd).format("YYYY-MM-DD"))
        },
        exitPlan() {
            this.$bvModal.hide(`autoplan-modal`)
        }
    },


}
</script>

<style scoped></style>
