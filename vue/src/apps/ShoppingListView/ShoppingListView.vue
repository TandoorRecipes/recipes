<template>
    <!-- add alert at top if offline -->
    <!-- get autosync time from preferences and put fetching checked items on timer -->
    <!-- allow reordering or items -->
    <div id="app" style="margin-bottom: 4vh">
        <div class="row  float-top">
            <div class="offset-md-10 col-md-2 no-gutter text-right">
                <b-button variant="link" class="px-0">
                    <i class="btn fas fa-plus-circle fa-lg px-0" @click="entrymode = !entrymode" :class="entrymode ? 'text-success' : 'text-muted'" />
                </b-button>
                <b-button variant="link" id="id_filters_button" class="px-0">
                    <i class="btn fas fa-filter text-decoration-none  fa-lg px-0" :class="filterApplied ? 'text-danger' : 'text-muted'" />
                </b-button>
            </div>
        </div>
        <b-tabs content-class="mt-3">
            <b-tab :title="$t('ShoppingList')" active>
                <template #title> <b-spinner v-if="loading" type="border" small></b-spinner> {{ $t("ShoppingList") }} </template>
                <div class="container">
                    <div class="row">
                        <div class="col col-md-12">
                            <!-- TODO add spinner -->
                            <div role="tablist" v-if="items && items.length > 0">
                                <!-- WARNING: all data in the table should be considered read-only, don't change any data through table bindings -->
                                <div class="row justify-content-md-center w-75" v-if="entrymode">
                                    <div class="col col-md-2 "><b-form-input min="1" type="number" :description="$t('Amount')" v-model="new_item.amount"></b-form-input></div>
                                    <div class="col col-md-3">
                                        <generic-multiselect
                                            @change="new_item.unit = $event.val"
                                            :model="Models.UNIT"
                                            :multiple="false"
                                            :allow_create="false"
                                            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                            :placeholder="$t('Unit')"
                                        />
                                    </div>
                                    <div class="col col-md-4">
                                        <generic-multiselect
                                            @change="new_item.food = $event.val"
                                            :model="Models.FOOD"
                                            :multiple="false"
                                            :allow_create="false"
                                            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                            :placeholder="$t('Food')"
                                        />
                                    </div>
                                    <div class="col col-md-1 ">
                                        <b-button variant="link" class="px-0">
                                            <i class="btn fas fa-cart-plus fa-lg px-0 text-success" @click="addItem" />
                                        </b-button>
                                    </div>
                                </div>
                                <div v-for="(done, x) in Sections" :key="x">
                                    <div v-if="x == 'true'">
                                        <hr />
                                        <hr />
                                        <h4>{{ $t("Completed") }}</h4>
                                    </div>

                                    <div v-for="(s, i) in done" :key="i">
                                        <h5 v-if="Object.entries(s).length > 0">
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
                                                    @update-checkbox="updateChecked"
                                                ></ShoppingLineItem>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <b-tab :title="$t('Recipes')">
                <table class="table w-75">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">{{ $t("Meal_Plan") }}</th>
                            <th scope="col">{{ $t("Recipe") }}</th>
                            <th scope="col">{{ $t("Servings") }}</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tr v-for="r in Recipes" :key="r.list_recipe">
                        <td>{{ r.list_recipe }}</td>
                        <td>{{ r.recipe_mealplan.name }}</td>
                        <td>{{ r.recipe_mealplan.recipe_name }}</td>
                        <td class="block-inline">
                            <b-form-input min="1" type="number" :debounce="300" :value="r.recipe_mealplan.servings" @input="updateServings($event, r.list_recipe)"></b-form-input>
                        </td>
                        <td>
                            <i class="btn text-danger fas fa-trash fa-lg px-2 border-0" variant="link" :title="$t('Delete')" @click="deleteRecipe($event, r.list_recipe)" />
                        </td>
                    </tr>
                </table>
            </b-tab>
            <b-tab :title="$t('Settings')">
                These are the settings <br />-sort supermarket categories<br />
                -add supermarket categories<br />
                - add supermarkets autosync time<br />
                autosync on/off<br />
                always restrict supermarket to categories?<br />
                when restricted or filterd - give visual indication<br />
                how long to defer shopping - default tomorrow <br />
                always override inheritance
            </b-tab>
        </b-tabs>
        <b-popover target="id_filters_button" triggers="click" placement="bottomleft" :title="$t('Filters')">
            <div>
                <b-form-group v-bind:label="$t('GroupBy')" label-for="popover-input-1" label-cols="6" class="mb-1">
                    <b-form-select v-model="group_by" :options="group_by_choices" size="sm"></b-form-select>
                </b-form-group>
                <b-form-group v-bind:label="$t('Supermarket')" label-for="popover-input-2" label-cols="6" class="mb-1">
                    <b-form-select v-model="selected_supermarket" :options="supermarkets" text-field="name" value-field="id" size="sm"></b-form-select>
                </b-form-group>
                <b-form-group v-bind:label="$t('ShowDelayed')" label-for="popover-input-3" content-cols="1" class="mb-1">
                    <b-form-checkbox v-model="show_delay"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('ShowUncategorizedFood')" label-for="popover-input-4" content-cols="1" class="mb-1" v-if="!selected_supermarket">
                    <b-form-checkbox v-model="show_undefined_categories"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('SupermarketCategoriesOnly')" label-for="popover-input-5" content-cols="1" class="mb-1" v-if="selected_supermarket">
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
                <ContextMenuItem
                    @click="
                        moveEntry($event, contextData)
                        $refs.menu.close()
                    "
                >
                    <b-form-group label-cols="6" content-cols="6" class="text-nowrap m-0 mr-2">
                        <template #label>
                            <a class="dropdown-item p-2" href="#"><i class="fas fa-cubes"></i> {{ $t("MoveCategory") }}</a>
                        </template>
                        <span @click.prevent.stop @mouseup.prevent.stop>
                            <!-- would like to hide the dropdown value and only display value in button - not sure how to do that -->
                            <b-form-select class="mt-2  border-0" :options="shopping_categories" text-field="name" value-field="id" v-model="shopcat"></b-form-select>
                        </span>
                    </b-form-group>
                </ContextMenuItem>

                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        onHand(contextData)
                    "
                >
                    <a class="dropdown-item p-2" href="#"><i class="fas fa-clipboard-check"></i> {{ $t("OnHand") }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        delayThis(contextData)
                    "
                >
                    <b-form-group label-cols="10" content-cols="2" class="text-nowrap m-0 mr-2">
                        <template #label>
                            <a class="dropdown-item p-2" href="#"><i class="far fa-hourglass"></i> {{ $t("DelayFor", { hours: delay }) }}</a>
                        </template>
                        <div @click.prevent.stop>
                            <b-form-input class="mt-2" min="0" type="number" v-model="delay"></b-form-input>
                        </div>
                    </b-form-group>
                </ContextMenuItem>

                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        ignoreThis(contextData)
                    "
                >
                    <a class="dropdown-item p-2" href="#"><i class="fas fa-ban"></i> {{ $t("IgnoreThis", { food: foodName(contextData) }) }}</a>
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
import GenericMultiselect from "@/components/GenericMultiselect"

import { ApiMixin, getUserPreference } from "@/utils/utils"
import { ApiApiFactory } from "@/utils/openapi/api"
import { StandardToasts, makeToast } from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    // TODO ApiGenerator doesn't capture and share error information - would be nice to share error details when available
    // or i'm capturing it incorrectly
    name: "ShoppingListView",
    mixins: [ApiMixin],
    components: { ContextMenu, ContextMenuItem, ShoppingLineItem, GenericMultiselect },

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
            delay: 0, // user default
            show_delay: false,
            show_modal: false,
            fields: ["checked", "amount", "category", "unit", "food", "recipe", "details"],
            loading: true,
            entrymode: false,
            new_item: { amount: 1, unit: undefined, food: undefined },
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

            let shopping_list = this.items

            // filter out list items that are delayed
            if (!this.show_delay && shopping_list) {
                shopping_list = shopping_list.filter((x) => !x.delay_until || !Date.parse(x?.delay_until) > new Date(Date.now()))
            }

            // if a supermarket is selected and filtered to only supermarket categories filter out everything else
            if (this.selected_supermarket && this.supermarket_categories_only) {
                let shopping_categories = this.supermarkets // category IDs configured on supermarket
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.id)
                shopping_list = shopping_list.filter((x) => shopping_categories.includes(x?.food?.supermarket_category?.id))
                // if showing undefined is off, filter undefined
            } else if (!this.show_undefined_categories) {
                shopping_list = shopping_list.filter((x) => x?.food?.supermarket_category)
            }

            const groups = { false: {}, true: {} } // force unchecked to always be first
            if (this.selected_supermarket) {
                let super_cats = this.supermarkets
                    .filter((x) => x.id === this.selected_supermarket)
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.name)
                new Set([...super_cats, ...this.shopping_categories.map((x) => x.name)]).foreach((cat) => {
                    groups.false[cat.name] = {}
                    groups.true[cat.name] = {}
                })
            } else {
                this.shopping_categories.forEach((cat) => {
                    groups.false[cat.name] = {}
                    groups.true[cat.name] = {}
                })
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
            return groups
        },
        defaultDelay() {
            return getUserPreference("default_delay") || 2
        },
        itemsDelayed() {
            return this.items.filter((x) => !x.delay_until || !Date.parse(x?.delay_until) > new Date(Date.now())).length < this.items.length
        },
        filterApplied() {
            return (this.itemsDelayed && !this.show_delay) || !this.show_undefined_categories || this.supermarket_categories_only
        },
        Recipes() {
            return [...new Map(this.items.filter((x) => x.list_recipe).map((item) => [item["list_recipe"], item])).values()]
        },
    },
    watch: {
        selected_supermarket(newVal, oldVal) {
            this.getShoppingList()
        },
    },
    mounted() {
        // value is passed from lists.py
        this.getShoppingList()
        this.getSupermarkets()
        this.getShoppingCategories()
        this.delay = getUserPreference("default_delay") || 4
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        addItem() {
            console.log(this.new_item)
            let api = new ApiApiFactory()
            api.createShoppingListEntry(this.new_item)
                .then((results) => {
                    console.log(results)
                    if (results?.data) {
                        this.items.push(results.data)
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    } else {
                        console.log("no data returned")
                    }
                    this.new_item = { amount: 1 }
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                })
        },
        categoryName: function(value) {
            return this.shopping_categories.filter((x) => x.id == value)[0]?.name ?? ""
        },
        delayThis: function(item) {
            let entries = []
            let promises = []
            if (Array.isArray(item)) {
                entries = item.map((x) => x.id)
            } else {
                entries = [item.id]
            }
            let delay_date = new Date(Date.now() + this.delay * (60 * 60 * 1000))

            entries.forEach((entry) => {
                promises.push(this.saveThis({ id: entry, delay_until: delay_date }, false))
            })
            Promise.all(promises).then(() => {
                StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                this.delay = this.defaultDelay
            })
        },
        deleteRecipe: function(e, recipe) {
            let api = new ApiApiFactory()
            api.destroyShoppingListRecipe(recipe)
                .then((x) => {
                    this.items = this.items.filter((x) => x.list_recipe !== recipe)
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                })
        },
        deleteThis: function(item) {
            let api = new ApiApiFactory()
            let entries = []
            let promises = []
            if (Array.isArray(item)) {
                entries = item.map((x) => x.id)
            } else {
                entries = [item.id]
            }

            entries.forEach((x) => {
                promises.push(
                    api.destroyShoppingListEntry(x).catch((err) => {
                        console.log(err)
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                    })
                )
            })

            Promise.all(promises).then((result) => {
                this.items = this.items.filter((x) => !entries.includes(x.id))
                StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
            })
        },
        foodName: function(value) {
            return value?.food?.name ?? value?.[0]?.food?.name ?? ""
        },
        getShoppingCategories: function() {
            let api = new ApiApiFactory()
            api.listSupermarketCategorys().then((result) => {
                this.shopping_categories = result.data
            })
        },
        getShoppingList: function(params = {}) {
            this.loading = true
            params = {
                supermarket: this.selected_supermarket,
            }
            params.options = { query: { recent: 1 } }
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
            let api = new ApiApiFactory()
            api.listSupermarkets().then((result) => {
                this.supermarkets = result.data
                console.log(this.supermarkets)
            })
        },
        getThis: function(id) {
            return this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.FETCH, { id: id })
        },
        getRecipe: function(item) {
            // change to get pop up card?  maybe same for unit and food?
        },
        ignoreThis: function(item) {
            let food = {
                id: item?.[0]?.food.id ?? item.food.id,
                ignore_shopping: true,
            }
            this.updateFood(food, "ignore_shopping")
        },
        moveEntry: function(e, item) {
            if (!e) {
                makeToast(this.$t("Warning"), this.$t("NoCategory"), "warning")
            }

            // TODO make decision - should inheritance always be turned off when category set manually or give user a choice at front-end or make it a setting?
            let food = this.items.filter((x) => x.food.id == item?.[0]?.food.id ?? item.food.id)[0].food
            food.supermarket_category = this.shopping_categories.filter((x) => x?.id === this.shopcat)?.[0]
            this.updateFood(food, "supermarket_category")
            this.shopcat = null
        },
        onHand: function(item) {
            let api = new ApiApiFactory()
            let food = {
                id: item?.[0]?.food.id ?? item?.food?.id,
                on_hand: true,
            }

            this.updateFood(food)
                .then((result) => {
                    let entries = this.items.filter((x) => x.food.id == food.id).map((x) => x.id)
                    this.items = this.items.filter((x) => x.food.id !== food.id)
                    return entries
                })
                .then((entries) => {
                    entries.forEach((x) => {
                        api.destroyShoppingListEntry(x).then((result) => {})
                    })
                })
        },
        openContextMenu(e, value) {
            this.shopcat = value?.food?.supermarket_category?.id ?? value?.[0]?.food?.supermarket_category?.id ?? undefined
            this.$refs.menu.open(e, value)
        },
        saveThis: function(thisItem, toast = true) {
            let api = new ApiApiFactory()
            if (!thisItem?.id) {
                // if there is no item id assume it's a new item
                return api
                    .createShoppingListEntry(thisItem)
                    .then((result) => {
                        if (toast) {
                            StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                    })
            } else {
                return api
                    .partialUpdateShoppingListEntry(thisItem.id, thisItem)
                    .then((result) => {
                        if (toast) {
                            StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                        }
                    })
                    .catch((err) => {
                        console.log(err, err.response)

                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                    })
            }
        },
        sectionID: function(a, b) {
            return (a + b).replace(/\W/g, "")
        },
        updateChecked: function(update) {
            // when checking a sub item don't refresh the screen until all entries complete but change class to cross out

            let promises = []
            update.entries.forEach((x) => {
                console.log({ id: x, checked: update.checked })
                promises.push(this.saveThis({ id: x, checked: update.checked }, false))
                let item = this.items.filter((entry) => entry.id == x)[0]

                Vue.set(item, "checked", update.checked)
                Vue.set(item, "completed_at", new Date().toISOString())
            })
            Promise.all(promises).catch((err) => {
                console.log(err, err.response)
                StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
            })
        },
        updateFood: function(food, field) {
            let api = new ApiApiFactory()
            let ignore_category
            if (field) {
                ignore_category = food.ignore_inherit
                    .map((x) => food.ignore_inherit.fields)
                    .flat()
                    .includes(field)
            } else {
                ignore_category = true
            }

            return api
                .partialUpdateFood(food.id, food)
                .then((result) => {
                    if (food.inherit && food.supermarket_category && !ignore_category && food.parent) {
                        makeToast(this.$t("Warning"), this.$t("InheritWarning", { food: food.name }), "warning")
                    } else {
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    }
                    if (food?.numchild > 0) {
                        this.getShoppingList() // if food has children, just get the whole list.  probably could be more efficient
                    }
                })
                .catch((err) => {
                    console.log(err, Object.keys(err))
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                })
        },
        updateServings(e, plan) {
            // maybe this needs debounced?
            let api = new ApiApiFactory()
            api.partialUpdateShoppingListRecipe(plan, { id: plan, servings: e }).then(() => {
                this.getShoppingList()
            })
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
