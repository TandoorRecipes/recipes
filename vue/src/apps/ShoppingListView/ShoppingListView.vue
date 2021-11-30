<template>
    <div id="app" style="margin-bottom: 4vh">
        <b-alert :show="!online" dismissible class="small float-up" variant="warning">{{ $t("OfflineAlert") }}</b-alert>
        <div class="row float-top">
            <div class="offset-md-10 col-md-2 no-gutter text-right">
                <b-button variant="link" class="px-0">
                    <i class="btn fas fa-plus-circle fa-lg px-0" @click="entrymode = !entrymode" :class="entrymode ? 'text-success' : 'text-muted'" />
                </b-button>
                <b-button variant="link" class="px-0">
                    <i class="fas fa-download fa-lg nav-link dropdown-toggle text-muted px-0" id="downloadShoppingLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>

                    <div class="dropdown-menu dropdown-menu-center" aria-labelledby="downloadShoppingLink">
                        <a class="dropdown-item disabled" @click="download('CSV')"><i class="fas fa-file-import"></i> {{ $t("Download csv") }}</a>
                        <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')" icon="far fa-file-pdf" />
                        <DownloadCSV :items="csvData" :delim="settings.csv_delim" name="shopping.csv" :label="$t('download_csv')" icon="fas fa-file-csv" />
                        <a class="dropdown-item disabled" @click="download('clipboard')"><i class="fas fa-plus"></i> {{ $t("copy to clipboard") }}</a>
                        <a class="dropdown-item disabled" @click="download('markdown')"><i class="fas fa-plus"></i> {{ $t("copy as markdown") }}</a>
                    </div>
                </b-button>
                <b-button variant="link" id="id_filters_button" class="px-0">
                    <i class="btn fas fa-filter text-decoration-none fa-lg px-0" :class="filterApplied ? 'text-danger' : 'text-muted'" />
                </b-button>
            </div>
        </div>

        <b-tabs content-class="mt-3">
            <!-- shopping list tab -->
            <b-tab active>
                <template #title> <b-spinner v-if="loading" type="border" small></b-spinner> {{ $t("Shopping_list") }} </template>
                <div class="container" id="shoppinglist">
                    <div class="row">
                        <div class="col col-md-12">
                            <div role="tablist" v-if="items && items.length > 0">
                                <div class="row justify-content-md-center w-75" v-if="entrymode">
                                    <div class="col col-md-2">
                                        <b-form-input min="1" type="number" :description="$t('Amount')" v-model="new_item.amount"></b-form-input>
                                    </div>
                                    <div class="col col-md-3">
                                        <lookup-input :form="formUnit" :model="Models.UNIT" @change="new_item.unit = $event" :show_label="false" />
                                    </div>
                                    <div class="col col-md-4">
                                        <lookup-input :form="formFood" :model="Models.FOOD" @change="new_item.food = $event" :show_label="false" />
                                    </div>
                                    <div class="col col-md-1">
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
                                                <ShoppingLineItem :entries="entries[1]" :groupby="group_by" @open-context-menu="openContextMenu" @update-checkbox="updateChecked" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <!-- recipe tab -->
            <b-tab :title="$t('Recipes')">
                <table class="table w-75">
                    <thead>
                        <tr>
                            <th scope="col">{{ $t("Meal_Plan") }}</th>
                            <th scope="col">{{ $t("Recipe") }}</th>
                            <th scope="col">{{ $t("Servings") }}</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tr v-for="r in Recipes" :key="r.list_recipe">
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
            <!-- supermarkets tab -->
            <b-tab :title="$t('Supermarkets')">
                <div class="row justify-content-center">
                    <div class="col col-md-5">
                        <b-card>
                            <template #header>
                                <h4 class="mb-0">
                                    {{ $t("Supermarkets") }}
                                    <b-button variant="link" class="p-0 m-0 float-right" @click="new_supermarket.entrymode = !new_supermarket.entrymode">
                                        <i class="btn fas fa-plus-circle fa-lg px-0" :class="new_supermarket.entrymode ? 'text-success' : 'text-muted'" />
                                    </b-button>
                                </h4>
                            </template>
                            <b-card
                                class="m-1 p-1 no-body"
                                border-variant="success"
                                header-bg-variant="success"
                                header-text-variant="white"
                                align="center"
                                v-if="new_supermarket.entrymode"
                                :header="$t('SupermarketName')"
                            >
                                <div class="input-group">
                                    <b-form-input type="text" :placeholder="$t('SupermarketName')" v-model="new_supermarket.value" />
                                    <b-button class="input-group-append" variant="success" @click="addSupermarket"><i class="pr-2 pt-1 fas fa-save"></i> {{ $t("Save") }}</b-button>
                                </div>
                            </b-card>

                            <b-card-body class="m-0 p-0">
                                <b-card class="no-body mb-2" v-for="s in supermarkets" v-bind:key="s.id">
                                    <b-card-title
                                        >{{ s.name }}
                                        <b-button
                                            variant="link"
                                            class="p-0 m-0 float-right"
                                            @click="
                                                s.editmode = !s.editmode
                                                editSupermarket(s)
                                            "
                                        >
                                            <i class="btn fas fa-edit fa-lg px-0" :class="s.editmode ? 'text-success' : 'text-muted'" />
                                        </b-button>
                                    </b-card-title>

                                    <b-card-body class="py-0">
                                        <generic-pill :item_list="s.category_to_supermarket" label="category::name" color="info"></generic-pill>
                                    </b-card-body>
                                </b-card>
                            </b-card-body>
                        </b-card>
                    </div>
                    <div class="col col-md-5">
                        <b-card class="no-body">
                            <template #header>
                                <h4 class="mb-0">
                                    {{ $t("Shopping_Categories") }}
                                    <b-button variant="link" class="p-0 m-0 float-right" @click="new_category.entrymode = !new_category.entrymode">
                                        <i class="btn fas fa-plus-circle fa-lg px-0" :class="new_category.entrymode ? 'text-success' : 'text-muted'" />
                                    </b-button>
                                </h4>
                            </template>
                            <b-card
                                class="m-1 p-1 no-body"
                                border-variant="success"
                                header-bg-variant="success"
                                header-text-variant="white"
                                align="center"
                                v-if="new_category.entrymode"
                                :header="$t('CategoryName')"
                            >
                                <div class="input-group">
                                    <b-form-input type="text" :placeholder="$t('CategoryName')" v-model="new_category.value" />
                                    <b-button class="input-group-append" variant="success" @click="addCategory"><i class="pr-2 pt-1 fas fa-save"></i> {{ $t("Save") }}</b-button>
                                </div>
                            </b-card>

                            <b-card-sub-title v-if="new_supermarket.editmode" class="pt-0 pb-3">{{ $t("CategoryInstruction") }}</b-card-sub-title>
                            <b-card v-if="new_supermarket.editmode && supermarketCategory.length === 0" class="m-0 p-0 font-weight-bold no-body" border-variant="success" v-bind:key="-1" />
                            <draggable
                                class="list-group"
                                :list="supermarketCategory"
                                group="category"
                                @start="drag = true"
                                @end="drag = false"
                                ghost-class="ghost"
                                @change="saveSupermarketCategoryOrder"
                                v-bind="{ animation: 200, disabled: !new_supermarket.editmode }"
                            >
                                <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                    <b-card
                                        class="m-0 p-0 font-weight-bold no-body list-group-item"
                                        :style="new_supermarket.editmode ? 'cursor:move' : ''"
                                        v-for="c in supermarketCategory"
                                        v-bind:key="c.id"
                                        :border-variant="new_supermarket.editmode ? 'success' : ''"
                                    >
                                        {{ categoryName(c) }}
                                    </b-card>
                                </transition-group>
                            </draggable>
                            <hr style="height: 2px; background-color: black" v-if="new_supermarket.editmode" />
                            <b-card v-if="new_supermarket.editmode && notSupermarketCategory.length === 0" v-bind:key="-2" class="m-0 p-0 font-weight-bold no-body" border-variant="danger" />
                            <draggable
                                class="list-group"
                                :list="notSupermarketCategory"
                                group="category"
                                v-if="new_supermarket.editmode"
                                @start="drag = true"
                                @end="drag = false"
                                ghost-class="ghost"
                                v-bind="{ animation: 200 }"
                            >
                                <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                    <b-card class="m-0 p-0 font-weight-bold no-body list-group-item" style="cursor: move" v-for="c in notSupermarketCategory" v-bind:key="c.id" :border-variant="'danger'">
                                        {{ categoryName(c) }}
                                    </b-card>
                                </transition-group>
                            </draggable>
                        </b-card>
                    </div>
                </div>
            </b-tab>
            <!-- settings tab -->
            <b-tab :title="$t('Settings')">
                <div class="row justify-content-center">
                    <div class="col col-md-4 col-sm-8">
                        <b-card class="no-body">
                            <div class="row">
                                <div class="col col-md-6">{{ $t("mealplan_autoadd_shopping") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="checkbox" size="sm" v-model="settings.mealplan_autoadd_shopping" @change="saveSettings" />
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">{{ $t("mealplan_autoadd_shopping_desc") }}</em>
                                </div>
                            </div>
                            <div v-if="settings.mealplan_autoadd_shopping">
                                <div class="row">
                                    <div class="col col-md-6">{{ $t("mealplan_autoadd_shopping") }}</div>
                                    <div class="col col-md-6 text-right">
                                        <input type="checkbox" size="sm" v-model="settings.mealplan_autoexclude_onhand" @change="saveSettings" />
                                    </div>
                                </div>
                                <div class="row sm mb-3">
                                    <div class="col">
                                        <em class="small text-muted">{{ $t("mealplan_autoadd_shopping_desc") }}</em>
                                    </div>
                                </div>
                            </div>
                            <div v-if="settings.mealplan_autoadd_shopping">
                                <div class="row">
                                    <div class="col col-md-6">{{ $t("mealplan_autoinclude_related") }}</div>
                                    <div class="col col-md-6 text-right">
                                        <input type="checkbox" size="sm" v-model="settings.mealplan_autoinclude_related" @change="saveSettings" />
                                    </div>
                                </div>
                                <div class="row sm mb-3">
                                    <div class="col">
                                        <em class="small text-muted">
                                            {{ $t("mealplan_autoinclude_related_desc") }}
                                        </em>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("shopping_share") }}</div>
                                <div class="col col-md-6 text-right">
                                    <generic-multiselect
                                        size="sm"
                                        @change="
                                            settings.shopping_share = $event.val
                                            saveSettings()
                                        "
                                        :model="Models.USER"
                                        :initial_selection="settings.shopping_share"
                                        label="username"
                                        :multiple="true"
                                        :allow_create="false"
                                        style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                        :placeholder="$t('User')"
                                    />
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">{{ $t("shopping_share_desc") }}</em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("shopping_auto_sync") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="number" size="sm" v-model="settings.shopping_auto_sync" @change="saveSettings" />
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("shopping_auto_sync_desc") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("shopping_recent_days") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="number" size="sm" v-model="settings.shopping_recent_days" @change="saveSettings" />
                                </div>
                            </div>

                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("shopping_recent_days_desc") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("filter_to_supermarket") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="checkbox" size="sm" v-model="settings.filter_to_supermarket" @change="saveSettings" />
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("filter_to_supermarket_desc") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("default_delay") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="number" size="sm" min="1" v-model="settings.default_delay" @change="saveSettings" />
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("default_delay_desc") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("csv_delim_label") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="string" size="sm" v-model="settings.csv_delim" @change="saveSettings" />
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("csv_delim_help") }}
                                    </em>
                                </div>
                            </div>
                        </b-card>
                    </div>
                </div>
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
                <!-- TODO: shade filters red when they are actually filtering content -->
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
            <div class="row" style="margin-top: 1vh; min-width: 300px">
                <div class="col-12" style="text-align: right">
                    <b-button size="sm" variant="primary" class="mx-1" @click="resetFilters">{{ $t("Reset") }} </b-button>
                    <b-button size="sm" variant="secondary" class="mr-3" @click="$root.$emit('bv::hide::popover')">{{ $t("Close") }} </b-button>
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
                            <b-form-select class="mt-2 border-0" :options="shopping_categories" text-field="name" value-field="id" v-model="shopcat"></b-form-select>
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
import DownloadPDF from "@/components/Buttons/DownloadPDF"
import DownloadCSV from "@/components/Buttons/DownloadCSV"
import GenericMultiselect from "@/components/GenericMultiselect"
import GenericPill from "@/components/GenericPill"
import LookupInput from "@/components/Modals/LookupInput"
import draggable from "vuedraggable"

