<template>
    <!-- add alert at top if offline -->
    <!-- get autosync time from preferences and put fetching checked items on timer -->
    <!-- allow reordering or items -->
    <div id="app" style="margin-bottom: 4vh">
        <div class="row  float-top">
            <div class="offset-md-10 col-md-2 no-gutter text-right">
                <b-button variant="link" class="px-0">
                    <i class="btn fas fa-plus-circle text-muted fa-lg" @click="startAction({ action: 'new' })" />
                </b-button>
                <b-button variant="link" id="id_filters_button" class="px-0">
                    <i class="btn fas fa-filter text-decoration-none text-muted fa-lg" />
                </b-button>
            </div>
        </div>
        <b-tabs content-class="mt-3">
            <b-tab :title="$t('ShoppingList')" active>
                <template #title> <b-spinner v-if="loading" type="border" small></b-spinner> {{ $t("ShoppingList") }} </template>

                <div class="row">
                    <div class="col col-md-12">
                        <!-- TODO add spinner -->
                        <div role="tablist" v-if="items.length > 0">
                            <!-- WARNING: all data in the table should be considered read-only, don't change any data through table bindings -->
                            <div v-for="(done, x) in Sections" :key="x">
                                <div v-if="x == 'true'">
                                    <hr />
                                    <hr />
                                    <h4>{{ $t("Completed") }}</h4>
                                </div>

                                <div v-for="(s, i) in done" :key="i">
                                    <h5>
                                        <b-button
                                            class="btn btn-lg text-decoration-none text-dark px-1 py-0 border-0"
                                            variant="link"
                                            data-toggle="collapse"
                                            :href="'#section-' + sectionID(x, i)"
                                            :aria-expanded="'true' ? x == 'false' : 'true'"
                                        >
                                            <i class="fa fa-chevron-right rotate" />
                                            {{ i }}
                                        </b-button>
                                    </h5>

                                    <div class="collapse" :id="'section-' + sectionID(x, i)" visible role="tabpanel" :class="{ show: x == 'false' }">
                                        <!-- passing an array of values to the table grouped by Food -->
                                        <div v-for="(entries, x) in Object.entries(s)" :key="x">
                                            <ShoppingLineItem
                                                :entries="entries[1]"
                                                :groupby="group_by"
                                                @open-context-menu="openContextMenu"
                                                @toggle-checkbox="toggleChecked"
                                            ></ShoppingLineItem>
                                            <!-- <div style="position: static;" class=" btn-group">
                                                <div class="dropdown b-dropdown position-static">
                                                    <button
                                                        aria-haspopup="true"
                                                        aria-expanded="false"
                                                        type="button"
                                                        class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret"
                                                        @click.stop="openContextMenu($event, entries[1])"
                                                    >
                                                        <i class="fas fa-ellipsis-v fa-lg"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <b-button
                                                class="btn far text-body text-decoration-none"
                                                variant="link"
                                                @click="checkboxChanged(entries.item)"
                                                :class="formatChecked ? 'fa-square' : 'fa-check-square'"
                                            />
                                            {{ entries[0] }} {{ entries[1] }}

                                        </div> -->
                                            <!-- <b-table ref="table" small :items="Object.entries(s)" :fields="Fields" responsive="sm" class="w-100">
                                            <template #cell(checked)="row">
                                                <div style="position: static;" class=" btn-group">
                                                    <div class="dropdown b-dropdown position-static">
                                                        <button
                                                            aria-haspopup="true"
                                                            aria-expanded="false"
                                                            type="button"
                                                            class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret"
                                                            @click.stop="openContextMenu($event, row)"
                                                        >
                                                            <i class="fas fa-ellipsis-v fa-lg"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <b-button
                                                    class="btn far text-body text-decoration-none"
                                                    variant="link"
                                                    @click="checkboxChanged(data.item)"
                                                    :class="row.item.checked ? 'fa-check-square' : 'fa-square'"
                                                />
                                            </template>
                                            <template #cell(amount)="row">
                                                {{ formatAmount(row.item) }}
                                            </template>
                                            <template #cell(food)="row">
                                                {{ formatFood(row.item) }}
                                            </template>
                                            <template #cell(recipe)="row">
                                                {{ formatRecipe(row.item) }}
                                            </template>
                                            <template #cell(unit)="row">
                                                {{ formatUnit(row.item) }}
                                            </template>
                                            <template #cell(category)="row">
                                                {{ formatCategory(row.item.food.supermarket_category) }}
                                            </template>
                                            <template #cell(details)="row">
                                                <b-button size="sm" @click="row.toggleDetails" class="mr-2" variant="link">
                                                    <div class="text-nowrap">{{ row.detailsShowing ? "Hide" : "Show" }} Details</div>
                                                </b-button>
                                            </template>

                                            <template #row-details="row">
                                                notes {{ formatNotes(row.item) }} <br />
                                                by {{ row.item.created_by.username }}<br />
                                                at {{ formatDate(row.item.created_at) }}<br />
                                                <div v-if="row.item.checked">completed {{ formatDate(row.item.completed_at) }}</div>
                                            </template>
                                        </b-table> -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <b-tab :title="$t('Settings')"> These are the settings</b-tab>
        </b-tabs>
        <b-popover target="id_filters_button" triggers="click" placement="bottomleft" :title="$t('Filters')">
            <div>
                <b-form-group v-bind:label="$t('GroupBy')" label-for="popover-input-1" label-cols="6" class="mb-3">
                    <b-form-select v-model="group_by" :options="group_by_choices" size="sm"></b-form-select>
                </b-form-group>
                <b-form-group v-bind:label="$t('Supermarket')" label-for="popover-input-2" label-cols="6" class="mb-3">
                    <b-form-select v-model="selected_supermarket" :options="supermarkets" text-field="name" value-field="id" size="sm"></b-form-select>
                </b-form-group>
                <b-form-group v-bind:label="$t('ShowUncategorizedFood')" label-for="popover-input-2" label-cols="6" class="mb-3 text-nowrap">
                    <b-form-checkbox v-model="show_undefined_categories"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('SupermarketCategoriesOnly')" label-for="popover-input-3" label-cols="6" class="mb-3">
                    <b-form-checkbox v-model="supermarket_categories_only"></b-form-checkbox>
                </b-form-group>
            </div>
            <div class="row" style="margin-top: 1vh;min-width:300px">
                <div class="col-12" style="text-align: right;">
                    <b-button size="sm" variant="secondary" style="margin-right:20px" @click="$root.$emit('bv::hide::popover')">{{ $t("Close") }} </b-button>
                </div>
            </div>
        </b-popover>
        <ContextMenu ref="menu">
            <template #menu="{ contextData }">
                <ContextMenuItem>
                    <b-form-group label-cols="6" content-cols="6" class="text-nowrap m-0 mr-2">
                        <template #label>
                            <a class="dropdown-item p-2" href="#"><i class="fas fa-cubes"></i> {{ $t("MoveCategory") }}</a>
                        </template>
                        <b-form-select
                            class="mt-2"
                            :options="shopping_categories"
                            text-field="name"
                            value-field="id"
                            v-model="shopcat"
                            @change="
                                $refs.menu.close()
                                moveEntry($event, contextData)
                            "
                        ></b-form-select>
                    </b-form-group>
                </ContextMenuItem>

                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        deleteThis(contextData)
                    "
                >
                    <a class="dropdown-item p-2 text-danger" href="#"><i class="fas fa-trash"></i> {{ $t("Delete") }}</a>
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
import ShoppingLineItem from "@/components/ShoppingLineItem"

