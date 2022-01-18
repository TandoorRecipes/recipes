<template>
    <div id="app" style="margin-bottom: 4vh">
        <RecipeSwitcher ref="ref_recipe_switcher" />
        <div class="row">
            <div class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1">
                <div class="row">
                    <div class="col col-md-12">
                        <div class="row justify-content-center">
                            <div class="col-12 col-lg-10 col-xl-8 mt-3 mb-3">
                                <b-input-group>
                                    <b-input class="form-control form-control-lg form-control-borderless form-control-search" v-model="search.search_input" v-bind:placeholder="$t('Search')"></b-input>
                                    <b-input-group-append>
                                        <b-button v-b-tooltip.hover :title="$t('show_sql')" @click="showSQL()" v-if="debug && ui.sql_debug">
                                            <i class="fas fa-bug" style="font-size: 1.5em"></i>
                                        </b-button>
                                        <b-button variant="light" v-b-tooltip.hover :title="$t('Random Recipes')" @click="openRandom()">
                                            <i class="fas fa-dice-five" style="font-size: 1.5em"></i>
                                        </b-button>
                                        <b-button v-b-toggle.collapse_advanced_search v-b-tooltip.hover :title="$t('Advanced Settings')" v-bind:variant="!searchFiltered(true) ? 'primary' : 'danger'">
                                            <!-- TODO consider changing this icon to a filter -->
                                            <i class="fas fa-caret-down" v-if="!search.advanced_search_visible"></i>
                                            <i class="fas fa-caret-up" v-if="search.advanced_search_visible"></i>
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </div>
                        </div>

                        <b-collapse id="collapse_advanced_search" class="mt-2 shadow-sm" v-model="search.advanced_search_visible">
                            <div class="card">
                                <div class="card-body p-4">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <a class="btn btn-primary btn-block text-uppercase" :href="resolveDjangoUrl('new_recipe')">{{ $t("New_Recipe") }}</a>
                                        </div>
                                        <div class="col-md-3">
                                            <a class="btn btn-primary btn-block text-uppercase" :href="resolveDjangoUrl('data_import_url')">{{ $t("Import") }}</a>
                                        </div>
                                        <div class="col-md-3">
                                            <button
                                                class="btn btn-block text-uppercase"
                                                v-b-tooltip.hover
                                                :title="$t('show_only_internal')"
                                                v-bind:class="{ 'btn-success': search.search_internal, 'btn-primary': !search.search_internal }"
                                                @click="
                                                    search.search_internal = !search.search_internal
                                                    refreshData()
                                                "
                                            >
                                                <!-- TODO is this the right place to refresh data?  or deep watch on this.search?? -->
                                                {{ $t("Internal") }}
                                            </button>
                                        </div>

                                        <div class="col-md-3">
                                            <button id="id_settings_button" class="btn btn-primary btn-block text-uppercase"><i class="fas fa-cog fa-lg m-1"></i></button>
                                        </div>
                                    </div>
                                    <div v-if="ui.enable_expert" class="row justify-content-end small">
                                        <div class="col-auto">
                                            <b-button class="my-0" variant="link" size="sm">{{ $t("expert_mode") }}</b-button>
                                        </div>
                                    </div>

                                    <b-popover target="id_settings_button" triggers="click" placement="bottom">
                                        <b-tabs content-class="mt-1" small>
                                            <b-tab :title="$t('Settings')" active :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('Recently_Viewed')" label-for="popover-input-1" label-cols="6" class="mb-3">
                                                    <b-form-input type="number" v-model="ui.recently_viewed" id="popover-input-1" size="sm"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Recipes_per_page')" label-for="popover-input-page-count" label-cols="6" class="mb-3">
                                                    <b-form-input type="number" v-model="ui.page_size" id="popover-input-page-count" size="sm"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Meal_Plan')" label-for="popover-input-2" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_meal_plan" id="popover-input-2" size="sm"></b-form-checkbox>
                                                </b-form-group>

                                                <b-form-group v-if="ui.show_meal_plan" v-bind:label="$t('Meal_Plan_Days')" label-for="popover-input-5" label-cols="6" class="mb-3">
                                                    <b-form-input type="number" v-model="ui.meal_plan_days" id="popover-input-5" size="sm"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Sort_by_new')" label-for="popover-input-3" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.sort_by_new" id="popover-input-3" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <div class="row" style="margin-top: 1vh">
                                                    <div class="col-12">
                                                        <a :href="resolveDjangoUrl('view_settings') + '#search'">{{ $t("Search Settings") }}</a>
                                                    </div>
                                                </div>
                                            </b-tab>
                                            <b-tab :title="$t('fields')" :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('show_keywords')" label-for="popover-show_keywords" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_keywords" id="popover-show_keywords" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_foods')" label-for="popover-show_foods" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_foods" id="popover-show_foods" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_books')" label-for="popover-input-show_books" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_books" id="popover-input-show_books" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_rating')" label-for="popover-show_rating" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_rating" id="popover-show_rating" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('show_units')" label-for="popover-show_units" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_units" id="popover-show_units" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('show_filters')" label-for="popover-show_filters" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.show_filters" id="popover-show_filters" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                            </b-tab>

                                            <b-tab :title="$t('advanced')" :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('remember_search')" label-for="popover-rem-search" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.remember_search" id="popover-rem-search" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.remember_search" v-bind:label="$t('remember_hours')" label-for="popover-input-rem-hours" label-cols="6" class="mb-3">
                                                    <b-form-input type="number" v-model="ui.remember_hours" id="popover-rem-hours" size="sm"></b-form-input>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('tree_select')" label-for="popover-input-treeselect" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.tree_select" id="popover-input-treeselect" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('enable_expert')" label-for="popover-input-expert" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.enable_expert" id="popover-input-expert" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="debug" v-bind:label="$t('sql_debug')" label-for="popover-input-sqldebug" label-cols="6" class="mb-3">
                                                    <b-form-checkbox switch v-model="ui.sql_debug" id="popover-input-sqldebug" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                            </b-tab>
                                        </b-tabs>

                                        <div class="row" style="margin-top: 1vh">
                                            <div class="col-12" style="text-align: right">
                                                <b-button size="sm" variant="secondary" style="margin-right: 8px" @click="$root.$emit('bv::hide::popover')">{{ $t("Close") }} </b-button>
                                            </div>
                                        </div>
                                    </b-popover>

                                    <!-- keywords filter -->
                                    <div class="row">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <treeselect
                                                    v-if="ui.tree_select"
                                                    v-model="search.search_keywords"
                                                    :options="facets.Keywords"
                                                    :load-options="loadKeywordChildren"
                                                    :multiple="true"
                                                    :flat="true"
                                                    :auto-load-root-options="false"
                                                    searchNested
                                                    :placeholder="$t('Keywords')"
                                                    :normalizer="normalizer"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <generic-multiselect
                                                    v-if="!ui.tree_select"
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_keywords"
                                                    :initial_selection="search.search_keywords"
                                                    :model="Models.KEYWORD"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Keywords')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_keywords_or" name="check-button" @change="refreshData(false)" class="shadow-none" switch>
                                                            <span class="text-uppercase" v-if="search.search_keywords_or">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- foods filter -->
                                    <div class="row">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <treeselect
                                                    v-if="ui.tree_select"
                                                    v-model="search.search_foods"
                                                    :options="facets.Foods"
                                                    :load-options="loadFoodChildren"
                                                    :multiple="true"
                                                    :flat="true"
                                                    :auto-load-root-options="false"
                                                    searchNested
                                                    :placeholder="$t('Foods')"
                                                    :normalizer="normalizer"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <generic-multiselect
                                                    v-if="!ui.tree_select"
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_foods"
                                                    :initial_selection="search.search_foods"
                                                    :model="Models.FOOD"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Foods')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_foods_or" name="check-button" @change="refreshData(false)" class="shadow-none" switch>
                                                            <span class="text-uppercase" v-if="search.search_foods_or">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- books filter -->
                                    <div class="row">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <generic-multiselect
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_books"
                                                    :initial_selection="search.search_books"
                                                    :model="Models.RECIPE_BOOK"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    v-bind:placeholder="$t('Books')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_books_or" name="check-button" @change="refreshData(false)" class="shadow-none" tyle="width: 100%" switch>
                                                            <span class="text-uppercase" v-if="search.search_books_or">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- ratings filter -->
                                    <div class="row">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <treeselect
                                                    v-model="search.search_ratings"
                                                    :options="ratingOptions"
                                                    :flat="true"
                                                    :placeholder="$t('Ratings')"
                                                    :searchable="false"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text style="width: 85px"></b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                </div>

                <div class="row">
                    <div class="col col-md-12 text-right" style="margin-top: 2vh">
                        <span class="text-muted">
                            {{ $t("Page") }} {{ search.pagination_page }}/{{ Math.ceil(pagination_count / ui.page_size) }}
                            <a href="#" @click="resetSearch"><i class="fas fa-times-circle"></i> {{ $t("Reset") }}</a>
                        </span>
                    </div>
                </div>

                <div class="row">
                    <div class="col col-md-12">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); grid-gap: 0.8rem">
                            <template v-if="!searchFiltered()">
                                <recipe-card v-bind:key="`mp_${m.id}`" v-for="m in meal_plans" :recipe="m.recipe" :meal_plan="m" :footer_text="m.meal_type_name" footer_icon="far fa-calendar-alt"></recipe-card>
                            </template>
                            <recipe-card v-for="r in recipes" v-bind:key="r.id" :recipe="r" :footer_text="isRecentOrNew(r)[0]" :footer_icon="isRecentOrNew(r)[1]"></recipe-card>
                        </div>
                    </div>
                </div>

                <div class="row" style="margin-top: 2vh" v-if="!random_search">
                    <div class="col col-md-12">
                        <b-pagination pills v-model="search.pagination_page" :total-rows="pagination_count" :per-page="ui.page_size" @change="pageChange" align="center"></b-pagination>
                    </div>
                </div>
            </div>
            <div class="col-md-2 d-none d-md-block"></div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import VueCookies from "vue-cookies"

