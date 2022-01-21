<template>
    <div id="app" style="margin-bottom: 4vh">
        <b-alert :show="!online" dismissible class="small float-up" variant="warning">{{ $t("OfflineAlert") }}</b-alert>
        <div class="row float-top pl-0 pr-0">
            <div class="col-auto no-gutter ml-auto">
                <b-button variant="link" class="px-1 pt-0 pb-1 d-none d-md-inline-block">
                    <i class="btn fas fa-plus-circle fa-lg px-0" @click="entrymode = !entrymode" :class="entrymode ? 'text-success' : 'text-primary'" />
                </b-button>
                <b-button variant="link" class="px-1 pt-0 pb-1 d-none d-md-inline-block">
                    <i class="fas fa-download fa-lg nav-link dropdown-toggle text-primary px-1" id="downloadShoppingLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>

                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="downloadShoppingLink">
                        <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')" icon="far fa-file-pdf" />
                        <DownloadCSV :items="csvData" :delim="settings.csv_delim" name="shopping.csv" :label="$t('download_csv')" icon="fas fa-file-csv" />
                        <CopyToClipboard :items="csvData" :settings="settings" :label="$t('copy_to_clipboard')" icon="fas fa-clipboard-list" />
                        <CopyToClipboard :items="csvData" :settings="settings" format="table" :label="$t('copy_markdown_table')" icon="fab fa-markdown" />
                    </div>
                </b-button>
                <b-button variant="link" id="id_filters_button" class="px-1 pt-0 pb-1">
                    <i class="btn fas fa-filter text-decoration-none fa-lg px-1" :class="filterApplied ? 'text-danger' : 'text-primary'" />
                </b-button>
            </div>
        </div>

        <b-tabs content-class="mt-3" v-model="current_tab">
            <!-- shopping list tab -->
            <b-tab active>
                <template #title>
                    <b-spinner v-if="loading" type="border" small></b-spinner>
                    {{ $t("Shopping_list") }}
                </template>
                <div class="container p-0" id="shoppinglist">
                    <div class="row">
                        <div class="col col-md-12 p-0 p-lg-3">
                            <div role="tablist">
                                <!-- add to shopping form -->

                                <b-row class="justify-content-md-center align-items-center pl-1 pr-1" v-if="entrymode">
                                    <b-col cols="12" md="3" v-if="!entry_mode_simple" class="d-none d-md-block mt-1">
                                        <b-form-input
                                            size="lg"
                                            min="1"
                                            type="number"
                                            :description="$t('Amount')"
                                            v-model="new_item.amount"
                                            style="font-size: 16px; border-radius: 5px !important; border: 1px solid #e8e8e8 !important"
                                        ></b-form-input>
                                    </b-col>
                                    <b-col cols="12" md="4" v-if="!entry_mode_simple" class="mt-1">
                                        <lookup-input :class_list="'mb-0'" :form="formUnit" :model="Models.UNIT" @change="new_item.unit = $event" :show_label="false" :clear="clear" />
                                    </b-col>
                                    <b-col cols="12" md="4" v-if="!entry_mode_simple" class="mt-1">
                                        <lookup-input :class_list="'mb-0'" :form="formFood" :model="Models.FOOD" @change="new_item.food = $event" :show_label="false" :clear="clear" />
                                    </b-col>
                                    <b-col cols="12" md="11" v-if="entry_mode_simple" class="mt-1">
                                        <b-form-input size="lg" type="text" :placeholder="$t('QuickEntry')" v-model="new_item.ingredient" @keyup.enter="addItem"></b-form-input>
                                    </b-col>
                                    <b-col cols="12" md="1" class="d-none d-md-block mt-1">
                                        <b-button variant="link" class="px-0">
                                            <i class="btn fas fa-cart-plus fa-lg px-0 text-success" @click="addItem" />
                                        </b-button>
                                    </b-col>
                                    <b-col cols="12" md="3" v-if="!entry_mode_simple" class="d-block d-md-none mt-1">
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
                                                    <i class="btn fas fa-cart-plus fa-lg" @click="addItem" />
                                                </b-button>
                                            </b-col>
                                        </b-row>
                                    </b-col>
                                </b-row>

                                <b-row class="row justify-content-around mt-2" v-if="entrymode">
                                    <b-form-checkbox switch v-model="entry_mode_simple">
                                        {{ $t("QuickEntry") }}
                                    </b-form-checkbox>
                                    <b-button variant="success" size="sm" class="d-flex d-md-none p-0" v-if="entry_mode_simple">
                                        <i class="btn fas fa-cart-plus" @click="addItem" />
                                    </b-button>
                                </b-row>
                                <!-- shopping list table -->
                                <div v-if="items && items.length > 0">
                                    <div v-for="(done, x) in Sections" :key="x">
                                        <div v-if="x == 'true'" class="bg-header w-100 text-center d-flex justify-content-center align-items-center">
                                            <span class="h4 d-flex mt-1 mb-1">{{ $t("Completed") }}</span>
                                        </div>

                                        <div v-for="(s, i) in done" :key="i">
                                            <div class="dropdown b-dropdown position-static inline-block" data-html2canvas-ignore="true" v-if="Object.entries(s).length > 0">
                                                <button
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                    type="button"
                                                    class="btn dropdown-toggle btn-link text-decoration-none text-dark pr-2 dropdown-toggle-no-caret"
                                                    @click.stop="openContextMenu($event, s, true)"
                                                >
                                                    <i class="fas fa-ellipsis-v fa-lg"></i>
                                                </button>

                                                <b-button
                                                    class="btn btn-lg text-decoration-none text-dark px-1 py-0 border-0"
                                                    variant="link"
                                                    data-toggle="collapse"
                                                    :href="'#section-' + sectionID(x, i)"
                                                    :aria-expanded="'true' ? x == 'false' : 'true'"
                                                >
                                                    <i class="fa fa-chevron-right rotate" />
                                                    <span class="h5 ml-2 text-secondary">{{ i }}</span>
                                                </b-button>
                                            </div>

                                            <div class="collapse" :id="'section-' + sectionID(x, i)" visible role="tabpanel" :class="{ show: x == 'false' }">
                                                <!-- passing an array of values to the table grouped by Food -->
                                                <transition-group name="slide-fade">
                                                    <div v-for="(entries, x) in Object.entries(s)" :key="x">
                                                        <transition name="slide-fade" mode="out-in">
                                                            <ShoppingLineItem
                                                                :entries="entries[1]"
                                                                :groupby="group_by"
                                                                :settings="settings"
                                                                @open-context-menu="openContextMenu"
                                                                @update-checkbox="updateChecked"
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
                <div class="container p-0">
                    <b-row class="justify-content-md-center align-items-center p-1">
                        <b-col cols="10">
                            <b-input-group>
                                <b-input-group-prepend is-text>
                                    {{ $t("Servings") }}
                                </b-input-group-prepend>
                                <b-input-group-prepend is-text>
                                    <input type="number" :min="1" v-model="add_recipe_servings" style="width: 3em" />
                                </b-input-group-prepend>
                                <!-- <b-input-group-prepend is-text>
                                    <b>{{ $t("Recipe") }}</b>
                                </b-input-group-prepend> -->
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
                                <b-input-group-append>
                                    <b-button variant="success" @click="addRecipeToShopping" :disabled="!new_recipe.id">{{ $t("Add_to_Shopping") }}</b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </b-col>
                    </b-row>
                    <table class="table w-100">
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
                </div>
            </b-tab>
            <!-- supermarkets tab -->
            <b-tab :title="$t('Supermarkets')">
                <div class="row justify-content-center">
                    <!-- supermarkets column -->
                    <div class="col col-md-5">
                        <b-card no-body>
                            <template #header>
                                <h4 class="mb-0">
                                    {{ $t("Supermarkets") }}
                                    <b-button
                                        variant="link"
                                        class="p-0 m-0 float-right"
                                        @click="
                                            new_supermarket.entrymode = !new_supermarket.entrymode
                                            new_supermarket.value = undefined
                                            new_supermarket.editmode = false
                                            new_category.entrymode = false
                                            supermarkets = supermarkets.map((x) => {
                                                return { ...x, editmode: false }
                                            })
                                        "
                                    >
                                        <i class="btn fas fa-plus-circle fa-lg px-0" :class="new_supermarket.entrymode ? 'text-success' : 'text-primary'" />
                                    </b-button>
                                </h4>
                            </template>
                            <b-card
                                class="pt-5 pl-5 pr-5"
                                border-variant="success"
                                header-bg-variant="success"
                                header-text-variant="white"
                                align="center"
                                v-if="new_supermarket.entrymode"
                                :header="new_supermarket.value ? new_supermarket.value : $t('SupermarketName')"
                            >
                                <b-input-group>
                                    <b-form-input type="text" class="form-control-append" :placeholder="$t('SupermarketName')" v-model="new_supermarket.value" />
                                    <b-input-group-append>
                                        <b-button class="input-group-append" variant="success" @click="addSupermarket"><i class="pr-2 pt-1 fas fa-save"></i> {{ $t("Create") }} </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-card>

                            <b-card-body class="m-0 p-0">
                                <b-card class="mt-1 p-0" v-for="s in supermarkets" v-bind:key="s.id">
                                    <b-card-header class="p-2 border-0 pt-3">
                                        <div class="row">
                                            <div class="col-12">
                                                <h5 class="mt-1 mb-1">
                                                    {{ s.name }}
                                                    <b-button
                                                        variant="link"
                                                        class="p-0 m-0 float-right"
                                                        @click="
                                                            s.editmode = !s.editmode
                                                            new_category.entrymode = false
                                                            new_supermarket.entrymode = false
                                                            editSupermarket(s)
                                                        "
                                                    >
                                                        <i class="btn fas fa-edit fa-lg px-0" :class="s.editmode ? 'text-success' : 'text-primary'" />
                                                    </b-button>
                                                    <b-button variant="link" class="p-0 m-0 float-right" @click="deleteSupermarket(s)">
                                                        <i class="btn fas fa-trash fa-lg px-2 text-danger" />
                                                    </b-button>
                                                </h5>
                                            </div>
                                        </div>
                                    </b-card-header>
                                    <b-card-body class="m-0 p-0">
                                        <generic-pill :item_list="s.category_to_supermarket" label="category::name" color="info"></generic-pill>
                                    </b-card-body>
                                </b-card>
                            </b-card-body>
                        </b-card>
                    </div>
                    <div class="col col-md-5">
                        <b-card>
                            <template #header>
                                <h4 class="mb-0">
                                    {{ $t("Shopping_Categories") }}
                                    <b-button
                                        variant="link"
                                        class="p-0 m-0 float-right"
                                        @click="
                                            new_category.entrymode = !new_category.entrymode
                                            new_supermarket.entrymode = false
                                        "
                                    >
                                        <i class="btn fas fa-plus-circle fa-lg px-0" :class="new_category.entrymode ? 'text-success' : 'text-primary'" />
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
                                :header="new_category.value ? new_category.value : $t('CategoryName')"
                            >
                                <b-input-group>
                                    <b-form-input type="text" class="form-control-append" :placeholder="$t('CategoryName')" v-model="new_category.value" />
                                    <b-input-group-append>
                                        <b-button class="input-group-append" variant="success" @click="addCategory"><i class="pr-2 pt-1 fas fa-save"></i> {{ $t("Create") }} </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-card>

                            <b-card-sub-title v-if="new_supermarket.editmode" class="pt-0 pb-3">{{ $t("CategoryInstruction") }} </b-card-sub-title>
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
                                        no-body
                                        v-hover
                                        class="mt-1 list-group-item p-2"
                                        :style="new_supermarket.editmode ? 'cursor:move' : ''"
                                        v-for="c in supermarketCategory"
                                        v-bind:key="c.id"
                                        :border-variant="new_supermarket.editmode ? 'success' : ''"
                                    >
                                        <b-card-header class="p-2 border-0">
                                            <div class="row">
                                                <div class="col-2" v-if="new_supermarket.editmode">
                                                    <button type="button" class="btn btn-lg shadow-none"><i class="fas fa-arrows-alt-v"></i></button>
                                                </div>
                                                <div :class="new_supermarket.editmode ? 'col-10' : 'col-12'">
                                                    <h5 class="mt-1 mb-1">
                                                        {{ categoryName(c) }}
                                                        <b-button variant="link" class="p-0 m-0 float-right" @click="deleteCategory(c)">
                                                            <i class="btn fas fa-trash fa-lg px-2 text-danger" />
                                                        </b-button>
                                                    </h5>
                                                </div>
                                            </div>
                                        </b-card-header>
                                    </b-card>
                                </transition-group>
                            </draggable>
                            <hr style="height: 2px; background-color: black" v-if="new_supermarket.editmode" />
                            <b-card v-if="new_supermarket.editmode && notSupermarketCategory.length === 0" v-bind:key="-2" class="m-0 p-0 font-weight-bold no-body" border-variant="danger" />
                            <draggable
                                class="list-group"
                                :list="notSupermarketCategory"
                                group="category"
                                @start="drag = true"
                                @end="drag = false"
                                ghost-class="ghost"
                                v-if="new_supermarket.editmode"
                                v-bind="{ animation: 200 }"
                            >
                                <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                    <b-card no-body v-hover class="mt-1 list-group-item p-2" style="cursor: move" v-for="c in notSupermarketCategory" v-bind:key="c.id" :border-variant="'danger'">
                                        <b-card-header class="p-2 border-0">
                                            <div class="row">
                                                <div class="col-2" v-if="new_supermarket.editmode">
                                                    <button type="button" class="btn btn-lg shadow-none"><i class="fas fa-arrows-alt-v"></i></button>
                                                </div>
                                                <div :class="new_supermarket.editmode ? 'col-10' : 'col-12'">
                                                    <h5 class="mt-1 mb-1">
                                                        {{ categoryName(c) }}
                                                        <b-button variant="link" class="p-0 m-0 float-right" @click="deleteCategory(c)">
                                                            <i class="btn fas fa-trash fa-lg px-2 text-primary" />
                                                        </b-button>
                                                    </h5>
                                                </div>
                                            </div>
                                        </b-card-header>
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
                    <div class="col-12 col-md-8">
                        <b-card class="no-body">
                            <div class="row">
                                <div class="col col-md-6">{{ $t("mealplan_autoadd_shopping") }}</div>
                                <div class="col col-md-6 text-right">
                                    <input type="checkbox" class="form-control settings-checkbox" v-model="settings.mealplan_autoadd_shopping" @change="saveSettings" />
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
                                        <input type="checkbox" class="form-control settings-checkbox" v-model="settings.mealplan_autoexclude_onhand" @change="saveSettings" />
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
                                        <input type="checkbox" class="form-control settings-checkbox" v-model="settings.mealplan_autoinclude_related" @change="saveSettings" />
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
                                        @change="settings.shopping_share = $event.valsaveSettings()"
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
                                    <input type="number" class="form-control" v-model="settings.shopping_auto_sync" @change="saveSettings" />
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
                                    <input type="checkbox" class="form-control settings-checkbox" v-model="settings.shopping_add_onhand" @change="saveSettings" />
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
                                    <input type="number" class="form-control" v-model="settings.shopping_recent_days" @change="saveSettings" />
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
                                    <input type="checkbox" class="form-control settings-checkbox" v-model="settings.filter_to_supermarket" @change="saveSettings" />
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
                                    <input type="number" class="form-control" min="1" v-model="settings.default_delay" @change="saveSettings" />
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
                                    <input class="form-control" v-model="settings.csv_delim" @change="saveSettings" />
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
                                    <input class="form-control" v-model="settings.csv_prefix" @change="saveSettings" />
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
                                    <input type="checkbox" class="form-control settings-checkbox" v-model="settings.left_handed" @change="saveSettings" />
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
                    <b-button size="sm" variant="primary" class="mx-1" @click="resetFilters">{{ $t("Reset") }}</b-button>
                    <b-button size="sm" variant="secondary" class="mr-3" @click="$root.$emit('bv::hide::popover')">{{ $t("Close") }} </b-button>
                </div>
            </div>
        </b-popover>
        <ContextMenu ref="menu">
            <template #menu="{ contextData }">
                <ContextMenuItem>
                    <b-input-group>
                        <template #prepend>
                            <span class="dropdown-item p-2 text-decoration-none" style="user-select: none !important"><i class="fas fa-cubes"></i> {{ $t("MoveCategory") }}</span>
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
                    <a class="dropdown-item p-2" href="#"><i class="fas fa-hourglass"></i> {{ $t("DelayFor", { hours: delay }) }}</a>
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
                    <a class="dropdown-item p-2 text-danger" href="#"><i class="fas fa-trash"></i> {{ $t("Delete") }}</a>
                </ContextMenuItem>
            </template>
        </ContextMenu>
        <transition name="slided-fade">
            <div class="row fixed-bottom p-2 b-1 border-top text-center d-flex d-md-none" style="background: rgba(255, 255, 255, 0.6)" v-if="current_tab === 0">
                <div class="col-6">
                    <a class="btn btn-block btn-success shadow-none" @click="entrymode = !entrymode"
                        ><i class="fas fa-cart-plus"></i>
                        {{ $t("New Entry") }}
                    </a>
                </div>
                <div class="col-6">
                    <b-dropdown id="dropdown-dropup" block dropup variant="primary" class="shadow-none">
                        <template #button-content> <i class="fas fa-download"></i> {{ $t("Export") }} </template>
                        <DownloadPDF dom="#shoppinglist" name="shopping.pdf" :label="$t('download_pdf')" icon="far fa-file-pdf" />
                        <DownloadCSV :items="csvData" :delim="settings.csv_delim" name="shopping.csv" :label="$t('download_csv')" icon="fas fa-file-csv" />
                        <CopyToClipboard :items="csvData" :settings="settings" :label="$t('copy_to_clipboard')" icon="fas fa-clipboard-list" />
                        <CopyToClipboard :items="csvData" :settings="settings" format="table" :label="$t('copy_markdown_table')" icon="fab fa-markdown" />
                    </b-dropdown>
                </div>
            </div>
        </transition>
        <shopping-modal v-if="new_recipe.id" :recipe="new_recipe" :servings="parseInt(add_recipe_servings)" :modal_id="new_recipe.id" @finish="finishShopping" />
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import VueCookies from "vue-cookies"

