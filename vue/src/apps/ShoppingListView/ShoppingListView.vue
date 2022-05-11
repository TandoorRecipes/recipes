<template>
    <div id="app" style="margin-bottom: 4vh">
        <b-alert :show="!online" dismissible class="small float-up" variant="warning">{{ $t("OfflineAlert") }}</b-alert>
        <div class="row float-top w-100">
            <div class="col-auto no-gutter ml-auto">
                <b-button variant="link" class="px-1 pt-0 pb-1 d-none d-md-inline-block">
                    <i class="btn fas fa-plus-circle fa-lg px-0" @click="entrymode = !entrymode"
                       :class="entrymode ? 'text-success' : 'text-primary'"/>
                </b-button>
                <b-button variant="link" class="px-1 pt-0 pb-1 d-none d-md-inline-block">
                    <i class="fas fa-download fa-lg nav-link dropdown-toggle text-primary px-1"
                       id="downloadShoppingLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>

                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="downloadShoppingLink">
                        <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')"
                                     icon="far fa-file-pdf"/>
                        <DownloadCSV :items="csvData" :delim="settings.csv_delim" name="shopping.csv"
                                     :label="$t('download_csv')" icon="fas fa-file-csv"/>
                        <CopyToClipboard :items="csvData" :settings="settings" :label="$t('copy_to_clipboard')"
                                         icon="fas fa-clipboard-list"/>
                        <CopyToClipboard :items="csvData" :settings="settings" format="table"
                                         :label="$t('copy_markdown_table')" icon="fab fa-markdown"/>
                    </div>
                </b-button>
                <i id="id_filters_button" class="fas fa-filter fa-fw mt-1" style="font-size: 16px; cursor: pointer"
                   :class="filterApplied ? 'text-danger' : 'text-primary'"/>
            </div>
        </div>

        <b-tabs content-class="mt-2" v-model="current_tab" class="mt-md-1" style="margin-top: 22px">
            <!-- shopping list tab -->
            <b-tab active>
                <template #title>
                    <b-spinner v-if="loading" type="border" small class="d-inline-block"></b-spinner>
                    <i v-if="!loading" class="fas fa-shopping-cart fa-fw d-inline-block d-md-none"></i>
                    <span class="d-none d-md-inline-block">{{ $t('Shopping_list') }}</span>
                </template>
                <div class="container p-0 p-md-3" id="shoppinglist">
                    <div class="row">
                        <div class="col col-md-12 p-0 p-lg-3">
                            <div role="tablist">
                                <!-- add to shopping form -->
                                <div class="container">
                                    <b-row class="justify-content-md-center align-items-center pl-1 pr-1"
                                           v-if="entrymode">
                                        <b-col cols="12" md="3" v-if="!ui.entry_mode_simple"
                                               class="d-none d-md-block mt-1">
                                            <b-form-input
                                                size="lg"
                                                min="1"
                                                type="number"
                                                :description="$t('Amount')"
                                                v-model="new_item.amount"
                                                style="font-size: 16px; border-radius: 5px !important; border: 1px solid #e8e8e8 !important"
                                                ref="amount_input_complex"
                                            ></b-form-input>
                                        </b-col>
                                        <b-col cols="12" md="4" v-if="!ui.entry_mode_simple" class="mt-1">
                                            <lookup-input :class_list="'mb-0'" :form="formUnit" :model="Models.UNIT"
                                                          @change="new_item.unit = $event" :show_label="false"
                                                          :clear="clear"/>
                                        </b-col>
                                        <b-col cols="12" md="4" v-if="!ui.entry_mode_simple" class="mt-1">
                                            <lookup-input :class_list="'mb-0'" :form="formFood" :model="Models.FOOD"
                                                          @change="new_item.food = $event" :show_label="false"
                                                          :clear="clear"/>
                                        </b-col>
                                        <b-col cols="12" md="11" v-if="ui.entry_mode_simple" class="mt-1">
                                            <b-form-input size="lg" type="text" :placeholder="$t('QuickEntry')"
                                                          v-model="new_item.ingredient"
                                                          @keyup.enter="addItem"
                                                          ref="amount_input_simple"></b-form-input>
                                        </b-col>
                                        <b-col cols="12" md="1" class="d-none d-md-block mt-1">
                                            <b-button variant="link" class="px-0" type="submit">
                                                <i class="btn fas fa-cart-plus fa-lg px-0 text-success"
                                                   @click="addItem"/>
                                            </b-button>
                                        </b-col>
                                        <b-col cols="12" md="3" v-if="!ui.entry_mode_simple"
                                               class="d-block d-md-none mt-1">
                                            <b-row>
                                                <b-col cols="9">
                                                    <b-form-input
                                                        size="lg"
                                                        min="1"
                                                        type="number"
                                                        :description="$t('Amount')"
                                                        v-model="new_item.amount"
                                                        style="font-size: 16px; border-radius: 5px !important; border: 1px solid #e8e8e8 !important"
                                                    ></b-form-input>
                                                </b-col>
                                                <b-col cols="3" class="flex-grow-1">
                                                    <b-button variant="success" class="p-0 pt-1 w-100 h-100">
                                                        <i class="btn fas fa-cart-plus fa-lg" @click="addItem"/>
                                                    </b-button>
                                                </b-col>
                                            </b-row>
                                        </b-col>
                                    </b-row>

                                    <b-row class="row justify-content-around mt-2" v-if="entrymode">
                                        <b-form-checkbox switch v-model="ui.entry_mode_simple">
                                            {{ $t("QuickEntry") }}
                                        </b-form-checkbox>
                                        <b-button variant="success" size="sm" class="d-flex d-md-none p-0"
                                                  v-if="ui.entry_mode_simple">
                                            <i class="btn fas fa-cart-plus" @click="addItem"/>
                                        </b-button>
                                    </b-row>

                                </div>
                                <!-- shopping list table -->
                                <div v-if="items && items.length > 0">
                                    <div v-for="(categories, checked_key) in Sections" :key="checked_key">
                                        <div v-if="checked_key == 'true'"
                                             class="bg-header w-100 text-center d-flex justify-content-center align-items-center">
                                            <span class="h4 d-flex mt-1 mb-1">{{ $t("Completed") }}</span>
                                        </div>

                                        <div v-for="(foods_group, category_key) in categories" :key="category_key">
                                            <div class="dropdown b-dropdown position-static inline-block"
                                                 data-html2canvas-ignore="true"
                                                 v-if="Object.entries(foods_group).length > 0">
                                                <button
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                    type="button"
                                                    class="btn dropdown-toggle btn-link text-decoration-none text-dark pr-2 dropdown-toggle-no-caret"
                                                    @click.stop="openContextMenu($event, foods_group, true)"
                                                >
                                                    <i class="fas fa-ellipsis-v"></i>
                                                </button>

                                                <b-button
                                                    class="btn btn-lg text-decoration-none text-dark px-1 py-0 border-0"
                                                    variant="link"
                                                    data-toggle="collapse"
                                                    :href="'#section-' + sectionID(checked_key, category_key)"
                                                    :aria-expanded="'true' ? checked_key == 'false' : 'true'"
                                                >
                                                    <i class="fa fa-chevron-right rotate"/>
                                                    <span class="h6 ml-2 text-secondary">{{ category_key }}</span>
                                                </b-button>
                                            </div>

                                            <div class="collapse"
                                                 :id="'section-' + sectionID(checked_key, category_key)" visible
                                                 role="tabpanel" :class="{ show: checked_key == 'false' }">
                                                <!-- passing an array of values to the table grouped by Food -->
                                                <transition-group name="slide-fade">
                                                    <div class="pl-4 pr-0"
                                                         v-for="(entries, index) in Object.entries(foods_group)"
                                                         :key="index">
                                                        <transition name="slide-fade" mode="out-in">
                                                            <shopping-line-item
                                                                :entries="entries[1]"
                                                                :groupby="group_by"
                                                                :settings="settings"
                                                                @open-context-menu="openContextMenu"
                                                                @update-checkbox="updateChecked"
                                                                @update-delaythis="delayThis"
                                                            />
                                                        </transition>
                                                    </div>
                                                </transition-group>
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
                <template #title>
                    <i class="fas fa-book fa-fw d-block d-md-none"></i>
                    <span class="d-none d-md-block">{{ $t('Recipes') }}</span>
                </template>
                <div class="container p-0">
                    <div class="row">
                        <div class="col col-md-12 p-0 p-lg-3">
                            <div role="tablist">
                                <!-- add to shopping form -->
                                <div class="container">
                                    <b-row class="justify-content-md-center align-items-center pl-1 pr-1">
                                        <b-col cols="10" md="3" class="mt-1">
                                            <b-form-input
                                                size="lg"
                                                min="1"
                                                type="number"
                                                :description="$t('Servings')"
                                                v-model="add_recipe_servings"
                                                style="font-size: 16px; border-radius: 5px !important; border: 1px solid #e8e8e8 !important"
                                            ></b-form-input>
                                        </b-col>
                                        <b-col cols="2" md="1" class="d-block d-md-none mt-1">
                                            <b-button variant="link" class="px-0">
                                                <i class="btn fas fa-cart-plus fa-lg px-0 text-success"
                                                   @click="addRecipeToShopping"
                                                   :disabled="!new_recipe.id"/>
                                            </b-button>
                                        </b-col>
                                        <b-col cols="12" md="8" class="mt-1">
                                            <generic-multiselect
                                                class="input-group-text m-0 p-0"
                                                @change="new_recipe = $event.val"
                                                :label="'name'"
                                                :model="Models.RECIPE"
                                                style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                v-bind:placeholder="$t('Recipe')"
                                                :limit="20"
                                                :multiple="false"
                                            />
                                        </b-col>
                                        <b-col cols="12" md="1" class="d-none d-md-block mt-1">
                                            <b-button variant="link" class="px-0">
                                                <i class="btn fas fa-cart-plus fa-lg px-0 text-success"
                                                   @click="addRecipeToShopping"
                                                   :disabled="!new_recipe.id"/>
                                            </b-button>
                                        </b-col>
                                    </b-row>
                                    <table class="table w-100 mt-3 recipe-table">
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
                                            <td><a :href="resolveDjangoUrl('view_recipe', r.recipe_mealplan.recipe)">{{ r.recipe_mealplan.recipe_name }}</a></td>
                                            <td class="block-inline">
                                                <b-form-input min="1" type="number" :debounce="300"
                                                              :value="r.recipe_mealplan.servings"
                                                              @input="updateServings($event, r.list_recipe)"></b-form-input>
                                            </td>
                                            <td>
                                                <i class="text-primary far fa-eye fa-fw fa-lg"
                                                   :title="$t('view_recipe')" @click="editRecipeList($event, r)"/>
                                                <i class="text-danger fas fa-trash fa-fw fa-lg mt-3"
                                                   :title="$t('Delete')" @click="deleteRecipe($event, r.list_recipe)"/>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <!-- supermarkets tab -->
            <b-tab>
                <template #title>
                    <i class="fas fa-store-alt fa-fw d-block d-md-none"></i>
                    <span class="d-none d-md-block">{{ $t('Supermarkets') }}</span>
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
                                                        v-for="(supermarket, index) in supermarkets" v-hover
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
                                                            v-for="(category, index) in supermarket_categories" v-hover
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
            <!-- settings tab -->
            <b-tab>
                <template #title>
                    <i class="fas fa-user-cog fa-fw d-block d-md-none"></i>
                    <span class="d-none d-md-block">{{ $t('Settings') }}</span>
                </template>
                <div class="row justify-content-center">
                    <div class="col-12 col-md-8">
                        <b-card class="no-body">
                            <div class="row">
                                <div class="col col-md-6">{{ $t("mealplan_autoadd_shopping") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="checkbox" class="form-control settings-checkbox"
                                           v-model="settings.mealplan_autoadd_shopping" @change="saveSettings"/>
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">{{ $t("mealplan_autoadd_shopping_desc") }}</em>
                                </div>
                            </div>
                            <div v-if="settings.mealplan_autoadd_shopping">
                                <div class="row">
                                    <div class="col col-md-6">{{ $t("mealplan_autoexclude_onhand") }}</div>
                                    <div class="col col-md-6 text-right">
                                        <input type="checkbox" class="form-control settings-checkbox"
                                               v-model="settings.mealplan_autoexclude_onhand" @change="saveSettings"/>
                                    </div>
                                </div>
                                <div class="row sm mb-3">
                                    <div class="col">
                                        <em class="small text-muted">{{ $t("mealplan_autoexclude_onhand_desc") }}</em>
                                    </div>
                                </div>
                            </div>
                            <div v-if="settings.mealplan_autoadd_shopping">
                                <div class="row">
                                    <div class="col col-md-6">{{ $t("mealplan_autoinclude_related") }}</div>
                                    <div class="col col-md-6 text-right">
                                        <input type="checkbox" class="form-control settings-checkbox"
                                               v-model="settings.mealplan_autoinclude_related" @change="saveSettings"/>
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
                                    <input type="number" class="form-control" v-model="settings.shopping_auto_sync"
                                           @change="saveSettings"/>
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
                                <div class="col col-md-6">{{ $t("shopping_add_onhand") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="checkbox" class="form-control settings-checkbox"
                                           v-model="settings.shopping_add_onhand" @change="saveSettings"/>
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("shopping_add_onhand_desc") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("shopping_recent_days") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="number" class="form-control" v-model="settings.shopping_recent_days"
                                           @change="saveSettings"/>
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
                                    <input type="checkbox" class="form-control settings-checkbox"
                                           v-model="settings.filter_to_supermarket" @change="saveSettings"/>
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
                                    <input type="number" class="form-control" min="1" v-model="settings.default_delay"
                                           @change="saveSettings"/>
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
                                    <input class="form-control" v-model="settings.csv_delim" @change="saveSettings"/>
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("csv_delim_help") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("csv_prefix_label") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input class="form-control" v-model="settings.csv_prefix" @change="saveSettings"/>
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("csv_prefix_help") }}
                                    </em>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col col-md-6">{{ $t("left_handed") }}</div>
                                <div class="col col-md-6">
                                    <input type="checkbox" class="form-control settings-checkbox"
                                           v-model="settings.left_handed" @change="saveSettings"/>
                                </div>
                            </div>
                            <div class="row sm mb-3">
                                <div class="col">
                                    <em class="small text-muted">
                                        {{ $t("left_handed_help") }}
                                    </em>
                                </div>
                            </div>
                        </b-card>
                    </div>
                </div>
            </b-tab>
        </b-tabs>

        <transition name="slided-fade">
            <div class="row fixed-bottom p-2 b-1 border-top text-center d-flex d-md-none"
                 style="background: rgba(255, 255, 255, 0.6);width: 105%;" v-if="current_tab === 0">
                <div class="col-6">
                    <a class="btn btn-block btn-success shadow-none" @click="entrymode = !entrymode; "
                    ><i class="fas fa-cart-plus"></i>
                        {{ $t("New_Entry") }}
                    </a>
                </div>
                <div class="col-6">
                    <b-dropdown id="dropdown-dropup" block dropup variant="primary" class="shadow-none">
                        <template #button-content><i class="fas fa-download"></i> {{ $t("Export") }}</template>
                        <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')"
                                     icon="far fa-file-pdf"/>
                        <DownloadCSV :items="csvData" :delim="settings.csv_delim" name="shopping.csv"
                                     :label="$t('download_csv')" icon="fas fa-file-csv"/>
                        <CopyToClipboard :items="csvData" :settings="settings" :label="$t('copy_to_clipboard')"
                                         icon="fas fa-clipboard-list"/>
                        <CopyToClipboard :items="csvData" :settings="settings" format="table"
                                         :label="$t('copy_markdown_table')" icon="fab fa-markdown"/>
                    </b-dropdown>
                </div>
            </div>
        </transition>
        <b-popover target="id_filters_button" triggers="click" placement="bottomleft" :title="$t('Filters')">
            <div>
                <b-form-group v-bind:label="$t('GroupBy')" label-for="popover-input-1" label-cols="6" class="mb-1">
                    <b-form-select v-model="group_by" :options="group_by_choices" size="sm"></b-form-select>
                </b-form-group>
                <b-form-group v-bind:label="$t('Supermarket')" label-for="popover-input-2" label-cols="6" class="mb-1">
                    <b-form-select v-model="ui.selected_supermarket" :options="supermarkets" text-field="name"
                                   value-field="id" size="sm"></b-form-select>
                </b-form-group>
                <!-- TODO: shade filters red when they are actually filtering content -->
                <b-form-group v-bind:label="$t('ShowDelayed')" label-for="popover-input-3" content-cols="1"
                              class="mb-1">
                    <b-form-checkbox v-model="show_delay"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('ShowUncategorizedFood')" label-for="popover-input-4" content-cols="1"
                              class="mb-1" v-if="!ui.selected_supermarket">
                    <b-form-checkbox v-model="show_undefined_categories"></b-form-checkbox>
                </b-form-group>
                <b-form-group v-bind:label="$t('SupermarketCategoriesOnly')" label-for="popover-input-5"
                              content-cols="1" class="mb-1" v-if="ui.selected_supermarket">
                    <b-form-checkbox v-model="supermarket_categories_only"></b-form-checkbox>
                </b-form-group>
            </div>
            <div class="row" style="margin-top: 1vh; min-width: 300px">
                <div class="col-12" style="text-align: right">
                    <b-button size="sm" variant="primary" class="mx-1" @click="resetFilters">{{
                            $t("Reset")
                        }}
                    </b-button>
                    <b-button size="sm" variant="secondary" class="mr-3" @click="$root.$emit('bv::hide::popover')">
                        {{ $t("Close") }}
                    </b-button>
                </div>
            </div>
        </b-popover>
        <ContextMenu ref="menu">
            <template #menu="{ contextData }">
                <ContextMenuItem>
                    <b-input-group>
                        <template #prepend>
                            <span class="dropdown-item p-2 text-decoration-none" style="user-select: none !important"><i
                                class="fas fa-cubes"></i> {{ $t("MoveCategory") }}</span>
                        </template>
                        <b-form-select
                            class="form-control mt-1 mr-1"
                            :options="shopping_categories"
                            text-field="name"
                            value-field="id"
                            v-model="shopcat"
                            @change="
                                moveEntry($event, contextData)
                                $refs.menu.close()
                            "
                        ></b-form-select>
                    </b-input-group>
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
                    <a class="dropdown-item p-2" href="#"><i class="fas fa-hourglass"></i>
                        {{ $t("DelayFor", {hours: delay}) }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        updateChecked({ entries: contextData, checked: true })
                    "
                >
                    <a class="dropdown-item p-2" href="#"><i class="fas fa-check-square"></i> {{ $t("mark_complete") }}</a>
                </ContextMenuItem>
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        deleteThis(contextData)
                    "
                >
                    <a class="dropdown-item p-2 text-danger" href="#"><i class="fas fa-trash"></i> {{
                            $t("Delete")
                        }}</a>
                </ContextMenuItem>
            </template>
        </ContextMenu>
        <shopping-modal v-if="new_recipe.id" :recipe="new_recipe" :servings="parseInt(add_recipe_servings)"
                        :modal_id="new_recipe.id" @finish="finishShopping" :list_recipe="new_recipe.list_recipe"/>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import VueCookies from "vue-cookies"
import draggable from "vuedraggable"

import ContextMenu from "@/components/ContextMenu/ContextMenu"
import ContextMenuItem from "@/components/ContextMenu/ContextMenuItem"
import ShoppingLineItem from "@/components/ShoppingLineItem"
import DownloadPDF from "@/components/Buttons/DownloadPDF"
import DownloadCSV from "@/components/Buttons/DownloadCSV"
import CopyToClipboard from "@/components/Buttons/CopyToClipboard"
import GenericMultiselect from "@/components/GenericMultiselect"
import LookupInput from "@/components/Modals/LookupInput"
import ShoppingModal from "@/components/Modals/ShoppingModal"

import {ApiMixin, getUserPreference, StandardToasts, makeToast, ResolveUrlMixin} from "@/utils/utils"
import {ApiApiFactory} from "@/utils/openapi/api"

Vue.use(BootstrapVue)
Vue.use(VueCookies)
let SETTINGS_COOKIE_NAME = "shopping_settings"

export default {
    name: "ShoppingListView",
    mixins: [ApiMixin,ResolveUrlMixin],
    components: {
        ContextMenu,
        ContextMenuItem,
        ShoppingLineItem,
        GenericMultiselect,
        LookupInput,
        DownloadPDF,
        DownloadCSV,
        CopyToClipboard,
        ShoppingModal,
        draggable
    },

    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            items: [],
            current_tab: 0,
            group_by: "category",
            group_by_choices: ["created_by", "category", "recipe"],
            supermarkets: [],
            shopping_categories: [],
            show_undefined_categories: true,
            supermarket_categories_only: false,
            shopcat: null,
            delay: 0,
            clear: Math.random(),
            generic_action: null,
            generic_model: null,
            ui: {
                entry_mode_simple: true,
                selected_supermarket: undefined,
            },
            settings: {
                shopping_auto_sync: 0,
                default_delay: 4,
                mealplan_autoadd_shopping: false,
                mealplan_autoinclude_related: false,
                mealplan_autoexclude_onhand: true,
                filter_to_supermarket: false,
                shopping_recent_days: 7,
                csv_delim: ",",
                csv_prefix: undefined,
                shopping_add_onhand: true,
                left_handed: false,
            },
            editing_supermarket_categories: [],
            editing_supermarket: null,
            new_supermarket: {entrymode: false, value: undefined, editmode: undefined},
            new_category: {entrymode: false, value: undefined},
            autosync_id: undefined,
            auto_sync_running: false, // track to not start a new sync before old one was finished
            auto_sync_blocked: false, // blocking auto sync while request to check item is still running
            show_delay: false,
            drag: false,
            show_modal: false,
            fields: ["checked", "amount", "category", "unit", "food", "recipe", "details"],
            loading: true,
            entrymode: false,
            new_item: {amount: 1, unit: undefined, food: undefined, ingredient: undefined},
            online: true,
            new_recipe: {
                id: undefined,
            },
            add_recipe_servings: 1,
            shopping_list_height: '60vh'
        }
    },
    computed: {
        Sections() {
            // Sections to display in list (checked/unchecked -> category -> food group -> entries)
            // ordering/sorting is definied by the order in which categories are added to the sections array (even trough the dev console does not show it like this)
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
                shopping_list = shopping_list.filter((x) => !x.delay_until || Date.parse(x?.delay_until) < new Date(Date.now()))
            }

            // if a supermarket is selected and filtered to only supermarket categories filter out everything else
            if (this.ui.selected_supermarket && this.supermarket_categories_only) {
                let shopping_categories = this.supermarkets // category IDs configured on supermarket
                    .filter((x) => x.id === this.ui.selected_supermarket)
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.id)
                shopping_list = shopping_list.filter((x) => shopping_categories.includes(x?.food?.supermarket_category?.id))
                // if showing undefined is off, filter undefined
            } else if (!this.show_undefined_categories) {
                shopping_list = shopping_list.filter((x) => x?.food?.supermarket_category)
            }

            var groups = {false: {}, true: {}} // force unchecked to always be first
            // TODO: make nulls_first a user setting
            // add undefined group to both the checked and non checked
            groups.false[this.$t("Undefined")] = {}
            groups.true[this.$t("Undefined")] = {}
            // category order is defined by order of insertion into groups variable
            if (this.ui.selected_supermarket) {
                let super_cats = this.supermarkets
                    .filter((x) => x.id === this.ui.selected_supermarket)
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.name)
                new Set([...super_cats, ...this.shopping_categories.map((x) => x.name)]).forEach((cat) => {
                    groups["false"][cat] = {}
                    groups["true"][cat] = {}
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
                return {amount: x.amount, unit: x.unit?.name ?? "", food: x.food?.name ?? ""}
            })
        },
        defaultDelay() {
            return Number(getUserPreference("default_delay")) || 2
        },
        editingSupermarket() {
            return this.supermarkets.filter((el) => {
                return el.editing
            })
        },
        unusedSupermarketCategories() {
            if (this.editingSupermarket.length > 0) {
                return this.supermarket_categories.filter(a => !this.editing_supermarket_categories.map(b => b.id).includes(a.id))
            } else {
                return []
            }
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
            return (this.itemsDelayed && !this.show_delay) || !this.show_undefined_categories || (this.supermarket_categories_only && this.ui.selected_supermarket)
        },
        Recipes() {
            // hiding recipes associated with shopping list items that are complete
            return [...new Map(this.items.filter((x) => x.list_recipe && !x.checked).map((item) => [item["list_recipe"], item])).values()]
        },
        supermarket_categories() {
            return this.shopping_categories
        },
        notsupermarket_categories() {
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
        ui: {
            handler() {
                this.$cookies.set(SETTINGS_COOKIE_NAME, {ui: this.ui, settings: {entrymode: this.entrymode}}, "100y")
                if (this.entrymode) {
                    this.$nextTick(function () {
                        this.setFocus()
                    })
                }
            },
            deep: true,
        },
        entrymode: {
            handler() {
                this.$cookies.set(SETTINGS_COOKIE_NAME, {ui: this.ui, settings: {entrymode: this.entrymode}}, "100y")
                if (this.entrymode) {
                    document.getElementById('shoppinglist').scrollTop = 0
                    this.$nextTick(function () {
                        this.setFocus()
                    })
                }
            }
        },
        new_recipe: {
            handler() {
                this.add_recipe_servings = this.new_recipe.servings
            },
            deep: true,
        },
        "settings.filter_to_supermarket": function (newVal, oldVal) {
            this.supermarket_categories_only = this.settings.filter_to_supermarket
        },
        "settings.shopping_auto_sync": function (newVal, oldVal) {
            clearInterval(this.autosync_id)
            this.autosync_id = undefined
            if (this.settings.shopping_auto_sync > 0) {
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
            }

        },
        "settings.default_delay": function (newVal, oldVal) {
            this.delay = Number(newVal)
        },
        "ui.selected_supermarket": function (newVal, oldVal) {
            this.supermarket_categories_only = this.settings.filter_to_supermarket
        },
    },
    mounted() {
        this.getShoppingList()
        this.getSupermarkets()
        this.getShoppingCategories()

        this.settings = getUserPreference()
        this.delay = Number(this.settings.default_delay || 4)
        this.supermarket_categories_only = this.settings.filter_to_supermarket
        if (this.settings.shopping_auto_sync) {
            window.addEventListener("online", this.updateOnlineStatus)
            window.addEventListener("offline", this.updateOnlineStatus)
        }
        this.$nextTick(function () {
            if (this.$cookies.isKey(SETTINGS_COOKIE_NAME)) {
                this.ui = Object.assign({}, this.ui, this.$cookies.get(SETTINGS_COOKIE_NAME).ui)
                this.entrymode = this.$cookies.get(SETTINGS_COOKIE_NAME).settings.entrymode
            }
        })
        this.$i18n.locale = window.CUSTOM_LOCALE
        console.log(window.CUSTOM_LOCALE)
    },
    methods: {
        setFocus() {
            if (this.ui.entry_mode_simple) {
                this.$refs['amount_input_simple'].focus()
            } else {
                if (this.$refs['amount_input_complex']) {
                    this.$refs['amount_input_complex'].focus()
                }
            }
        },
        // this.genericAPI inherited from ApiMixin
        addItem: function () {
            if (this.ui.entry_mode_simple) {
                if (this.new_item.ingredient !== "" && this.new_item.ingredient !== undefined) {
                    this.genericPostAPI("api_ingredient_from_string", {text: this.new_item.ingredient}).then((result) => {
                        let unit = null
                        if (result.data.unit !== null) {
                            unit = {name: result.data.unit}
                        }

                        this.new_item = {
                            amount: result.data.amount,
                            unit: unit,
                            food: {name: result.data.food},
                        }
                        this.addEntry()
                    })
                }
            } else {
                this.addEntry()
            }
            this.setFocus()
        },
        addEntry: function (x) {
            let api = new ApiApiFactory()
            api.createShoppingListEntry(this.new_item)
                .then((results) => {
                    if (results?.data) {
                        this.items.push(results.data)
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                    } else {
                        console.log("no data returned")
                    }
                    this.new_item = {amount: 1, unit: undefined, food: undefined, ingredient: undefined}
                    this.clear += 1
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                })
        },
        resetFilters: function () {
            this.ui.selected_supermarket = undefined
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
                    return {...x, delay_until: delay_date}
                })
                entries = item.map((x) => x.id)
            } else {
                item.delay_until = delay_date
                entries = [item.id]
            }

            entries.forEach((entry) => {
                promises.push(this.saveThis({id: entry, delay_until: delay_date}, false))
            })
            Promise.all(promises).then(() => {
                this.items = this.items.filter((x) => !entries.includes(x.id))
                this.delay = this.defaultDelay
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        deleteRecipe: function (e, recipe) {
            let api = new ApiApiFactory()
            api.destroyShoppingListRecipe(recipe)
                .then((x) => {
                    this.items = this.items.filter((x) => x.list_recipe !== recipe)
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
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
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                    })
                )
            })

            Promise.all(promises).then((result) => {
                this.items = this.items.filter((x) => !entries.includes(x.id))
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
            })
        },
        foodName: function (value) {
            return value?.food?.name ?? value?.[0]?.food?.name ?? ""
        },
        getShoppingCategories: function () {
            let api = new ApiApiFactory()
            api.listSupermarketCategorys().then((result) => {
                result.data.forEach((category) => {
                    category.editing = false
                })
                this.shopping_categories = result.data
            })
        },
        getShoppingList: function (autosync = false) {
            let params = {}
            params.supermarket = this.ui.selected_supermarket

            params.options = {query: {recent: 1}}
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
                        if (!this.auto_sync_blocked) {
                            this.mergeShoppingList(results.data)
                        }
                    }
                })
                .catch((err) => {
                    if (!autosync) {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                    }
                })
        },
        getSupermarkets: function () {
            let api = new ApiApiFactory()
            api.listSupermarkets().then((result) => {
                result.data.forEach((supermarket) => {
                    supermarket.editing = false
                })
                this.supermarkets = result.data
            })
        },
        getThis: function (id) {
            return this.genericAPI(this.Models.SHOPPING_CATEGORY, this.Actions.FETCH, {id: id})
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
            let new_entries = data.map((x) => x.id).filter((y) => !this.items.map((z) => z.id).includes(y))
            if (new_entries.length > 0) {
                let api = new ApiApiFactory()
                new_entries.forEach((new_id) => {
                    api.retrieveShoppingListEntry(new_id).then((result) => {
                        this.items.push(result.data)
                    })
                })
            }
        },
        moveEntry: function (e, item) {
            if (!e) {
                makeToast(this.$t("Warning"), this.$t("NoCategory"), "warning")
            }

            // TODO make decision - should inheritance always be set manually or give user a choice at front-end or make it a setting?
            let food = this.items.filter((x) => x.food.id == item?.[0]?.food.id ?? item.food.id)[0].food
            let supermarket_category = this.shopping_categories.filter((x) => x?.id === this.shopcat)?.[0]
            food.supermarket_category = supermarket_category
            this.updateFood(food, "supermarket_category").then((result) => {
                this.items = this.items.map((x) => {
                    if (x.food.id === food.id) {
                        return {...x, food: {...x.food, supermarket_category: supermarket_category}}
                    } else {
                        return x
                    }
                })
            })
            this.shopcat = null
        },
        onHand: function (item) {
            let api = new ApiApiFactory()
            let food = {
                id: item?.[0]?.food.id ?? item?.food?.id,
                food_onhand: true,
            }

            this.updateFood(food, "food_onhand")
                .then((result) => {
                    let entries = this.items.filter((x) => x.food.id == food.id).map((x) => x.id)
                    this.items = this.items.filter((x) => x.food.id !== food.id)
                    return entries
                })
                .then((entries) => {
                    entries.forEach((x) => {
                        api.destroyShoppingListEntry(x).then((result) => {
                        })
                    })
                })
        },
        openContextMenu(e, value, section = false) {
            if (section) {
                value = Object.values(value).flat()
            } else {
                this.shopcat = value?.food?.supermarket_category?.id ?? value?.[0]?.food?.supermarket_category?.id ?? undefined
            }

            this.$refs.menu.open(e, value)
        },
        saveSettings: function () {
            let api = ApiApiFactory()
            api.partialUpdateUserPreference(this.settings.user, this.settings)
                .then((result) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
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
                            StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                        }
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                    })
            } else {
                return api
                    .partialUpdateShoppingListEntry(thisItem.id, thisItem)
                    .then((result) => {
                        if (toast) {
                            StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                        }
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            }
        },
        sectionID: function (a, b) {
            return (a + b).replace(/\W/g, "")
        },
        updateChecked: function (update) {
            // when checking a sub item don't refresh the screen until all entries complete but change class to cross out
            this.auto_sync_blocked = true
            let promises = []
            update.entries.forEach((x) => {
                const id = x?.id ?? x
                let completed_at = undefined
                if (update.checked) {
                    completed_at = new Date().toISOString()
                }
                promises.push(this.saveThis({id: id, checked: update.checked}, false))

                let item = this.items.filter((entry) => entry.id == id)[0]
                Vue.set(item, "checked", update.checked)
                Vue.set(item, "completed_at", completed_at)
            })

            Promise.all(promises)
                .then(() => {
                    this.auto_sync_blocked = false
                })
                .catch((err) => {
                    this.auto_sync_blocked = false
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
        },
        updateFood: function (food, field) {
            let api = new ApiApiFactory()
            if (field) {
                // assume if field is changing it should no longer be inherited
                food.inherit_fields = food.inherit_fields.filter((x) => x.field !== field)
            }

            return api
                .partialUpdateFood(food.id, food)
                .then((result) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    if (food?.numchild > 0) {
                        this.getShoppingList() // if food has children, just get the whole list.  probably could be more efficient
                    }
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
        },
        updateServings(e, plan) {
            // maybe this needs debounced?
            let api = new ApiApiFactory()
            api.partialUpdateShoppingListRecipe(plan, {id: plan, servings: e}).then(() => {
                this.getShoppingList()
            })
        },
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
                    apiClient.destroySupermarket(this.supermarkets[index].id)
                        .then((e) => {
                            this.getShoppingList()
                            this.getSupermarkets()
                            this.getShoppingCategories()
                            StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                        })
                        .catch((err) => {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                        })
                }
            })
        },
        addSupermarket: function () {
            let api = new ApiApiFactory()
            api.createSupermarket({name: this.$t('Supermarket') + Math.floor(1000 + Math.random() * 9000)})
                .then((result) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                    this.supermarkets.push(result.data)
                    this.new_supermarket.value = undefined
                })
                .catch((err) => {
                    console.log(err, Object.keys(err))
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE)
                })
        },
        editOrSaveSupermarket(index) {
            let supermarket = this.supermarkets[index]

            if (supermarket.editing) {
                this.$set(this.supermarkets[index], "editing", false)
                this.$set(this.supermarkets[index], "category_to_supermarket", this.editing_supermarket_categories)
                this.editing_supermarket_categories = []

                let apiClient = new ApiApiFactory()

                apiClient
                    .updateSupermarket(this.supermarkets[index].id, this.supermarkets[index])
                    .then((e) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            } else {
                this.supermarkets.forEach((market, i) => {
                    if (i !== index) {
                        this.$set(this.supermarkets[i], "editing", false)
                    }
                })

                this.$set(this.supermarkets[index], "editing", true)

                this.editing_supermarket_categories = []
                this.supermarkets[index].category_to_supermarket.forEach((cur, i) => {
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
                    apiClient.destroySupermarketCategory(this.supermarket_categories[index].id)
                        .then((e) => {
                            this.getShoppingList()
                            this.getSupermarkets()
                            this.getShoppingCategories()
                            StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                        })
                        .catch((err) => {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                        })
                }
            })
        },
        addSupermarketCategory() {
            let apiClient = new ApiApiFactory()

            apiClient.createSupermarketCategory({name: this.$t("Shopping_Category") + Math.floor(1000 + Math.random() * 9000)})
                .then((result) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                    this.shopping_categories.push(result.data)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                })
        },
        editOrSaveSupermarketCategory(index) {
            let category = this.supermarket_categories[index]

            this.supermarkets.forEach((supermarket) => {
                supermarket.category_to_supermarket.forEach((cat) => {
                    if (cat.category.id === this.supermarket_categories[index].id) {
                        cat.category = this.supermarket_categories[index]
                    }
                })
            })
            if (category.editing) {
                this.$set(this.supermarket_categories[index], "editing", false)

                let apiClient = new ApiApiFactory()

                apiClient
                    .updateSupermarketCategory(this.supermarket_categories[index].id, this.supermarket_categories[index])
                    .then((e) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            } else {
                this.supermarket_categories.forEach((market, i) => {
                    if (i !== index) {
                        this.$set(this.supermarket_categories[i], "editing", false)
                    }
                })

                this.$set(this.supermarket_categories[index], "editing", true)
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
                apiClient
                    .destroySupermarketCategoryRelation(e.removed.element.relation_id)
                    .then((result) => {

                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE)
                        this.editing_supermarket_categories.splice(e.removed.oldIndex, 0, e.removed.element);
                    })
            }

            if ("added" in e) {
                let apiClient = new ApiApiFactory()

                apiClient
                    .createSupermarketCategoryRelation({
                        supermarket: this.editingSupermarket[0].id,
                        category: e.added.element,
                        order: e.added.newIndex,
                    })
                    .then((results) => {
                        this.editing_supermarket_categories.splice(e.added.newIndex, 1, {
                            name: results.data.category.name,
                            description: results.data.category.description,
                            id: results.data.category.id,
                            relation_id: results.data.id,
                            order: results.data.order,
                            supermarket: results.data.supermarket,
                            category: results.data.category
                        });
                    })
                    .catch((err) => {
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
        categoryName(item) {
            return item?.category?.name ?? item.name
        },
        updateOnlineStatus(e) {
            const {type} = e
            this.online = type === "online"
        },
        beforeDestroy() {
            window.removeEventListener("online", this.updateOnlineStatus)
            window.removeEventListener("offline", this.updateOnlineStatus)
        },
        addRecipeToShopping() {
            this.$bvModal.show(`shopping_${this.new_recipe.id}`)
        },
        finishShopping() {
            this.add_recipe_servings = 1
            this.new_recipe = {id: undefined}
            this.edit_recipe_list = undefined
            this.getShoppingList()
        },
        editRecipeList(e, r) {
            this.new_recipe = {
                id: r.recipe_mealplan.recipe,
                name: r.recipe_mealplan.recipe_name,
                servings: r.recipe_mealplan.servings,
                list_recipe: r.list_recipe
            }
            this.$nextTick(function () {
                this.$bvModal.show(`shopping_${this.new_recipe.id}`)
            })

            // this.$bvModal.show(`shopping_${this.new_recipe.id}`)
        }
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

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.2s ease;
}

.slide-fade-enter, .slide-fade-leave-to
    /* .slider-fade-leave-active below version 2.1.8 */
{
    transform: translateX(10px);
    opacity: 0;
}

.form-control-append {
    font-size: 20px;
}

#shoppinglist {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    height: calc(100vh - 170px);
}

#id_base_container {
    padding-right: 5px;
    padding-left: 5px;
}

input {
    font-size: 16px !important;
}

@media (max-width: 991.9px) {
    #shoppinglist {
        max-width: none;
    }
}

@media (min-width: 992px) {
    #shoppinglist {
        overflow-y: auto;
        overflow-x: auto;
        height: auto;
        margin: auto;
    }

    #id_base_container {
        padding-right: 15px;
        padding-left: 15px;
    }
}

.settings-checkbox {
    font-size: 0.3rem;
}

@media (max-width: 767.9px) {
    .recipe-table {
        font-size: 14px;
    }
}


</style>