import "bootstrap-vue/dist/bootstrap-vue.css"
import moment from "moment"
import _debounce from "lodash/debounce"

import { ApiMixin, ResolveUrlMixin } from "@/utils/utils"
import LoadingSpinner from "@/components/LoadingSpinner" // TODO: is this deprecated?
import RecipeCard from "@/components/RecipeCard"
import GenericMultiselect from "@/components/GenericMultiselect"
import { Treeselect, LOAD_CHILDREN_OPTIONS } from "@riophae/vue-treeselect" //TODO: delete
import "@riophae/vue-treeselect/dist/vue-treeselect.css" //TODO: delete
import RecipeSwitcher from "@/components/Buttons/RecipeSwitcher"

Vue.use(VueCookies)
Vue.use(BootstrapVue)

let SEARCH_COOKIE_NAME = "search_settings"
let UI_COOKIE_NAME = "ui_search_settings"

export default {
    name: "RecipeSearchView",
    mixins: [ResolveUrlMixin, ApiMixin],
    components: { GenericMultiselect, RecipeCard, Treeselect, RecipeSwitcher },
    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            recipes: [],
            facets: {},
            meal_plans: [],
            last_viewed_recipes: [],

            search: {
                advanced_search_visible: false,
                search_input: "",
                search_internal: false,
                search_keywords: [],
                search_foods: [],
                search_books: [],
                search_ratings: undefined,
                search_keywords_or: true,
                search_foods_or: true,
                search_books_or: true,
                pagination_page: 1,
                expert_mode: false,
            },
            ui: {
                show_meal_plan: true,
                meal_plan_days: 0,
                recently_viewed: 5,
                sort_by_new: true,
                page_size: 25,
                remember_search: true,
                remember_hours: 4,
                sql_debug: false,
                tree_select: false,
                enable_expert: false,
                show_keywords: true,
                show_foods: true,
                show_books: true,
                show_rating: true,
                show_units: false,
                show_filters: false,
            },
            pagination_count: 0,
            random_search: false,
            debug: false,
        }
    },
    computed: {
        ratingOptions: function () {
            let ratingCount = undefined
            if (Object.keys(this.facets?.Ratings ?? {}).length === 0) {
                ratingCount = (x) => {
                    return ""
                }
            } else {
                ratingCount = (x) => {
                    return ` (${x})`
                }
            }
            return [
                { id: 5, label: "⭐⭐⭐⭐⭐" + ratingCount(this.facets.Ratings?.["5.0"] ?? 0) },
                { id: 4, label: "⭐⭐⭐⭐ " + this.$t("and_up") + ratingCount(this.facets.Ratings?.["4.0"] ?? 0) },
                { id: 3, label: "⭐⭐⭐ " + this.$t("and_up") + ratingCount(this.facets.Ratings?.["3.0"] ?? 0) },
                { id: 2, label: "⭐⭐ " + this.$t("and_up") + ratingCount(this.facets.Ratings?.["2.0"] ?? 0) },
                { id: 1, label: "⭐ " + this.$t("and_up") + ratingCount(this.facets.Ratings?.["1.0"] ?? 0) },
                { id: 0, label: this.$t("Unrated") + ratingCount(this.facets.Ratings?.["0.0"] ?? 0) },
            ]
        },
    },
    mounted() {
        this.$nextTick(function () {
            if (this.$cookies.isKey(UI_COOKIE_NAME)) {
                this.ui = Object.assign({}, this.ui, this.$cookies.get(UI_COOKIE_NAME))
            }
            if (this.ui.remember_search && this.$cookies.isKey(SEARCH_COOKIE_NAME)) {
                this.search = Object.assign({}, this.search, this.$cookies.get(SEARCH_COOKIE_NAME), `${this.ui.remember_hours}h`)
            }
            let urlParams = new URLSearchParams(window.location.search)

            if (urlParams.has("keyword")) {
                this.search.search_keywords = []
                this.facets.Keywords = []
                for (let x of urlParams.getAll("keyword")) {
                    let initial_keyword = { id: Number.parseInt(x), name: "loading..." }
                    this.search.search_keywords.push(initial_keyword)

                    this.genericAPI(this.Models.KEYWORD, this.Actions.FETCH, { id: initial_keyword.id })
                        .then((response) => {
                            let kw_index = this.search.search_keywords.findIndex((k) => k.id === initial_keyword.id)
                            this.$set(this.search.search_keywords, kw_index, response.data)
                            this.$set(this.facets.Keywords, kw_index, response.data)
                        })
                        .catch((err) => {
                            if (err.response.status === 404) {
                                let kw_index = this.search.search_keywords.findIndex((k) => k.id === initial_keyword.id)
                                this.search.search_keywords.splice(kw_index, 1)
                                this.facets.Keywords.splice(kw_index, 1)
                                this.refreshData(false)
                            }
                        })
                }
            }

            this.facets.Foods = []
            for (let x of this.search.search_foods) {
                this.facets.Foods.push({ id: x, name: "loading..." })
            }

            this.facets.Keywords = []
            for (let x of this.search.search_keywords) {
                this.facets.Keywords.push({ id: x, name: "loading..." })
            }

            this.facets.Books = []
            for (let x of this.search.search_books) {
                this.facets.Books.push({ id: x, name: "loading..." })
            }

            this.loadMealPlan()
            this.refreshData(false)
        })
        this.$i18n.locale = window.CUSTOM_LOCALE
        this.debug = localStorage.getItem("DEBUG") == "True" || false
    },
    watch: {
        search: {
            handler() {
                this.$cookies.set(SEARCH_COOKIE_NAME, this.search, `${this.ui.remember_hours}h`)
            },
            deep: true,
        },
        ui: {
            handler() {
                this.$cookies.set(UI_COOKIE_NAME, this.ui)
            },
            deep: true,
        },
        "ui.show_meal_plan": function () {
            this.loadMealPlan()
        },
        "ui.meal_plan_days": function () {
            this.loadMealPlan()
        },
        "ui.recently_viewed": function () {
            this.refreshData(false)
        },
        "ui.tree_select": function () {
            if (this.ui.tree_select && !this.facets?.Keywords && !this.facets?.Foods) {
                console.log("i changed to true")
                this.getFacets(this.facets?.hash)
            }
        },
        "search.search_input": _debounce(function () {
            this.search.pagination_page = 1
            this.pagination_count = 0
            this.refreshData(false)
        }, 300),
        "ui.page_size": _debounce(function () {
            this.refreshData(false)
        }, 300),
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        refreshData: function (random) {
            this.random_search = random
            let params = {
                query: this.search.search_input,
                keywords: this.search.search_keywords,
                foods: this.search.search_foods,
                rating: this.search.search_ratings,
                books: this.search.search_books.map(function (A) {
                    return A["id"]
                }),
                keywordsOr: this.search.search_keywords_or,
                foodsOr: this.search.search_foods_or,
                booksOr: this.search.search_books_or,
                internal: this.search.search_internal,
                random: this.random_search,
                _new: this.ui.sort_by_new,
                page: this.search.pagination_page,
                pageSize: this.search.page_size,
            }
            if (!this.searchFiltered) {
                params.options = { query: { last_viewed: this.ui.recently_viewed } }
            }
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params)
                .then((result) => {
                    window.scrollTo(0, 0)
                    this.pagination_count = result.data.count

                    this.facets = result.data.facets
                    this.recipes = [...this.removeDuplicates(result.data.results, (recipe) => recipe.id)]
                    if (!this.searchFiltered()) {
                        // if meal plans are being shown - filter out any meal plan recipes from the recipe list
                        let mealPlans = []
                        this.meal_plans.forEach((x) => mealPlans.push(x.recipe.id))
                        this.recipes = this.recipes.filter((recipe) => !mealPlans.includes(recipe.id))
                    }
                })
                .then(() => {
                    this.$nextTick(function () {
                        this.getFacets(this.facets?.cache_key)
                    })
                })
        },
        openRandom: function () {
            this.refreshData(true)
        },
        removeDuplicates: function (data, key) {
            return [...new Map(data.map((item) => [key(item), item])).values()]
        },
        loadMealPlan: function () {
            if (this.ui.show_meal_plan) {
                let params = {
                    options: {
                        query: {
                            from_date: moment().format("YYYY-MM-DD"),
                            to_date: moment().add(this.ui.meal_plan_days, "days").format("YYYY-MM-DD"),
                        },
                    },
                }
                this.genericAPI(this.Models.MEAL_PLAN, this.Actions.LIST, params).then((result) => {
                    this.meal_plans = result.data
                })
            } else {
                this.meal_plans = []
            }
        },
        genericSelectChanged: function (obj) {
            this.search[obj.var] = obj.val
            this.refreshData(false)
        },
        resetSearch: function () {
            this.search.search_input = ""
            this.search.search_internal = false
            this.search.search_keywords = []
            this.search.search_foods = []
            this.search.search_books = []
            this.search.search_ratings = undefined
            this.search.pagination_page = 1
            this.refreshData(false)
        },
        pageChange: function (page) {
            this.search.pagination_page = page
            this.refreshData(false)
        },
        normalizer(node) {
            let count = node?.count ? " (" + node.count + ")" : ""
            return {
                id: node.id,
                label: node.name + count,
                children: node.children,
                isDefaultExpanded: node.isDefaultExpanded,
            }
        },
        isRecentOrNew: function (x) {
            let recent_recipe = [this.$t("Recently_Viewed"), "fas fa-eye"]
            let new_recipe = [this.$t("New_Recipe"), "fas fa-splotch"]
            if (x.new) {
                return new_recipe
            } else if (x.recent) {
                return recent_recipe
            } else {
                return [undefined, undefined]
            }
        },
        getFacets: function (hash, facet, id) {
            if (!this.ui.tree_select) {
                return
            }
            let params = { hash: hash }
            if (facet) {
                params[facet] = id
            }
            return this.genericGetAPI("api_get_facets", params).then((response) => {
                this.facets = { ...this.facets, ...response.data.facets }
            })
        },
        showSQL: function () {
            let params = this.buildParams()
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params).then((result) => {})
        },
        // TODO refactor to combine with load KeywordChildren
        loadFoodChildren({ action, parentNode, callback }) {
            if (action === LOAD_CHILDREN_OPTIONS) {
                if (this.facets?.cache_key) {
                    this.getFacets(this.facets.cache_key, "food", parentNode.id).then(callback())
                }
            }
        },
        loadKeywordChildren({ action, parentNode, callback }) {
            if (action === LOAD_CHILDREN_OPTIONS) {
                if (this.facets?.cache_key) {
                    this.getFacets(this.facets.cache_key, "keyword", parentNode.id).then(callback())
                }
            }
        },
        buildParams: function () {
            let params = {
                query: this.search.search_input,
                keywords: this.search.search_keywords,
                foods: this.search.search_foods,
                rating: this.search.search_ratings,
                books: this.search.search_books.map(function (A) {
                    return A["id"]
                }),
                keywordsOr: this.search.search_keywords_or,
                foodsOr: this.search.search_foods_or,
                booksOr: this.search.search_books_or,
                internal: this.search.search_internal,
                random: this.random_search,
                _new: this.ui.sort_by_new,
                page: this.search.pagination_page,
                pageSize: this.ui.page_size,
            }
            if (!this.searchFiltered()) {
                params.options = { query: { last_viewed: this.ui.recently_viewed } }
            }
        },
        searchFiltered: function (ignore_string = false) {
            let filtered =
                this.search?.search_keywords?.length === 0 &&
                this.search?.search_foods?.length === 0 &&
                this.search?.search_books?.length === 0 &&
                // this.settings?.pagination_page === 1 &&
                !this.random_search &&
                this.search?.search_ratings === undefined
            if (ignore_string) {
                return filtered
            } else {
                return filtered && this.search?.search_input === ""
            }
        },
    },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style></style>
