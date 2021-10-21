<template>
    <!-- add alert at top if offline -->
    <!-- get autosync time from preferences and put fetching checked items on timer -->
    <!-- allow reordering or items -->
    <div id="app">
        <div class="col-12">
            <div class="row">
                <div class="col col-md-1">
                    <div style="position: static;" class=" btn-group">
                        <div class="dropdown b-dropdown position-static">
                            <button
                                aria-haspopup="true"
                                aria-expanded="false"
                                type="button"
                                class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret"
                                @click.stop="$emit('open-context-menu', $event, entries[0])"
                            >
                                <i class="fas fa-ellipsis-v fa-lg"></i>
                            </button>
                        </div>
                    </div>

                    <b-button class="btn far text-body text-decoration-none" variant="link" @click="checkboxChanged()" :class="formatChecked ? 'fa-check-square' : 'fa-square'" />
                </div>
                <div class="col col-md-1">{{ formatAmount }}</div>
                <div class="col col-md-1">{{ formatUnit }}</div>

                <div class="col col-md-4">
                    {{ formatFood }} <span class="text-muted">({{ formatHint }})</span>
                </div>
                <div class="col col-md-1">{{ formatNotes }}</div>
                <div class="col col-md-1">
                    <b-button size="sm" @click="showDetails = !showDetails" class="mr-2" variant="link">
                        <div class="text-nowrap">{{ showDetails ? "Hide" : "Show" }} Details</div>
                    </b-button>
                </div>
            </div>
            <div class="row" v-if="showDetails">
                <div class="offset-md-1">
                    <div v-for="e in entries" :key="e.id">
                        <div style="position: static;" class=" btn-group">
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
                            @click="checkboxChanged()"
                            :class="formatChecked ? 'fa-check-square' : 'fa-square'"
                        />
                        {{ e.amount }} - {{ e.unit }}- {{ e.recipe }}- {{ e.mealplan }}- {{ e.note }}- {{ e.unit }}
                    </div>
                </div>
            </div>
            <hr class="m-1" />
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue)

export default {
    // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available
    // or i'm capturing it incorrectly
    name: "ShoppingLineItem",
    mixins: [],
    components: {},
    props: {
        entries: {
            type: Array,
        },
        groupby: { type: String },
    },
    data() {
        return {
            showDetails: false,
        }
    },
    computed: {
        formatAmount: function() {
            return this.entries[0].amount
        },
        formatCategory: function() {
            return this.entries[0]?.food?.supermarket_category?.name ?? this.$t("Undefined")
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
            return this.entries[0]?.food?.name ?? this.$t("Undefined")
        },
        formatUnit: function() {
            return this.entries[0]?.unit?.name ?? this.$t("Undefined")
        },
        formatRecipe: function() {
            if (this.entries.length == 1) {
                return this.entries[0]?.recipe_mealplan?.name ?? this.$t("Undefined")
            } else {
                return [this.entries[0]?.recipe_mealplan?.name ?? this.$t("Undefined"), this.$t("CountMore", { count: this.entries.length - 1 })].join("  ")
            }
        },
        formatNotes: function() {
            return [this.entries[0]?.recipe_mealplan?.mealplan_note, this.entries?.ingredient_note].filter(String).join("\n")
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
    },
}
</script>

<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->

<style></style>
