<template>
    <div id="app" style="margin-bottom: 4vh">
        <RecipeSwitcher ref="ref_recipe_switcher" />
        <div class="row">
            <div class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1">
                <div class="row">
                    <div class="col col-md-12">
                        <div class="row justify-content-center">
                            <div class="col-12 col-lg-10 col-xl-8 mt-3 mb-3">
                                <b-input-group>
                                    <b-input class="form-control form-control-lg form-control-borderless form-control-search" v-model="search.search_input" v-bind:placeholder="$t('Search')"></b-input>
                                    <b-input-group-append>
                                        <b-button v-b-tooltip.hover :title="$t('show_sql')" @click="showSQL()" v-if="debug && ui.sql_debug">
                                            <i class="fas fa-bug" style="font-size: 1.5em"></i>
                                        </b-button>
                                        <b-button variant="light" v-b-tooltip.hover :title="$t('Random Recipes')" @click="openRandom()">
                                            <i class="fas fa-dice-five" style="font-size: 1.5em"></i>
                                        </b-button>
                                        <b-button v-b-toggle.collapse_advanced_search v-b-tooltip.hover :title="$t('Advanced Settings')" v-bind:variant="searchFiltered(true) ? 'danger' : 'primary'">
                                            <!-- TODO consider changing this icon to a filter -->
                                            <i class="fas fa-caret-down" v-if="!search.advanced_search_visible"></i>
                                            <i class="fas fa-caret-up" v-if="search.advanced_search_visible"></i>
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </div>
                        </div>

                        <b-collapse id="collapse_advanced_search" class="mt-2 shadow-sm" v-model="search.advanced_search_visible">
                            <div class="card">
                                <div class="card-body p-4">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <a class="btn btn-primary btn-block text-uppercase" :href="resolveDjangoUrl('new_recipe')">{{ $t("New_Recipe") }}</a>
                                        </div>
                                        <div class="col-md-3">
                                            <a class="btn btn-primary btn-block text-uppercase" :href="resolveDjangoUrl('data_import_url')">{{ $t("Import") }}</a>
                                        </div>
                                        <div class="col-md-3">
                                            <button
                                                class="btn btn-block text-uppercase"
                                                v-b-tooltip.hover
                                                :title="$t('show_only_internal')"
                                                v-bind:class="{ 'btn-success': search.search_internal, 'btn-primary': !search.search_internal }"
                                                @click="
                                                    search.search_internal = !search.search_internal
                                                    refreshData()
                                                "
                                            >
                                                <!-- TODO is this the right place to refresh data?  or deep watch on this.search?? -->
                                                {{ $t("Internal") }}
                                            </button>
                                        </div>

                                        <div class="col-md-3">
                                            <button id="id_settings_button" class="btn btn-primary btn-block text-uppercase"><i class="fas fa-cog fa-lg m-1"></i></button>
                                        </div>
                                    </div>
                                    <div v-if="ui.enable_expert" class="row justify-content-end small">
                                        <div class="col-auto">
                                            <b-button class="my-0" variant="link" size="sm" @click="search.expert_mode = !search.expert_mode">
                                                <div v-if="!expertMode">{{ $t("expert_mode") }}</div>
                                                <div v-if="expertMode">{{ $t("simple_mode") }}</div>
                                            </b-button>
                                        </div>
                                    </div>

                                    <b-popover target="id_settings_button" triggers="click" placement="bottom">
                                        <b-tabs content-class="mt-1 text-nowrap" small>
                                            <b-tab :title="$t('Settings')" active :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('Recently_Viewed')" label-for="popover-input-1" label-cols="6" class="mb-1">
                                                    <b-form-input type="number" v-model="ui.recently_viewed" id="popover-input-1" size="sm"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Recipes_per_page')" label-for="popover-input-page-count" label-cols="6" class="mb-1">
                                                    <b-form-input type="number" v-model="ui.page_size" id="popover-input-page-count" size="sm"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Meal_Plan')" label-for="popover-input-2" label-cols="6" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_meal_plan" id="popover-input-2" size="sm"></b-form-checkbox>
                                                </b-form-group>

                                                <b-form-group v-if="ui.show_meal_plan" v-bind:label="$t('Meal_Plan_Days')" label-for="popover-input-5" label-cols="6" class="mb-1">
                                                    <b-form-input type="number" v-model="ui.meal_plan_days" id="popover-input-5" size="sm"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Sort_by_new')" label-for="popover-input-3" label-cols="6" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.sort_by_new" id="popover-input-3" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <div class="row" style="margin-top: 1vh">
                                                    <div class="col-12">
                                                        <a :href="resolveDjangoUrl('view_settings') + '#search'">{{ $t("Search Settings") }}</a>
                                                    </div>
                                                </div>
                                            </b-tab>
                                            <b-tab :title="$t('fields')" :title-link-class="['mx-0']" v-if="ui.enable_expert">
                                                <b-form-group v-bind:label="$t('show_keywords')" label-for="popover-show_keywords" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_keywords" id="popover-show_keywords" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_foods')" label-for="popover-show_foods" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_foods" id="popover-show_foods" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_books')" label-for="popover-input-show_books" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_books" id="popover-input-show_books" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_rating')" label-for="popover-show_rating" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_rating" id="popover-show_rating" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('show_units')" label-for="popover-show_units" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_units" id="popover-show_units" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('show_filters')" label-for="popover-show_filters" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_filters" id="popover-show_filters" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('show_sortby')" label-for="popover-show_sortby" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_sortby" id="popover-show_sortby" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('times_cooked')" label-for="popover-show_sortby" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_timescooked" id="popover-show_cooked" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('make_now')" label-for="popover-show_sortby" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_makenow" id="popover-show_makenow" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.enable_expert" v-bind:label="$t('last_cooked')" label-for="popover-show_sortby" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_lastcooked" id="popover-show_lastcooked" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                            </b-tab>

                                            <b-tab :title="$t('advanced')" :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('remember_search')" label-for="popover-rem-search" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.remember_search" id="popover-rem-search" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="ui.remember_search" v-bind:label="$t('remember_hours')" label-for="popover-input-rem-hours" label-cols="8" class="mb-1">
                                                    <b-form-input type="number" v-model="ui.remember_hours" id="popover-rem-hours" size="sm"></b-form-input>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('tree_select')" label-for="popover-input-treeselect" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.tree_select" id="popover-input-treeselect" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('enable_expert')" label-for="popover-input-expert" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.enable_expert" id="popover-input-expert" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-if="debug" v-bind:label="$t('sql_debug')" label-for="popover-input-sqldebug" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.sql_debug" id="popover-input-sqldebug" size="sm"></b-form-checkbox>
                                                </b-form-group>
                                            </b-tab>
                                        </b-tabs>

                                        <div class="row" style="margin-top: 1vh">
                                            <div class="col-12" style="text-align: right">
                                                <b-button size="sm" variant="secondary" style="margin-right: 8px" @click="$root.$emit('bv::hide::popover')">{{ $t("Close") }} </b-button>
                                            </div>
                                        </div>
                                    </b-popover>

                                    <!-- custom filters filter -->
                                    <div class="row" v-if="ui.show_filters || ui.show_sortby">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <generic-multiselect
                                                    v-if="ui.show_filters"
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_filter"
                                                    :initial_single_selection="search.search_filter"
                                                    :model="Models.CUSTOM_FILTER"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Custom Filter')"
                                                    :multiple="false"
                                                    :limit="50"
                                                />
                                                <multiselect
                                                    v-if="ui.show_sortby"
                                                    v-model="search.sort_order"
                                                    :options="sortOptions"
                                                    :multiple="true"
                                                    :hide-selected="true"
                                                    :internal-search="false"
                                                    @input="refreshData(false)"
                                                    label="text"
                                                    track-by="id"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('sort_by')"
                                                />
                                            </b-input-group>
                                        </div>
                                    </div>
                                    <!-- keywords filter -->
                                    <h6 class="mb-0" v-if="search.expert_mode && search.keywords_fields > 1">{{ $t("Keywords") }}</h6>
                                    <div class="row" v-if="ui.show_keywords">
                                        <div class="col-12">
                                            <b-input-group class="mt-2" v-for="(k, a) in keywordFields" :key="a">
                                                <template #prepend v-if="search.expert_mode">
                                                    <b-input-group-text style="width: 3em" @click="search.keywords_fields = search.keywords_fields + 1">
                                                        <i class="fas fa-plus-circle text-primary" v-if="k == search.keywords_fields && k < 4" />
                                                    </b-input-group-text>
                                                    <b-input-group-text
                                                        style="width: 3em"
                                                        @click="
                                                            search.keywords_fields = search.keywords_fields - 1
                                                            search.search_keywords[a].items = []
                                                            refreshData(false)
                                                        "
                                                    >
                                                        <i class="fas fa-minus-circle text-primary" v-if="k == search.keywords_fields && k > 1" />
                                                    </b-input-group-text>
                                                </template>
                                                <treeselect
                                                    v-if="ui.tree_select"
                                                    v-model="search.search_keywords[a].items"
                                                    :options="facets.Keywords"
                                                    :load-options="loadKeywordChildren"
                                                    :multiple="true"
                                                    :flat="true"
                                                    :auto-load-root-options="false"
                                                    searchNested
                                                    :placeholder="$t('Keywords')"
                                                    :normalizer="normalizer"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <generic-multiselect
                                                    v-if="!ui.tree_select"
                                                    @change="genericSelectChanged"
                                                    :parent_variable="`search_keywords::${a}`"
                                                    :initial_selection="search.search_keywords[a].items"
                                                    :model="Models.KEYWORD"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Keywords')"
                                                    :limit="50"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_keywords[a].operator"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.search_keywords[a].operator">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="search.expert_mode">
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_keywords[a].not" name="check-button" @change="refreshData(false)" class="shadow-none">
                                                            <span class="text-uppercase">{{ $t("not") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- foods filter -->
                                    <h6 class="mt-2 mb-0" v-if="search.expert_mode && search.foods_fields > 1">{{ $t("Foods") }}</h6>
                                    <div class="row" v-if="ui.show_foods">
                                        <div class="col-12">
                                            <b-input-group class="mt-2" v-for="(x, i) in foodFields" :key="i">
                                                <template #prepend v-if="search.expert_mode">
                                                    <b-input-group-text style="width: 3em" @click="search.foods_fields = search.foods_fields + 1">
                                                        <i class="fas fa-plus-circle text-primary" v-if="x == search.foods_fields && x < 4" />
                                                    </b-input-group-text>
                                                    <b-input-group-text
                                                        style="width: 3em"
                                                        @click="
                                                            search.foods_fields = search.foods_fields - 1
                                                            search.search_foods[i].items = []
                                                            refreshData(false)
                                                        "
                                                    >
                                                        <i class="fas fa-minus-circle text-primary" v-if="x == search.foods_fields && x > 1" />
                                                    </b-input-group-text>
                                                </template>
                                                <treeselect
                                                    v-if="ui.tree_select"
                                                    v-model="search.search_foods[i].items"
                                                    :options="facets.Foods"
                                                    :load-options="loadFoodChildren"
                                                    :multiple="true"
                                                    :flat="true"
                                                    :auto-load-root-options="false"
                                                    searchNested
                                                    :placeholder="$t('Foods')"
                                                    :normalizer="normalizer"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <generic-multiselect
                                                    v-if="!ui.tree_select"
                                                    @change="genericSelectChanged"
                                                    :parent_variable="`search_foods::${i}`"
                                                    :initial_selection="search.search_foods[i].items"
                                                    :model="Models.FOOD"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Foods')"
                                                    :limit="50"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_foods[i].operator" name="check-button" @change="refreshData(false)" class="shadow-none" switch style="width: 4em">
                                                            <span class="text-uppercase" v-if="search.search_foods[i].operator">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="search.expert_mode">
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_foods[i].not" name="check-button" @change="refreshData(false)" class="shadow-none">
                                                            <span class="text-uppercase">{{ $t("not") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- books filter -->
                                    <h6 class="mt-2 mb-0" v-if="search.expert_mode && search.books_fields > 1">{{ $t("Books") }}</h6>
                                    <div class="row" v-if="ui.show_books">
                                        <div class="col-12">
                                            <b-input-group class="mt-2" v-for="(x, i) in bookFields" :key="i">
                                                <template #prepend v-if="search.expert_mode">
                                                    <b-input-group-text style="width: 3em" @click="search.books_fields = search.books_fields + 1">
                                                        <i class="fas fa-plus-circle text-primary" v-if="x == search.books_fields && x < 4" />
                                                    </b-input-group-text>
                                                    <b-input-group-text
                                                        style="width: 3em"
                                                        @click="
                                                            search.books_fields = search.books_fields - 1
                                                            search.search_books[i].items = []
                                                            refreshData(false)
                                                        "
                                                    >
                                                        <i class="fas fa-minus-circle text-primary" v-if="x == search.books_fields && x > 1" />
                                                    </b-input-group-text>
                                                </template>
                                                <generic-multiselect
                                                    @change="genericSelectChanged"
                                                    :parent_variable="`search_books::${i}`"
                                                    :initial_selection="search.search_books[i].items"
                                                    :model="Models.RECIPE_BOOK"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    v-bind:placeholder="$t('Books')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_books[i].operator" name="check-button" @change="refreshData(false)" class="shadow-none" style="width: 4em" switch>
                                                            <span class="text-uppercase" v-if="search.search_books[i].operator">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="search.expert_mode">
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_books[i].not" name="check-button" @change="refreshData(false)" class="shadow-none">
                                                            <span class="text-uppercase">{{ $t("not") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- ratings filter -->
                                    <div class="row g-0" v-if="ui.show_rating">
                                        <div class="col-12" v-if="ui.show_rating">
                                            <b-input-group class="mt-2">
                                                <treeselect
                                                    v-model="search.search_rating"
                                                    :options="ratingOptions"
                                                    :flat="true"
                                                    :placeholder="$t('Ratings')"
                                                    :searchable="false"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_rating_gte" name="check-button" @change="refreshData(false)" class="shadow-none" switch style="width: 4em">
                                                            <span class="text-uppercase" v-if="search.search_rating_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>
                                    <!-- units filter -->
                                    <div class="row" v-if="ui.show_units">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <generic-multiselect
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_units"
                                                    :initial_selection="search.search_units"
                                                    :model="Models.UNIT"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    v-bind:placeholder="$t('Units')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_units_or" name="check-button" @change="refreshData(false)" class="shadow-none" style="width: 4em" switch>
                                                            <span class="text-uppercase" v-if="search.search_units_or">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- special switches -->
                                    <div class="row g-0" v-if="ui.show_timescooked || ui.show_makenow || ui.show_lastcooked">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <!-- times cooked -->
                                                <b-input-group-prepend is-text v-if="ui.show_timescooked">
                                                    {{ $t("times_cooked") }}
                                                </b-input-group-prepend>
                                                <b-form-input id="timescooked" type="number" min="0" v-model="search.timescooked" v-if="ui.show_timescooked"></b-form-input>
                                                <b-input-group-append v-if="ui.show_timescooked">
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.timescooked_gte" name="check-button" @change="refreshData(false)" class="shadow-none" switch style="width: 4em">
                                                            <span class="text-uppercase" v-if="search.timescooked_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <!-- date cooked -->
                                                <b-input-group-append v-if="ui.show_lastcooked">
                                                    <b-form-datepicker
                                                        v-model="search.lastcooked"
                                                        :max="yesterday"
                                                        no-highlight-today
                                                        reset-button
                                                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                                        :locale="locale"
                                                        :placeholder="$t('last_cooked')"
                                                        @input="refreshData(false)"
                                                    />
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.lastcooked_gte" name="check-button" @change="refreshData(false)" class="shadow-none" switch style="width: 4em">
                                                            <span class="text-uppercase" v-if="search.lastcooked_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <!-- make now -->
                                                <b-input-group-append v-if="ui.show_makenow">
                                                    <b-input-group-text>
                                                        {{ $t("make_now") }}
                                                        <b-form-checkbox v-model="search.makenow" name="check-button" @change="refreshData(false)" class="shadow-none" switch style="width: 4em" />
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>
                                    <div v-if="ui.enable_expert && searchFiltered(false)" class="row justify-content-end small">
                                        <div class="col-auto">
                                            <b-button class="my-0" variant="link" size="sm" @click="saveSearch">
                                                <div>{{ $t("save_filter") }}</div>
                                            </b-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                </div>

                <div class="row align-content-center">
                    <div class="col col-md-6" style="margin-top: 2vh">
                        <b-dropdown id="sortby" :text="$t('sort_by')" variant="link" toggle-class="text-decoration-none " class="m-0 p-0">
                            <div v-for="o in sortOptions" :key="o.id">
                                <b-dropdown-item
                                    v-on:click="
                                        search.sort_order = [o]
                                        refreshData(false)
                                    "
                                >
                                    {{ o.text }}
                                </b-dropdown-item>
                            </div>
                        </b-dropdown>
                    </div>
                    <div class="col col-md-6 text-right" style="margin-top: 2vh">
                        <span class="text-muted">
                            {{ $t("Page") }} {{ search.pagination_page }}/{{ Math.ceil(pagination_count / ui.page_size) }}
                            <a href="#" @click="resetSearch()"><i class="fas fa-times-circle"></i> {{ $t("Reset") }}</a>
                        </span>
                    </div>
                </div>

                <div class="row">
                    <div class="col col-md-12">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); grid-gap: 0.8rem">
                            <template v-if="searchFiltered()">
                                <recipe-card v-bind:key="`mp_${m.id}`" v-for="m in meal_plans" :recipe="m.recipe" :meal_plan="m" :footer_text="m.meal_type_name" footer_icon="far fa-calendar-alt"></recipe-card>
                            </template>
                            <recipe-card v-for="r in recipes" v-bind:key="r.id" :recipe="r" :footer_text="isRecentOrNew(r)[0]" :footer_icon="isRecentOrNew(r)[1]"></recipe-card>
                        </div>
                    </div>
                </div>

                <div class="row" style="margin-top: 2vh" v-if="!random_search">
                    <div class="col col-md-12">
                        <b-pagination pills v-model="search.pagination_page" :total-rows="pagination_count" :per-page="ui.page_size" @change="pageChange" align="center"></b-pagination>
                    </div>
                </div>
            </div>
            <div class="col-md-2 d-none d-md-block"></div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import VueCookies from "vue-cookies"
import "bootstrap-vue/dist/bootstrap-vue.css"

import moment from "moment"
import _debounce from "lodash/debounce"
import Multiselect from "vue-multiselect"
import { Treeselect, LOAD_CHILDREN_OPTIONS } from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

import { ApiMixin, ResolveUrlMixin, StandardToasts, ToastMixin } from "@/utils/utils"
import LoadingSpinner from "@/components/LoadingSpinner" // TODO: is this deprecated?
import RecipeCard from "@/components/RecipeCard"
import GenericMultiselect from "@/components/GenericMultiselect"
import RecipeSwitcher from "@/components/Buttons/RecipeSwitcher"

Vue.use(VueCookies)
Vue.use(BootstrapVue)

let SEARCH_COOKIE_NAME = "search_settings2"
let UI_COOKIE_NAME = "ui_search_settings"

export default {
    name: "RecipeSearchView",
    mixins: [ResolveUrlMixin, ApiMixin, ToastMixin],
    components: { GenericMultiselect, RecipeCard, Treeselect, RecipeSwitcher, Multiselect },
    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            recipes: [],
            facets: {},
            meal_plans: [],
            last_viewed_recipes: [],
            sortMenu: false,

            search: {
                advanced_search_visible: false,
                search_input: "",
                search_internal: false,
                search_keywords: [
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                ],
                search_foods: [
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                ],
                search_books: [
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                    { items: [], operator: true, not: false },
                ],
                search_units: [],
                search_rating: undefined,
                search_rating_gte: true,
                search_units_or: true,
                search_filter: undefined,
                timescooked: undefined,
                timescooked_gte: true,
                makenow: false,
                lastcooked: undefined,
                lastcooked_gte: true,
                sort_order: [],
                pagination_page: 1,
                expert_mode: false,
                keywords_fields: 1,
                foods_fields: 1,
                books_fields: 1,
                rating_fields: 1,
                units_fields: 1,
            },
            ui: {
                show_meal_plan: true,
                meal_plan_days: 0,
                recently_viewed: 5,
                sort_by_new: true,
                page_size: 25,
                remember_search: true,
                remember_hours: 4,
                sql_debug: false,
                tree_select: false,
                enable_expert: false,
                show_keywords: true,
                show_foods: true,
                show_books: true,
                show_rating: true,
                show_units: false,
                show_filters: false,
                show_sortby: false,
                show_timescooked: false,
                show_makenow: false,
                show_lastcooked: false,
                include_children: true,
            },
            pagination_count: 0,
            random_search: false,
            debug: false,
        }
    },
    computed: {
        locale: function () {
            return window.CUSTOM_LOCALE
        },
        yesterday: function () {
            const now = new Date()
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        },
        ratingOptions: function () {
            let ratingCount = undefined
            let label = undefined
            if (Object.keys(this.facets?.Ratings ?? {}).length === 0) {
                ratingCount = (x) => {
                    return ""
                }
            } else {
                ratingCount = (x) => {
                    return ` (${x}) `
                }
            }

            if (this.search.search_rating_gte) {
                label = (x) => {
                    if (x == 5) {
                        return ""
                    } else {
                        return this.$t("and_up")
                    }
                }
            } else {
                label = (x) => {
                    if (x == 1) {
                        return ""
                    } else {
                        return this.$t("and_down")
                    }
                }
            }

            return [
                { id: 5, label: "⭐⭐⭐⭐⭐" + ratingCount(this.facets.Ratings?.["5.0"] ?? 0) + label(5) },
                { id: 4, label: "⭐⭐⭐⭐ " + ratingCount(this.facets.Ratings?.["4.0"] ?? 0) + label() },
                { id: 3, label: "⭐⭐⭐ " + ratingCount(this.facets.Ratings?.["3.0"] ?? 0) + label() },
                { id: 2, label: "⭐⭐ " + ratingCount(this.facets.Ratings?.["2.0"] ?? 0) + label() },
                { id: 1, label: "⭐ " + ratingCount(this.facets.Ratings?.["1.0"] ?? 0) + label(1) },
                { id: 0, label: this.$t("Unrated") + ratingCount(this.facets.Ratings?.["0.0"] ?? 0) },
            ]
        },
        expertMode: function () {
            return this.ui.enable_expert && this.search.expert_mode
        },
        keywordFields: function () {
            return !this.expertMode ? 1 : this.search.keywords_fields
        },
        foodFields: function () {
            return !this.expertMode ? 1 : this.search.foods_fields
        },
        bookFields: function () {
            return !this.expertMode ? 1 : this.search.books_fields
        },
        ratingFields: function () {
            return !this.expertMode ? 1 : this.search.rating_fields
        },
        unitFields: function () {
            return !this.expertMode ? 1 : this.search.units_fields
        },
        sortOptions: function () {
            let sort_order = []
            let x = 1
            const field = [
                [this.$t("search_rank"), "score"],
                [this.$t("Name"), "name"],
                [this.$t("last_cooked"), "lastcooked"],
                [this.$t("Rating"), "rating"],
                [this.$t("times_cooked"), "favorite"],
                [this.$t("date_created"), "created_at"],
                [this.$t("date_viewed"), "lastviewed"],
            ]
            field.forEach((f) => {
                sort_order.push(
                    {
                        id: x,
                        text: `${f[0]} ↑`,
                        value: f[1],
                    },
                    {
                        id: x + 1,
                        text: `${f[0]} ↓`,
                        value: `-${f[1]}`,
                    }
                )
                x = x + 2
            })
            return sort_order
        },
    },
    mounted() {
        this.$nextTick(function () {
            if (this.$cookies.isKey(UI_COOKIE_NAME)) {
                this.ui = Object.assign({}, this.ui, this.$cookies.get(UI_COOKIE_NAME))
            }
            if (this.ui.remember_search && this.$cookies.isKey(SEARCH_COOKIE_NAME)) {
                this.search = Object.assign({}, this.search, this.$cookies.get(SEARCH_COOKIE_NAME))
            }
            let urlParams = new URLSearchParams(window.location.search)

            if (urlParams.has("keyword")) {
                this.search.search_keywords[0].items = []
                this.facets.Keywords = []
                for (let x of urlParams.getAll("keyword")) {
                    this.search.search_keywords[0].items.push(Number.parseInt(x))
                    this.facets.Keywords.push({ id: x, name: "loading..." })
                }
            } else {
                this.facets.Keywords = []
            }

            // TODO: figure out how to find nested items and load keyword/food children for that branch
            // probably a backend change in facets to pre-load children of nested items
            this.facets.Foods = []
            for (let x of this.search.search_foods.map((x) => x.items).flat()) {
                this.facets.Foods.push({ id: x, name: "loading..." })
            }

            for (let x of this.search.search_keywords.map((x) => x.items).flat()) {
                this.facets.Keywords.push({ id: x, name: "loading..." })
            }

            this.facets.Books = []
            for (let x of this.search.search_books.map((x) => x.items).flat()) {
                this.facets.Books.push({ id: x, name: "loading..." })
            }

            this.loadMealPlan()
            this.refreshData(false)
        })
        this.$i18n.locale = window.CUSTOM_LOCALE
        this.debug = localStorage.getItem("DEBUG") == "True" || false
    },
    watch: {
        search: {
            handler() {
                this.$cookies.set(SEARCH_COOKIE_NAME, this.search, `${this.ui.remember_hours}h`)
            },
            deep: true,
        },
        ui: {
            handler() {
                this.$cookies.set(UI_COOKIE_NAME, this.ui)
            },
            deep: true,
        },
        "search.search_input": _debounce(function () {
            this.search.pagination_page = 1
            this.pagination_count = 0
            this.refreshData(false)
        }, 300),
        "search.timescooked": function () {
            this.refreshData(false)
        },
        "ui.show_meal_plan": function () {
            this.loadMealPlan()
        },
        "ui.meal_plan_days": function () {
            this.loadMealPlan()
        },
        "ui.recently_viewed": function () {
            this.refreshData(false)
        },
        "ui.tree_select": function () {
            if (this.ui.tree_select && (this.facets?.Keywords.length == 0 || this.facets?.Foods.length == 0) && this.facets?.cache_key) {
                this.getFacets(this.facets?.cache_key)
            }
        },
        "ui.page_size": _debounce(function () {
            this.refreshData(false)
        }, 300),
        expertMode: function (newVal, oldVal) {
            if (!newVal) {
                this.search.search_keywords = this.search.search_keywords.map((x) => {
                    return { ...x, not: false }
                })
                this.search.search_foods = this.search.search_foods.map((x) => {
                    return { ...x, not: false }
                })
                this.search.search_books = this.search.search_books.map((x) => {
                    return { ...x, not: false }
                })
            }
        },
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        refreshData: _debounce(function (random) {
            let params = this.buildParams(random)
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params)
                .then((result) => {
                    window.scrollTo(0, 0)
                    this.pagination_count = result.data.count

                    this.facets = result.data.facets
                    this.recipes = [...this.removeDuplicates(result.data.results, (recipe) => recipe.id)]
                    if (!this.searchFiltered()) {
                        // if meal plans are being shown (and only when search is unfiltered) - filter out any meal plan recipes from the recipe list
                        let mealPlans = []
                        this.meal_plans.forEach((x) => mealPlans.push(x.recipe.id))
                        this.recipes = this.recipes.filter((recipe) => !mealPlans.includes(recipe.id))
                    }
                })
                .then(() => {
                    this.$nextTick(function () {
                        this.getFacets(this.facets?.cache_key)
                    })
                })
        }, 300),
        openRandom: function () {
            this.refreshData(true)
        },
        removeDuplicates: function (data, key) {
            return [...new Map(data.map((item) => [key(item), item])).values()]
        },
        loadMealPlan: function () {
            if (this.ui.show_meal_plan) {
                let params = {
                    options: {
                        query: {
                            from_date: moment().format("YYYY-MM-DD"),
                            to_date: moment().add(this.ui.meal_plan_days, "days").format("YYYY-MM-DD"),
                        },
                    },
                }
                this.genericAPI(this.Models.MEAL_PLAN, this.Actions.LIST, params).then((result) => {
                    this.meal_plans = result.data
                })
            } else {
                this.meal_plans = []
            }
        },
        genericSelectChanged: function (obj) {
            if (obj.var.includes("::")) {
                let x = obj.var.split("::")
                this.search[x[0]][x[1]].items = obj.val
            } else {
                this.search[obj.var] = obj.val
            }
            // if selecting a filter, reset all current selections
            if (obj.var === "search_filter") {
                this.resetSearch(this.search.search_filter)
            } else {
                this.refreshData(false)
            }
        },
        resetSearch: function (filter = undefined) {
            this.search.search_keywords = this.search.search_keywords.map((x) => {
                return { ...x, items: [] }
            })
            this.search.search_foods = this.search.search_foods.map((x) => {
                return { ...x, items: [] }
            })
            this.search.search_books = this.search.search_books.map((x) => {
                return { ...x, items: [] }
            })
            this.search.search_input = filter?.query ?? ""
            this.search.search_internal = filter?.internal ?? false
            this.search.search_units = filter?.units ?? []
            this.search.search_rating = filter?.rating ?? undefined
            this.search.sort_order = filter?.options?.query?.sort_order ?? []
            this.search.pagination_page = 1
            this.search.timescooked = undefined
            this.search.makenow = false
            this.search.lastcooked = undefined

            let fieldnum = {
                keywords: 1,
                foods: 1,
                books: 1,
            }

            if (filter) {
                // this can be simplified by calling recipe API {query: {filter: filter_id}} but you lose loading all of the params into the UI
                filter = JSON.parse(filter.search)
                let fields = ["keywords", "foods", "books"]
                let operators = ["_or", "_and", "_or_not", "_and_not"]
                fields.forEach((field) => {
                    let x = 0
                    operators.forEach((operator) => {
                        if (filter[`${field}${operator}`].length > 0) {
                            this.search[`search_${field}`][x].items = filter[`${field}${operator}`]
                            this.search[`search_${field}`][x].operator = operator.includes("or")
                            this.search[`search_${field}`][x].not = operator.includes("not")
                            x = x + 1
                        }
                    })
                    fieldnum[field] = fieldnum[field] + x
                })
            } else {
                this.search.search_filter = undefined
            }

            this.search.keywords_fields = fieldnum["keywords"]
            this.search.foods_fields = fieldnum["foods"]
            this.search.books_fields = fieldnum["books"]
            // this.search.rating_fields = 1
            // this.search.units_fields = 1
            this.refreshData(false)
        },
        pageChange: function (page) {
            this.search.pagination_page = page
            this.refreshData(false)
        },
        normalizer(node) {
            let count = node?.count ? " (" + node.count + ")" : ""
            return {
                id: node.id,
                label: node.name + count,
                children: node.children,
                isDefaultExpanded: node.isDefaultExpanded,
            }
        },
        isRecentOrNew: function (x) {
            let recent_recipe = [this.$t("Recently_Viewed"), "fas fa-eye"]
            let new_recipe = [this.$t("New_Recipe"), "fas fa-splotch"]
            if (x.new) {
                return new_recipe
            } else if (x.recent) {
                return recent_recipe
            } else {
                return [undefined, undefined]
            }
        },
        getFacets: function (hash, facet, id) {
            if (!this.ui.tree_select) {
                return
            }
            let params = { hash: hash }
            if (facet) {
                params[facet] = id
            }
            return this.genericGetAPI("api_get_facets", params).then((response) => {
                this.facets = { ...this.facets, ...response.data.facets }
            })
        },
        showSQL: function () {
            let params = this.buildParams()
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params).then((result) => {})
        },
        // TODO refactor to combine with load KeywordChildren
        loadFoodChildren({ action, parentNode, callback }) {
            if (action === LOAD_CHILDREN_OPTIONS) {
                if (this.facets?.cache_key) {
                    this.getFacets(this.facets.cache_key, "food", parentNode.id).then(callback())
                }
            }
        },
        loadKeywordChildren({ action, parentNode, callback }) {
            if (action === LOAD_CHILDREN_OPTIONS) {
                if (this.facets?.cache_key) {
                    this.getFacets(this.facets.cache_key, "keyword", parentNode.id).then(callback())
                }
            }
        },
        applyFilter() {
            return
        },
        buildParams: function (random) {
            this.random_search = random
            let rating = this.search.search_rating
            if (rating !== undefined && !this.search.search_rating_gte) {
                rating = rating * -1
            }
            let lastcooked = this.search.lastcooked || undefined
            if (lastcooked !== undefined && !this.search.lastcooked_gte) {
                lastcooked = "-" + lastcooked
            }
            let timescooked = parseInt(this.search.timescooked)
            if (isNaN(timescooked)) {
                timescooked = undefined
            } else if (!this.search.timescooked_gte) {
                timescooked = timescooked * -1
            }
            // when a filter is selected - added search params will be added to the filter
            let params = {
                options: { query: {} },
                ...this.addFields("keywords"),
                ...this.addFields("foods"),
                ...this.addFields("books"),
                units: this.search.search_units,
                query: this.search.search_input,
                rating: rating,
                internal: this.search.search_internal,
                random: this.random_search,
                _new: this.ui.sort_by_new,
                timescooked: timescooked,
                makenow: this.search.makenow || undefined,
                lastcooked: lastcooked,
                page: this.search.pagination_page,
                pageSize: this.ui.page_size,
            }

            params.options.query = {
                sort_order: this.search.sort_order.map((x) => x.value),
                include_children: this.ui.include_children,
            }
            if (!this.searchFiltered()) {
                params.options.query.last_viewed = this.ui.recently_viewed
            }
            return params
        },
        searchFiltered: function (ignore_string = false) {
            let filtered =
                this.search?.search_keywords?.[0]?.items?.length !== 0 ||
                this.search?.search_foods?.[0]?.items?.length !== 0 ||
                this.search?.search_books?.[0]?.items?.length !== 0 ||
                this.search?.search_units?.length !== 0 ||
                this.random_search ||
                this.search?.search_filter ||
                this.search.sort_order.length !== 0 ||
                this.search?.search_rating !== undefined ||
                (this.search.timescooked !== undefined && this.search.timescooked !== "") ||
                this.search.makenow !== false ||
                (this.search.lastcooked !== undefined && this.search.lastcooked !== "")

            if (ignore_string) {
                return filtered
            } else {
                return filtered || this.search?.search_input != ""
            }
        },
        addFields(field) {
            let fieldlist = this.search[`search_${field}`].slice(0, this.search[`${field}_fields`])
            return {
                [`${field}_or`]: fieldlist
                    .filter((x) => x.operator == true && x.not == false)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
                [`${field}_and`]: fieldlist
                    .filter((x) => x.operator == false && x.not == false)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
                [`${field}_or_not`]: fieldlist
                    .filter((x) => x.operator == true && x.not == true)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
                [`${field}_and_not`]: fieldlist
                    .filter((x) => x.operator == false && x.not == true)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
            }
        },
        saveSearch: function () {
            let filtername = window.prompt(this.$t("save_filter"), this.$t("filter_name"))
            let search = this.buildParams(false)
            ;["page", "pageSize"].forEach((key) => {
                delete search[key]
            })
            search = { ...search, ...search.options.query }
            let params = {
                name: filtername,
                search: JSON.stringify(search),
            }

            this.genericAPI(this.Models.CUSTOM_FILTER, this.Actions.CREATE, params)
                .then((result) => {
                    this.search.search_filter = result.data
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                })
                .catch((err) => {
                    console.log(err, Object.keys(err))
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                })
        },
    },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
.vue-treeselect__control,
#timescooked,
#makenow {
    border-radius: 0px !important;
    height: 44px;
    line-height: 22px;
}
.multiselect__tags {
    border-radius: 0px !important;
    line-height: 22px;
}
/* copied from vue-multiselect */
.vue-treeselect__placeholder {
    font-weight: 400;
    font-family: inherit;
    text-align: left;
    font-size: 14px;
    margin-bottom: 10px;
    padding-top: 2px;
}
/* copied from vue-multiselect */
.vue-treeselect__control-arrow-container {
    width: 30px;
}
</style>