import ContextMenu from "@/components/ContextMenu/ContextMenu"
import ContextMenuItem from "@/components/ContextMenu/ContextMenuItem"
import ShoppingLineItem from "@/components/ShoppingLineItem"
import DownloadPDF from "@/components/Buttons/DownloadPDF"
import DownloadCSV from "@/components/Buttons/DownloadCSV"
import CopyToClipboard from "@/components/Buttons/CopyToClipboard"
import GenericMultiselect from "@/components/GenericMultiselect"
import GenericPill from "@/components/GenericPill"
import LookupInput from "@/components/Modals/LookupInput"
import ShoppingModal from "@/components/Modals/ShoppingModal"
import draggable from "vuedraggable"

import { ApiMixin, getUserPreference, StandardToasts, makeToast } from "@/utils/utils"
import { ApiApiFactory } from "@/utils/openapi/api"

Vue.use(BootstrapVue)
Vue.use(VueCookies)
let SETTINGS_COOKIE_NAME = "shopping_settings"

export default {
    name: "ShoppingListView",
    mixins: [ApiMixin],
    components: {
        ContextMenu,
        ContextMenuItem,
        ShoppingLineItem,
        GenericMultiselect,
        GenericPill,
        draggable,
        LookupInput,
        DownloadPDF,
        DownloadCSV,
        CopyToClipboard,
        ShoppingModal,
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
            selected_supermarket: undefined,
            show_undefined_categories: true,
            supermarket_categories_only: false,
            shopcat: null,
            delay: 0,
            clear: Math.random(),
            entry_mode_simple: false,
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
            new_supermarket: { entrymode: false, value: undefined, editmode: undefined },
            new_category: { entrymode: false, value: undefined },
            autosync_id: undefined,
            auto_sync_running: false, // track to not start a new sync before old one was finished
            auto_sync_blocked: false, // blocking auto sync while request to check item is still running
            show_delay: false,
            drag: false,
            show_modal: false,
            fields: ["checked", "amount", "category", "unit", "food", "recipe", "details"],
            loading: true,
            entrymode: false,
            new_item: { amount: 1, unit: undefined, food: undefined, ingredient: undefined },
            online: true,
            new_recipe: {
                id: undefined,
            },
            add_recipe_servings: 1,
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
                shopping_list = shopping_list.filter((x) => !x.delay_until || !Date.parse(x?.delay_until) < new Date(Date.now()))
            }

            // if a supermarket is selected and filtered to only supermarket categories filter out everything else
            if (this.selected_supermarket && this.supermarket_categories_only) {
                let shopping_categories = this.supermarkets // category IDs configured on supermarket
                    .filter((x) => x.id === this.selected_supermarket)
                    .map((x) => x.category_to_supermarket)
                    .flat()
                    .map((x) => x.category.id)
                shopping_list = shopping_list.filter((x) => shopping_categories.includes(x?.food?.supermarket_category?.id))
                // if showing undefined is off, filter undefined
            } else if (!this.show_undefined_categories) {
                shopping_list = shopping_list.filter((x) => x?.food?.supermarket_category)
            }

            var groups = { false: {}, true: {} } // force unchecked to always be first
            if (this.selected_supermarket) {
                // TODO: make nulls_first a user setting
                groups.false[this.$t("Undefined")] = {}
                groups.true[this.$t("Undefined")] = {}
                let super_cats = this.supermarkets
                    .filter((x) => x.id === this.selected_supermarket)
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
            // hiding recipes associated with shopping list items that are complete
            return [...new Map(this.items.filter((x) => x.list_recipe && !x.checked).map((item) => [item["list_recipe"], item])).values()]
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
            localStorage.setItem("shopping_v2_selected_supermarket", JSON.stringify(this.selected_supermarket))
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
        "settings.default_delay": function (newVal, oldVal) {
            this.delay = Number(newVal)
        },
        entry_mode_simple(newVal) {
            this.$cookies.set(SETTINGS_COOKIE_NAME, newVal)
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
                this.entry_mode_simple = this.$cookies.get(SETTINGS_COOKIE_NAME)
                this.selected_supermarket = localStorage.getItem("shopping_v2_selected_supermarket") || undefined
            }
        })
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        addItem: function () {
            if (this.entry_mode_simple) {
                if (this.new_item.ingredient !== "" && this.new_item.ingredient !== undefined) {
                    this.genericPostAPI("api_ingredient_from_string", { text: this.new_item.ingredient }).then((result) => {
                        let unit = null
                        if (result.data.unit !== "") {
                            unit = { name: result.data.unit }
                        }

                        this.new_item = {
                            amount: result.data.amount,
                            unit: unit,
                            food: { name: result.data.food },
                        }
                        this.addEntry()
                    })
                }
            } else {
                this.addEntry()
            }
        },
        addEntry: function (x) {
            let api = new ApiApiFactory()
            api.createShoppingListEntry(this.new_item)
                .then((results) => {
                    if (results?.data) {
                        this.items.push(results.data)
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    } else {
                        console.log("no data returned")
                    }
                    this.new_item = { amount: 1, unit: undefined, food: undefined, ingredient: undefined }
                    this.clear += 1
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                })
        },
        deleteSupermarket: function (s) {
            let api = new ApiApiFactory()
            api.destroySupermarket(s.id)
                .then(() => {
                    this.getSupermarkets()
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                })
        },
        deleteCategory: function (c) {
            // could be category relation or a catory
            let c_id = c?.category?.id ?? c.id
            let api = new ApiApiFactory()
            api.destroySupermarketCategory(c_id)
                .then(() => {
                    this.getSupermarkets()
                    this.getShoppingCategories()
                    this.new_supermarket.value.category_to_supermarket = this.new_supermarket.value.category_to_supermarket.filter((x) => x.category.id != c_id)
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
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
                        if (!this.auto_sync_blocked) {
                            this.mergeShoppingList(results.data)
                        }
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
                        return { ...x, food: { ...x.food, supermarket_category: supermarket_category } }
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
                        api.destroyShoppingListEntry(x).then((result) => {})
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
            this.auto_sync_blocked = true
            let promises = []
            update.entries.forEach((x) => {
                const id = x?.id ?? x
                let completed_at = undefined
                if (update.checked) {
                    completed_at = new Date().toISOString()
                }
                promises.push(this.saveThis({ id: id, checked: update.checked }, false))

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
                    console.log(err, err.response)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
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
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
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
        addRecipeToShopping() {
            this.$bvModal.show(`shopping_${this.new_recipe.id}`)
        },
        finishShopping() {
            this.getShoppingList()
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
  /* .slider-fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
}

.form-control-append {
    font-size: 20px;
}

@media (max-width: 768px) {
    #shoppinglist {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-y: scroll;
        overflow-x: hidden;
        height: 65vh;
        padding-right: 8px !important;
    }
}

.settings-checkbox {
    font-size: 0.3rem;
}
</style>
