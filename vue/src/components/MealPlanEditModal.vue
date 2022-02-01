<template>
    <b-modal :id="modal_id" size="lg" :title="modal_title" hide-footer aria-label="" @show="showModal">
        <div class="row">
            <div class="col col-md-12">
                <div class="row">
                    <div class="col col-md-12">
                        <div class="row">
                            <div class="col-6 col-lg-9">
                                <b-input-group>
                                    <b-form-input id="TitleInput" v-model="entryEditing.title" :placeholder="entryEditing.title_placeholder" @change="missing_recipe = false"></b-form-input>
                                    <b-input-group-append class="d-none d-lg-block">
                                        <b-button variant="primary" @click="entryEditing.title = ''"><i class="fa fa-eraser"></i></b-button>
                                    </b-input-group-append>
                                </b-input-group>
                                <span class="text-danger" v-if="missing_recipe">{{ $t("Title_or_Recipe_Required") }}</span>
                                <small tabindex="-1" class="form-text text-muted" v-if="!missing_recipe">{{ $t("Title") }}</small>
                            </div>
                            <div class="col-6 col-lg-3">
                                <input type="date" id="DateInput" class="form-control" v-model="entryEditing.date" />
                                <small tabindex="-1" class="form-text text-muted">{{ $t("Date") }}</small>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12 col-lg-6 col-xl-6">
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
                                <b-form-group class="mt-3">
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
                                        @new="createMealType"
                                    ></generic-multiselect>
                                    <span class="text-danger" v-if="missing_meal_type">{{ $t("Meal_Type_Required") }}</span>
                                    <small tabindex="-1" class="form-text text-muted" v-if="!missing_meal_type">{{ $t("Meal_Type") }}</small>
                                </b-form-group>
                                <b-form-group label-for="NoteInput" :description="$t('Note')" class="mt-3">
                                    <textarea class="form-control" id="NoteInput" v-model="entryEditing.note" :placeholder="$t('Note')"></textarea>
                                </b-form-group>
                                <b-input-group>
                                    <b-form-input id="ServingsInput" v-model="entryEditing.servings" :placeholder="$t('Servings')"></b-form-input>
                                </b-input-group>
                                <small tabindex="-1" class="form-text text-muted">{{ $t("Servings") }}</small>
                                <b-form-group class="mt-3">
                                    <generic-multiselect
                                        required
                                        @change="entryEditing.shared = $event.val"
                                        parent_variable="entryEditing.shared"
                                        :label="'username'"
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
                                    <b-form-checkbox id="AddToShopping" v-model="mealplan_settings.addshopping" />
                                    <small tabindex="-1" class="form-text text-muted">{{ $t("AddToShopping") }}</small>
                                </b-input-group>
                                <b-input-group v-if="mealplan_settings.addshopping">
                                    <b-form-checkbox id="reviewShopping" v-model="mealplan_settings.reviewshopping" />
                                    <small tabindex="-1" class="form-text text-muted">{{ $t("review_shopping") }}</small>
                                </b-input-group>
                            </div>
                            <div class="col-lg-6 d-none d-lg-block d-xl-block">
                                <recipe-card v-if="entryEditing.recipe" :recipe="entryEditing.recipe" :detailed="false"></recipe-card>
                            </div>
                        </div>
                        <div class="row mt-3 mb-3">
                            <div class="col-12">
                                <b-button variant="danger" @click="deleteEntry" v-if="allow_delete">{{ $t("Delete") }} </b-button>
                                <b-button class="float-right" variant="primary" @click="editEntry">{{ $t("Save") }}</b-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </b-modal>
</template>

<script>
import Vue from "vue"
import VueCookies from "vue-cookies"
import { BootstrapVue } from "bootstrap-vue"
import GenericMultiselect from "@/components/GenericMultiselect"
import { ApiMixin, getUserPreference } from "@/utils/utils"

const { ApiApiFactory } = require("@/utils/openapi/api")
const { StandardToasts } = require("@/utils/utils")

Vue.use(BootstrapVue)
Vue.use(VueCookies)
let MEALPLAN_COOKIE_NAME = "mealplan_settings"

export default {
    name: "MealPlanEditModal",
    props: {
        entry: Object,
        entryEditing_inital_servings: Number,
        modal_title: String,
        modal_id: {
            type: String,
            default: "edit-modal",
        },
        allow_delete: {
            type: Boolean,
            default: true,
        },
    },
    mixins: [ApiMixin],
    components: {
        GenericMultiselect,
        RecipeCard: () => import("@/components/RecipeCard.vue"),
    },
    data() {
        return {
            entryEditing: {},
            missing_recipe: false,
            missing_meal_type: false,
            default_plan_share: [],
            mealplan_settings: {
                addshopping: false,
                reviewshopping: false,
            },
        }
    },
    watch: {
        entry: {
            handler() {
                this.entryEditing = Object.assign({}, this.entry)

                if (this.entryEditing_inital_servings) {
                    this.entryEditing.servings = this.entryEditing_inital_servings
                }
            },
            deep: true,
        },
        entryEditing: {
            handler(newVal) {},
            deep: true,
        },
        mealplan_settings: {
            handler(newVal) {
                this.$cookies.set(MEALPLAN_COOKIE_NAME, this.mealplan_settings)
            },
            deep: true,
        },
        entryEditing_inital_servings: function (newVal) {
            this.entryEditing.servings = newVal
        },
    },
    mounted: function () {},
    computed: {
        autoMealPlan: function () {
            return getUserPreference("mealplan_autoadd_shopping")
        },
    },
    methods: {
        showModal() {
            if (this.$cookies.isKey(MEALPLAN_COOKIE_NAME)) {
                this.mealplan_settings = Object.assign({}, this.mealplan_settings, this.$cookies.get(MEALPLAN_COOKIE_NAME))
            }
            let apiClient = new ApiApiFactory()

            apiClient.listUserPreferences().then((result) => {
                if (this.entry.id === -1) {
                    this.entryEditing.shared = result.data[0].plan_share
                }
            })
        },

        editEntry() {
            this.missing_meal_type = false
            this.missing_recipe = false
            let cancel = false
            if (this.entryEditing.meal_type == null) {
                this.missing_meal_type = true
                cancel = true
            }
            if (this.entryEditing.recipe == null && this.entryEditing.title === "") {
                this.missing_recipe = true
                cancel = true
            }
            if (!cancel) {
                this.$bvModal.hide(`edit-modal`)
                this.$emit("save-entry", { ...this.mealplan_settings, ...this.entryEditing })
            }
        },
        deleteEntry() {
            this.$bvModal.hide(`edit-modal`)
            this.$emit("delete-entry", this.entryEditing)
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
        createMealType(event) {
            if (event != "") {
                let apiClient = new ApiApiFactory()

                apiClient
                    .createMealType({ name: event })
                    .then((e) => {
                        this.$emit("reload-meal-types")
                    })
                    .catch((error) => {
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                    })
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
    },
}
</script>

<style scoped></style>
