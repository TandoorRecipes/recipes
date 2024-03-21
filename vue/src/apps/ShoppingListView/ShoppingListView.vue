<template>
    <div id="app" class="shopping">
        <b-alert :show="shopping_list_store.has_failed_items" class="float-up mt-2" variant="warning">
            {{ $t('ShoppingBackgroundSyncWarning') }}
        </b-alert>

        <div class="row">
            <div class="col-12 col-xl-8 offset-xl-2">

                <b-tabs content-class="mt-2" v-model="current_tab" class="mt-md-1" style="margin-bottom: 20vh">
                    <template #tabs-end>
                        <li class="nav-item flex-grow-1">

                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" @click="useShoppingListStore().undoChange()"> <i class="fas fa-undo fa-fw"></i>&nbsp;</a>
                        </li>
                        <li class="nav-item dropdown d-none d-md-inline-block">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-download"></i>&nbsp;
                            </a>
                            <div class="dropdown-menu">
                                <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')"
                                             icon="far fa-file-pdf"/>
                                <DownloadCSV :items="shopping_list_store.get_flat_entries" :delim="user_preference_store.user_settings.csv_delim"
                                             name="shopping.csv"
                                             :label="$t('download_csv')" icon="fas fa-file-csv"/>
                                <CopyToClipboard :items="shopping_list_store.get_flat_entries" :settings="user_preference_store.user_settings"
                                                 :label="$t('copy_to_clipboard')"
                                                 icon="fas fa-clipboard-list"/>
                                <CopyToClipboard :items="shopping_list_store.get_flat_entries" :settings="user_preference_store.user_settings" format="table"
                                                 :label="$t('copy_markdown_table')" icon="fab fa-markdown"/>
                            </div>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" id="id_filters_button">
                                <i class="fas fa-filter fa-fw"/>&nbsp;
                            </a>
                        </li>
                    </template>

                    <!-- shopping list tab -->
                    <b-tab>
                        <template #title>
                            <div class="d-print-none">
                                <i v-if="!shopping_list_store.currently_updating && useShoppingListStore().autosync_has_focus"
                                   class="fas fa-shopping-cart fa-fw" style=" height: 1.25em!important;"></i>
                                <i v-if="!shopping_list_store.currently_updating && !useShoppingListStore().autosync_has_focus"
                                   class="fas fa-eye-slash fa-fw" style=" height: 1.25em!important;"></i>
                                <b-spinner v-if="shopping_list_store.currently_updating" type="border" small
                                           style="line-height: 1!important;width:1.25em!important; height: 1.25em!important;"></b-spinner>

                                <span class="d-none d-lg-inline-block ml-1">
                                    {{ $t('Shopping_list') + ` (${shopping_list_store.total_unchecked_food})` }}
                                </span>
                            </div>
                        </template>
                        <!-- Entry input on large screens -->
                        <b-row class="d-lg-block d-print-none d-none mb-3 mt-3">
                            <b-col cols="12">
                                <b-input-group>
                                    <b-form-input type="text" :placeholder="$t('Shopping_input_placeholder')"
                                                  v-model="new_item.ingredient"
                                                  @keyup.enter="addItem"
                                                  ref="amount_input_simple"></b-form-input>
                                    <b-input-group-append>
                                        <b-button variant="success">
                                            <i class="fas fa-cart-plus fa-fw" @click="addItem"/>
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-col>
                        </b-row>

                        <!-- --------------------------------------- shopping list table -->
                        <b-row v-for="c in shopping_list_store.get_entries_by_group" v-bind:key="c.id">
                            <b-col cols="12"
                                v-if="(c.count_unchecked > 0 || user_preference_store.device_settings.shopping_show_checked_entries) 
                                && (c.count_unchecked + c.count_checked) > 0 
                                && (c.count_delayed_unchecked < c.count_unchecked || user_preference_store.device_settings.shopping_show_delayed_entries)"
                            >
                                <b-button-group class="w-100 mt-1" :class="{'flex-row-reverse': useUserPreferenceStore().user_settings.left_handed}">
                                    <b-button variant="info" block class="btn btn-block text-left">
                                        <span v-if="c.name === shopping_list_store.UNDEFINED_CATEGORY">{{$t('Undefined')}}</span>
                                        <span v-else>{{ c.name }}</span>
                                    </b-button>
                                    <b-button class="d-print-none "
                                                :class="{'btn-success':(c.count_unchecked > 0), 'btn-warning': (c.count_unchecked <= 0)}"
                                                @click="checkGroup(c, (c.count_unchecked > 0))">
                                        <i class="fas fa-fw" :class="{'fa-check':(c.count_unchecked > 0), 'fa-cart-plus':(c.count_unchecked <= 0) }"></i>
                                    </b-button>
                                </b-button-group>

                                <span v-for="f in c.foods" v-bind:key="f.id">
                                    <shopping-line-item :entries="f['entries']" class="mt-1"/>
                                </span>
                            </b-col>
                        </b-row>

                    </b-tab>
                    <!-- --------------------------------------- recipe tab -->
                    <b-tab :title="$t('Recipes')">
                        <template #title>
                            <div class="d-print-none">
                                <i class="fas fa-book fa-fw"></i>
                                <span class="d-none d-lg-inline-block ml-1">{{
                                        $t('Recipes') + ` (${Object.keys(shopping_list_store.getAssociatedRecipes()).length})`
                                    }}</span>
                            </div>

                        </template>

                        <b-row class="d-lg-block d-print-none d-none pr-1 pl-1 mb-3 mt-3">
                            <b-col cols="12">
                                <generic-multiselect
                                    :model="Models.RECIPE"
                                    :multiple="false"
                                    @change="addRecipeToShopping($event.val)"
                                ></generic-multiselect>
                            </b-col>
                        </b-row>

                        <b-row v-for="r in shopping_list_store.getAssociatedRecipes()" :key="r.shopping_list_recipe_id"
                               class="pr-1 pl-1">
                            <b-col cols="12">

                                <b-button-group class="w-100 mt-2">

                                    <div class="card flex-grow-1 btn-block p-2">
                                        <span>{{ r.recipe_name }}</span>
                                        <span v-if="r.mealplan_type"><small class="text-muted">{{ r.mealplan_type }} {{ formatDate(r.mealplan_from_date) }}</small></span>
                                    </div>


                                    <b-button variant="danger" @click="useShoppingListStore().deleteShoppingListRecipe(r.shopping_list_recipe_id)"><i
                                        class="fas fa-trash fa-fw"></i></b-button>
                                </b-button-group>

                                <number-scaler-component :number="r.servings" @change="updateServings(r, $event)"
                                                         :disable="useShoppingListStore().currently_updating"></number-scaler-component>
                                <hr class="m-2"/>
                            </b-col>

                        </b-row>
                    </b-tab>
                    <!-- --------------------------------------- supermarkets tab -->
                    <b-tab>
                        <template #title>
                            <div class="d-print-none">
                                <i class="fas fa-store-alt fa-fw"></i>
                                <span class="d-none d-lg-inline-block ml-1">{{ $t('Supermarkets') + ` (${shopping_list_store.supermarkets.length})` }}</span>
                            </div>
                        </template>
                        <div class="container p-0">
                            <div class="row">
                                <div class="col col-md-12 p-0 p-lg-3">
                                    <b-col role="tablist">
                                        <!-- add to shopping form -->
                                        <div class="container">
                                            <b-row>
                                                <b-col cols="12" md="6">
                                                    <h5>{{ $t("Supermarkets") }}
                                                        <span class="float-right text-primary" style="cursor: pointer"><i
                                                            class="fa fa-plus-circle" v-plus-button
                                                            @click="addSupermarket"
                                                            aria-hidden="true"></i
                                                        ></span></h5>
                                                    <b-list-group>
                                                        <b-card no-body class="mt-1 list-group-item p-2"
                                                                v-for="(supermarket, index) in shopping_list_store.supermarkets"
                                                                v-hover
                                                                :key="supermarket.id">
                                                            <b-card-header class="p-2 border-0">
                                                                <b-row>
                                                                    <b-col cols="12">
                                                                        <h5 class="mt-1 mb-1">
                                                                            {{ supermarket.name }}
                                                                            <span class="float-right text-primary"
                                                                                  style="cursor: pointer"
                                                                            ><i class="fa"
                                                                                v-bind:class="{ 'fa-pen': !supermarket.editing, 'fa-save': supermarket.editing }"
                                                                                @click="editOrSaveSupermarket(index)"
                                                                                aria-hidden="true"></i
                                                                            ></span>
                                                                        </h5>
                                                                        <span class="text-muted"
                                                                              v-if="supermarket.description !== ''">{{
                                                                                supermarket.description
                                                                            }}</span>
                                                                    </b-col>
                                                                </b-row>
                                                            </b-card-header>
                                                            <b-card-body class="p-4" v-if="supermarket.editing">
                                                                <div class="form-group">
                                                                    <label>{{ $t("Name") }}</label>
                                                                    <input class="form-control" :placeholder="$t('Name')"
                                                                           v-model="supermarket.name"/>
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>{{ $t("Description") }}</label>
                                                                    <input class="form-control" :placeholder="$t('Description')"
                                                                           v-model="supermarket.description"/>
                                                                </div>
                                                                <button class="btn btn-danger"
                                                                        @click="deleteSupermarket(index)">
                                                                    {{ $t("Delete") }}
                                                                </button>
                                                                <button class="btn btn-primary float-right"
                                                                        @click="editOrSaveSupermarket(index)">
                                                                    {{ $t("Save") }}
                                                                </button>
                                                            </b-card-body>
                                                        </b-card>
                                                    </b-list-group>
                                                </b-col>
                                                <b-col cols="12" md="6">
                                                    <h5 v-if="editingSupermarket.length > 0">{{ $t("Shopping_Categories") }} -
                                                        {{ editingSupermarket[0].name }}</h5>
                                                    <h5 v-else>{{ $t("Shopping_Categories") }}
                                                        <span class="float-right text-primary" v-plus-button
                                                              style="cursor: pointer"><i
                                                            class="fa fa-plus-circle" v-plus-button
                                                            @click="addSupermarketCategory"
                                                            aria-hidden="true"></i
                                                        ></span>
                                                    </h5>
                                                    <div v-if="editingSupermarket.length === 0">
                                                        <b-list-group>
                                                            <b-card no-body class="mt-1 list-group-item p-2"
                                                                    v-for="(category, index) in shopping_list_store.supermarket_categories"
                                                                    v-hover
                                                                    :key="category.id">
                                                                <b-card-header class="p-2 border-0">
                                                                    <b-row>
                                                                        <b-col cols="12">
                                                                            <h5 class="mt-1 mb-1">
                                                                                {{ category.name }}
                                                                                <span class="float-right text-primary"
                                                                                      style="cursor: pointer"
                                                                                ><i class="fa"
                                                                                    v-bind:class="{ 'fa-pen': !category.editing, 'fa-save': category.editing }"
                                                                                    @click="editOrSaveSupermarketCategory(index)"
                                                                                    aria-hidden="true"></i
                                                                                ></span>
                                                                            </h5>
                                                                        </b-col>
                                                                    </b-row>
                                                                </b-card-header>
                                                                <b-card-body class="p-4" v-if="category.editing">
                                                                    <div class="form-group">
                                                                        <label>{{ $t("Name") }}</label>
                                                                        <input class="form-control" :placeholder="$t('Name')"
                                                                               v-model="category.name"/>
                                                                    </div>
                                                                    <div class="form-group">
                                                                        <label>{{ $t("Description") }}</label>
                                                                        <input class="form-control"
                                                                               :placeholder="$t('Description')"
                                                                               v-model="category.description"/>
                                                                    </div>
                                                                    <button class="btn btn-danger"
                                                                            @click="deleteSupermarketCategory(index)">
                                                                        {{ $t("Delete") }}
                                                                    </button>
                                                                    <button class="btn btn-primary float-right"
                                                                            @click="editOrSaveSupermarketCategory(index)">
                                                                        {{ $t("Save") }}
                                                                    </button>
                                                                </b-card-body>
                                                            </b-card>
                                                        </b-list-group>
                                                    </div>
                                                    <div v-else>
                                                        <draggable :list="editing_supermarket_categories" group="categories"
                                                                   :empty-insert-threshold="10"
                                                                   @change="sortSupermarketCategories"
                                                                   ghost-class="ghost">
                                                            <b-card no-body class="mt-1 list-group-item p-2"
                                                                    style="cursor: move"
                                                                    v-for="(category, index) in editing_supermarket_categories"
                                                                    v-hover
                                                                    :key="category.id">
                                                                <b-card-header class="p-2 border-0">
                                                                    <div class="row">
                                                                        <div class="col-2">
                                                                            <button type="button"
                                                                                    class="btn btn-lg shadow-none"><i
                                                                                class="fas fa-arrows-alt-v"></i></button>
                                                                        </div>
                                                                        <div class="col-10">
                                                                            <h5 class="mt-1 mb-1">
                                                                                <b-badge class="float-left text-white mr-2">
                                                                                    #{{ index + 1 }}
                                                                                </b-badge>
                                                                                {{ category.name }}
                                                                                <span class="float-right text-primary"
                                                                                      style="cursor: pointer"
                                                                                ><i class="fa fa-minus-circle" v-minus-button
                                                                                    @click="removeSupermarketCategoryRelationAtIndex(index)"
                                                                                    aria-hidden="true"></i
                                                                                ></span>
                                                                            </h5>
                                                                        </div>
                                                                    </div>
                                                                </b-card-header>
                                                            </b-card>
                                                        </draggable>
                                                        <h5>{{ $t("Available") }}</h5>
                                                        <draggable :list="unusedSupermarketCategories" group="categories"
                                                                   :empty-insert-threshold="10"
                                                                   ghost-class="ghost">
                                                            <b-card no-body class="mt-1 list-group-item p-2"
                                                                    style="cursor: move"
                                                                    v-for="(category) in unusedSupermarketCategories"
                                                                    v-hover
                                                                    :key="category.id">
                                                                <b-card-header class="p-2 border-0">
                                                                    <div class="row">
                                                                        <div class="col-2">
                                                                            <button type="button"
                                                                                    class="btn btn-lg shadow-none"><i
                                                                                class="fas fa-arrows-alt-v"></i></button>
                                                                        </div>
                                                                        <div class="col-10">
                                                                            <h5 class="mt-1 mb-1">
                                                                                {{ category.name }}
                                                                                <span class="float-right text-primary"
                                                                                      style="cursor: pointer"
                                                                                ><i class="fa fa-plus-circle" v-plus-button
                                                                                    @click="addSupermarketCategoryRelation(category)"
                                                                                    aria-hidden="true"></i
                                                                                ></span>
                                                                            </h5>
                                                                        </div>
                                                                    </div>
                                                                </b-card-header>
                                                            </b-card>
                                                        </draggable>
                                                    </div>
                                                </b-col>
                                            </b-row>
                                        </div>
                                    </b-col>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                    <!-- --------------------------------------- settings tab -->
                    <b-tab>
                        <template #title>
                            <div class="d-print-none">
                                <i class="fas fa-user-cog fa-fw"></i>
                                <!--                                <span class="d-none d-lg-inline-block ml-1">{{ $t('Settings') }}</span>-->
                            </div>
                        </template>
                        <div class="row justify-content-center">
                            <div class="col-12 col-md-8">
                                <shopping-settings-component></shopping-settings-component>
                            </div>
                        </div>
                    </b-tab>
                </b-tabs>
            </div>
        </div>

        <b-popover target="id_filters_button" triggers="click blur" placement="bottomleft" :title="$t('Filters')">
            <div>
                <b-form-group v-bind:label="$t('GroupBy')" label-for="popover-input-1" label-cols="12" class="mb-1">
                    <b-form-select v-model="user_preference_store.device_settings.shopping_selected_grouping" size="sm">
                        <b-form-select-option v-for="go in shopping_list_store.grouping_options" :value="go.id"
                                              v-bind:key="go.id">{{ $t(go.translatable_label) }}
                        </b-form-select-option>
                    </b-form-select>
                </b-form-group>
                <b-form-group v-bind:label="$t('Supermarket')" label-for="popover-input-2" label-cols="12" class="mb-1">
                    <generic-multiselect :model="Models.SUPERMARKET"
                                         :initial_single_selection="user_preference_store.device_settings.shopping_selected_supermarket"
                                         @change="user_preference_store.device_settings.shopping_selected_supermarket = $event.val; user_preference_store.updateDeviceSettings()"
                                         :multiple="false"></generic-multiselect>
                </b-form-group>
                <b-form-group v-bind:label="$t('ShowDelayed')" label-for="popover-input-3" content-cols="1"
                              class="mb-1">
                    <b-form-checkbox v-model="user_preference_store.device_settings.shopping_show_delayed_entries"
                                     @change="user_preference_store.updateDeviceSettings()"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('ShowRecentlyCompleted')" label-for="popover-input-3" content-cols="1"
                              class="mb-1">
                    <b-form-checkbox v-model="user_preference_store.device_settings.shopping_show_checked_entries"
                                     @change="user_preference_store.updateDeviceSettings()"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('SupermarketCategoriesOnly')" label-for="popover-input-5"
                              content-cols="1" class="mb-1">
                    <b-form-checkbox
                        v-model="user_preference_store.device_settings.shopping_show_selected_supermarket_only"
                        @change="user_preference_store.updateDeviceSettings()"></b-form-checkbox>
                </b-form-group>
                <span>{{ $t('Information') }}</span>
                <b-form-group v-bind:label="$t('Recipe')" label-for="popover-input-5"
                              content-cols="1" class="mb-1">
                    <b-form-checkbox v-model="user_preference_store.device_settings.shopping_item_info_recipe"
                                     @change="user_preference_store.updateDeviceSettings()"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('Meal_Plan')" label-for="popover-input-5"
                              content-cols="1" class="mb-1">
                    <b-form-checkbox v-model="user_preference_store.device_settings.shopping_item_info_mealplan"
                                     @change="user_preference_store.updateDeviceSettings()"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('created_by')" label-for="popover-input-5"
                              content-cols="1" class="mb-1">
                    <b-form-checkbox v-model="user_preference_store.device_settings.shopping_item_info_created_by"
                                     @change="user_preference_store.updateDeviceSettings()"></b-form-checkbox>
                </b-form-group>
            </div>
            <div class="row" style="margin-top: 1vh; min-width: 300px">
                <div class="col-12" style="text-align: right">
                    <b-button size="sm" variant="secondary" class="mr-3" @click="$root.$emit('bv::hide::popover')">
                        {{ $t("Close") }}
                    </b-button>
                </div>
            </div>
        </b-popover>

        <shopping-modal v-if="new_recipe.id" :recipe="new_recipe" :modal_id="new_recipe.id"
                        :servings="new_recipe.servings" :mealplan="undefined" @finish="finishShopping"/>

        <bottom-navigation-bar active-view="view_shopping">
            <template #custom_nav_content v-if="current_tab <= 1">
                <b-row class="mb-2">
                    <b-col cols="12">
                        <template v-if="current_tab===0">
                            <b-input-group>
                                <b-form-input v-model="new_item.ingredient" :placeholder="$t('Shopping_input_placeholder')"
                                              @keyup.enter="addItem"></b-form-input>
                                <b-input-group-append>
                                    <b-button @click="addItem" variant="success">
                                        <i class="fas fa-cart-plus "/>
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </template>
                        <template v-if="current_tab===1">
                            <generic-multiselect
                                :model="Models.RECIPE"
                                :multiple="false"
                                @change="addRecipeToShopping($event.val)"
                            ></generic-multiselect>
                        </template>

                    </b-col>
                </b-row>

            </template>

            <template #custom_create_functions>

                <div class="dropdown-divider"></div>
                <h6 class="dropdown-header">{{ $t('Shopping_list') }}</h6>

                <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')"
                             icon="far fa-file-pdf fa-fw"/>
                <DownloadCSV :items="shopping_list_store.get_flat_entries" :delim="user_preference_store.user_settings.csv_delim" name="shopping.csv"
                             :label="$t('download_csv')" icon="fas fa-file-csv fa-fw"/>
                <CopyToClipboard :items="shopping_list_store.get_flat_entries" :settings="user_preference_store.user_settings"
                                 :label="$t('copy_to_clipboard')"
                                 icon="fas fa-clipboard-list fa-fw"/>
                <CopyToClipboard :items="shopping_list_store.get_flat_entries" :settings="user_preference_store.user_settings" format="table"
                                 :label="$t('copy_markdown_table')" icon="fab fa-markdown fa-fw"/>


            </template>
        </bottom-navigation-bar>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import VueCookies from "vue-cookies"
