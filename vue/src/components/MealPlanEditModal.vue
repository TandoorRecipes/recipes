<template>
    <div>
        <b-modal :id="modal_id" size="lg" :title="modal_title" hide-footer aria-label="" @show="showModal">
            <div class="row" v-if="entryEditing !== null">
                <div class="col col-md-12">
                    <div class="row">
                        <div class="col col-md-12">
                            <div class="row">
                                <div class="col-12">
                                    <b-input-group>
                                        <b-form-input id="TitleInput" v-model="entryEditing.title"
                                                      :placeholder="entryEditing.title_placeholder"
                                                      @change="missing_recipe = false"></b-form-input>
                                        <b-input-group-append class="d-none d-lg-block">
                                            <b-button variant="primary" @click="entryEditing.title = ''"><i class="fa fa-eraser"></i></b-button>
                                        </b-input-group-append>
                                    </b-input-group>
                                    <span class="text-danger" v-if="missing_recipe">{{
                                            $t("Title_or_Recipe_Required")
                                        }}</span>
                                    <small tabindex="-1" class="form-text text-muted" v-if="!missing_recipe">{{
                                            $t("Title")
                                        }}</small>
                                </div>
                                <div class="col-12 col-lg-6">
                                    <b-input-group>
                                        <b-form-input type="date" v-model="entryEditing.from_date"></b-form-input>
                                        <b-input-group-append>
                                            <b-button variant="secondary" @click="entryEditing.from_date = changeDate(entryEditing.from_date, -1)"><i class="fas fa-minus"></i></b-button>
                                            <b-button variant="primary" @click="entryEditing.from_date = changeDate(entryEditing.from_date, 1)"><i class="fas fa-plus"></i></b-button>
                                        </b-input-group-append>
                                    </b-input-group>

                                    <small tabindex="-1" class="form-text text-muted">{{ $t("StartDate") }}</small>
                                </div>
                                <div class="col-12 col-lg-6">
                                    <b-input-group>
                                        <b-form-input type="date" v-model="entryEditing.to_date"></b-form-input>
                                        <b-input-group-append>
                                            <b-button variant="secondary" @click="entryEditing.to_date = changeDate(entryEditing.to_date, -1)"><i class="fas fa-minus"></i></b-button>
                                            <b-button variant="primary" @click="entryEditing.to_date = changeDate(entryEditing.to_date, 1)"><i class="fas fa-plus"></i></b-button>
                                        </b-input-group-append>
                                    </b-input-group>
                                    <small tabindex="-1" class="form-text text-muted">{{ $t("EndDate") }}</small>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <b-form-group>
                                        <generic-multiselect
                                            @change="selectRecipe"
                                            :initial_single_selection="entryEditing.recipe"
                                            :label="'name'"
                                            :model="Models.RECIPE"
                                            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                            v-bind:placeholder="$t('Recipe')"
                                            :limit="10"
                                            :multiple="false"
                                        ></generic-multiselect>
                                        <small tabindex="-1" class="form-text text-muted">{{ $t("Recipe") }}</small>
                                    </b-form-group>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 col-lg-6 col-xl-6">
                                    <b-form-group class="">
                                        <generic-multiselect
                                            required
                                            @change="selectMealType"
                                            :label="'name'"
                                            :model="Models.MEAL_TYPE"
                                            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                            v-bind:placeholder="$t('Meal_Type')"
                                            :limit="10"
                                            :multiple="false"
                                            :initial_single_selection="entryEditing.meal_type"
                                            :allow_create="true"
                                            :create_placeholder="$t('Create_New_Meal_Type')"
                                        ></generic-multiselect>
                                        <span class="text-danger" v-if="missing_meal_type">{{
                                                $t("Meal_Type_Required")
                                            }}</span>
                                        <small tabindex="-1" class="form-text text-muted"
                                               v-if="!missing_meal_type">{{ $t("Meal_Type") }}</small>
                                    </b-form-group>
                                    <b-form-group label-for="NoteInput" :description="$t('Note')" class="mt-3">
                                    <textarea class="form-control" id="NoteInput" v-model="entryEditing.note"
                                              :placeholder="$t('Note')"></textarea>
                                    </b-form-group>
                                    <b-input-group>
                                        <b-form-input id="ServingsInput" v-model="entryEditing.servings"
                                                      :placeholder="$t('Servings')"></b-form-input>
                                    </b-input-group>
                                    <small tabindex="-1" class="form-text text-muted">{{ $t("Servings") }}</small>
                                    <b-form-group class="mt-3">
                                        <generic-multiselect
                                            required
                                            @change="entryEditing.shared = $event.val"
                                            parent_variable="entryEditing.shared"
                                            :label="'display_name'"
                                            :model="Models.USER_NAME"
                                            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                            v-bind:placeholder="$t('Share')"
                                            :limit="10"
                                            :multiple="true"
                                            :initial_selection="entryEditing.shared"
                                        ></generic-multiselect>
                                        <small tabindex="-1" class="form-text text-muted">{{ $t("Share") }}</small>
                                    </b-form-group>
                                    <b-input-group v-if="!autoMealPlan">
                                        <b-form-checkbox id="AddToShopping" v-model="mealplan_settings.addshopping"/>
                                        <small tabindex="-1" class="form-text text-muted">{{
                                                $t("AddToShopping")
                                            }}</small>
                                    </b-input-group>
                                    <b-input-group v-if="mealplan_settings.addshopping && !autoMealPlan">
                                        <b-form-checkbox id="reviewShopping"
                                                         v-model="mealplan_settings.reviewshopping"/>
                                        <small tabindex="-1" class="form-text text-muted">{{
                                                $t("review_shopping")
                                            }}</small>
                                    </b-input-group>
                                </div>
                                <div class="col-lg-6 d-none d-lg-block d-xl-block">
                                    <recipe-card v-if="entryEditing.recipe" :recipe="entryEditing.recipe"
                                                 :detailed="false"></recipe-card>
                                </div>
                            </div>
                            <div class="row mt-3 mb-3">
                                <div class="col-12">
                                    <b-button variant="danger" @click="deleteEntry" v-if="allow_delete">{{
                                            $t("Delete")
                                        }}
                                    </b-button>
                                    <b-button class="float-right" variant="primary" @click="editEntry">{{
                                            $t("Save")
                                        }}
                                    </b-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </b-modal>

        <shopping-modal :recipe="last_created_plan.recipe" :servings="last_created_plan.servings" :modal_id="999999"
                        :mealplan="last_created_plan" v-if="last_created_plan !== null && last_created_plan.recipe !== null"/>
    </div>

