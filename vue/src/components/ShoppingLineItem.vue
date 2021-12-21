<template>
    <div id="shopping_line_item">
        <div class="col-12">
            <div class="row">
                <div class="col col-md-1">
                    <div style="position: static" class="btn-group">
                        <div class="dropdown b-dropdown position-static inline-block" data-html2canvas-ignore="true">
                            <button
                                aria-haspopup="true"
                                aria-expanded="false"
                                type="button"
                                class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret"
                                @click.stop="$emit('open-context-menu', $event, entries)"
                            >
                                <i class="fas fa-ellipsis-v fa-lg"></i>
                            </button>
                        </div>
                        <input type="checkbox" class="text-right mx-3 mt-2" :checked="formatChecked" @change="updateChecked" :key="entries[0].id" />
                    </div>
                </div>
                <div class="col-sm-3">
                    <div v-if="Object.entries(formatAmount).length == 1">{{ Object.entries(formatAmount)[0][1] }} &ensp; {{ Object.entries(formatAmount)[0][0] }}</div>
                    <div class="small" v-else v-for="(x, i) in Object.entries(formatAmount)" :key="i">{{ x[1] }} &ensp; {{ x[0] }}</div>
                </div>

                <div class="col col-md-6">
                    {{ formatFood }} <span class="small text-muted">{{ formatHint }}</span>
                </div>
                <div class="col col-md-1" data-html2canvas-ignore="true">
                    <b-button size="sm" @click="showDetails = !showDetails" class="mr-2" variant="link">
                        <div class="text-nowrap">{{ showDetails ? "Hide" : "Show" }} Details</div>
                    </b-button>
                </div>
            </div>
            <div class="card no-body" v-if="showDetails">
                <div v-for="(e, z) in entries" :key="z">
                    <div class="row ml-2 small">
                        <div class="col-md-4 overflow-hidden text-nowrap">
                            <button
                                aria-haspopup="true"
                                aria-expanded="false"
                                type="button"
                                class="btn btn-link btn-sm m-0 p-0"
                                style="text-overflow: ellipsis"
                                @click.stop="openRecipeCard($event, e)"
                                @mouseover="openRecipeCard($event, e)"
                            >
                                {{ formatOneRecipe(e) }}
                            </button>
                        </div>
                        <div class="col-md-4 text-muted">{{ formatOneMealPlan(e) }}</div>
                        <div class="col-md-4 text-muted text-right">{{ formatOneCreatedBy(e) }}</div>
                    </div>
                    <div class="row ml-2 small">
                        <div class="col-md-4 offset-md-8 text-muted text-right" v-if="formatOneCompletedAt(e)">{{ formatOneCompletedAt(e) }}</div>
                        <div class="col-md-4 offset-md-8 text-muted text-right" v-if="formatOneDelayUntil(e)">{{ formatOneDelayUntil(e) }}</div>
                    </div>
                    <div class="row ml-2 light">
                        <div class="col-sm-1 text-nowrap">
                            <div style="position: static" class="btn-group">
                                <div class="dropdown b-dropdown position-static inline-block" data-html2canvas-ignore="true">
                                    <button
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                        type="button"
                                        class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret"
                                        @click.stop="$emit('open-context-menu', $event, e)"
                                    >
                                        <i class="fas fa-ellipsis-v fa-lg"></i>
                                    </button>
                                </div>
                                <input type="checkbox" class="text-right mx-3 mt-2" :checked="e.checked" @change="updateChecked($event, e)" />
                            </div>
                        </div>
                        <div class="col-sm-1">{{ formatOneAmount(e) }}</div>
                        <div class="col-sm-2">{{ formatOneUnit(e) }}</div>

                        <div class="col-sm-3">{{ formatOneFood(e) }}</div>

                        <div class="col-sm-4">
                            <div class="small" v-for="(n, i) in formatOneNote(e)" :key="i">{{ n }}</div>
                        </div>
                    </div>

                    <hr class="w-75" />
                </div>
            </div>
            <hr class="m-1" />
        </div>
        <ContextMenu ref="recipe_card" triggers="click, hover" :title="$t('Filters')" style="max-width: 300">
            <template #menu="{ contextData }" v-if="recipe">
                <ContextMenuItem><RecipeCard :recipe="contextData" :detail="false"></RecipeCard></ContextMenuItem>
                <ContextMenuItem @click="$refs.menu.close()">
                    <b-form-group label-cols="9" content-cols="3" class="text-nowrap m-0 mr-2">
                        <template #label>
                            <a class="dropdown-item p-2" href="#"><i class="fas fa-pizza-slice"></i> {{ $t("Servings") }}</a>
                        </template>
                        <div @click.prevent.stop>
                            <b-form-input class="mt-2" min="0" type="number" v-model="servings"></b-form-input>
                        </div>
                    </b-form-group>
                </ContextMenuItem>
            </template>
        </ContextMenu>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import ContextMenu from "@/components/ContextMenu/ContextMenu"
import ContextMenuItem from "@/components/ContextMenu/ContextMenuItem"
import { ApiMixin } from "@/utils/utils"
import RecipeCard from "./RecipeCard.vue"

