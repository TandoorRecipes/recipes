<template>
    <!-- add alert at top if offline -->
    <!-- get autosync time from preferences and put fetching checked items on timer -->
    <!-- allow reordering or items -->
    <div id="app">
        <div class="col-12">
            <div class="row" :class="{ 'text-muted': formatChecked }">
                <div class="col col-md-1">
                    <div style="position: static;" class=" btn-group">
                        <div class="dropdown b-dropdown position-static">
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
                    </div>

                    <b-button class="btn far text-body text-decoration-none" variant="link" @click="checkboxChanged()" :class="formatChecked ? 'fa-check-square' : 'fa-square'" />
                </div>
                <div class="col col-md-1">{{ formatAmount }}</div>
                <div class="col col-md-1">{{ formatUnit }}</div>

                <div class="col col-md-6">
                    {{ formatFood }} <span class="small text-muted">{{ formatHint }}</span>
                </div>
                <div class="col col-md-1">
                    <b-button size="sm" @click="showDetails = !showDetails" class="mr-2" variant="link">
                        <div class="text-nowrap">{{ showDetails ? "Hide" : "Show" }} Details</div>
                    </b-button>
                </div>
            </div>
            <div class="card no-body" v-if="showDetails">
                <div v-for="(e, z) in entries" :key="z">
                    <div class="row ml-2 small" v-if="formatOneMealPlan(e)">
                        <div class="col-md-4  overflow-hidden text-nowrap">
                            <button
                                aria-haspopup="true"
                                aria-expanded="false"
                                type="button"
                                class="btn btn-link stn-sm m-0 p-0"
                                style="text-overflow: ellipsis;"
                                @click.stop="openRecipeCard($event, e)"
                                @mouseover="openRecipeCard($event, e)"
                            >
                                {{ formatOneRecipe(e) }}
                            </button>
                        </div>
                        <div class="col-md-4 text-muted">{{ formatOneMealPlan(e) }}</div>
                        <div class="col-md-4 text-muted">{{ formatOneCreatedBy(e) }}</div>
                    </div>
                    <div class="row ml-2 light">
                        <div class="col-sm-1 text-nowrap">
                            <div style="position: static;" class=" btn-group ">
                                <div class="dropdown b-dropdown position-static">
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
                            </div>

                            <b-button
                                class="btn far text-body text-decoration-none"
                                variant="link"
                                @click="checkboxChanged(e)"
                                :class="formatOneChecked(e) ? 'fa-check-square' : 'fa-square'"
                            />
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
        <ContextMenu ref="recipe_card" triggers="click, hover" :title="$t('Filters')" style="max-width:300">
            <template #menu="{ contextData }">
                <ContextMenuItem><RecipeCard :recipe="contextData" :detail="false" v-if="recipe"></RecipeCard></ContextMenuItem
            ></template>
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
        }
    },
    computed: {
        formatAmount: function() {
            return this.formatOneAmount(this.entries[0])
        },
        formatCategory: function() {
            return this.formatOneCategory(this.entries[0]) || this.$t("Undefined")
        },
        formatChecked: function() {
            return false
        },
        formatHint: function() {
            if (this.groupby == "recipe") {
                return this.formatCategory
            } else {
                return this.formatRecipe
            }
        },
        formatFood: function() {
            return this.formatOneFood(this.entries[0])
        },
        formatUnit: function() {
            return this.formatOneUnit(this.entries[0])
        },
        formatRecipe: function() {
            if (this.entries?.length == 1) {
                return this.formatOneMealPlan(this.entries[0]) || ""
            } else {
                let mealplan_name = this.entries.filter((x) => x?.recipe_mealplan?.name)
                return [this.formatOneMealPlan(mealplan_name?.[0]), this.$t("CountMore", { count: this.entries?.length - 1 })].join("  ")
            }
        },
        formatNotes: function() {
            if (this.entries?.length == 1) {
                return this.formatOneNote(this.entries[0]) || ""
            }
            return ""
        },
    },
    watch: {},
    mounted() {},
    methods: {
        // this.genericAPI inherited from ApiMixin

        formatDate: function(datetime) {
            if (!datetime) {
                return
            }
            return Intl.DateTimeFormat(window.navigator.language, { dateStyle: "short", timeStyle: "short" }).format(Date.parse(datetime))
        },
        checkboxChanged: function() {
            console.log("click!")
            // item.checked = !item.checked
            // if (item.checked) {
            //     item.completed_at = new Date().toISOString()
            // }

            // this.saveThis(item, false)
            // this.$refs.table.refresh()
        },
        formatOneAmount: function(item) {
            return item?.amount ?? 1
        },
        formatOneUnit: function(item) {
            return item?.unit?.name ?? ""
        },
        formatOneCategory: function(item) {
            return item?.food?.supermarket_category?.name
        },
        formatOneFood: function(item) {
            return item.food.name
        },
        formatOneChecked: function(item) {
            return item.checked
        },
        formatOneMealPlan: function(item) {
            return item?.recipe_mealplan?.name
        },
        formatOneRecipe: function(item) {
            return item?.recipe_mealplan?.recipe_name
        },
        formatOneNote: function(item) {
            if (!item) {
                item = this.entries[0]
            }
            return [item?.recipe_mealplan?.mealplan_note, item?.ingredient_note].filter(String)
        },
        formatOneCreatedBy: function(item) {
            return [item?.created_by.username, "@", this.formatDate(item.created_at)].join(" ")
        },
        openRecipeCard: function(e, item) {
            this.genericAPI(this.Models.RECIPE, this.Actions.FETCH, { id: item.recipe_mealplan.recipe }).then((result) => {
                let recipe = result.data
                recipe.steps = undefined
                this.recipe = true
                this.$refs.recipe_card.open(e, recipe)
            })
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