import { ApiMixin } from "@/utils/utils"
import { ApiApiFactory } from "@/utils/openapi/api"
import { StandardToasts } from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available
    // or i'm capturing it incorrectly
    name: "ChecklistView",
    mixins: [ApiMixin],
    components: { ContextMenu, ContextMenuItem, ShoppingLineItem },

    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            items: [],
            group_by: "category", //TODO create setting to switch group_by
            group_by_choices: ["created_by", "category", "recipe"],
            supermarkets: [],
            shopping_categories: [],
            selected_supermarket: undefined,
            show_undefined_categories: true,
            supermarket_categories_only: false,
            shopcat: null,
            show_modal: false,
            fields: ["checked", "amount", "category", "unit", "food", "recipe", "details"],
            loading: true,
        }
    },
    computed: {
        Sections() {
            function getKey(item, group_by, x) {
                switch (group_by) {
                    case "category":
                        return item?.food?.supermarket_category?.name ?? x
                    case "created_by":
                        return item?.created_by?.username ?? x
                    case "recipe":
                        return item?.recipe_mealplan?.recipe_name ?? x
                }
            }
            const groups = {}
            this.items
            let shopping_list = this.items
            if (this.selected_supermarket && this.supermarket_categories_only) {
                let shopping_categories = this.supermarkets // category IDs configured on supermarket
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.id)
                shopping_list = shopping_list.filter((x) => shopping_categories.includes(x?.food?.supermarket_category?.id))
            } else if (!this.show_undefined_categories) {
                shopping_list = shopping_list.filter((x) => x?.food?.supermarket_category)
            }
            shopping_list.forEach((item) => {
                let key = getKey(item, this.group_by, this.$t("Undefined"))
                // first level of dict is done/not done
                if (!groups[item.checked]) groups[item.checked] = {}

                // second level of dict is this.group_by selection
                if (!groups[item.checked][key]) groups[item.checked][key] = {}

                // third level of dict is the food
                if (groups[item.checked][key][item.food.name]) {
                    groups[item.checked][key][item.food.name].push(item)
                } else {
                    groups[item.checked][key][item.food.name] = [item]
                }
            })
            console.log(groups)

            return groups
        },
        Fields() {
            switch (this.group_by) {
                case "category":
                    return this.fields.filter((x) => x !== "category")
                case "recipe":
                    return this.fields.filter((x) => x.key !== "recipe_mealplan.name")
            }
            return this.fields
        },
    },
    watch: {
        selected_supermarket(newVal, oldVal) {
            this.getItems()
        },
    },
    mounted() {
        // value is passed from lists.py
        this.getItems()
        this.getSupermarkets()
        this.getShoppingCategories()
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        getItems: function(params = {}) {
            this.loading = true
            params = {
                supermarket: this.selected_supermarket,
            }
            params.options = { query: { recent: 1 } } // returns extended values in API response
            this.genericAPI(this.Models.SHOPPING_LIST, this.Actions.LIST, params)
                .then((results) => {
                    console.log(results.data)
                    if (results.data?.length) {
                        this.items = results.data
                    } else {
                        console.log("no data returned")
                    }
                    this.loading = false
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
                })
        },
        getSupermarkets: function() {
            this.genericAPI(this.Models.SUPERMARKET, this.Actions.LIST).then((result) => {
                this.supermarkets = result.data
            })
        },
        getShoppingCategories: function() {
            this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.LIST).then((result) => {
                this.shopping_categories = result.data
            })
        },
        getThis: function(id) {
            return this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.FETCH, { id: id })
        },
        saveThis: function(thisItem, toast = true) {
            if (!thisItem?.id) {
                // if there is no item id assume it's a new item
                this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.CREATE, thisItem)
                    .then((result) => {
                        // this.items = result.data - refresh the list here
                        if (toast) {
                            StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        if (toast) {
                            StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                        }
                    })
            } else {
                this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.UPDATE, thisItem)
                    .then((result) => {
                        // this.refreshThis(thisItem.id) refresh the list here
                        if (toast) {
                            StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                        }
                    })
                    .catch((err) => {
                        console.log(err, err.response)
                        if (toast) {
                            StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                        }
                    })
            }
        },
        getRecipe: function(item) {
            // change to get pop up card?  maybe same for unit and food?
        },
        deleteThis: function(id) {
            this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.DELETE, { id: id })
                .then((result) => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                })
        },
        // formatAmount: function(value) {
        //     return value[1][0].amount
        // },
        // formatCategory: function(value) {
        //     return value[1][0]?.name ?? this.$t("Undefined")
        // },
        // formatChecked: function(value) {
        //     return false
        // },
        // formatFood: function(value) {
        //     return value[1][0]?.food?.name ?? this.$t("Undefined")
        // },
        // formatUnit: function(value) {
        //     return value[1][0]?.unit?.name ?? this.$t("Undefined")
        // },
        // formatRecipe: function(value) {
        //     return value[1][0]?.recipe_mealplan?.recipe_name ?? this.$t("Undefined")
        // },
        // formatNotes: function(value) {
        //     return [value[1][0]?.recipe_mealplan?.mealplan_note, value?.ingredient_note].filter(String).join("\n")
        // },
        // formatDate: function(datetime) {
        //     if (!datetime) {
        //         return
        //     }
        //     return Intl.DateTimeFormat(window.navigator.language, { dateStyle: "short", timeStyle: "short" }).format(Date.parse(datetime))
        // },
        toggleChecked: function(item) {
            item.checked = !item.checked
            if (item.checked) {
                item.completed_at = new Date().toISOString()
            }

            this.saveThis(item, false)
        },

        sectionID: function(a, b) {
            return (a + b).replace(/\W/g, "")
        },
        openContextMenu(e, value) {
            this.$refs.menu.open(e, value)
        },
        moveEntry: function(e, item) {
            // TODO update API to warn that category is inherited
            let food = {
                id: item.food.id,
                supermarket_category: this.shopping_categories.filter((x) => x.id === e)[0],
            }
            console.log("food", food, "event", e, "item", item)

            this.genericAPI(this.Models.FOOD, this.Actions.UPDATE, food)
                .then((result) => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    this.items
                        .filter((x) => x.food.id == food.id)
                        .forEach((y) => {
                            y.food.supermarket_category = food.supermarket_category
                            this.updateEntry(y)
                        })
                })
                .catch((err) => {
                    console.log(err, Object.keys(err))
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                })
            this.shopcat = null
        },
        updateEntry: function(newItem) {
            let idx = this.items.indexOf((x) => x.id === newItem.id)
            Vue.set(this.items, idx, newItem)
        },
    },
}
</script>

<!--style src="vue-multiselect/dist/vue-multiselect.min.css"></style-->

<style>
.rotate {
    -moz-transition: all 0.25s linear;
    -webkit-transition: all 0.25s linear;
    transition: all 0.25s linear;
}
.btn[aria-expanded="true"] > .rotate {
    -moz-transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
}
.float-top {
    padding-bottom: -3em;
    margin-bottom: -3em;
}
</style>