import draggable from "vuedraggable"


import ShoppingLineItem from "@/components/ShoppingLineItem"
import DownloadPDF from "@/components/Buttons/DownloadPDF"
import DownloadCSV from "@/components/Buttons/DownloadCSV"
import CopyToClipboard from "@/components/Buttons/CopyToClipboard"
import GenericMultiselect from "@/components/GenericMultiselect"
import ShoppingModal from "@/components/Modals/ShoppingModal"

import {ApiMixin, getUserPreference, StandardToasts, makeToast, ResolveUrlMixin, FormatMixin} from "@/utils/utils"
import {ApiApiFactory} from "@/utils/openapi/api"
import ShoppingSettingsComponent from "@/components/Settings/ShoppingSettingsComponent";

Vue.use(BootstrapVue)
Vue.use(VueCookies)

import {Workbox} from 'workbox-window';
import BottomNavigationBar from "@/components/BottomNavigationBar.vue";
import {useShoppingListStore} from "@/stores/ShoppingListStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import NumberScalerComponent from "@/components/NumberScalerComponent.vue";

export default {
    name: "ShoppingListView",
    mixins: [ApiMixin, ResolveUrlMixin, FormatMixin],
    components: {
        NumberScalerComponent,

        ShoppingLineItem,
        GenericMultiselect,
        DownloadPDF,
        DownloadCSV,
        CopyToClipboard,
        ShoppingModal,
        draggable,
        ShoppingSettingsComponent,
        BottomNavigationBar,
    },

    data() {
        return {
            current_tab: 0,

            user_id: parseInt(localStorage.getItem('USER_ID')),
            editing_supermarket_categories: [],
            editing_supermarket: null,
            new_supermarket: {entrymode: false, value: undefined, editmode: undefined},
            new_category: {entrymode: false, value: undefined},
            autosync_id: undefined,
            new_item: {amount: 1, unit: undefined, food: undefined, ingredient: undefined},
            new_recipe: {
                id: undefined,
            },

            shopping_list_store: useShoppingListStore(),
            user_preference_store: useUserPreferenceStore(),
        }
    },
    computed: {
        editingSupermarket() {
            return this.shopping_list_store.supermarkets.filter((el) => {
                return el.editing
            })
        },
        unusedSupermarketCategories() {
            if (this.editingSupermarket.length > 0) {
                return this.shopping_list_store.supermarket_categories.filter(a => !this.editing_supermarket_categories.map(b => b.id).includes(a.id))
            } else {
                return []
            }
        },
    },
    watch: {},
    mounted() {
        addEventListener("visibilitychange", (event) => {
            useShoppingListStore().autosync_has_focus = (document.visibilityState === 'visible')
        });

        this.$i18n.locale = window.CUSTOM_LOCALE

        this.shopping_list_store.refreshFromAPI()
        useUserPreferenceStore().loadUserSettings(true)
        useUserPreferenceStore().loadDeviceSettings()

        // update selected supermarkt because local setting become stale otherwise
        if (useUserPreferenceStore().device_settings.shopping_selected_supermarket != null) {
            let api = new ApiApiFactory()
            api.retrieveSupermarket(useUserPreferenceStore().device_settings.shopping_selected_supermarket.id).then(r => {
                useUserPreferenceStore().device_settings.shopping_selected_supermarket = r.data
                useUserPreferenceStore().updateDeviceSettings()
            }).catch(err => {
                useUserPreferenceStore().device_settings.shopping_selected_supermarket = null
                useUserPreferenceStore().updateDeviceSettings()
            })
        }

        this.autoSyncLoop()
    },
    methods: {
        useUserPreferenceStore,
        useShoppingListStore,
        /**
         * recursive function calling autosync after set amount of time has passed
         */
        autoSyncLoop: function () {
            // this should not happen in production but sometimes in development with HMR
            clearTimeout(useShoppingListStore().autosync_timeout_id)

            let timeout = Math.max(this.user_preference_store.user_settings.shopping_auto_sync, 1) * 1000 // if disabled (shopping_auto_sync=0) check again after 1 second if enabled

            useShoppingListStore().autosync_timeout_id = setTimeout(() => {
                if (this.user_preference_store.user_settings.shopping_auto_sync > 0) {
                    this.shopping_list_store.autosync()
                }
                this.autoSyncLoop()
            }, timeout)
        },
        /**
         * get ingredient from input string and create new shopping list entry using it
         */
        addItem: function () {
            // this.genericAPI inherited from ApiMixin
            if (this.new_item.ingredient !== "" && this.new_item.ingredient !== undefined) {
                this.genericPostAPI("api_ingredient_from_string", {text: this.new_item.ingredient}).then((result) => {
                    let unit = null
                    if (result.data.unit !== null) {
                        unit = {name: result.data.unit}
                    }

                    this.useShoppingListStore().createObject({
                        amount: result.data.amount,
                        unit: unit,
                        food: {name: result.data.food, supermarket_category: null},
                    })
                    this.new_item = {amount: 1, unit: undefined, food: undefined, ingredient: undefined}
                })
            }
        },

        /**
         * change number of servings of a shopping list recipe
         * backend handles scaling of associated entries
         * @param recipe recipe to update
         * @param servings number of servings to set recipe to
         */
        updateServings(recipe, servings) {
            if (servings > 0 && servings !== "") {
                let api = new ApiApiFactory()
                useShoppingListStore().currently_updating = true
                api.partialUpdateShoppingListRecipe(recipe.shopping_list_recipe_id, {
                    id: recipe.shopping_list_recipe_id,
                    servings: servings
                }).then(() => {
                    useShoppingListStore().currently_updating = false
                    useShoppingListStore().refreshFromAPI()
                }).catch((err) => {
                    useShoppingListStore().currently_updating = false
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            }
        },
        /**
         * set checked state for all foods->entries of a group
         * @param group group to set state
         * @param checked_state checked state to set group to
         */
        checkGroup(group, checked_state) {
            let all_entries = {}
            for (let f in group.foods) {
                all_entries = Object.assign({}, all_entries, group.foods[f].entries)
            }
            useShoppingListStore().setEntriesCheckedState(all_entries, checked_state, true)
        },
        // TODO cleanup, review data structure, probably move to its own component --> FOR ALL SUPERMARKET FUNCTIONS
        deleteSupermarket(index) {
            this.$bvModal.msgBoxConfirm(this.$t('Are_You_Sure'), {
                title: this.$t('Confirm'),
                size: 'md',
                buttonSize: 'sm',
                okVariant: 'success',
                headerClass: 'p-3 border-bottom-0',
                footerClass: 'p-3 border-top-0 justify-content-center',
                centered: true,
                cancelTitle: this.$t('Cancel'),
                okTitle: this.$t('Delete')
            }).then(value => {
                if (value) {
                    let apiClient = new ApiApiFactory()
                    apiClient.destroySupermarket(this.shopping_list_store.supermarkets[index].id)
                        .then((e) => {
                            this.shopping_list_store.refreshFromAPI()
                        })
                        .catch((err) => {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                        })
                }
            })
        },
        /**
         * add new supermarket to list of supermarkets
         */
        addSupermarket: function () {
            let api = new ApiApiFactory()
            api.createSupermarket({name: this.$t('Supermarket') + Math.floor(1000 + Math.random() * 9000)}).then((r) => {
                useShoppingListStore().supermarkets.push(r.data)
                this.new_supermarket.value = undefined
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
            })
        },
        /**
         * handle updating a supermarket
         * @param index
         */
        editOrSaveSupermarket(index) {
            let supermarket = this.shopping_list_store.supermarkets[index]

            if (supermarket.editing) {
                this.$set(this.shopping_list_store.supermarkets[index], "editing", false)
                this.$set(this.shopping_list_store.supermarkets[index], "category_to_supermarket", this.editing_supermarket_categories)
                this.editing_supermarket_categories = []

                let apiClient = new ApiApiFactory()

                apiClient.updateSupermarket(this.shopping_list_store.supermarkets[index].id, this.shopping_list_store.supermarkets[index]).then((r) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    this.shopping_list_store.refreshFromAPI()

                    if (r.data.id === useUserPreferenceStore().device_settings.shopping_selected_supermarket.id){
                        useUserPreferenceStore().device_settings.shopping_selected_supermarket = r.data
                    }
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            } else {
                this.shopping_list_store.supermarkets.forEach((market, i) => {
                    if (i !== index) {
                        this.$set(this.shopping_list_store.supermarkets[i], "editing", false)
                    }
                })

                this.$set(this.shopping_list_store.supermarkets[index], "editing", true)

                this.editing_supermarket_categories = []
                this.shopping_list_store.supermarkets[index].category_to_supermarket.forEach((cur, i) => {
                    this.editing_supermarket_categories.push({
                        name: cur.category.name,
                        description: cur.category.description,
                        id: cur.category.id,
                        relation_id: cur.id,
                        order: cur.order,
                        supermarket: cur.supermarket,
                        category: cur.category
                    })
                })
            }
        },
        /**
         * delete a supermarket category
         * @param index
         */
        deleteSupermarketCategory(index) {
            this.$bvModal.msgBoxConfirm(this.$t('Warning_Delete_Supermarket_Category'), {
                title: this.$t('Confirm'),
                size: 'md',
                buttonSize: 'sm',
                okVariant: 'success',
                headerClass: 'p-3 border-bottom-0',
                footerClass: 'p-3 border-top-0 justify-content-center',
                centered: true,
                cancelTitle: this.$t('Cancel'),
                okTitle: this.$t('Delete')
            }).then(value => {
                if (value) {
                    let apiClient = new ApiApiFactory()
                    apiClient.destroySupermarketCategory(this.shopping_list_store.supermarket_categories[index].id).then((e) => {
                        this.shopping_list_store.refreshFromAPI()
                    }).catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                    })
                }
            })
        },
        addSupermarketCategory() {
            let apiClient = new ApiApiFactory()

            apiClient.createSupermarketCategory({name: this.$t("Shopping_Category") + Math.floor(1000 + Math.random() * 9000)}).then((result) => {
                this.shopping_list_store.supermarket_categories.push(result.data)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
            })
        },
        editOrSaveSupermarketCategory(index) {
            let category = this.shopping_list_store.supermarket_categories[index]

            this.shopping_list_store.supermarkets.forEach((supermarket) => {
                supermarket.category_to_supermarket.forEach((cat) => {
                    if (cat.category.id === this.shopping_list_store.supermarket_categories[index].id) {
                        cat.category = this.shopping_list_store.supermarket_categories[index]
                    }
                })
            })
            if (category.editing) {
                this.$set(this.shopping_list_store.supermarket_categories[index], "editing", false)

                let apiClient = new ApiApiFactory()

                apiClient
                    .updateSupermarketCategory(this.shopping_list_store.supermarket_categories[index].id, this.shopping_list_store.supermarket_categories[index])
                    .then((e) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            } else {
                this.shopping_list_store.supermarket_categories.forEach((market, i) => {
                    if (i !== index) {
                        this.$set(this.shopping_list_store.supermarket_categories[i], "editing", false)
                    }
                })

                this.$set(this.shopping_list_store.supermarket_categories[index], "editing", true)
            }
        },
        addSupermarketCategoryRelation(category) {
            this.sortSupermarketCategories({
                added: {
                    element: category,
                    newIndex: this.editing_supermarket_categories.length
                }
            })
            this.editing_supermarket_categories.push(category);
        },
        removeSupermarketCategoryRelationAtIndex(index) {
            this.sortSupermarketCategories({
                removed: {
                    element: this.editing_supermarket_categories[index],
                    oldIndex: index
                }
            })
            this.editing_supermarket_categories.splice(index, 1);
        },
        sortSupermarketCategories(e) {
            let apiClient = new ApiApiFactory()

            if ("removed" in e) {
                apiClient.destroySupermarketCategoryRelation(e.removed.element.relation_id).then((result) => {

                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    this.editing_supermarket_categories.splice(e.removed.oldIndex, 0, e.removed.element);
                })
            }

            if ("added" in e) {
                let apiClient = new ApiApiFactory()

                apiClient.createSupermarketCategoryRelation({
                    supermarket: this.editingSupermarket[0].id,
                    category: e.added.element,
                    order: e.added.newIndex,
                }).then((results) => {
                    this.editing_supermarket_categories.splice(e.added.newIndex, 1, {
                        name: results.data.category.name,
                        description: results.data.category.description,
                        id: results.data.category.id,
                        relation_id: results.data.id,
                        order: results.data.order,
                        supermarket: results.data.supermarket,
                        category: results.data.category
                    });
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE)
                    this.editing_supermarket_categories.splice(e.added.newIndex, 1);
                })
            }

            if ("moved" in e) {
                let old_order = Object.assign({}, this.editing_supermarket_categories);
                let promises = []

                this.editing_supermarket_categories.forEach((element, index) => {
                    let apiClient = new ApiApiFactory()
                    promises.push(apiClient.partialUpdateSupermarketCategoryRelation(element.relation_id, {order: index}))
                })
                return Promise.all(promises).then(() => {

                }).catch((err) => {
                    this.editing_supermarket_categories = old_order
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            }
        },
        /**
         * open standard shopping modal to add selected recipe to shopping list
         * @param recipe recipe object to add to shopping
         */
        addRecipeToShopping(recipe) {
            this.new_recipe = recipe
            this.$nextTick(() => {
                this.$bvModal.show(`shopping_${this.new_recipe.id}`)
            })
        },
        /**
         * called after adding a new recipe through the shopping modal
         * cleanup and data refresh
         */
        finishShopping() {
            this.new_recipe = {id: undefined}
            useShoppingListStore().autosync()
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
        'plus-button': {
            inserted: function (el) {
                el.addEventListener("mouseenter", () => {
                    el.classList.add("text-success")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("text-success")
                })
            },
        },
        'minus-button': {
            inserted: function (el) {
                el.addEventListener("mouseenter", () => {
                    el.classList.add("text-warning")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("text-warning")
                })
            },
        },
    },
}
</script>

<style>

</style>
