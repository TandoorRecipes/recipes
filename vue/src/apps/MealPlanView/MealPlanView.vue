<template>
    <div>
        <b-tabs content-class="mt-3" v-model="current_tab">
            <b-tab :title="$t('Planner')" active>
                <div class="row calender-row">
                    <div class="col-12 calender-parent">
                        <calendar-view
                            :show-date="showDate"
                            :enable-date-selection="true"
                            class="theme-default"
                            :items="plan_items"
                            :display-period-uom="settings.displayPeriodUom"
                            :period-changed-callback="periodChangedCallback"
                            :enable-drag-drop="true"
                            :item-content-height="item_height"
                            @click-date="createEntryClick"
                            @drop-on-date="moveEntry"
                            :display-period-count="settings.displayPeriodCount"
                            :starting-day-of-week="settings.startingDayOfWeek"
                            :display-week-numbers="settings.displayWeekNumbers"
                        >
                            <template #item="{ value, weekStartDate, top }">
                                <meal-plan-card
                                    :value="value"
                                    :week-start-date="weekStartDate"
                                    :top="top"
                                    :detailed="detailed_items"
                                    :item_height="item_height"
                                    @dragstart="dragged_item = value"
                                    @click-item="entryClick"
                                    @open-context-menu="openContextMenu"
                                />
                            </template>
                            <template #header="{ headerProps }">
                                <meal-plan-calender-header
                                    ref="header"
                                    :header-props="headerProps"
                                    @input="setShowDate"
                                    @delete-dragged="deleteEntry(dragged_item)"
                                    @create-new="createEntryClick(new Date())"
                                    @set-starting-day-back="setStartingDay(-1)"
                                    @set-starting-day-forward="setStartingDay(1)"
                                    :i-cal-url="iCalUrl"
                                    :options="options"
                                    :settings_prop="settings"
                                />
                            </template>
                        </calendar-view>
                    </div>
                </div>
            </b-tab>
            <b-tab :title="$t('Settings')">
                <div class="row mt-3">
                    <div class="col-12 col-md-3 calender-options">
                        <h5>{{ $t("Planner_Settings") }}</h5>
                        <b-form>
                            <b-form-group id="UomInput" :label="$t('Period')" :description="$t('Plan_Period_To_Show')"
                                          label-for="UomInput">
                                <b-form-select id="UomInput" v-model="settings.displayPeriodUom"
                                               :options="options.displayPeriodUom"></b-form-select>
                            </b-form-group>
                            <b-form-group id="PeriodInput" :label="$t('Periods')"
                                          :description="$t('Plan_Show_How_Many_Periods')" label-for="PeriodInput">
                                <b-form-select id="PeriodInput" v-model="settings.displayPeriodCount"
                                               :options="options.displayPeriodCount"></b-form-select>
                            </b-form-group>
                            <b-form-group id="DaysInput" :label="$t('Starting_Day')" :description="$t('Starting_Day')"
                                          label-for="DaysInput">
                                <b-form-select id="DaysInput" v-model="settings.startingDayOfWeek"
                                               :options="dayNames"></b-form-select>
                            </b-form-group>
                            <b-form-group id="WeekNumInput" :label="$t('Week_Numbers')">
                                <b-form-checkbox v-model="settings.displayWeekNumbers" name="week_num">
                                    {{ $t("Show_Week_Numbers") }}
                                </b-form-checkbox>
                            </b-form-group>
                        </b-form>
                    </div>
                    <div class="col-12 col-md-9 col-lg-6">
                        <h5>{{ $t("Meal_Types") }}</h5>
                        <div>
                            <draggable :list="meal_types" group="meal_types" :empty-insert-threshold="10"
                                       @sort="sortMealTypes()" ghost-class="ghost">
                                <b-card no-body class="mt-1 list-group-item p-2" style="cursor: move"
                                        v-for="(meal_type, index) in meal_types" v-hover :key="meal_type.id">
                                    <b-card-header class="p-2 border-0">
                                        <div class="row">
                                            <div class="col-2">
                                                <button type="button" class="btn btn-lg shadow-none"><i
                                                    class="fas fa-arrows-alt-v"></i></button>
                                            </div>
                                            <div class="col-10">
                                                <h5 class="mt-1 mb-1">
                                                    {{ meal_type.icon }} {{
                                                        meal_type.name
                                                    }}<span class="float-right text-primary" style="cursor: pointer"
                                                ><i class="fa"
                                                    v-bind:class="{ 'fa-pen': !meal_type.editing, 'fa-save': meal_type.editing }"
                                                    @click="editOrSaveMealType(index)" aria-hidden="true"></i
                                                ></span>
                                                </h5>
                                            </div>
                                        </div>
                                    </b-card-header>
                                    <b-card-body class="p-4" v-if="meal_type.editing">
                                        <div class="form-group">
                                            <label>{{ $t("Name") }}</label>
                                            <input class="form-control" :placeholder="$t('Name')"
                                                   v-model="meal_type.name"/>
                                        </div>
                                        <div class="form-group">
                                            <emoji-input :field="'icon'" :label="$t('Icon')"
                                                         :value="meal_type.icon"></emoji-input>
                                        </div>
                                        <div class="form-group">
                                            <label>{{ $t("Color") }}</label>
                                            <input class="form-control" type="color" name="Name"
                                                   :value="meal_type.color"
                                                   @change="meal_type.color = $event.target.value"/>
                                        </div>
                                        <b-form-checkbox id="checkbox-1" v-model="meal_type.default"
                                                         name="default_checkbox" class="mb-2">
                                            {{ $t("Default") }}
                                        </b-form-checkbox>
                                        <button class="btn btn-danger" @click="deleteMealType(index)">{{
                                                $t("Delete")
                                            }}
                                        </button>
                                        <button class="btn btn-primary float-right" @click="editOrSaveMealType(index)">
                                            {{ $t("Save") }}
                                        </button>
                                    </b-card-body>
                                </b-card>
                            </draggable>
                            <button class="btn btn-success float-right mt-1" @click="newMealType">
                                <i class="fas fa-plus"></i>
                                {{ $t("New_Meal_Type") }}
                            </button>
                        </div>
                    </div>
                </div>
            </b-tab>
        </b-tabs>
        <ContextMenu ref="menu">
            <template #menu="{ contextData }">
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        openEntryEdit(contextData.originalItem.entry)
                    "
                >
                    <a class="dropdown-item p-2" href="javascript:void(0)"><i class="fas fa-pen"></i> {{
                            $t("Edit")
                        }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    v-if="contextData && contextData.originalItem && contextData.originalItem.entry.recipe != null"
                    @click="
                        $refs.menu.close()
                        openRecipe(contextData.originalItem.entry.recipe)
                    "
                >
                    <a class="dropdown-item p-2" href="javascript:void(0)"><i class="fas fa-pizza-slice"></i>
                        {{ $t("Recipe") }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        moveEntryLeft(contextData)
                    "
                >
                    <a class="dropdown-item p-2" href="javascript:void(0)"><i class="fas fa-arrow-left"></i>
                        {{ $t("Move") }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        moveEntryRight(contextData)
                    "
                >
                    <a class="dropdown-item p-2" href="javascript:void(0)"><i class="fas fa-arrow-right"></i>
                        {{ $t("Move") }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        createEntry(contextData.originalItem.entry)
                    "
                >
                    <a class="dropdown-item p-2" href="javascript:void(0)"><i class="fas fa-copy"></i> {{ $t("Clone") }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        deleteEntry(contextData)
                    "
                >
                    <a class="dropdown-item p-2 text-danger" href="javascript:void(0)"><i class="fas fa-trash"></i>
                        {{ $t("Delete") }}</a>
                </ContextMenuItem>
            </template>
        </ContextMenu>
        <meal-plan-edit-modal
            :entry="entryEditing"
            :modal_title="modal_title"
            :edit_modal_show="edit_modal_show"
            @save-entry="editEntry"
            @delete-entry="deleteEntry"
            @reload-meal-types="refreshMealTypes"
        ></meal-plan-edit-modal>

        <transition name="slide-fade">
            <div class="row fixed-bottom p-2 b-1 border-top text-center" style="background: rgba(255, 255, 255, 0.6)"
                 v-if="current_tab === 0">
                <div class="col-md-3 col-6">
                    <button class="btn btn-block btn-success shadow-none" @click="createEntryClick(new Date())"><i
                        class="fas fa-calendar-plus"></i> {{ $t("Create") }}
                    </button>
                </div>
                <div class="col-md-3 col-6">
                    <a class="btn btn-block btn-primary shadow-none" :href="iCalUrl"
                    ><i class="fas fa-download"></i>
                        {{ $t("Export_To_ICal") }}
                    </a>
                </div>
                <div class="col-md-3 col-6">
                    <button class="btn btn-block btn-primary shadow-none disabled" v-b-tooltip.focus.top
                            :title="$t('Coming_Soon')">
                        {{ $t("Auto_Planner") }}
                    </button>
                </div>
                <div class="col-12 d-flex justify-content-center mt-2 d-block d-md-none">
                    <b-button-toolbar key-nav aria-label="Toolbar with button groups">
                        <b-button-group class="mx-1">
                            <b-button v-html="'<<'" class="p-2 pr-3 pl-3"
                                      @click="setShowDate($refs.header.headerProps.previousPeriod)"></b-button>
                            <b-button v-html="'<'" @click="setStartingDay(-1)" class="p-2 pr-3 pl-3"></b-button>
                        </b-button-group>
                        <b-button-group class="mx-1">
                            <b-button @click="setShowDate($refs.header.headerProps.currentPeriod)"><i
                                class="fas fa-home"></i></b-button>
                            <b-form-datepicker button-only button-variant="secondary"></b-form-datepicker>
                        </b-button-group>
                        <b-button-group class="mx-1">
                            <b-button v-html="'>'" @click="setStartingDay(1)" class="p-2 pr-3 pl-3"></b-button>
                            <b-button v-html="'>>'" class="p-2 pr-3 pl-3"
                                      @click="setShowDate($refs.header.headerProps.nextPeriod)"></b-button>
                        </b-button-group>
                    </b-button-toolbar>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import ContextMenu from "@/components/ContextMenu/ContextMenu"
import ContextMenuItem from "@/components/ContextMenu/ContextMenuItem"
import MealPlanCard from "@/components/MealPlanCard"
import MealPlanEditModal from "@/components/MealPlanEditModal"
import MealPlanCalenderHeader from "@/components/MealPlanCalenderHeader"
import EmojiInput from "@/components/Modals/EmojiInput"

import moment from "moment"
import draggable from "vuedraggable"
import VueCookies from "vue-cookies"

import {ApiMixin, StandardToasts, ResolveUrlMixin} from "@/utils/utils"
import {CalendarView, CalendarMathMixin} from "vue-simple-calendar/src/components/bundle"
import {ApiApiFactory} from "@/utils/openapi/api"

const {makeToast} = require("@/utils/utils")

Vue.prototype.moment = moment
Vue.use(BootstrapVue)
Vue.use(VueCookies)

let SETTINGS_COOKIE_NAME = "mealplan_settings"

export default {
    name: "MealPlanView",
    components: {
        MealPlanEditModal,
        MealPlanCard,
        CalendarView,
        ContextMenu,
        ContextMenuItem,
        MealPlanCalenderHeader,
        EmojiInput,
        draggable,
    },
    mixins: [CalendarMathMixin, ApiMixin, ResolveUrlMixin],
    data: function () {
        return {
            showDate: new Date(),
            plan_entries: [],
            recipe_viewed: {},
            settings: {
                displayPeriodUom: "week",
                displayPeriodCount: 2,
                startingDayOfWeek: 1,
                displayWeekNumbers: true,
            },
            dragged_item: null,
            current_tab: 0,
            meal_types: [],
            current_context_menu_item: null,
            options: {
                displayPeriodUom: [
                    {text: this.$t("Week"), value: "week"},
                    {
                        text: this.$t("Month"),
                        value: "month",
                    },
                    {text: this.$t("Year"), value: "year"},
                ],
                displayPeriodCount: [1, 2, 3],
                entryEditing: {
                    date: null,
                    id: -1,
                    meal_type: null,
                    note: "",
                    note_markdown: "",
                    recipe: null,
                    servings: 1,
                    shared: [],
                    title: "",
                    title_placeholder: this.$t("Title"),
                },
            },
            shopping_list: [],
            current_period: null,
            entryEditing: {},
            edit_modal_show: false,
            ical_url: window.ICAL_URL,
        }
    },
    computed: {
        modal_title: function () {
            if (this.entryEditing.id === -1) {
                return this.$t("Create_Meal_Plan_Entry")
            } else {
                return this.$t("Edit_Meal_Plan_Entry")
            }
        },
        plan_items: function () {
            let items = []
            this.plan_entries.forEach((entry) => {
                items.push(this.buildItem(entry))
            })
            return items
        },
        detailed_items: function () {
            return this.settings.displayPeriodUom === "week"
        },
        dayNames: function () {
            let options = []
            this.getFormattedWeekdayNames(this.userLocale, "long", 0).forEach((day, index) => {
                options.push({text: day, value: index})
            })
            return options
        },
        userLocale: function () {
            return this.getDefaultBrowserLocale
        },
        item_height: function () {
            if (this.settings.displayPeriodUom === "week") {
                return "10rem"
            } else {
                return "1.6rem"
            }
        },
        iCalUrl() {
            if (this.current_period !== null) {
                let start = moment(this.current_period.periodStart).format("YYYY-MM-DD")
                let end = moment(this.current_period.periodEnd).format("YYYY-MM-DD")
                return this.ical_url.replace(/12345/, start).replace(/6789/, end)
            } else {
                return ""
            }
        },
    },
    mounted() {
        this.$nextTick(function () {
            if (this.$cookies.isKey(SETTINGS_COOKIE_NAME)) {
                this.settings = Object.assign({}, this.settings, this.$cookies.get(SETTINGS_COOKIE_NAME))
            }
        })
        this.$root.$on("change", this.updateEmoji)
        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    watch: {
        settings: {
            handler() {
                this.$cookies.set(SETTINGS_COOKIE_NAME, this.settings, "360d")
            },
            deep: true,
        },
    },
    methods: {
        openRecipe: function (recipe) {
            window.open(this.resolveDjangoUrl("view_recipe", recipe.id))
        },
        setStartingDay(days) {
            if (this.settings.startingDayOfWeek + days < 0) {
                this.settings.startingDayOfWeek = 6
            } else if (this.settings.startingDayOfWeek + days > 6) {
                this.settings.startingDayOfWeek = 0
            } else {
                this.settings.startingDayOfWeek = this.settings.startingDayOfWeek + days
            }
        },
        newMealType() {
            let apiClient = new ApiApiFactory()

            apiClient
                .createMealType({name: this.$t("Meal_Type")})
                .then((e) => {
                    this.periodChangedCallback(this.current_period)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })

            this.refreshMealTypes()
        },
        sortMealTypes() {
            this.meal_types.forEach(function (element, index) {
                element.order = index
            })
            let updated = 0
            this.meal_types.forEach((meal_type) => {
                let apiClient = new ApiApiFactory()

                apiClient
                    .updateMealType(meal_type.id, meal_type)
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
        editOrSaveMealType(index) {
            let meal_type = this.meal_types[index]
            if (meal_type.editing) {
                this.$set(this.meal_types[index], "editing", false)
                let apiClient = new ApiApiFactory()

                apiClient
                    .updateMealType(this.meal_types[index].id, this.meal_types[index])
                    .then((e) => {
                        this.periodChangedCallback(this.current_period)
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            } else {
                this.$set(this.meal_types[index], "editing", true)
            }
        },
        deleteMealType(index) {
            let apiClient = new ApiApiFactory()

            apiClient
                .destroyMealType(this.meal_types[index].id)
                .then((e) => {
                    this.periodChangedCallback(this.current_period)
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                })
        },
        updateEmoji: function (field, value) {
            this.meal_types.forEach((meal_type) => {
                if (meal_type.editing) {
                    meal_type.icon = value
                }
            })
        },
        editEntry(edit_entry) {
            if (edit_entry.id !== -1) {
                this.plan_entries.forEach((entry, index) => {
                    if (entry.id === edit_entry.id) {
                        this.$set(this.plan_entries, index, edit_entry)
                        this.saveEntry(this.plan_entries[index])
                    }
                })
            } else {
                this.createEntry(edit_entry)
            }
        },
        setShowDate(d) {
            this.showDate = d
        },
        createEntryClick(data) {
            this.entryEditing = this.options.entryEditing
            this.entryEditing.date = moment(data).format("YYYY-MM-DD")
            this.$bvModal.show(`edit-modal`)
        },
        findEntry(id) {
            return this.plan_entries.filter((entry) => {
                return entry.id === id
            })[0]
        },
        moveEntry(null_object, target_date, drag_event) {
            this.plan_entries.forEach((entry) => {
                if (entry.id === this.dragged_item.id) {
                    if (drag_event.ctrlKey) {
                        let new_entry = Object.assign({}, entry)
                        new_entry.date = target_date
                        this.createEntry(new_entry)
                    } else {
                        entry.date = target_date
                        this.saveEntry(entry)
                    }
                }
            })
        },
        moveEntryLeft(data) {
            this.plan_entries.forEach((entry) => {
                if (entry.id === data.id) {
                    entry.date = moment(entry.date).subtract(1, "d")
                    this.saveEntry(entry)
                }
            })
        },
        moveEntryRight(data) {
            this.plan_entries.forEach((entry) => {
                if (entry.id === data.id) {
                    entry.date = moment(entry.date).add(1, "d")
                    this.saveEntry(entry)
                }
            })
        },
        deleteEntry(data) {
            this.plan_entries.forEach((entry, index, list) => {
                if (entry.id === data.id) {
                    let apiClient = new ApiApiFactory()

                    apiClient
                        .destroyMealPlan(entry.id)
                        .then((e) => {
                            list.splice(index, 1)
                        })
                        .catch((err) => {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                        })
                }
            })
        },
        entryClick(data) {
            let entry = this.findEntry(data.id)
            this.openEntryEdit(entry)
        },
        openContextMenu($event, value) {
            this.$refs.menu.open($event, value)
        },
        openEntryEdit(entry) {
            this.$bvModal.show(`edit-modal`)
            this.entryEditing = entry
            this.entryEditing.date = moment(entry.date).format("YYYY-MM-DD")
            if (this.entryEditing.recipe != null) {
                this.entryEditing.title_placeholder = this.entryEditing.recipe.name
            }
        },
        periodChangedCallback(date) {
            this.current_period = date
            let apiClient = new ApiApiFactory()

            apiClient
                .listMealPlans({
                    query: {
                        from_date: moment(date.periodStart).format("YYYY-MM-DD"),
                        to_date: moment(date.periodEnd).format("YYYY-MM-DD"),
                    },
                })
                .then((result) => {
                    this.plan_entries = result.data
                })
            this.refreshMealTypes()
        },
        refreshMealTypes() {
            let apiClient = new ApiApiFactory()

            apiClient.listMealTypes().then((result) => {
                result.data.forEach((meal_type) => {
                    meal_type.editing = false
                })
                this.meal_types = result.data
            })
        },
        saveEntry(entry) {
            entry.date = moment(entry.date).format("YYYY-MM-DD")

            let apiClient = new ApiApiFactory()

            apiClient.updateMealPlan(entry.id, entry).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        createEntry(entry) {
            entry.date = moment(entry.date).format("YYYY-MM-DD")

            let apiClient = new ApiApiFactory()

            apiClient
                .createMealPlan(entry)
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
                .then((entry_result) => {
                    this.plan_entries.push(entry_result.data)
                })
        },
        buildItem(plan_entry) {
            //dirty hack to order items within a day
            let date = moment(plan_entry.date).add(plan_entry.meal_type.order, "m")
            return {
                id: plan_entry.id,
                startDate: date,
                endDate: date,
                entry: plan_entry,
            }
        },
    },
    directives: {
        hover: {
            inserted: function (el) {
                el.addEventListener("mouseenter", () => {
                    el.classList.add("shadow")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("shadow")
                })
            },
        },
    },
}
</script>

<style>
.slide-fade-enter-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-active {
    transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

.calender-row {
    height: calc(100vh - 240px);
}

.calender-parent {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: hidden;
    height: 100%
}

.cv-item {
    white-space: inherit !important;
}


.isHovered {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.cv-day.draghover {
    box-shadow: inset 0 0 0.2em 0.2em rgb(221, 191, 134) !important;
}

.modal-backdrop {
    opacity: 0.5;
}

/*
**************************************************************
This theme is the default shipping theme, it includes some
decent defaults, but is separate from the calendar component
to make it easier for users to implement their own themes w/o
having to override as much.
**************************************************************
*/

/* Header */

.theme-default .cv-header,
.theme-default .cv-header-day {
    background-color: #f0f0f0;
}

.theme-default .cv-header .periodLabel {
    font-size: 1.5em;
}

/* Grid */

.theme-default .cv-weeknumber {
    background-color: #e0e0e0;
    border-color: #ccc;
    color: #808080;
}

.theme-default .cv-weeknumber span {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.theme-default .cv-day.past {
    background-color: #fafafa;
}

.theme-default .cv-day.outsideOfMonth {
    background-color: #f7f7f7;
}

.theme-default .cv-day.today {
    background-color: #ffe;
}

.theme-default .cv-day[aria-selected] {
    background-color: #ffc;
}

/* Events */

.theme-default .cv-item {
    border-color: #e0e0f0;
    border-radius: 0.5em;
    background-color: #fff;
    text-overflow: ellipsis;
}

.theme-default .cv-item.purple {
    background-color: #f0e0ff;
    border-color: #e7d7f7;
}

.theme-default .cv-item.orange {
    background-color: #ffe7d0;
    border-color: #f7e0c7;
}

.theme-default .cv-item.continued::before,
.theme-default .cv-item.toBeContinued::after {
    content: " \21e2 ";
    color: #999;
}

.theme-default .cv-item.toBeContinued {
    border-right-style: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.theme-default .cv-item.isHovered.hasUrl {
    text-decoration: underline;
}

.theme-default .cv-item.continued {
    border-left-style: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.cv-item.span3,
.cv-item.span4,
.cv-item.span5,
.cv-item.span6,
.cv-item.span7 {
    text-align: center;
}

/* Event Times */

.theme-default .cv-item .startTime,
.theme-default .cv-item .endTime {
    font-weight: bold;
    color: #666;
}

/* Drag and drop */

.theme-default .cv-day.draghover {
    box-shadow: inset 0 0 0.2em 0.2em yellow;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

@media (max-width: 767.9px) {
    .periodLabel {
        font-size: 18px !important;
    }
}
</style>