</template>

<script>
import Vue from "vue"
import VueCookies from "vue-cookies"
import {BootstrapVue} from "bootstrap-vue"
import GenericMultiselect from "@/components/GenericMultiselect"
import {ApiMixin, getUserPreference, ToastMixin} from "@/utils/utils"

const {ApiApiFactory} = require("@/utils/openapi/api")

import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import ShoppingModal from "@/components/Modals/ShoppingModal.vue";
import moment from "moment";

Vue.use(BootstrapVue)
Vue.use(VueCookies)
let MEALPLAN_COOKIE_NAME = "mealplan_settings"

export default {
    name: "MealPlanEditModal",
    props: {
        entry: Object,
        create_date: String,
        modal_title: String,
        modal_id: {
            type: String,
            default: "id_meal_plan_edit_modal",
        },
        allow_delete: {
            type: Boolean,
            default: true,
        },
    },
    mixins: [ApiMixin, ToastMixin],
    components: {
        GenericMultiselect,
        RecipeCard: () => import("@/components/RecipeCard.vue"),
        ShoppingModal,
    },
    data() {
        return {
            entryEditing: null,
            missing_recipe: false,
            missing_meal_type: false,
            default_plan_share: [],
            mealplan_settings: {
                addshopping: false,
                reviewshopping: false,
            },
            last_created_plan: null,
        }
    },
    watch: {
        entry: {
            handler() {
                this.entryEditing = Object.assign({}, this.entry)
            },
            deep: true,
        },
        'entryEditing.from_date': {
            handler(newVal, oldVal) {
                if (newVal !== undefined && oldVal !== undefined) {
                    if (newVal !== oldVal && newVal !== this.entryEditing.to_date) {
                        let change = Math.abs(moment(oldVal).diff(moment(this.entryEditing.to_date), 'days')) // even though negative numbers might be correct, they would be illogical as to needs to always be larger than from
                        this.entryEditing.to_date = moment(newVal).add(change, 'd').format("YYYY-MM-DD")
                    }
                }
            },
            deep: true,
        },
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
        showModal() {
            if (this.$cookies.isKey(MEALPLAN_COOKIE_NAME)) {
                this.mealplan_settings = Object.assign({}, this.mealplan_settings, this.$cookies.get(MEALPLAN_COOKIE_NAME))
            }

            if (this.entry === null) {
                this.entryEditing = Object.assign({}, useMealPlanStore().empty_meal_plan, null)
            } else {
                this.entryEditing = Object.assign({}, this.entry, null)
            }

            if (this.create_date) {
                this.entryEditing.from_date = this.create_date
                this.entryEditing.to_date = this.create_date
            }

            useUserPreferenceStore().getData().then(userPreference => {
                if (this.entryEditing.id === -1) {
                    this.entryEditing.shared = userPreference.plan_share
                }
            })
        },
        editEntry() {

            if (this.entryEditing.meal_type == null) {
                this.makeToast('Warning', this.$t('Meal_Type_Required'), 'warning')
                return;
            }
            if (this.entryEditing.recipe == null && this.entryEditing.title === "") {
                this.makeToast('Warning', this.$t('Title_or_Recipe_Required'), 'warning')
                return
            }
            //TODO properly validate
            this.$bvModal.hide(this.modal_id)

            // only set addshopping if review is not enabled
            this.$set(this.entryEditing, 'addshopping', (this.mealplan_settings.addshopping && !this.mealplan_settings.reviewshopping))

            if (!('id' in this.entryEditing) || this.entryEditing.id === -1) {
                useMealPlanStore().createObject(this.entryEditing).then((r) => {
                    this.last_created_plan = r.data
                    if (r.data.recipe && this.mealplan_settings.addshopping && !this.autoMealPlan && this.mealplan_settings.reviewshopping) {
                        this.$nextTick(function () {
                            this.$bvModal.show(`shopping_999999`)
                        })
                    }
                })
            } else {
                useMealPlanStore().updateObject(this.entryEditing)
            }
        },
        deleteEntry() {
            this.$bvModal.hide(this.modal_id)
            useMealPlanStore().deleteObject(this.entryEditing)
        },
        selectMealType(event) {
            this.missing_meal_type = false
            if (event.val != null) {
                this.entryEditing.meal_type = event.val
            } else {
                this.entryEditing.meal_type = null
            }
        },
        selectShared(event) {
            if (event.val != null) {
                this.entryEditing.shared = event.val
            } else {
                this.entryEditing.meal_type = null
            }
        },
        selectRecipe(event) {
            this.missing_recipe = false
            if (event.val != null) {
                this.entryEditing.recipe = event.val
                this.entryEditing.title_placeholder = this.entryEditing.recipe.name
                this.entryEditing.servings = this.entryEditing.recipe.servings
            } else {
                this.entryEditing.recipe = null
                this.entryEditing.title_placeholder = ""
                this.entryEditing.servings = 1
            }
        },
        changeDate(date, change) {
            return moment(date).add(change, 'd').format("YYYY-MM-DD")
        }
    },
}
</script>

<style scoped></style>