import { ApiMixin, getUserPreference } from "@/utils/utils"
import { ApiApiFactory } from "@/utils/openapi/api"
import { StandardToasts, makeToast } from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    name: "ShoppingListView",
    mixins: [ApiMixin],
    components: { ContextMenu, ContextMenuItem, ShoppingLineItem, GenericMultiselect, GenericPill, draggable, LookupInput, DownloadPDF, DownloadCSV },

    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            items: [],
            group_by: "category",
            group_by_choices: ["created_by", "category", "recipe"],
            supermarkets: [],
            shopping_categories: [],
            selected_supermarket: undefined,
            show_undefined_categories: true,
            supermarket_categories_only: false,
            shopcat: null,
            delay: 0,
            settings: {
                shopping_auto_sync: 0,
                default_delay: 4,
                mealplan_autoadd_shopping: false,
                mealplan_autoinclude_related: false,
                mealplan_autoexclude_onhand: true,
                filter_to_supermarket: false,
                shopping_recent_days: 7,
                csv_delim: ",",
            },
            new_supermarket: { entrymode: false, value: undefined, editmode: undefined },
            new_category: { entrymode: false, value: undefined },
            autosync_id: undefined,
            auto_sync_running: false,
            show_delay: false,
            drag: false,
            show_modal: false,
            fields: ["checked", "amount", "category", "unit", "food", "recipe", "details"],
            loading: true,
            entrymode: false,
            new_item: { amount: 1, unit: undefined, food: undefined },
            online: true,
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

            let groups = { false: {}, true: {} } // force unchecked to always be first
            if (this.selected_supermarket) {
                let super_cats = this.supermarkets
                    .filter((x) => x.id === this.selected_supermarket)
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.name)
                new Set([...super_cats, ...this.shopping_categories.map((x) => x.name)]).forEach((cat) => {
                    groups["false"][cat.name] = {}
                    groups["true"][cat.name] = {}
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
        csvData() {
            return this.items.map((x) => {
                return { amount: x.amount, unit: x.unit?.name ?? "", food: x.food?.name ?? "" }
            })
        },
        defaultDelay() {
            return Number(getUserPreference("default_delay")) || 2
        },
        formUnit() {
            let unit = this.Models.SHOPPING_LIST.create.form.unit
            unit.value = this.new_item.unit
            return unit
        },
        formFood() {
            let food = this.Models.SHOPPING_LIST.create.form.food
            food.value = this.new_item.food
            return food
        },
        itemsDelayed() {
            return this.items.filter((x) => !x.delay_until || !Date.parse(x?.delay_until) > new Date(Date.now())).length < this.items.length
        },
        filterApplied() {
            return (this.itemsDelayed && !this.show_delay) || !this.show_undefined_categories || (this.supermarket_categories_only && this.selected_supermarket)
        },
        Recipes() {
            return [...new Map(this.items.filter((x) => x.list_recipe).map((item) => [item["list_recipe"], item])).values()]
        },
        supermarketCategory() {
            return this.new_supermarket.editmode ? this.new_supermarket.value.category_to_supermarket : this.shopping_categories
        },
        notSupermarketCategory() {
            let supercats = this.new_supermarket.value.category_to_supermarket
                .map((x) => x.category)
                .flat()
                .map((x) => x.id)

            return this.shopping_categories
                .filter((x) => !supercats.includes(x.id))
                .map((x) => {
                    return {
                        id: Math.random(),
                        category: x,
                    }
                })
        },
    },
    watch: {
        selected_supermarket(newVal, oldVal) {
            this.supermarket_categories_only = this.settings.filter_to_supermarket
        },
        "settings.filter_to_supermarket": function (newVal, oldVal) {
            this.supermarket_categories_only = this.settings.filter_to_supermarket
        },
        "settings.shopping_auto_sync": function (newVal, oldVal) {
            clearInterval(this.autosync_id)
            this.autosync_id = undefined
            if (!newVal) {
                window.removeEventListener("online", this.updateOnlineStatus)
                window.removeEventListener("offline", this.updateOnlineStatus)
                return
            } else if (oldVal === 0 && newVal > 0) {
                window.addEventListener("online", this.updateOnlineStatus)
                window.addEventListener("offline", this.updateOnlineStatus)
            }
            this.autosync_id = setInterval(() => {
                if (this.online && !this.auto_sync_running) {
                    this.auto_sync_running = true
                    this.getShoppingList(true)
                }
            }, this.settings.shopping_auto_sync * 1000)
        },
    },
    mounted() {
        this.getShoppingList()
        this.getSupermarkets()
        this.getShoppingCategories()

        this.settings = getUserPreference()
        this.delay = this.settings.default_delay || 4
        this.delim = this.settings.csv_delim || ","
        this.supermarket_categories_only = this.settings.filter_to_supermarket
        if (this.settings.shopping_auto_sync) {
            window.addEventListener("online", this.updateOnlineStatus)
            window.addEventListener("offline", this.updateOnlineStatus)
        }
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        download(type) {
            console.log("you just downloaded", type)
        },
        addItem() {
            let api = new ApiApiFactory()
            api.createShoppingListEntry(this.new_item)
                .then((results) => {
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
        resetFilters: function () {
            this.selected_supermarket = undefined
            this.supermarket_categories_only = this.settings.filter_to_supermarket
            this.show_undefined_categories = true
            this.group_by = "category"
            this.show_delay = false
        },
        delayThis: function (item) {
            let entries = []
            let promises = []
            let delay_date = new Date(Date.now() + this.delay * (60 * 60 * 1000))

            if (Array.isArray(item)) {
                item = item.map((x) => {
                    return { ...x, delay_until: delay_date }
                })
                entries = item.map((x) => x.id)
            } else {
                item.delay_until = delay_date
                entries = [item.id]
            }

            entries.forEach((entry) => {
                promises.push(this.saveThis({ id: entry, delay_until: delay_date }, false))
            })
            Promise.all(promises).then(() => {
                StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                this.items = this.items.filter((x) => !entries.includes(x.id))
                this.delay = this.defaultDelay
            })
        },
        deleteRecipe: function (e, recipe) {
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
        deleteThis: function (item) {
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
        editSupermarket(s) {
            if (!s.editmode) {
                this.new_supermarket = { entrymode: false, value: undefined, editmode: undefined }
                this.supermarkets.map((x) => (x.editmode = false))
            } else {
                this.new_supermarket.value = s
                this.new_supermarket.editmode = true
                this.supermarkets.filter((x) => x.id !== s.id).map((x) => (x.editmode = false))
            }
        },
        foodName: function (value) {
            return value?.food?.name ?? value?.[0]?.food?.name ?? ""
        },
        getShoppingCategories: function () {
            let api = new ApiApiFactory()
            api.listSupermarketCategorys().then((result) => {
                this.shopping_categories = result.data
            })
        },
        getShoppingList: function (autosync = false) {
            let params = {}
            params.supermarket = this.selected_supermarket

            params.options = { query: { recent: 1 } }
            if (autosync) {
                params.options.query["autosync"] = 1
            } else {
                this.loading = true
            }
            this.genericAPI(this.Models.SHOPPING_LIST, this.Actions.LIST, params)
                .then((results) => {
                    if (!autosync) {
                        if (results.data?.length) {
                            this.items = results.data
                        } else {
                            console.log("no data returned")
                        }
                        this.loading = false
                    } else {
                        this.mergeShoppingList(results.data)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    if (!autosync) {
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
                    }
                })
        },
        getSupermarkets: function () {
            let api = new ApiApiFactory()
            api.listSupermarkets().then((result) => {
                this.supermarkets = result.data
            })
        },
        getThis: function (id) {
            return this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.FETCH, { id: id })
        },
        ignoreThis: function (item) {
            let food = {
                id: item?.[0]?.food.id ?? item.food.id,
                ignore_shopping: true,
            }
            this.updateFood(food, "ignore_shopping")
        },
        mergeShoppingList: function (data) {
            this.items.map((x) =>
                data.map((y) => {
                    if (y.id === x.id) {
                        x.checked = y.checked
                        return x
                    }
                })
            )
            this.auto_sync_running = false
        },
        moveEntry: function (e, item) {
            if (!e) {
                makeToast(this.$t("Warning"), this.$t("NoCategory"), "warning")
            }

            // TODO make decision - should inheritance always be turned off when category set manually or give user a choice at front-end or make it a setting?
            let food = this.items.filter((x) => x.food.id == item?.[0]?.food.id ?? item.food.id)[0].food
            food.supermarket_category = this.shopping_categories.filter((x) => x?.id === this.shopcat)?.[0]
            this.updateFood(food, "supermarket_category")
            this.shopcat = null
        },
        onHand: function (item) {
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
        saveSettings: function () {
            let api = ApiApiFactory()
            api.partialUpdateUserPreference(this.settings.user, this.settings)
                .then((result) => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                })
        },
        saveThis: function (thisItem, toast = true) {
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
        sectionID: function (a, b) {
            return (a + b).replace(/\W/g, "")
        },
        updateChecked: function (update) {
            // when checking a sub item don't refresh the screen until all entries complete but change class to cross out
            let promises = []
            update.entries.forEach((x) => {
                promises.push(this.saveThis({ id: x, checked: update.checked }, false))
                let item = this.items.filter((entry) => entry.id == x)[0]

                Vue.set(item, "checked", update.checked)
                if (update.checked) {
                    Vue.set(item, "completed_at", new Date().toISOString())
                } else {
                    Vue.set(item, "completed_at", undefined)
                }
            })
            Promise.all(promises).catch((err) => {
                console.log(err, err.response)
                StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
            })
        },
        updateFood: function (food, field) {
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
        addCategory: function () {
            let api = new ApiApiFactory()
            api.createSupermarketCategory({ name: this.new_category.value })
                .then((result) => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    this.shopping_categories.push(result.data)
                    this.new_category.value = undefined
                })
                .catch((err) => {
                    console.log(err, Object.keys(err))
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                })
        },
        addSupermarket: function () {
            let api = new ApiApiFactory()
            api.createSupermarket({ name: this.new_supermarket.value })
                .then((result) => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    this.supermarkets.push(result.data)
                    this.new_supermarket.value = undefined
                })
                .catch((err) => {
                    console.log(err, Object.keys(err))
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                })
        },
        saveSupermarketCategoryOrder(e) {
            // TODO: all of this complexity should be moved to the backend
            let apiClient = new ApiApiFactory()
            let supermarket = this.new_supermarket.value
            let temp_supermarkets = [...this.supermarkets]
            const updateMoved = function (supermarket) {
                var promises = []
                supermarket.category_to_supermarket.forEach((x, i) => {
                    x.order = i
                    promises.push(apiClient.partialUpdateSupermarketCategoryRelation(x.id, { order: i }))
                })
                return Promise.all(promises).then(() => {
                    return supermarket
                })
            }

            if ("removed" in e) {
                // store current value in case it needs rolled back
                let idx = this.supermarkets.indexOf((x) => x.id === supermarket.id)
                Vue.set(this.supermarkets, idx, supermarket)
                apiClient
                    .destroySupermarketCategoryRelation(e.removed.element.id)
                    .then((result) => {
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        console.log(err, Object.keys(err))
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                        this.supermarkets = temp_supermarkets
                    })
            }

            if ("added" in e) {
                let apiClient = new ApiApiFactory()
                let category = e.added.element.category

                apiClient
                    .createSupermarketCategoryRelation({
                        supermarket: supermarket.id,
                        category: category,
                        order: e.added.element.newIndex,
                    })
                    .then((results) => {
                        this.new_supermarket.value.category_to_supermarket.filter((x) => x.category.id === category.id)[0].id = results.data.id

                        return updateMoved(this.new_supermarket.value)
                    })
                    .then((updated_supermarket) => {
                        let idx = this.supermarkets.indexOf((x) => x.id === updated_supermarket.id)
                        Vue.set(this.supermarkets, idx, updated_supermarket)
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        console.log(err, Object.keys(err))
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                        this.supermarkets = temp_supermarkets
                    })
            }

            if ("moved" in e) {
                updateMoved(this.new_supermarket.value)
                    .then((updated_supermarket) => {
                        let idx = this.supermarkets.indexOf((x) => x.id === updated_supermarket.id)
                        Vue.set(this.supermarkets, idx, updated_supermarket)
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        console.log(err, Object.keys(err))
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                        this.supermarkets = temp_supermarkets
                    })
            }
        },
        categoryName(item) {
            return item?.category?.name ?? item.name
        },
        updateOnlineStatus(e) {
            const { type } = e
            this.online = type === "online"
        },
        beforeDestroy() {
            window.removeEventListener("online", this.updateOnlineStatus)
            window.removeEventListener("offline", this.updateOnlineStatus)
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
.float-up {
    padding-top: -3em;
    margin-top: -3em;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
