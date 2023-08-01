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
                            <b-form-input class="w-25 m-2 mb-0" :value = "AutoPlan.servings" :type="'number'" @input="updateServings"></b-form-input>
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

                          <div class="">
                            <div class="row m-3 mb-0">
                            <b-form-datepicker class="col" :value-as-date="true" :value="AutoPlan.startDay" @input="updateStartDay"></b-form-datepicker>
                            <div class="col"></div>
                            <b-form-datepicker class="col" :value-as-date="true" :value="AutoPlan.endDay" @input="updateEndDay"></b-form-datepicker>
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
          <b-button class="float-right" variant="primary" @click="createPlan">{{ $t("Create Meal Plan") }}</b-button>
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

const { ApiApiFactory } = require("@/utils/openapi/api")
const { StandardToasts } = require("@/utils/utils")

Vue.use(BootstrapVue)

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
            shared: []
          }
        }
    },
    mounted: function () {},
    methods: {
        genericSelectChanged: function (obj) {
          this.AutoPlan.keywords[obj.var] = obj.val
        },
        showModal() {
          this.refreshMealTypes()

          this.AutoPlan.servings = 1
          this.AutoPlan.startDay = new Date()
          this.AutoPlan.endDay = this.current_period.periodEnd
          useUserPreferenceStore().getData().then(userPreference => {
                    this.AutoPlan.shared = userPreference.plan_share
            })
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
            })).then( () => {
              let mealArray = this.AutoPlan.meal_types
              for (let i = 0; i < mealArray.length; i++) {
                 this.AutoPlan.keywords[i] = [];
              }}
            )
        },
      createPlan() {
            this.$bvModal.hide(`autoplan-modal`)
            this.$emit("create-plan", this.AutoPlan)
        },
      updateStartDay(date){
          this.AutoPlan.startDay = date
      },
      updateEndDay(date){
          this.AutoPlan.endDay = date
      },
      updateServings(numberOfServings) {
          this.AutoPlan.servings = numberOfServings
      },
      exitPlan() {
          this.$bvModal.hide(`autoplan-modal`)
      }
    },


}
</script>

<style scoped></style>