Vue.use(BootstrapVue)

export default {
    // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available
    // or i'm capturing it incorrectly
    name: "ShoppingLineItem",
    mixins: [ApiMixin],
    components: { RecipeCard, ContextMenu, ContextMenuItem },
    props: {
        entries: {
            type: Array,
        },
        groupby: { type: String },
    },
    data() {
        return {
            showDetails: false,
            recipe: undefined,
            servings: 1,
        }
    },
    computed: {
        formatAmount: function () {
            let amount = {}
            this.entries.forEach((entry) => {
                let unit = entry?.unit?.name ?? "----"
                if (entry.amount) {
                    if (amount[unit]) {
                        amount[unit] += entry.amount
                    } else {
                        amount[unit] = entry.amount
                    }
                }
            })
            for (const [k, v] of Object.entries(amount)) {
                amount[k] = Math.round(v * 100 + Number.EPSILON) / 100 // javascript hack to force rounding at 2 places
            }
            return amount
        },
        formatCategory: function () {
            return this.formatOneCategory(this.entries[0]) || this.$t("Undefined")
        },
        formatChecked: function () {
            return this.entries.map((x) => x.checked).every((x) => x === true)
        },
        formatHint: function () {
            if (this.groupby == "recipe") {
                return this.formatCategory
            } else {
                return this.formatRecipe
            }
        },
        formatFood: function () {
            return this.formatOneFood(this.entries[0])
        },
        formatUnit: function () {
            return this.formatOneUnit(this.entries[0])
        },
        formatRecipe: function () {
            if (this.entries?.length == 1) {
                return this.formatOneMealPlan(this.entries[0]) || ""
            } else {
                let mealplan_name = this.entries.filter((x) => x?.recipe_mealplan?.name)
                return [this.formatOneMealPlan(mealplan_name?.[0]), this.$t("CountMore", { count: this.entries?.length - 1 })].join("  ")
            }
        },
        formatNotes: function () {
            if (this.entries?.length == 1) {
                return this.formatOneNote(this.entries[0]) || ""
            }
            return ""
        },
    },
    watch: {},
    mounted() {
        this.servings = this.entries?.[0]?.recipe_mealplan?.servings ?? 0
    },
    methods: {
        // this.genericAPI inherited from ApiMixin

        formatDate: function (datetime) {
            if (!datetime) {
                return
            }
            return Intl.DateTimeFormat(window.navigator.language, { dateStyle: "short", timeStyle: "short" }).format(Date.parse(datetime))
        },
        formatOneAmount: function (item) {
            return item?.amount ?? 1
        },
        formatOneUnit: function (item) {
            return item?.unit?.name ?? ""
        },
        formatOneCategory: function (item) {
            return item?.food?.supermarket_category?.name
        },
        formatOneCompletedAt: function (item) {
            if (!item.completed_at) {
                return false
            }
            return [this.$t("Completed"), "@", this.formatDate(item.completed_at)].join(" ")
        },
        formatOneFood: function (item) {
            return item.food.name
        },
        formatOneChecked: function (item) {
            return item.checked
        },
        formatOneDelayUntil: function (item) {
            if (!item.delay_until && item.checked) {
                return false
            }
            return [this.$t("DelayUntil"), "-", this.formatDate(item.delay_until)].join(" ")
        },
        formatOneMealPlan: function (item) {
            return item?.recipe_mealplan?.name ?? ""
        },
        formatOneRecipe: function (item) {
            return item?.recipe_mealplan?.recipe_name ?? ""
        },
        formatOneNote: function (item) {
            if (!item) {
                item = this.entries[0]
            }
            return [item?.recipe_mealplan?.mealplan_note, item?.ingredient_note].filter(String)
        },
        formatOneCreatedBy: function (item) {
            return [this.$t("Added_by"), item?.created_by.username, "@", this.formatDate(item.created_at)].join(" ")
        },
        openRecipeCard: function (e, item) {
            this.genericAPI(this.Models.RECIPE, this.Actions.FETCH, { id: item.recipe_mealplan.recipe }).then((result) => {
                let recipe = result.data
                recipe.steps = undefined
                this.recipe = true
                this.$refs.recipe_card.open(e, recipe)
            })
        },
        updateChecked: function (e, item) {
            if (!item) {
                let update = { entries: this.entries.map((x) => x.id), checked: !this.formatChecked }
                this.$emit("update-checkbox", update)
            } else {
                this.$emit("update-checkbox", { id: item.id, checked: !item.checked })
            }
        },
    },
}
</script>

<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->

<style>
/* table           { border-collapse:collapse } /* Ensure no space between cells   */
/* tr.strikeout td { position:relative        } /* Setup a new coordinate system   */
/* tr.strikeout td:before {                     /* Create a new element that       */
/*   content: " ";                              /* …has no text content            */
/*   position: absolute;                        /* …is absolutely positioned       */
/*   left: 0; top: 50%; width: 100%;            /* …with the top across the middle */
/*   border-bottom: 1px solid #000;             /* …and with a border on the top   */
/* }   */
</style>
